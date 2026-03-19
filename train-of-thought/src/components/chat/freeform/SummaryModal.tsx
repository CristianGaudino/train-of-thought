"use client";

import { useState } from "react";
import { X, Sparkles, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import type { IdeaCard } from "@/lib/chat/definitions";
import type { Idea } from "@/lib/chat/schemas";
import { useGenerateProject } from "@/hooks/chat/useGenerateProject";
import ProjectPreviewModal from "@/components/projects/ProjectPreviewModal";

export function SummaryModal({
    idea,
    isStale,
    onClose,
    onRefresh,
    onSaveAsCard,
    refreshing,
}: {
    idea:           Idea;
    isStale:        boolean;
    onClose:        () => void;
    onRefresh:      () => void;
    onSaveAsCard:   (card: Omit<IdeaCard, "id" | "createdAt">) => void;
    // onAddToProjects removed — handled internally now
    refreshing:     boolean;
}) {
    const { generating, generatedProject, error, generate, reset } = useGenerateProject();
    const [showPreview, setShowPreview] = useState(false);

    const handleAddToProjects = async () => {
        await generate({ source: 'freeform', idea });
        setShowPreview(true);
    };

    const handlePreviewClose = () => {
        setShowPreview(false);
        reset();
        onClose();
    };

    return (
        <>
            <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="bg-white w-full sm:max-w-lg rounded-2xl shadow-xl border border-zinc-100 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                            <Sparkles size={15} className="text-zinc-400" />
                            <span className="text-sm font-semibold text-zinc-800">Idea Summary</span>
                            {isStale && (
                                <span className="text-[10px] text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                    Conversation has moved on
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isStale && (
                                <button
                                    onClick={onRefresh}
                                    disabled={refreshing}
                                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 transition disabled:opacity-40"
                                >
                                    <RotateCcw size={12} className={refreshing ? "animate-spin" : ""} />
                                    {refreshing ? "Updating…" : "Refresh"}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 transition"
                            >
                                <X size={14} className="text-zinc-500" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div
                        className={`px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto transition-opacity ${
                            refreshing ? "opacity-40 pointer-events-none" : ""
                        }`}
                    >
                        {idea.title && (
                            <div>
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Title</p>
                                <p className="text-base font-semibold text-zinc-900">{idea.title}</p>
                            </div>
                        )}
                        {idea.summary && (
                            <div>
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Summary</p>
                                <p className="text-sm text-zinc-700 leading-relaxed">{idea.summary}</p>
                            </div>
                        )}
                        {idea.coreConcept && (
                            <div>
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Core Concept</p>
                                <p className="text-sm text-zinc-700">{idea.coreConcept}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            {idea.problem && (
                                <div>
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Problem</p>
                                    <p className="text-sm text-zinc-700">{idea.problem}</p>
                                </div>
                            )}
                            {idea.audience && (
                                <div>
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Audience</p>
                                    <p className="text-sm text-zinc-700">{idea.audience}</p>
                                </div>
                            )}
                        </div>
                        {idea.variations && idea.variations.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Directions</p>
                                <ul className="space-y-1">
                                    {idea.variations.map((v, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />
                                            {v}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {idea.openQuestions && idea.openQuestions.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Open Questions</p>
                                <ul className="space-y-1">
                                    {idea.openQuestions.map((q, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                                            <span className="text-zinc-300 shrink-0">–</span>
                                            {q}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Generation error */}
                        {error && (
                            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-600 font-primary">
                                {error} — please try again.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition"
                        >
                            Continue refining
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    onSaveAsCard({
                                        title:   idea.title || "Untitled idea",
                                        content: idea.summary || idea.coreConcept || "",
                                        source:  "summary",
                                    })
                                }
                                className="px-4 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 hover:border-zinc-400 transition"
                            >
                                Save as card
                            </button>
                            <button
                                onClick={handleAddToProjects}
                                disabled={generating}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        Generating…
                                    </>
                                ) : (
                                    <>
                                        Add to projects
                                        <ArrowRight size={13} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview modal — shown after generation completes */}
            {showPreview && generatedProject && (
                <ProjectPreviewModal
                    generated={generatedProject}
                    onClose={handlePreviewClose}
                />
            )}
        </>
    );
}
