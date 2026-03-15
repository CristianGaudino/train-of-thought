"use client";

import { Loader2 } from "lucide-react";
import { ChatEventProps } from "@/lib/definitions";

export function ChatEvent({ label, loading = false, action }: ChatEventProps) {
    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-100" />
            <div className="flex items-center gap-1.5">
                {loading && <Loader2 size={10} className="text-zinc-300 animate-spin" />}
                {!action && (
                    <span className="text-[10px] text-zinc-300 uppercase tracking-widest">{label}</span>
                )}
                {action && (
                    <button
                        onClick={action.onClick}
                        className="text-[10px] text-zinc-300 hover:text-zinc-500 underline underline-offset-2 transition uppercase tracking-widest"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <div className="flex-1 h-px bg-zinc-100" />
        </div>
    );
}
