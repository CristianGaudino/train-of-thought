'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Lightbulb, ArrowRight, LayoutGrid, CheckSquare, Bell } from 'lucide-react';
import Logo from './ui/svg';
import { Mode } from '@/lib/definitions';

export default function LandingClient() {
    const [mode, setMode] = useState<Mode>('idle');

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">

            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                    <Logo size={32} />
                    <div>
                        <div className="text-[15px] font-secondary text-zinc-900 tracking-tight leading-none">
                            Train of Thought
                        </div>
                        <div className="text-[11px] text-zinc-400 font-primary mt-0.5">
                            a thinking space
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/sign-in"
                        className="px-4 py-2 text-[13px] font-primary font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/sign-up"
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold font-primary hover:bg-zinc-700 transition-colors"
                    >
                        Get started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
                <div className="flex flex-col items-center text-center w-full max-w-xl">

                    {/* Logo mark */}
                    <div className="mb-6">
                        <Logo size={64} />
                    </div>

                    {/* Heading */}
                    <h1 className="text-[48px] sm:text-[56px] font-secondary text-zinc-900 tracking-tight leading-none mb-4">
                        Train of Thought
                    </h1>

                    <p className="text-[16px] text-zinc-500 font-primary leading-relaxed mb-3 max-w-md">
                        A thinking space for ideas worth developing.
                    </p>

                    <p className="text-[14px] text-zinc-400 font-primary leading-relaxed mb-12 max-w-md">
                        Explore ideas freely with AI, then turn them into real structured projects — all in one place.
                    </p>

                    {/* ── Two-mode entry ── */}
                    {mode === 'idle' ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <button
                                onClick={() => setMode('explore')}
                                className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 text-white text-[15px] font-semibold font-primary hover:bg-zinc-700 transition-colors shadow-sm hover:shadow-lg"
                            >
                                Start Creating
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                            </button>
                            <p className="text-[12px] text-zinc-400 font-primary">
                                Or{' '}
                                <Link
                                    href="/sign-in"
                                    className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 transition-colors"
                                >
                                    sign in
                                </Link>
                                {' '}to access your projects
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 w-full max-w-md">
                            <p className="text-[13px] text-zinc-400 font-primary mb-1">
                                How do you want to begin?
                            </p>

                            {/* Freeform */}
                            <Link
                                href="/freeform"
                                className="group w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all text-left flex items-start gap-4"
                            >
                                <div className="mt-0.5 w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <Sparkles size={16} className="text-zinc-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[14px] font-semibold text-zinc-900 font-primary block mb-0.5">
                                        I need inspiration
                                    </span>
                                    <span className="text-[12px] text-zinc-400 font-primary leading-relaxed">
                                        Explore ideas freely and discover what you want to create.
                                    </span>
                                </div>
                                <ArrowRight size={15} className="text-zinc-300 group-hover:text-zinc-500 mt-1 flex-shrink-0 transition-colors" />
                            </Link>

                            {/* Structured */}
                            <Link
                                href="/structured"
                                className="group w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all text-left flex items-start gap-4"
                            >
                                <div className="mt-0.5 w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <Lightbulb size={16} className="text-zinc-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[14px] font-semibold text-zinc-900 font-primary block mb-0.5">
                                        I have an idea
                                    </span>
                                    <span className="text-[12px] text-zinc-400 font-primary leading-relaxed">
                                        Start with a clear concept and build it with structure.
                                    </span>
                                </div>
                                <ArrowRight size={15} className="text-zinc-300 group-hover:text-zinc-500 mt-1 flex-shrink-0 transition-colors" />
                            </Link>

                            {/* Sign up nudge */}
                            <div className="mt-2 pt-4 border-t border-zinc-100 flex items-center justify-between">
                                <p className="text-[12px] text-zinc-400 font-primary">
                                    Want to save your work?
                                </p>
                                <Link
                                    href="/sign-up"
                                    className="text-[12px] font-semibold text-zinc-900 font-primary hover:text-zinc-600 transition-colors flex items-center gap-1"
                                >
                                    Create a free account
                                    <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview cards */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                    {[
                        { title: 'Brand Redesign',    status: 'In Progress', accent: '#2D7A5F', color: '#E8F4F0', pct: 58, tasks: '7/12' },
                        { title: 'Q2 Product Launch', status: 'Planning',    accent: '#3A5FA0', color: '#EEF2F8', pct: 24, tasks: '4/24' },
                        { title: 'Learn Ceramics',    status: 'In Progress', accent: '#A0714F', color: '#F5F0EA', pct: 40, tasks: '3/8'  },
                    ].map(card => (
                        <div
                            key={card.title}
                            className="text-left rounded-2xl border border-zinc-100 p-5 relative overflow-hidden"
                            style={{ background: card.color }}
                        >
                            <div
                                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                                style={{ background: card.accent }}
                            />
                            <div className="text-[14px] font-semibold text-zinc-900 font-primary mt-1 truncate">
                                {card.title}
                            </div>
                            <div
                                className="text-[11px] font-medium font-primary mt-0.5"
                                style={{ color: card.accent }}
                            >
                                {card.status}
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-[11px] font-primary text-zinc-400 mb-1.5">
                                    <span>Progress</span>
                                    <span style={{ color: card.accent, fontWeight: 600 }}>{card.tasks} tasks</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${card.pct}%`, background: card.accent }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features strip */}
            <div className="border-t border-zinc-100 bg-white px-8 py-16">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-[28px] font-secondary text-zinc-900 tracking-tight text-center mb-12">
                        From idea to done
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                        {[
                            {
                                icon:  LayoutGrid,
                                title: 'Project Space',
                                desc:  'Organise work into projects with sections, tasks and deadlines. Switch between a quick view and full detail.',
                            },
                            {
                                icon:  CheckSquare,
                                title: 'My Tasks',
                                desc:  'See everything assigned to you across all projects in one view, grouped by date, project or priority.',
                            },
                            {
                                icon:  Bell,
                                title: 'Notifications',
                                desc:  'Stay on top of comments, assignments and project activity without checking every tab.',
                            },
                        ].map(f => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="flex flex-col gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center">
                                        <Icon size={18} className="text-zinc-600" />
                                    </div>
                                    <div className="text-[15px] font-semibold text-zinc-900 font-primary">
                                        {f.title}
                                    </div>
                                    <div className="text-[13px] text-zinc-500 font-primary leading-relaxed">
                                        {f.desc}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-zinc-100 bg-white px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Logo size={20} />
                    <span className="text-[13px] font-secondary text-zinc-400">Train of Thought</span>
                </div>
                <div className="text-[12px] text-zinc-400 font-primary">
                    Built with Next.js, Clerk &amp; Neon
                </div>
            </footer>
        </div>
    );
}
