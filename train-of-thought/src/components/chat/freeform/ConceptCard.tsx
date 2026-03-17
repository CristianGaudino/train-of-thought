"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, Sparkles } from "lucide-react";
import { IdeaCard } from "@/lib/chat/definitions";

export function ConceptCard({
    card,
    onRemove,
    onEdit,
    autoFocus,
}: {
    card: IdeaCard;
    onRemove: () => void;
    onEdit: (id: string, updates: Partial<IdeaCard>) => void;
    autoFocus?: boolean;
}) {
    const [editingTitle, setEditingTitle] = useState(autoFocus ?? false);
    const [editingContent, setEditingContent] = useState(false);
    const [titleValue, setTitleValue] = useState(card.title ?? "");
    const [contentValue, setContentValue] = useState(card.content ?? "");

    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (autoFocus) setEditingTitle(true);
    }, [autoFocus]);

    useEffect(() => {
        if (editingTitle) titleRef.current?.focus();
    }, [editingTitle]);

    useEffect(() => {
        if (editingContent) contentRef.current?.focus();
    }, [editingContent]);

    function commitTitle() {
        onEdit(card.id, { title: titleValue.trim() || undefined });
        setEditingTitle(false);
    }

    function commitContent() {
        onEdit(card.id, { content: contentValue.trim() });
        setEditingContent(false);
    }

    return (
        <div className="group bg-white rounded-xl border border-zinc-200 p-3 hover:border-zinc-300 transition relative">
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition"
            >
                <Trash2 size={11} className="text-zinc-400" />
            </button>

            {/* Title */}
            <div className="mb-2 pr-6">
                {editingTitle ? (
                    <input
                        ref={titleRef}
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                commitTitle();
                                setContentValue(card.content ?? "");
                                setEditingContent(true);
                            }
                            if (e.key === "Tab") {
                                e.preventDefault();
                                commitTitle();
                                setContentValue(card.content ?? "");
                                setEditingContent(true);
                            }
                            if (e.key === "Escape") setEditingTitle(false);
                        }}
                        onBlur={commitTitle}
                        placeholder="Concept name…"
                        className="w-full text-xs font-semibold text-zinc-800 bg-transparent border-b border-zinc-300 outline-none pb-0.5 placeholder:text-zinc-300"
                    />
                ) : (
                    <button onClick={() => setEditingTitle(true)} className="text-left w-full">
                        <p className={`text-xs font-semibold ${card.title ? "text-zinc-800" : "text-zinc-300"}`}>
                            {card.title || "Untitled concept"}
                        </p>
                    </button>
                )}
            </div>

            {/* Content */}
            <div>
                {editingContent ? (
                    <textarea
                        ref={contentRef}
                        value={contentValue}
                        onChange={(e) => setContentValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                commitContent();
                            }
                            if (e.key === "Escape") commitContent();
                        }}
                        onBlur={commitContent}
                        rows={3}
                        placeholder="What's locked in…"
                        className="w-full text-xs text-zinc-600 bg-zinc-50 rounded-lg border border-zinc-200 p-2 outline-none resize-none focus:border-zinc-300 placeholder:text-zinc-300"
                    />
                ) : (
                    <button
                        onClick={() => {
                            setContentValue(card.content ?? "");
                            setEditingContent(true);
                        }}
                        className="text-left w-full"
                    >
                        <p className={`text-xs leading-relaxed ${card.content ? "text-zinc-500" : "text-zinc-300"}`}>
                            {card.content || "Click to add details…"}
                        </p>
                    </button>
                )}
            </div>

            {card.source === "summary" && (
                <div className="mt-2 flex items-center gap-1">
                    <Sparkles size={9} className="text-zinc-300" />
                    <span className="text-[10px] text-zinc-300">From summary</span>
                </div>
            )}
        </div>
    );
}
