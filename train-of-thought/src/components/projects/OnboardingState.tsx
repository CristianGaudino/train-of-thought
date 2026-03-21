'use client';

import Link from 'next/link';
import { Plus, Sparkles, FlaskConical, ArrowRight } from 'lucide-react';
import { OnboardingEmptyStateProps } from '@/lib/projects/definitions';

export default function OnboardingEmptyState({ onNewProject }: OnboardingEmptyStateProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">

            {/* Decorative preview cards */}
            <div className="flex gap-3 mb-10 opacity-40 pointer-events-none select-none">
                {[
                    { accent: '#2D7A5F', color: '#E8F4F0', w: 56 },
                    { accent: '#3A5FA0', color: '#EEF2F8', w: 36 },
                    { accent: '#A0714F', color: '#F5F0EA', w: 48 },
                ].map((card, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-zinc-100 p-4 relative overflow-hidden flex flex-col gap-2"
                        style={{ background: card.color, width: 140 }}
                    >
                        <div
                            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                            style={{ background: card.accent }}
                        />
                        <div className="h-3 rounded-full bg-zinc-200 mt-1" style={{ width: `${card.w + 20}%` }} />
                        <div className="h-2 rounded-full bg-zinc-100" style={{ width: `${card.w}%` }} />
                        <div className="h-2 rounded-full bg-zinc-100" style={{ width: `${card.w - 10}%` }} />
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-zinc-200">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${card.w}%`, background: card.accent }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Heading */}
            <h2 className="text-[26px] font-secondary text-zinc-900 tracking-tight mb-2">
                Your project space is empty
            </h2>
            <p className="text-[14px] text-zinc-400 font-primary leading-relaxed mb-10 max-w-sm">
                Start by exploring an idea in the AI chat, or jump straight in and create a project manually.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">

                {/* Explore with AI */}
                <div className="flex-1 flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300 font-primary text-center">
                        Start with AI
                    </p>
                    <Link
                        href="/freeform"
                        className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all text-left"
                    >
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center flex-shrink-0 transition-colors">
                            <Sparkles size={15} className="text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-zinc-900 font-primary">
                                Freeform
                            </div>
                            <div className="text-[11px] text-zinc-400 font-primary mt-0.5">
                                Explore an idea first
                            </div>
                        </div>
                        <ArrowRight size={14} className="text-zinc-300 group-hover:text-zinc-500 flex-shrink-0 transition-colors" />
                    </Link>
                    <Link
                        href="/structured"
                        className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all text-left"
                    >
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center flex-shrink-0 transition-colors">
                            <FlaskConical size={15} className="text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-zinc-900 font-primary">
                                Structured
                            </div>
                            <div className="text-[11px] text-zinc-400 font-primary mt-0.5">
                                Shape a specific idea
                            </div>
                        </div>
                        <ArrowRight size={14} className="text-zinc-300 group-hover:text-zinc-500 flex-shrink-0 transition-colors" />
                    </Link>
                </div>

                {/* Divider */}
                <div className="hidden sm:flex flex-col items-center gap-2 py-4">
                    <div className="flex-1 w-px bg-zinc-100" />
                    <span className="text-[11px] text-zinc-300 font-primary">or</span>
                    <div className="flex-1 w-px bg-zinc-100" />
                </div>
                <div className="sm:hidden flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-100" />
                    <span className="text-[11px] text-zinc-300 font-primary">or</span>
                    <div className="flex-1 h-px bg-zinc-100" />
                </div>

                {/* Create manually */}
                <div className="flex-1 flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300 font-primary text-center">
                        Start manually
                    </p>
                    <button
                        onClick={onNewProject}
                        className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed border-zinc-200 bg-transparent hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left h-full cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 flex items-center justify-center flex-shrink-0 transition-colors">
                            <Plus size={15} className="text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-zinc-900 font-primary">
                                New project
                            </div>
                            <div className="text-[11px] text-zinc-400 font-primary mt-0.5">
                                Start from scratch
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
