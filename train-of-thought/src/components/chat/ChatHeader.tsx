"use client";

import { ChatHeaderProps } from "@/lib/chat/definitions";
import { DepthSelector } from "./DepthSelector";

export function ChatHeader({ title, depth, setDepth, left, children }: ChatHeaderProps) {
    return (
        <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-100 bg-white">
            <div className="flex items-center gap-3">
                {left}
                <h1 className="text-sm font-semibold font-primary text-zinc-800 tracking-tight">
                    {title}
                </h1>
                <div className="hidden sm:block w-px h-4 bg-zinc-100" />
                <div className="hidden sm:block">
                    <DepthSelector depth={depth} setDepth={setDepth} />
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                {children}
            </div>
        </header>
    );
}
