interface PillProps {
    children: React.ReactNode;
    bg: string;
    color: string;
    className?: string;
}

export default function Pill({ children, bg, color, className = '' }: PillProps) {
    return (
        <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 font-primary ${className}`}
            style={{ background: bg, color }}
        >
            {children}
        </span>
    );
}
