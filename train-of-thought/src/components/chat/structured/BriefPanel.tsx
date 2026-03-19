"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import type { BriefPanelProps } from "@/lib/chat/definitions";

export function BriefPanel({
    sections,
    filledCount,
    onExport,
    onAddToProjects,
    generating = false,
}: BriefPanelProps) {

    const hasContent = filledCount > 0;

    return (
        <aside className="w-56 shrink-0 border-l border-zinc-100 flex flex-col bg-zinc-50">
            <div className="px-4 py-3 border-b border-zinc-100 bg-white flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Brief</span>
                {filledCount > 0 && (
                    <span className="text-xs text-zinc-300">{filledCount}/{sections.length}</span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {sections.map((section) => (
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

            <div className="p-3 border-t border-zinc-100 bg-white flex flex-col gap-2">
                {/* Add to projects — primary action */}
                <button
                    onClick={onAddToProjects}
                    disabled={!hasContent || generating}
                    className="w-full py-2 text-xs font-medium rounded-xl bg-zinc-900 text-white hover:opacity-90 transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <>
                            <Loader2 size={12} className="animate-spin" />
                            Generating…
                        </>
                    ) : (
                        <>
                            Add to projects
                            <ArrowRight size={12} />
                        </>
                    )}
                </button>

                {/* Export / secondary action — kept for future use */}
                {onExport && (
                    <button
                        onClick={onExport}
                        disabled={!hasContent}
                        className="w-full py-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Export brief
                    </button>
                )}

                {!hasContent && (
                    <p className="text-[10px] text-zinc-300 text-center font-primary leading-relaxed">
                        Keep exploring to fill in the brief
                    </p>
                )}
            </div>
        </aside>
    );
}
