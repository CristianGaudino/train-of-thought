"use client";

import { useState } from "react";
import Link from "next/link";
import { BrainCircuit, Lightbulb, Sparkles } from "lucide-react";

export default function LandingPage() {
    const [showModes, setShowModes] = useState(false);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 text-zinc-900 px-6">
            <div className="flex flex-col items-center text-center max-w-lg w-full">

                <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="w-10 h-10" />
                    <h1 className="text-4xl font-bold">Train of Thought</h1>
                </div>

                <p className="text-zinc-400 text-sm mb-8">
                    A thinking space for ideas worth developing.
                </p>

                {!showModes ? (
                    <button
                        onClick={() => setShowModes(true)}
                        className="px-10 py-4 rounded-2xl text-lg font-semibold bg-zinc-900 text-white shadow hover:shadow-xl transition-all"
                    >
                        Start Creating
                    </button>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        <p className="text-sm text-zinc-500 mb-2">
                            How do you want to begin?
                        </p>

                        <Link
                            href="/freeform"
                            className="group w-full px-6 py-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all text-left flex items-start gap-4"
                        >
                            <div className="mt-0.5 w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center shrink-0 transition">
                                <Sparkles size={16} className="text-zinc-600" />
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-zinc-900 block mb-0.5">
                                    I Need Inspiration
                                </span>
                                <span className="text-xs text-zinc-400 leading-relaxed">
                                    Explore ideas freely and discover what you want to create.
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/structured"
                            className="group w-full px-6 py-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all text-left flex items-start gap-4"
                        >
                            <div className="mt-0.5 w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center shrink-0 transition">
                                <Lightbulb size={16} className="text-zinc-600" />
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-zinc-900 block mb-0.5">
                                    I Have an Idea
                                </span>
                                <span className="text-xs text-zinc-400 leading-relaxed">
                                    Start with a clear concept and build it with structure.
                                </span>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}