"use client";

import { StageIndicator } from "@/components/ui/misc";
import { StagePanelProps } from "@/lib/definitions";
import { ChevronLeft } from "lucide-react";

export function StagePanel({ stages, activeStageId, brief, ideaStageId, onStageClick, onClose }: StagePanelProps) {
    return (
        <aside className="w-52 shrink-0 border-r border-zinc-100 flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Journey</span>
                <button onClick={onClose} className="text-zinc-300 hover:text-zinc-500 transition">
                    <ChevronLeft size={14} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
                <button
                    onClick={() => onStageClick(ideaStageId)}
                    className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition hover:bg-zinc-50 ${activeStageId === ideaStageId ? "bg-zinc-50" : ""}`}
                >
                    <StageIndicator
                        state={brief[ideaStageId] ? "done" : activeStageId === ideaStageId ? "active" : "empty"}
                        index={1}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-800 leading-snug">The idea</p>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-snug">Your starting point</p>
                    </div>
                </button>

                {stages.map((stage, i) => (
                    <button
                        key={stage.id}
                        onClick={() => onStageClick(stage.id)}
                        className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition hover:bg-zinc-50 ${activeStageId === stage.id ? "bg-zinc-50" : ""}`}
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
    );
}
