"use client";

import { ErrorAlert } from "@/components/ui/alerts";
import { ChatInputBarProps } from "@/lib/definitions";

export function ChatInputBar({
    value,
    onChange,
    onSubmit,
    disabled,
    placeholder = "Say something…",
    hint,
    error,
    onErrorClose,
}: ChatInputBarProps) {
    return (
        <div className="shrink-0 px-6 py-4 border-t border-zinc-100 space-y-2">
            {error && (
                <ErrorAlert
                    message={error}
                    dismissable={true}
                    onClose={onErrorClose}
                />
            )}
            {hint && (
                <p className="text-xs text-zinc-400 px-1">
                    {hint}
                </p>
            )}
            <form onSubmit={onSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSubmit()}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 transition disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={disabled || !value.trim()}
                    className="px-5 py-2.5 text-sm font-medium rounded-xl bg-zinc-900 text-white hover:opacity-90 transition disabled:opacity-40"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
