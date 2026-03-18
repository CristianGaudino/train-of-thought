"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Sparkles } from "lucide-react";

export default function LandingPage() {
    const [showModes, setShowModes] = useState(false);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 text-zinc-900 px-6">
            <div className="flex flex-col items-center text-center max-w-lg w-full">

                <div className="flex items-center gap-2 mb-2">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="60px" width="60px" xmlns="http://www.w3.org/2000/svg"><polygon fill="#CFD8DC" points="39.4,23 38.6,19 26,21.6 26,8 22,8 22,20.3 8.1,11.3 5.9,14.7 21.1,24.5 9.4,39.8 12.6,42.2 23.9,27.4 32.3,40.1 35.7,37.9 27.3,25.4"></polygon><circle fill="#3F51B5" cx="24" cy="24" r="7"></circle><g fill="#00BCD4"><circle cx="24" cy="8" r="5"></circle><circle cx="39" cy="21" r="5"></circle><circle cx="7" cy="13" r="5"></circle><circle cx="11" cy="41" r="5"></circle><circle cx="34" cy="39" r="5"></circle></g></svg>
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