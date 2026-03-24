'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to your error tracking service here (e.g. Sentry)
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6 text-center">
            <div className="text-8xl font-secondary text-zinc-200 leading-none mb-6">
                !
            </div>
            <h1 className="text-2xl font-secondary text-zinc-900 tracking-tight mb-2">
                Something went wrong
            </h1>
            <p className="text-sm text-zinc-400 font-primary mb-8 max-w-xs leading-relaxed">
                An unexpected error occurred. You can try again or head back to your projects.
            </p>
            {error.digest && (
                <p className="text-xs text-zinc-300 font-primary mb-6 font-mono">
                    Error ID: {error.digest}
                </p>
            )}
            <div className="flex items-center gap-3">
                <button
                    onClick={reset}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold font-primary hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                    Try again
                </button>
                <Link
                    href="/projects"
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-sm font-medium font-primary hover:bg-zinc-50 transition-colors"
                >
                    Go to projects
                </Link>
            </div>
        </div>
    );
}
