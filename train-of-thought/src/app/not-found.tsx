import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6 text-center">
            <div className="text-[80px] font-secondary text-zinc-200 leading-none mb-6">
                404
            </div>
            <h1 className="text-[24px] font-secondary text-zinc-900 tracking-tight mb-2">
                Page not found
            </h1>
            <p className="text-[14px] text-zinc-400 font-primary mb-8 max-w-xs leading-relaxed">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex items-center gap-3">
                <Link
                    href="/projects"
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold font-primary hover:bg-zinc-700 transition-colors"
                >
                    Go to projects
                </Link>
                <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-[13px] font-medium font-primary hover:bg-zinc-50 transition-colors"
                >
                    Home
                </Link>
            </div>
        </div>
    );
}
