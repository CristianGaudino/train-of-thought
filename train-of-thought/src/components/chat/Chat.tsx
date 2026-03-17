"use client";

import { ChatWindow } from "./ChatWindow";
import { ChatInputBar } from "./ChatInputBar";
import { ChatProps } from "@/lib/chat/definitions";

export function Chat({
    messages,
    status,
    input,
    onInputChange,
    onSubmit,
    showIntro,
    introTitle,
    introSubtitle,
    isMessageSaved,
    onToggleSave,
    getDisplayContent,
    showSaveButton = true,
    placeholder,
    hint,
    error,
    onErrorClose,
    markers,
    onMarkerClick,
    generatedAtIndex,
    generating,
    generated,
}: ChatProps) {
    return (
        <>
            <ChatWindow
                messages={messages}
                status={status}
                showIntro={showIntro}
                introTitle={introTitle}
                introSubtitle={introSubtitle}
                isMessageSaved={isMessageSaved}
                onToggleSave={onToggleSave}
                getDisplayContent={getDisplayContent}
                showSaveButton={showSaveButton}
                markers={markers}
                onMarkerClick={onMarkerClick}
                generatedAtIndex={generatedAtIndex}
                generating={generating}
                generated={generated}
            />
            <ChatInputBar
                value={input}
                onChange={onInputChange}
                onSubmit={onSubmit}
                disabled={status !== "ready"}
                placeholder={placeholder}
                hint={hint}
                error={error}
                onErrorClose={onErrorClose}
            />
        </>
    );
}
