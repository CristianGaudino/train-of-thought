"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatWindowProps } from "@/lib/definitions";
import { defaultGetDisplayContent } from "@/lib/utils";

export function ChatWindow({
    messages,
    status,
    showIntro,
    introTitle,
    introSubtitle,
    isMessageSaved,
    onToggleSave,
    getDisplayContent = defaultGetDisplayContent,
}: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status]);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6">
            {showIntro && (
                <div className="flex flex-col items-center justify-center h-full text-center pb-16">
                    <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
                        {introTitle}
                    </h2>
                    <p className="text-sm text-zinc-400 max-w-xs">
                        {introSubtitle}
                    </p>
                </div>
            )}

            {messages.map((m) => {
                const displayContent = getDisplayContent(m);
                if (!displayContent) return null;
                const clean = { ...m, parts: [{ type: "text" as const, text: displayContent }] };
                return (
                    <ChatMessage
                        key={m.id}
                        message={clean}
                        saved={isMessageSaved(m)}
                        onToggleSave={() => onToggleSave(m)}
                    />
                );
            })}

            {status !== "ready" && (
                <div className="flex justify-start mb-2">
                    <div className="flex gap-1 px-4 py-3 bg-zinc-100 rounded-2xl rounded-bl-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
}
