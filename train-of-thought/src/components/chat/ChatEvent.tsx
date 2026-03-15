"use client";

import { ChatEventProps } from "@/lib/definitions";

export function ChatEvent({ label, action }: ChatEventProps) {
    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-100" />
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-300 uppercase tracking-widest">{label}</span>
                {action && (
                    <button
                        onClick={action.onClick}
                        className="text-[10px] text-zinc-400 hover:text-zinc-600 underline underline-offset-2 transition"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <div className="flex-1 h-px bg-zinc-100" />
        </div>
    );
}
