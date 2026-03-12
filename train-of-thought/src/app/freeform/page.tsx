"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

import { DepthSelector } from "./_components/DepthSelector";
import { ChatMessage } from "./_components/ChatMessage";
import { ConceptSidebar } from "./_components/ConceptSidebar";
import { SummaryModal } from "./_components/SummaryModal";
import { useConceptCards } from "./_hooks/useConceptCards";
import { useSummary } from "./_hooks/useSummary";
import { ErrorAlert } from "@/components/ui/alerts";

export default function FreeformPage() {
    const [depth, setDepth] = useState(1);
    const [input, setInput] = useState("");
    const [showIntro, setShowIntro] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatError, setChatError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [chatId] = useState(() => crypto.randomUUID());

    const {
        cards,
        drafting,
        setDrafting,
        addCard,
        commitDraft,
        editCard,
        removeCard,
        toggleCardFromMessage,
        isMessageSaved,
    } = useConceptCards();

    const { messages, sendMessage, status, setMessages } = useChat({
        id: chatId,
        transport: new DefaultChatTransport({
            api: "/api/freeform-chat",
        }),
        onError: (err) => {
            if (err.message.includes("429")) {
                setChatError("Too many requests — please wait a moment before continuing.");
            } else {
                setChatError("Something went wrong. Please try again.");
            }
        },
    });

    const {
        summaryCache,
        summaryOpen,
        summarising,
        isStale,
        error: summaryError,
        setError: setSummaryError,
        openSummary,
        closeSummary,
        resetSummary,
        fetchSummary,
    } = useSummary(messages);

    useEffect(() => {
        const saved = localStorage.getItem("freeformSidebar");
        if (saved) setSidebarOpen(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("freeformSidebar", JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status]);

    function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!input.trim() || status !== "ready") return;
        setChatError(null);
        if (showIntro) setShowIntro(false);
        sendMessage(
            { text: input },
            { body: { depth, cards } }
        );
        setInput("");
    }

    function handleReset() {
        setMessages([]);
        setShowIntro(true);
        setChatError(null);
        resetSummary();
    }

    function handleAddToProjects(idea: any) {
        localStorage.setItem("pendingProjectIdea", JSON.stringify(idea));
        alert("Projects page coming soon! Idea has been staged.");
    }

    const hasMessages = messages.length > 0;

    return (
        <main className="h-screen flex bg-white text-zinc-900 overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-100">
                    <div className="flex items-center gap-4">
                        <h1 className="font-semibold text-sm text-zinc-800">Freeform</h1>
                        <DepthSelector depth={depth} setDepth={setDepth} />
                    </div>
                    <div className="flex items-center gap-2">
                        {hasMessages && (
                            <>
                                <button
                                    onClick={openSummary}
                                    disabled={summarising}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition disabled:opacity-40 relative"
                                >
                                    <Sparkles size={13} />
                                    {summarising ? "Summarising…" : "Summarise"}
                                    {isStale && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                                    )}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded-lg transition"
                                >
                                    <RotateCcw size={13} />
                                    Reset
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* Chat */}
                <div className="flex-1 relative overflow-hidden">
                    {summaryOpen && summaryCache && (
                        <SummaryModal
                            idea={summaryCache.idea}
                            isStale={isStale}
                            onClose={closeSummary}
                            onRefresh={fetchSummary}
                            onSaveAsCard={addCard}
                            onAddToProjects={handleAddToProjects}
                            refreshing={summarising}
                        />
                    )}

                    <div className="h-full overflow-y-auto px-6 py-6">
                        {showIntro && (
                            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
                                <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
                                    What's on your mind?
                                </h2>
                                <p className="text-sm text-zinc-400 max-w-xs">
                                    Share an idea, a feeling, a vague direction — we'll make sense of it together.
                                </p>
                            </div>
                        )}

                        {messages.map((m) => (
                            <ChatMessage
                                key={m.id}
                                message={m}
                                saved={isMessageSaved(m)}
                                onToggleSave={() => toggleCardFromMessage(m)}
                            />
                        ))}

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
                    {summaryError && (
                        <ErrorAlert
                            message={summaryError}
                            dismissable={true}
                            onClose={() => setSummaryError(null)}
                        />
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && !e.shiftKey && handleSubmit()
                            }
                            disabled={status !== "ready"}
                            placeholder="Tell me what's on your mind…"
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

            <ConceptSidebar
                cards={cards}
                drafting={drafting}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onStartDraft={() => setDrafting(true)}
                onCommitDraft={commitDraft}
                onDiscardDraft={() => setDrafting(false)}
                onEdit={editCard}
                onRemove={removeCard}
            />
        </main>
    );
}