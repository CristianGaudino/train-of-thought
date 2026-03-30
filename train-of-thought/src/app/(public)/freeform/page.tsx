"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect } from "react";
import { Sparkles, RotateCcw, BookmarkCheck } from "lucide-react";
import { ConceptSidebar } from "../../../components/chat/freeform/ConceptSidebar";
import { SummaryModal } from "../../../components/chat/freeform/SummaryModal";
import { ResumeModal } from "@/components/chat/ResumeModal";
import { useConceptCards } from "../../../hooks/chat/freeform/useConceptCards";
import { useSummary } from "../../../hooks/chat/freeform/useSummary";
import { useSaveMessages, loadPersistedMessages, clearPersistedMessages } from "@/hooks/chat/usePersistedMessages";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatNav } from "@/components/chat/ChatNav";
import { Chat } from "@/components/chat/Chat";
import { FREEFORM_STORAGE_KEY } from "@/lib/chat/definitions";

export default function FreeformPage() {
    useEffect(() => { document.title = 'Freeform | Train of Thought'; }, []);

    const [depth, setDepth] = useState(1);
    const [input, setInput] = useState("");
    const [showIntro, setShowIntro] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
        summaryOpen,
        summarising,
        canSummarise,
        error: summaryError,
        setError: setSummaryError,
        markers,
        activeSummaryIdea,
        openSummary,
        openMarkerSummary,
        closeSummary,
        resetSummary,
        fetchSummary,
    } = useSummary(messages);

    useSaveMessages(messages, FREEFORM_STORAGE_KEY);

    useEffect(() => {
        const persisted = loadPersistedMessages(FREEFORM_STORAGE_KEY);
        if (persisted.length > 0) setResumeMessages(persisted);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("freeformSidebar");
        if (saved !== null) {
            setSidebarOpen(JSON.parse(saved));
        } else {
            setSidebarOpen(window.innerWidth >= 768);
        }
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
        clearPersistedMessages(FREEFORM_STORAGE_KEY);
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

    const hasMessages = messages.length > 0;

    return (
        <main className="h-screen flex bg-white text-zinc-900 overflow-hidden">
            {resumeMessages.length > 0 && (
                <ResumeModal
                    messages={resumeMessages}
                    onContinue={handleContinue}
                    onStartFresh={handleStartFresh}
                    showConceptsStep={true}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <ChatNav />
                <ChatHeader title="Freeform" depth={depth} setDepth={setDepth}>
                    {hasMessages && (
                        <>
                            <button
                                onClick={openSummary}
                                disabled={!canSummarise}
                                title="Summarise"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition disabled:opacity-40"
                            >
                                <Sparkles size={13} />
                                <span className="hidden sm:inline">{summarising ? "Summarising…" : "Summarise"}</span>
                            </button>
                            <button
                                onClick={handleReset}
                                title="Reset"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded-lg transition"
                            >
                                <RotateCcw size={13} />
                                <span className="hidden sm:inline">Reset</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        title={cards.length > 0 ? `Concepts (${cards.length})` : "Concepts"}
                        className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition"
                    >
                        <BookmarkCheck size={13} />
                        {cards.length > 0 && <span className="text-xs">{cards.length}</span>}
                    </button>
                </ChatHeader>

                <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
                    {summaryOpen && activeSummaryIdea && (
                        <SummaryModal
                            idea={activeSummaryIdea}
                            isStale={false}
                            onClose={closeSummary}
                            onRefresh={fetchSummary}
                            onSaveAsCard={addCard}
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
                        markers={markers}
                        onMarkerClick={openMarkerSummary}
                        generating={summarising}
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
