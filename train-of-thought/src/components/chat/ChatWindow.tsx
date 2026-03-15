"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatEvent } from "@/components/chat/ChatEvent";
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
    showSaveButton = true,
    markers = [],
    onMarkerClick,
    generating = false,
    generatedAtIndex = null,
    generated = false,
}: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, status, generating, generating, markers]);

    // Markers that appear before a given message index
    function markersAt(index: number) {
        return markers.filter((mk) => mk.messageIndex === index);
    }

    // Markers that appear after all messages (messageIndex >= messages.length)
    const trailingMarkers = markers.filter((mk) => mk.messageIndex >= messages.length);

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

                    const showShapedDivider = false; // divider is rendered as trailing event below

                    return (
                        <div key={m.id}>
                            {markersAt(i).map((mk) => (
                                <ChatEvent
                                    key={mk.id}
                                    label="View summary"
                                    action={onMarkerClick ? {
                                        label: "View summary",
                                        onClick: () => onMarkerClick(mk.id),
                                    } : undefined}
                                />
                            ))}
                            {showShapedDivider && <ChatEvent label="Idea generated" />}
                            <ChatMessage
                                message={clean}
                                saved={isMessageSaved(m)}
                                onToggleSave={() => onToggleSave(m)}
                                showSaveButton={showSaveButton}
                            />
                        </div>
                    );
                })}

                {/* Trailing markers — sit after the last message */}
                {trailingMarkers.map((mk) => (
                    <ChatEvent
                        key={mk.id}
                        label="View summary"
                        action={onMarkerClick ? {
                            label: "View summary",
                            onClick: () => onMarkerClick(mk.id),
                        } : undefined}
                    />
                ))}

                {/* Shaped divider — no message is added by shaping so render as trailing */}
                {generated && generatedAtIndex !== null && generatedAtIndex >= messages.length && (
                    <ChatEvent label="Idea generated" />
                )}

                {/* Generating indicator */}
                {generating && (
                    <ChatEvent label="Generating" loading />
                )}

                {/* Normal typing indicator */}
                {status !== "ready" && !generating && (
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
