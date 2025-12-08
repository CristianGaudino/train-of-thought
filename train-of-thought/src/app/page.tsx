"use client";

import { useState } from "react";
import Link from "next/link";
import { FcMindMap } from "react-icons/fc";

export default function LandingPage() {
    const [showModes, setShowModes] = useState(false);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 text-zinc-900">
            <div className="flex flex-col items-center text-center px-6 max-w-xl">

                {/* Title */}
                <div className="flex items-center gap-2 mb-2">
                    <FcMindMap className="w-10 h-10" />
                    <h1 className="text-4xl font-bold">Train of Thought</h1>
                </div>

                <p className="text-zinc-600 text-center max-w-md mb-6">
                    Capture sparks, explore ideas, and co-create with AI.
                </p>

                {/* Initial CTA */}
                {!showModes && (
                    <button
                        onClick={() => setShowModes(true)}
                        className="
                            px-10 py-4 rounded-2xl text-lg font-semibold
                            bg-zinc-900 text-white shadow hover:shadow-xl
                            transition-all
                        "
                    >
                        Start Creating
                    </button>
                )}

                {/* Mode Selection */}
                {showModes && (
                    <div
                        className="flex flex-col gap-2 w-full transition-all animate-fadeInSlow"
                    >
                        <h2 className="text-2xl font-semibold">
                            How do you want to begin?
                        </h2>

                        <Link
                            href="/structured"
                            className="
                                w-full px-6 py-4 rounded-2xl bg-white border border-zinc-300
                                hover:border-zinc-400 hover:shadow transition-all
                                text-left
                            "
                        >
                            <span className="text-lg font-medium block">I Have an Idea</span>
                            <span className="text-sm text-zinc-600 block">
                                Start with a clear concept and build it with structure.
                            </span>
                        </Link>

                        <Link
                            href="/freeform"
                            className="
                                w-full px-6 py-4 rounded-2xl bg-white border border-zinc-300
                                hover:border-zinc-400 hover:shadow transition-all
                                text-left
                            "
                        >
                            <span className="text-lg font-medium block">I Need Inspiration</span>
                            <span className="text-sm text-zinc-600 block">
                                Explore ideas freely and discover what you want to create.
                            </span>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
