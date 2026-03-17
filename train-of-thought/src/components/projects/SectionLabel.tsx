export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-[11px] font-semibold tracking-widest uppercase text-zinc-300 font-primary mb-2.5">
            {children}
        </div>
    );
}