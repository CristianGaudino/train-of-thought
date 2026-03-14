"use client";

import { DEPTH_OPTIONS } from "@/lib/definitions";

export function DepthSelector({
    depth,
    setDepth,
}: {
    depth: number;
    setDepth: (d: number) => void;
}) {
    return (
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
            {DEPTH_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setDepth(opt.value)}
                    title={opt.hint}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        depth === opt.value
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700"
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}