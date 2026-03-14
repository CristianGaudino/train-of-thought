"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

import { ConceptSidebar } from "./_components/ConceptSidebar";
import { SummaryModal } from "./_components/SummaryModal";
import { ResumeModal } from "./_components/ResumeModal";
import { useConceptCards } from "./_hooks/useConceptCards";
import { useSummary } from "./_hooks/useSummary";
import { useSaveMessages, loadPersistedMessages, clearPersistedMessages } from "@/lib/hooks/usePersistedMessages";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Chat } from "@/components/chat/Chat";

const STORAGE_KEY = "freeformMessages";

export default function FreeformPage() {
    const [depth, setDepth] = useState(1);
    const [input, setInput] = useState("");
    const [showIntro, setShowIntro] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatError, setChatError] = useState<string | null>(null);
    const [resumeMessages, setResumeMessages] = useState<any[]>([]);
    const [chatId] = useState(() => crypto.randomUUID());

    const {
        cards,
        drafting,
        setDrafting,
        addCard,
        commitDraft,
        editCard,
        removeCard,
        removeAllCards,
        toggleCardFromMessage,
        isMessageSaved,
    } = useConceptCards();

    const { messages, sendMessage, status, setMessages } = useChat({
        id: chatId,
        transport: new DefaultChatTransport({ api: "/api/freeform-chat" }),
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

    useSaveMessages(messages, STORAGE_KEY);

    useEffect(() => {
        const persisted = loadPersistedMessages(STORAGE_KEY);
        if (persisted.length > 0) setResumeMessages(persisted);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("freeformSidebar");
        if (saved) setSidebarOpen(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("freeformSidebar", JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

    function handleContinue() {
        setMessages(resumeMessages);
        setShowIntro(false);
        setResumeMessages([]);
    }

    function handleStartFresh(keepConcepts: boolean) {
        if (!keepConcepts) removeAllCards();
        clearPersistedMessages(STORAGE_KEY);
        setResumeMessages([]);
        setShowIntro(true);
        resetSummary();
    }

    function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!input.trim() || status !== "ready") return;
        setChatError(null);
        if (showIntro) setShowIntro(false);
        sendMessage({ text: input }, { body: { depth, cards } });
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
            {resumeMessages.length > 0 && (
                <ResumeModal
                    messages={resumeMessages}
                    onContinue={handleContinue}
                    onStartFresh={handleStartFresh}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <ChatHeader title="Freeform" depth={depth} setDepth={setDepth}>
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
                </ChatHeader>

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
                    <Chat
                        messages={messages}
                        status={status}
                        input={input}
                        onInputChange={setInput}
                        onSubmit={handleSubmit}
                        showIntro={showIntro}
                        introTitle="What's on your mind?"
                        introSubtitle="Share an idea, a feeling, a vague direction — we'll make sense of it together."
                        isMessageSaved={isMessageSaved}
                        onToggleSave={toggleCardFromMessage}
                        placeholder="Tell me what's on your mind…"
                        error={chatError ?? summaryError}
                        onErrorClose={() => { setChatError(null); setSummaryError(null); }}
                    />
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
