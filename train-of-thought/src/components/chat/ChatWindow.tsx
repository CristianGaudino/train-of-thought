"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatEvent } from "@/components/chat/ChatEvent";
import { defaultGetDisplayContent } from "@/lib/utils";
import { ChatWindowProps } from "@/lib/definitions";

export function ChatWindow({
    messages,
    status,
    showIntro,
    introTitle,
    introSubtitle,
    isMessageSaved,
    onToggleSave,
    getDisplayContent = defaultGetDisplayContent,
    showSaveButton = true,
    markers = [],
    onMarkerClick,
    shapedAtIndex = null,
    isShaping = false,
}: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status, isShaping]);

    return (
        <div className="flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />

            <div className="h-full overflow-y-auto px-6 py-6">
                {showIntro && (
                    <div className="flex flex-col items-center justify-center h-full text-center pb-16">
                        <h2 className="text-2xl font-semibold text-zinc-800 mb-2">{introTitle}</h2>
                        <p className="text-sm text-zinc-400 max-w-xs">{introSubtitle}</p>
                    </div>
                )}

                {messages.map((m, i) => {
                    const displayContent = getDisplayContent(m);
                    if (!displayContent) return null;
                    const clean = { ...m, parts: [{ type: "text" as const, text: displayContent }] };

                    // Markers that sit before this message index
                    const markersHere = markers.filter((mk) => mk.messageIndex === i);

                    // Shaped divider — show before the first assistant message after shaping
                    const showShapedDivider =
                        shapedAtIndex !== null &&
                        i === shapedAtIndex &&
                        m.role === "assistant";

                    return (
                        <div key={m.id}>
                            {markersHere.map((mk) => (
                                <ChatEvent
                                    key={mk.id}
                                    label="Summary generated"
                                    action={onMarkerClick ? {
                                        label: "View summary",
                                        onClick: () => onMarkerClick(mk.id),
                                    } : undefined}
                                />
                            ))}
                            {showShapedDivider && (
                                <ChatEvent label="Idea shaped" />
                            )}
                            <ChatMessage
                                message={clean}
                                saved={isMessageSaved(m)}
                                onToggleSave={() => onToggleSave(m)}
                                showSaveButton={showSaveButton}
                            />
                        </div>
                    );
                })}

                {/* Shaping loader */}
                {isShaping && (
                    <div>
                        <ChatEvent label="Shaping" />
                        <div className="flex justify-start mb-2">
                            <div className="flex gap-1 px-4 py-3 bg-zinc-100 rounded-2xl rounded-bl-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Normal typing indicator */}
                {status !== "ready" && !isShaping && (
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
        </div>
    );
}
