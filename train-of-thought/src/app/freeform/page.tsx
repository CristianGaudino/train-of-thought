"use client";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function FreeformPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/freeform-chat',
    }),
  });
  const [input, setInput] = useState('');

    return (
        <main className="min-h-screen flex flex-col bg-gradient-to-b from-white to-zinc-50 text-zinc-900">
            {/* Header */}
            <header className="w-full border-b border-zinc-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="font-semibold text-lg">Freeform Mode</h1>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col">
                {/* Intro / Hero */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Let's Find Your Idea</h2>
                    <p className="text-zinc-600 max-w-prose mx-auto">
                        Not sure what you want to create? Tell me anything — a vibe, a dream, a topic, a feeling — and we'll discover it together.
                    </p>
                </div>

                {/* Conversation / Generated Output */}
                <div className="flex-1 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm mb-6 overflow-auto">
                    {messages.map(m => (
                        <div key={m.id} className={`mb-2 p-2 rounded ${m.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
                            {m.parts.map((part, index) =>
                                part.type === 'text' ? <span key={index}><span className="font-bold capitalize">{m.role}:</span> {part.text}</span> : null,
                            )}
                        </div>
                    ))}
                </div>

                {/* Input bar */}
                <div className="w-full">
                    <form       
                        onSubmit={e => {
                            e.preventDefault();
                            if (input.trim()) {
                                sendMessage({ text: input });
                                setInput('');
                            }
                        }} 
                        className="flex gap-3"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={status !== 'ready'}
                            placeholder="Tell me what's on your mind..."
                            className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 bg-white shadow-sm"
                        />

                        <button
                            type="submit"
                            disabled={status !== 'ready'}
                            className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                            {status !== 'ready' ? "Thinking..." : "Start"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
