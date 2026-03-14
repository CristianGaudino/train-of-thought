"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, ChevronLeft, Sparkles } from "lucide-react";
import { ErrorAlert } from "@/components/ui/alerts";
import { DepthSelector } from "../freeform/_components/DepthSelector";
import { ChatMessage } from "../freeform/_components/ChatMessage";

interface Stage {
    id: string;
    label: string;
    question: string;
}

type StageThreads = Record<string, any[]>;

const IDEA_STAGE_ID = "idea";
const STAGES_REGEX = /%%STAGES:([\s\S]*?)%%/;
const BRIEF_REGEX = /%%BRIEF:([\s\S]*?)%%/g;

function extractText(message: any): string {
    return message.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") ?? "";
}

function stripBlocks(text: string): string {
    if (text.includes("%%STAGES:") && !text.includes("%%", text.indexOf("%%STAGES:") + 9)) return "";
    return text.replace(STAGES_REGEX, "").replace(BRIEF_REGEX, "").trimStart();
}

function parseStages(text: string): Stage[] | null {
    const match = text.match(STAGES_REGEX);
    if (!match) return null;
    try {
        const parsed = JSON.parse(match[1]);
        return parsed.stages ?? null;
    } catch {
        return null;
    }
}

function parseBrief(text: string): Record<string, string> | null {
    const regex = /%%BRIEF:([\s\S]*?)%%/;
    const match = text.match(regex);
    if (!match) return null;
    try {
        return JSON.parse(match[1]);
    } catch {
        return null;
    }
}

