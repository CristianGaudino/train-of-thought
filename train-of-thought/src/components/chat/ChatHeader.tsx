"use client";

import { ChatHeaderProps } from "@/lib/definitions";
import { DepthSelector } from "./DepthSelector";

export function ChatHeader({ title, depth, setDepth, left, children }: ChatHeaderProps) {
    return (
        <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-4">
                {left}
                <h1 className="font-semibold text-sm text-zinc-800">{title}</h1>
                <DepthSelector depth={depth} setDepth={setDepth} />
            </div>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </header>
    );
}
