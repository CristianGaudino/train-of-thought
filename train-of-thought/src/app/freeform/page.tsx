"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";

export default function FreeformPage() {
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/freeform-chat",
            body: () => ({
                depth
            })
        })
    });

    const [input, setInput] = useState("");
    const [showIntro, setShowIntro] = useState(true);

    const chatRef = useRef<HTMLDivElement>(null);

    const [depth, setDepth] = useState(1); 
    // 1 = light
    // 2 = structured
    // 3 = deep

    const [ideaSummary, setIdeaSummary] = useState<any>(null);
    const [summarising, setSummarising] = useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!input.trim()) return;

        if (showIntro) {
            setShowIntro(false);
        }

        sendMessage({ text: input });
        setInput("");
    }

    async function handleSummarise() {
        setSummarising(true);

        const res = await fetch("/api/summarize-idea", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages })
        });

        const data = await res.json();
        setIdeaSummary(data);
        setSummarising(false);
    }

    return (
        <main className="min-h-screen flex flex-col bg-gradient-to-b from-white to-zinc-50 text-zinc-900">
            {/* Header */}
            <header className="w-full border-b border-zinc-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="font-semibold text-lg">Freeform Mode</h1>
                </div>
            </header>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full px-6 py-10">
                <div className="mb-4 flex gap-2">
                    <button
                        onClick={() => setDepth(1)}
                        className={depth === 1 ? "font-bold" : ""}
                    >
                        Light
                    </button>
                    <button
                        onClick={() => setDepth(2)}
                        className={depth === 2 ? "font-bold" : ""}
                    >
                        Structured
                    </button>
                    <button
                        onClick={() => setDepth(3)}
                        className={depth === 3 ? "font-bold" : ""}
                    >
                        Deep
                    </button>
                </div>
                {/* Scrollable Chat Window */}
                <div
                    ref={chatRef}
                    className="h-[60vh] overflow-auto bg-white border border-zinc-200 rounded-xl p-6 shadow-sm mb-6"
                >
                    {showIntro && (
                        <div className="text-center mb-8 text-zinc-600">
                            <h2 className="text-2xl font-bold mb-2">
                                Let's Find Your Idea
                            </h2>
                            <p>
                                Not sure what you want to create? Tell me
                                anything — a vibe, a dream, a topic, a feeling —
                                and we'll discover it together.
                            </p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`mb-3 p-3 rounded-xl max-w-[80%] ${
                                m.role === "user" ? "ml-auto bg-blue-100 text-right" : "mr-auto bg-gray-100 text-left"
                            }`}
                        >
                            {m.parts.map((part, index) =>
                                part.type === "text" ? (
                                    <span key={index}>{part.text}</span>
                                ) : null
                            )}
                        </div>
                    ))}
                </div>

                {/* Input bar */}
                <div className="mb-4">
                    <button
                        onClick={handleSummarise}
                        disabled={summarising}
                        className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm hover:opacity-90 disabled:opacity-50"
                    >
                        {summarising ? "Summarising..." : "Summarise Idea"}
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInput(e.target.value)
                        }
                        disabled={status !== "ready"}
                        placeholder="Tell me what's on your mind..."
                        className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 bg-white shadow-sm"
                    />

                    <button
                        type="submit"
                        disabled={status !== "ready"}
                        className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                        {status !== "ready" ? "Thinking..." : "Start"}
                    </button>
                </form>
                {ideaSummary && (
                    <div className="mt-6 p-4 border border-zinc-200 rounded-xl bg-white shadow-sm">
                        <h3 className="font-semibold mb-2">Idea Summary</h3>
                        <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(ideaSummary, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </main>
    );
}
