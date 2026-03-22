import { SkeletonProps } from "@/lib/definitions";

export default function Skeleton({
    height    = 'h-4',
    width     = 'w-full',
    rounded   = 'rounded-lg',
    className = '',
}: SkeletonProps) {
    return (
        <div
            className={`bg-zinc-100 animate-pulse ${height} ${width} ${rounded} ${className}`}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 h-48 animate-pulse">
            <Skeleton height="h-4" width="w-3/4" className="mb-3" />
            <Skeleton height="h-3" width="w-full" className="mb-1.5" />
            <Skeleton height="h-3" width="w-2/3" />
        </div>
    );
}

export function RowSkeleton({ height = 'h-14' }: { height?: string }) {
    return (
        <Skeleton height={height} width="w-full" rounded="rounded-xl" />
    );
}

export function PageSkeleton() {
    return (
        <div className="flex flex-col gap-3 w-full max-w-2xl px-8 pt-8">
            <Skeleton height="h-8" width="w-64" rounded="rounded-xl" />
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-3/4" />
        </div>
    );
}
