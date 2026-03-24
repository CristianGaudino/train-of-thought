'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Logo from '../ui/svg';

export function ChatNav() {
    const { user, isLoaded } = useUser();
    const isSignedIn = isLoaded && !!user;

    return (
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-100">

            {/* Left — logo + back link */}
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 group">
                    <Logo size={24} />
                    <span className="text-sm font-secondary text-zinc-800 tracking-tight group-hover:text-zinc-600 transition-colors">
                        Train of Thought
                    </span>
                </Link>

                {/* Back to projects if signed in */}
                {isSignedIn && (
                    <>
                        <span className="text-zinc-200 text-sm">/</span>
                        <Link
                            href="/projects"
                            className="flex items-center gap-1.5 text-xs font-primary text-zinc-400 hover:text-zinc-700 transition-colors"
                        >
                            <ArrowLeft size={12} />
                            Projects
                        </Link>
                    </>
                )}
            </div>

            {/* Right — auth */}
            <div className="flex items-center gap-2">
                {isLoaded && (
                    isSignedIn ? (
                        <UserButton
                            appearance={{
                                elements: { avatarBox: 'w-7 h-7' },
                            }}
                        />
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="px-3 py-1.5 text-xs font-primary font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/sign-up"
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold font-primary hover:bg-zinc-700 transition-colors"
                            >
                                Get started
                            </Link>
                        </>
                    )
                )}
            </div>
        </div>
    );
}
