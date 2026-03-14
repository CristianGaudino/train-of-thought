"use client";

import { BriefPanelProps } from "@/lib/definitions";

export function BriefPanel({ sections, filledCount, canExport, onExport }: BriefPanelProps) {
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
                        className={`bg-white rounded-lg border p-3 ${section.content ? "border-l-2 border-zinc-300 rounded-l-none" : "border-zinc-100"}`}
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
                    onClick={onExport}
                    disabled={!canExport}
                    className="w-full py-2 text-xs font-medium rounded-xl bg-zinc-900 text-white hover:opacity-90 transition disabled:opacity-25"
                >
                    Add to workspace
                </button>
            </div>
        </aside>
    );
}
