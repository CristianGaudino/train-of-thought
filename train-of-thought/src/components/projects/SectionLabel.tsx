import { SectionLabelProps } from "@/lib/projects/definitions";

export default function SectionLabel({ children, className = '' }: SectionLabelProps) {
    return (
        <div className={`text-[11px] font-semibold tracking-widest uppercase text-zinc-400 font-primary mb-2.5 ${className}`}>
            {children}
        </div>
    );
}