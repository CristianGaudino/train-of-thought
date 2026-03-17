"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, ChevronLeft, Sparkles } from "lucide-react";
import { StagePanel } from "./_components/StagePanel";
import { BriefPanel } from "./_components/BriefPanel";
import { ResumeModal } from "@/components/chat/ResumeModal";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Chat } from "@/components/chat/Chat";
import { useShapeIdea } from "./_hooks/useShapeIdea";
import { useSaveMessages, loadPersistedMessages, clearPersistedMessages } from "@/lib/hooks/usePersistedMessages";
import { Stage, StageThreads } from "@/lib/chat/definitions";
import { getDisplayContent, parseBrief } from "@/lib/chat/utils";

const IDEA_STAGE_ID = "idea";
const STORAGE_KEY = "structuredMessages";

export default function StructuredPage() {
    const [depth, setDepth] = useState(1);
    const [input, setInput] = useState("");
    const [showIntro, setShowIntro] = useState(true);
    const [chatError, setChatError] = useState<string | null>(null);
    const [resumeMessages, setResumeMessages] = useState<any[]>([]);

    const [stages, setStages] = useState<Stage[]>([]);
    const [generatedAtIndex, setGeneratedAtIndex] = useState<number | null>(null);

    const [activeStageId, setActiveStageId] = useState<string>(IDEA_STAGE_ID);
    const [stageThreads, setStageThreads] = useState<StageThreads>({ [IDEA_STAGE_ID]: [] });
    const [brief, setBrief] = useState<Record<string, string>>({});
    const [railOpen, setRailOpen] = useState(true);

    const [chatId, setChatId] = useState(() => `${IDEA_STAGE_ID}-${crypto.randomUUID()}`);
    const savingFromStageRef = useRef<string>(IDEA_STAGE_ID);

    const {
        generating,
        generated,
        error: shapeError,
        shapeIdea,
        reset: resetShape,
    } = useShapeIdea();

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

    // Seed messages when switching stages
    useEffect(() => {
        const stored = stageThreads[activeStageId] ?? [];
        setMessages(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId]);

    // Sync active messages back to stageThreads
    useEffect(() => {
        const stageId = savingFromStageRef.current;
        setStageThreads((prev) => ({ ...prev, [stageId]: messages }));
    }, [messages]);

    // Parse brief updates from assistant messages
    useEffect(() => {
        const assistantMessages = messages.filter((m) => m.role === "assistant");
        if (assistantMessages.length === 0) return;
        const lastMsg = assistantMessages[assistantMessages.length - 1];
        const lastText = lastMsg.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") ?? "";
        const briefUpdates = parseBrief(lastText);
        if (briefUpdates) setBrief((prev) => ({ ...prev, ...briefUpdates }));
    }, [messages]);

    // Persist the idea stage thread
    useSaveMessages(stageThreads[IDEA_STAGE_ID] ?? [], STORAGE_KEY);

    // On mount, check for persisted idea thread
    useEffect(() => {
        const persisted = loadPersistedMessages(STORAGE_KEY);
        if (persisted.length > 0) setResumeMessages(persisted);
    }, []);

    function handleContinue() {
        setStageThreads((prev) => ({ ...prev, [IDEA_STAGE_ID]: resumeMessages }));
        setMessages(resumeMessages);
        setShowIntro(false);
        setResumeMessages([]);
    }

    function handleStartFresh() {
        clearPersistedMessages(STORAGE_KEY);
        setResumeMessages([]);
        setShowIntro(true);
    }

    const switchStage = useCallback((newStageId: string) => {
        if (newStageId === activeStageId) return;
        setStageThreads((prev) => ({ ...prev, [activeStageId]: messages }));
        savingFromStageRef.current = newStageId;
        setActiveStageId(newStageId);
        setChatId(`${newStageId}-${crypto.randomUUID()}`);
        setInput("");
        setChatError(null);
    }, [activeStageId, messages]);

    function handleShapeIdea() {
        const ideaMessages = stageThreads[IDEA_STAGE_ID] ?? [];
        shapeIdea(ideaMessages, depth, (result, messageIndex) => {
            setStages(result.stages);
            setBrief((prev) => ({ ...prev, ...result.brief }));
            setGeneratedAtIndex(messageIndex);
            setStageThreads((prev) => {
                const next = { ...prev };
                result.stages.forEach((s) => { if (!next[s.id]) next[s.id] = []; });
                return next;
            });
        });
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
        setGeneratedAtIndex(null);
        setActiveStageId(IDEA_STAGE_ID);
        setStageThreads({ [IDEA_STAGE_ID]: [] });
        setBrief({});
        setChatError(null);
        clearPersistedMessages(STORAGE_KEY);
        savingFromStageRef.current = IDEA_STAGE_ID;
        setChatId(`${IDEA_STAGE_ID}-${crypto.randomUUID()}`);
        resetShape();
    }

    const activeStage = stages.find((s) => s.id === activeStageId) ?? null;
    const activeStageQuestion = activeStage?.question ?? null;
    const hasMessages = messages.length > 0;
    const ideaMessages = stageThreads[IDEA_STAGE_ID] ?? [];
    const canShape = !generated && !generating && ideaMessages.length >= 2;
    const filledSections = Object.values(brief).filter(Boolean).length;

    const briefSections = [
        { id: IDEA_STAGE_ID, label: "The idea", content: brief[IDEA_STAGE_ID] },
        ...stages.map((s) => ({ id: s.id, label: s.label, content: brief[s.id] })),
    ];

    return (
        <main className="h-screen flex bg-white text-zinc-900 overflow-hidden">
            {resumeMessages.length > 0 && (
                <ResumeModal
                    messages={resumeMessages}
                    onContinue={handleContinue}
                    onStartFresh={handleStartFresh}
                />
            )}

            {generated && railOpen && (
                <StagePanel
                    stages={stages}
                    activeStageId={activeStageId}
                    brief={brief}
                    ideaStageId={IDEA_STAGE_ID}
                    onStageClick={switchStage}
                    onClose={() => setRailOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <ChatHeader
                    title="Structured"
                    depth={depth}
                    setDepth={setDepth}
                    left={generated && !railOpen ? (
                        <button onClick={() => setRailOpen(true)} className="text-zinc-400 hover:text-zinc-600 transition">
                            <ChevronLeft size={14} className="rotate-180" />
                        </button>
                    ) : undefined}
                >
                    {canShape && (
                        <button
                            onClick={handleShapeIdea}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition"
                        >
                            <Sparkles size={13} />
                            Shape this idea
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
                </ChatHeader>

                <Chat
                    messages={messages}
                    status={status}
                    input={input}
                    onInputChange={setInput}
                    onSubmit={handleSubmit}
                    showIntro={showIntro}
                    introTitle="Tell me about your idea"
                    introSubtitle="Describe what you want to make — we'll shape the rest together."
                    isMessageSaved={() => false}
                    onToggleSave={() => {}}
                    showSaveButton={false}
                    getDisplayContent={getDisplayContent}
                    placeholder={activeStageQuestion ? "Respond freely…" : "Describe your idea…"}
                    hint={activeStageQuestion ? `${activeStageQuestion} — or just say whatever comes to mind.` : undefined}
                    error={chatError ?? shapeError}
                    onErrorClose={() => setChatError(null)}
                    generating={generating}
                    generated={generated}
                    generatedAtIndex={generatedAtIndex}
                />
            </div>

            {generated && (
                <BriefPanel
                    sections={briefSections}
                    filledCount={filledSections}
                    onExport={() => {}}
                />
            )}
        </main>
    );
}
