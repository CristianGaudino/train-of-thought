import { RingProps } from "@/lib/projects/definitions";

export default function Ring({ done, total, accent, size = 40 }: RingProps) {
    const pct  = total ? done / total : 0;
    const r    = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const dash = pct * circ;
    const cx   = size / 2;
    const cy   = size / 2;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="flex-shrink-0"
        >
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke="#E4E4E7"
                strokeWidth="3"
            />
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={accent}
                strokeWidth="3"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <text
                x={cx}
                y={cy + size * 0.1}
                textAnchor="middle"
                fontSize={size * 0.22}
                fill={accent}
                fontWeight="700"
                fontFamily="var(--font-montserrat, sans-serif)"
            >
                {total ? `${done}/${total}` : '–'}
            </text>
        </svg>
    );
}
