"use client";

import { useRef, useEffect, useState } from "react";
import { BookmarkCheck, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { IdeaCard } from "@/lib/definitions";
import { ConceptCard } from "./ConceptCard";

function DraftCard({
    onCommit,
    onDiscard,
}: {
    onCommit: (draft: { title?: string; content: string }) => void;
    onDiscard: () => void;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    function handleCommit() {
        onCommit({ title, content });
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-300 border-dashed p-3 relative">
            <button
                onClick={onDiscard}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-100 transition"
            >
                <X size={11} className="text-zinc-400" />
            </button>

            {/* Title */}
            <div className="mb-2 pr-6">
                <input
                    ref={titleRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            contentRef.current?.focus();
                        }
                        if (e.key === "Tab") {
                            e.preventDefault();
                            contentRef.current?.focus();
                        }
                        if (e.key === "Escape") onDiscard();
                    }}
                    placeholder="Concept name…"
                    className="w-full text-xs font-semibold text-zinc-800 bg-transparent border-b border-zinc-300 outline-none pb-0.5 placeholder:text-zinc-300"
                />
            </div>

            {/* Content */}
            <div className="mb-3">
                <textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleCommit();
                        }
                        if (e.key === "Escape") onDiscard();
                    }}
                    rows={3}
                    placeholder="What's locked in…"
                    className="w-full text-xs text-zinc-600 bg-zinc-50 rounded-lg border border-zinc-200 p-2 outline-none resize-none focus:border-zinc-300 placeholder:text-zinc-300"
                />
            </div>

            <button
                onClick={handleCommit}
                className="w-full py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:opacity-90 transition"
            >
                Add concept
            </button>
        </div>
    );
}

export function ConceptSidebar({
    cards,
    drafting,
    sidebarOpen,
    setSidebarOpen,
    onStartDraft,
    onCommitDraft,
    onDiscardDraft,
    onEdit,
    onRemove,
}: {
    cards: IdeaCard[];
    drafting: boolean;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    onStartDraft: () => void;
    onCommitDraft: (draft: { title?: string; content: string }) => void;
    onDiscardDraft: () => void;
    onEdit: (id: string, updates: Partial<IdeaCard>) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <aside
            className={`shrink-0 flex flex-col border-l border-zinc-100 transition-all duration-300 ${
                sidebarOpen ? "w-72" : "w-12"
            }`}
        >
            <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-100">
                {sidebarOpen && (
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide pl-1">
                        Core Concepts {cards.length > 0 && `(${cards.length})`}
                    </span>
                )}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition ml-auto"
                >
                    {sidebarOpen ? (
                        <ChevronRight size={15} className="text-zinc-400" />
                    ) : (
                        <ChevronLeft size={15} className="text-zinc-400" />
                    )}
                </button>
            </div>

            {sidebarOpen && (
                <>
                    {/* Committed cards */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {cards.length === 0 && !drafting && (
                            <div className="text-center py-8">
                                <BookmarkCheck
                                    size={18}
                                    className="text-zinc-300 mx-auto mb-2"
                                />
                                <p className="text-xs text-zinc-300">
                                    No concepts locked in yet
                                </p>
                            </div>
                        )}
                        {cards.map((card) => (
                            <ConceptCard
                                key={card.id}
                                card={card}
                                onRemove={() => onRemove(card.id)}
                                onEdit={onEdit}
                            />
                        ))}
                    </div>

                    {/* Draft area */}
                    <div className="shrink-0 px-3 py-3 border-t border-zinc-100">
                        {drafting ? (
                            <DraftCard
                                onCommit={onCommitDraft}
                                onDiscard={onDiscardDraft}
                            />
                        ) : (
                            <button
                                onClick={onStartDraft}
                                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded-lg border border-dashed border-zinc-200 hover:border-zinc-300 transition"
                            >
                                <Plus size={13} />
                                Add concept
                            </button>
                        )}
                    </div>
                </>
            )}
        </aside>
    );
}