export default function StructuredPage() {
    const [depth, setDepth] = useState(1);
    const [input, setInput] = useState("");
    const [showIntro, setShowIntro] = useState(true);
    const [chatError, setChatError] = useState<string | null>(null);

    // Stages & shaping
    const [stages, setStages] = useState<Stage[]>([]);
    const [isShaped, setIsShaped] = useState(false);
    const [isShaping, setIsShaping] = useState(false);

    // Active stage
    const [activeStageId, setActiveStageId] = useState<string>(IDEA_STAGE_ID);

    // Per-stage message storage — keyed by stage id
    const [stageThreads, setStageThreads] = useState<StageThreads>({ [IDEA_STAGE_ID]: [] });

    // Brief
    const [brief, setBrief] = useState<Record<string, string>>({});

    // Rail panel
    const [railOpen, setRailOpen] = useState(true);

    // chatId changes when we switch stages, forcing useChat to reinitialise
    const [chatId, setChatId] = useState(() => `${IDEA_STAGE_ID}-${crypto.randomUUID()}`);

    const bottomRef = useRef<HTMLDivElement>(null);
    // Track the stage we're saving messages FROM when switching
    const savingFromStageRef = useRef<string>(IDEA_STAGE_ID);

    const { messages, sendMessage, status, setMessages } = useChat({
        id: chatId,
        transport: new DefaultChatTransport({ api: "/api/structured-chat" }),
        onError: (err) => {
            if (err.message.includes("429")) {
                setChatError("Too many requests — please wait a moment.");
            } else {
                setChatError("Something went wrong. Please try again.");
            }
        },
    });

    // When chatId changes (stage switch), seed messages from the stored thread
    useEffect(() => {
        const stored = stageThreads[activeStageId] ?? [];
        setMessages(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId]);

    // Sync messages back to stageThreads on every change
    useEffect(() => {
        const stageId = savingFromStageRef.current;
        setStageThreads((prev) => ({ ...prev, [stageId]: messages }));
    }, [messages]);

    // Parse stages + brief from assistant messages
    useEffect(() => {
        const assistantMessages = messages.filter((m) => m.role === "assistant");
        if (assistantMessages.length === 0) return;

        const lastMsg = assistantMessages[assistantMessages.length - 1];
        const lastText = extractText(lastMsg);

        // Parse stages from the shaping response
        if (activeStageId === IDEA_STAGE_ID && isShaping && lastText.includes("%%STAGES:")) {
            const parsed = parseStages(lastText);
            if (parsed && parsed.length > 0) {
                setStages(parsed);
                setIsShaped(true);
                setIsShaping(false);
                setStageThreads((prev) => {
                    const next = { ...prev };
                    parsed.forEach((s) => { if (!next[s.id]) next[s.id] = []; });
                    return next;
                });
            }
        }

        // Parse brief updates from any stage
        const briefUpdates = parseBrief(lastText);
        if (briefUpdates) {
            setBrief((prev) => ({ ...prev, ...briefUpdates }));
        }
    }, [messages, activeStageId, isShaping]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status]);

    const switchStage = useCallback((newStageId: string) => {
        if (newStageId === activeStageId) return;
        // Save current messages before switching
        setStageThreads((prev) => ({ ...prev, [activeStageId]: messages }));
        savingFromStageRef.current = newStageId;
        setActiveStageId(newStageId);
        // New chatId forces useChat to reinitialise with the new stage's stored messages
        setChatId(`${newStageId}-${crypto.randomUUID()}`);
        setInput("");
        setChatError(null);
    }, [activeStageId, messages]);

    function handleShapeIdea() {
        if (status !== "ready" || isShaping) return;
        setIsShaping(true);
        sendMessage(
            { text: "I'm ready to shape this idea. Please analyse our conversation and generate my journey stages." },
            { body: { depth, activeStageId: IDEA_STAGE_ID, stages: [], isShapingRequest: true } }
        );
    }

    function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!input.trim() || status !== "ready") return;
        setChatError(null);
        if (showIntro) setShowIntro(false);
        const activeStage = stages.find((s) => s.id === activeStageId);
        sendMessage(
            { text: input },
            { body: { depth, activeStageId, activeStageQuestion: activeStage?.question ?? null, stages, brief } }
        );
        setInput("");
    }

    function handleReset() {
        setShowIntro(true);
        setStages([]);
        setIsShaped(false);
        setIsShaping(false);
        setActiveStageId(IDEA_STAGE_ID);
        setStageThreads({ [IDEA_STAGE_ID]: [] });
        setBrief({});
        setChatError(null);
        savingFromStageRef.current = IDEA_STAGE_ID;
        setChatId(`${IDEA_STAGE_ID}-${crypto.randomUUID()}`);
    }

    const activeStage = stages.find((s) => s.id === activeStageId) ?? null;
    const activeStageQuestion = activeStage?.question ?? null;
    const hasMessages = messages.length > 0;
    const ideaMessages = stageThreads[IDEA_STAGE_ID] ?? [];
    const canShape = !isShaped && !isShaping && ideaMessages.length >= 2;
    const filledSections = Object.values(brief).filter(Boolean).length;
    const canExport = filledSections >= 2;

    const briefSections = [
        { id: IDEA_STAGE_ID, label: "The idea", content: brief[IDEA_STAGE_ID] },
        ...stages.map((s) => ({ id: s.id, label: s.label, content: brief[s.id] })),
    ];

    return (
        <main className="h-screen flex bg-white text-zinc-900 overflow-hidden">

            {/* Stage Rail — only shown once shaped */}
            {isShaped && railOpen && (
                <aside className="w-52 shrink-0 border-r border-zinc-100 flex flex-col">
                    <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                            Journey
                        </span>
                        <button
                            onClick={() => setRailOpen(false)}
                            className="text-zinc-300 hover:text-zinc-500 transition"
                        >
                            <ChevronLeft size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-3">
                        {/* Idea stage */}
                        <button
                            onClick={() => switchStage(IDEA_STAGE_ID)}
                            className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition hover:bg-zinc-50 ${
                                activeStageId === IDEA_STAGE_ID ? "bg-zinc-50" : ""
                            }`}
                        >
                            <StageIndicator
                                state={brief[IDEA_STAGE_ID] ? "done" : activeStageId === IDEA_STAGE_ID ? "active" : "empty"}
                                index={1}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-zinc-800 leading-snug">The idea</p>
                                <p className="text-xs text-zinc-400 mt-0.5 leading-snug">Your starting point</p>
                            </div>
                        </button>

                        {/* Dynamic stages */}
                        {stages.map((stage, i) => (
                            <button
                                key={stage.id}
                                onClick={() => switchStage(stage.id)}
                                className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition hover:bg-zinc-50 ${
                                    activeStageId === stage.id ? "bg-zinc-50" : ""
                                }`}
                            >
                                <StageIndicator
                                    state={brief[stage.id] ? "done" : activeStageId === stage.id ? "active" : "empty"}
                                    index={i + 2}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium leading-snug ${brief[stage.id] ? "text-zinc-800" : "text-zinc-500"}`}>
                                        {stage.label}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-0.5 leading-snug truncate">
                                        {stage.question.length > 38 ? stage.question.slice(0, 38) + "…" : stage.question}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>
            )}

            {/* Main chat */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-100">
                    <div className="flex items-center gap-4">
                        {isShaped && !railOpen && (
                            <button
                                onClick={() => setRailOpen(true)}
                                className="text-zinc-400 hover:text-zinc-600 transition"
                            >
                                <ChevronLeft size={14} className="rotate-180" />
                            </button>
                        )}
                        <h1 className="font-semibold text-sm text-zinc-800">Structured</h1>
                        <DepthSelector depth={depth} setDepth={setDepth} />
                    </div>
                    <div className="flex items-center gap-2">
                        {canShape && (
                            <button
                                onClick={handleShapeIdea}
                                disabled={isShaping}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition disabled:opacity-40"
                            >
                                <Sparkles size={13} />
                                {isShaping ? "Shaping…" : "Shape this idea"}
                            </button>
                        )}
                        {hasMessages && (
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded-lg transition"
                            >
                                <RotateCcw size={13} />
                                Reset
                            </button>
                        )}
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {showIntro && (
                        <div className="flex flex-col items-center justify-center h-full text-center pb-16">
                            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
                                Tell me about your idea
                            </h2>
                            <p className="text-sm text-zinc-400 max-w-xs">
                                Describe what you want to make — we'll shape the rest together.
                            </p>
                        </div>
                    )}

                    {messages.map((m) => {
                        const raw = extractText(m);
                        const displayContent = m.role === "assistant" ? stripBlocks(raw) : raw;
                        if (!displayContent) return null;
                        const clean = { ...m, parts: [{ type: "text" as const, text: displayContent }] };
                        return (
                            <ChatMessage
                                key={m.id}
                                message={clean}
                                saved={false}
                                onToggleSave={() => {}}
                            />
                        );
                    })}

                    {status !== "ready" && (
                        <div className="flex justify-start mb-2">
                            <div className="flex gap-1 px-4 py-3 bg-zinc-100 rounded-2xl rounded-bl-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 px-6 py-4 border-t border-zinc-100 space-y-2">
                    {chatError && (
                        <ErrorAlert
                            message={chatError}
                            dismissable={true}
                            onClose={() => setChatError(null)}
                        />
                    )}
                    {activeStageQuestion && (
                        <p className="text-xs text-zinc-400 px-1">
                            {activeStageQuestion} — or just say whatever comes to mind.
                        </p>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                            disabled={status !== "ready"}
                            placeholder={activeStageQuestion ? "Respond freely…" : "Describe your idea…"}
                            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 transition disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={status !== "ready" || !input.trim()}
                            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-zinc-900 text-white hover:opacity-90 transition disabled:opacity-40"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>

            {/* Brief Panel — only shown once shaped */}
            {isShaped && (
                <aside className="w-56 shrink-0 border-l border-zinc-100 flex flex-col bg-zinc-50">
                    <div className="px-4 py-3 border-b border-zinc-100 bg-white flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Brief</span>
                        {filledSections > 0 && (
                            <span className="text-xs text-zinc-300">{filledSections}/{briefSections.length}</span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                        {briefSections.map((section) => (
                            <div
                                key={section.id}
                                className={`bg-white rounded-lg border p-3 ${
                                    section.content
                                        ? "border-l-2 border-zinc-300 rounded-l-none"
                                        : "border-zinc-100"
                                }`}
                            >
                                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 mb-1.5">
                                    {section.label}
                                </p>
                                {section.content ? (
                                    <p className="text-xs text-zinc-700 leading-relaxed">{section.content}</p>
                                ) : (
                                    <p className="text-xs text-zinc-300 italic">Not yet explored</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-t border-zinc-100 bg-white">
                        <button
                            disabled={!canExport}
                            className="w-full py-2 text-xs font-medium rounded-xl bg-zinc-900 text-white hover:opacity-90 transition disabled:opacity-25"
                        >
                            Add to workspace
                        </button>
                    </div>
                </aside>
            )}
        </main>
    );
}

function StageIndicator({ state, index }: { state: "active" | "done" | "empty"; index: number }) {
    if (state === "done") {
        return (
            <div className="w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.5 6L6.5 2" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        );
    }
    if (state === "active") {
        return (
            <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-medium text-white">{index}</span>
            </div>
        );
    }
    return (
        <div className="w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5 opacity-50">
            <span className="text-[10px] text-zinc-400">{index}</span>
        </div>
    );
}
