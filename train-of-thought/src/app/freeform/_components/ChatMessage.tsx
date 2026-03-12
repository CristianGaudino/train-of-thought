"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";


export function ChatMessage({
    message,
    onToggleSave,
    saved,
}: {
    message: any;
    onToggleSave: () => void;
    saved: boolean;
}) {
    const text =
        message.parts?.map((p: any) => p.text).join(" ") || message.text;
    const isUser = message.role === "user";

    return (
        <div
            className={`group relative mb-2 flex ${
                isUser ? "justify-end" : "justify-start"
            }`}
        >
            <div
                className={`relative px-4 py-3 rounded-2xl max-w-[78%] text-sm leading-relaxed ${
                    isUser
                        ? "bg-zinc-900 text-white rounded-br-sm"
                        : "bg-zinc-100 text-zinc-800 rounded-bl-sm"
                }`}
            >
                <span className="whitespace-pre-wrap">{text}</span>

                {!isUser && (
                    <button
                        onClick={onToggleSave}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Save message"
                    >
                        {saved ? (
                            <Bookmark size={10} className="text-zinc-800" />
                        ) : (
                            <BookmarkCheck size={10} className="text-zinc-400" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}