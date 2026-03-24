export function StageIndicator({ state, index }: { state: "active" | "done" | "empty"; index: number }) {
    if (state === "done") {
        return (
            <div className="w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.5 6L6.5 2" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        );
    }
    if (state === "active") {
        return (
            <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-white">{index}</span>
            </div>
        );
    }
    return (
        <div className="w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5 opacity-50">
            <span className="text-xs text-zinc-400">{index}</span>
        </div>
    );
}
