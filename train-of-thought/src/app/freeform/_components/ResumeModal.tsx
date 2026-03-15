"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { extractText } from "@/lib/utils";

type Step = "resume" | "concepts";

export function ResumeModal({
    messages,
    onContinue,
    onStartFresh,
}: {
    messages: any[];
    onContinue: () => void;
    onStartFresh: (keepConcepts: boolean) => void;
}) {
    const [step, setStep] = useState<Step>("resume");

    const previewMessages = (() => {
        if (messages.length === 0) return [];
        const last = messages[messages.length - 1];
        const secondLast = messages[messages.length - 2];
        const lastText = extractText(last);
        
        if (secondLast && lastText.length < 200) {
            return [secondLast, last];
        }
        return [last];
    })();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-100 overflow-hidden">
                {step === "resume" ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-100">
                            <MessageCircle size={15} className="text-zinc-400" />
                            <span className="text-sm font-semibold text-zinc-800">
                                Welcome back
                            </span>
                        </div>

                        {/* Preview */}
                        <div className="relative px-5 pt-4 pb-2">
                            <p className="text-xs text-zinc-400 mb-3">
                                You have an unfinished conversation.
                            </p>

                            {/* Faded message preview */}
                            <div className="relative rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 max-h-48">
                                {/* Fade overlay at top */}
                                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-zinc-50 to-transparent z-10 pointer-events-none" />

                                <div className="p-4 space-y-2 overflow-y-auto max-h-48 flex flex-col justify-end">
                                    {previewMessages.map((m, i) => {
                                        const text = extractText(m);
                                        const isUser = m.role === "user";
                                        return (
                                            <div
                                                key={i}
                                                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`px-3 py-2 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                                                        isUser
                                                            ? "bg-zinc-900 text-white"
                                                            : "bg-white border border-zinc-200 text-zinc-700"
                                                    }`}
                                                >
                                                    {text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 flex items-center justify-between gap-2">
                            <button
                                onClick={() => setStep("concepts")}
                                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition"
                            >
                                Start fresh
                            </button>
                            <button
                                onClick={onContinue}
                                className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:opacity-90 transition"
                            >
                                Continue
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-100">
                            <MessageCircle size={15} className="text-zinc-400" />
                            <span className="text-sm font-semibold text-zinc-800">
                                Your concepts
                            </span>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-5">
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Do you want to keep your locked-in concepts, or clear them along with the conversation?
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-zinc-100 flex items-center justify-between gap-2">
                            <button
                                onClick={() => setStep("resume")}
                                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-600 transition"
                            >
                                Back
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onStartFresh(false)}
                                    className="px-4 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 hover:border-zinc-400 transition"
                                >
                                    Clear all
                                </button>
                                <button
                                    onClick={() => onStartFresh(true)}
                                    className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:opacity-90 transition"
                                >
                                    Keep concepts
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}