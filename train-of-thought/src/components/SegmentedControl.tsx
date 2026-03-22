import { SegmentedControlProps } from "@/lib/definitions";


export default function SegmentedControl<T extends string>({
    segments,
    value,
    onChange,
    className = '',
}: SegmentedControlProps<T>) {
    return (
        <div className={`flex bg-zinc-100 rounded-xl p-0.5 ${className}`}>
            {segments.map(seg => (
                <button
                    key={seg.value}
                    onClick={() => onChange(seg.value)}
                    className={`
                        px-3 py-1 rounded-lg text-[12px] font-primary
                        transition-all duration-150 cursor-pointer
                        ${value === seg.value
                            ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-700'
                        }
                    `}
                >
                    {seg.label}
                </button>
            ))}
        </div>
    );
}