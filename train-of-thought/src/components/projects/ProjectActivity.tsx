'use client';

import { useEffect, useState, useMemo } from 'react';
import { NOTIFICATION_CONFIG } from '@/lib/projects/config';
import type { Notification, ProjectActivityProps } from '@/lib/projects/definitions';
import { useMembers } from '@/hooks/useMembers';
import { RowSkeleton } from '@/components/ui/skeletons';

export function ProjectActivity({ header, projectId }: ProjectActivityProps) {
    const [activity, setActivity] = useState<Notification[]>([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/projects/${projectId}/activity`)
            .then(r => r.json())
            .then(data => setActivity(Array.isArray(data) ? data : []))
            .catch(() => setActivity([]))
            .finally(() => setLoading(false));
    }, [projectId]);

    const actorIds  = useMemo(() => [...new Set(activity.map(a => a.actor))], [activity]);
    const memberMap = useMembers(actorIds);

    return (
        <div className="px-8 py-7 max-w-2xl">
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[...Array(4)].map((_, i) => <RowSkeleton key={i} />)}
                </div>
            ) : activity.length === 0 ? (
                <p className="text-sm text-zinc-400 font-primary">No activity yet.</p>
            ) : (
                <div className="flex flex-col">
                    {activity.map((a, i) => {
                        const actor = memberMap[a.actor];
                        const cfg   = NOTIFICATION_CONFIG[a.type] ?? NOTIFICATION_CONFIG.comment;
                        return (
                            <div key={a.id} className="flex gap-3.5 items-start pb-5 relative">
                                {i < activity.length - 1 && (
                                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-zinc-100" />
                                )}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 z-10 border"
                                    style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '30' }}
                                >
                                    {cfg.icon}
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className="text-sm font-primary text-zinc-700 leading-snug m-0">
                                        <span className="font-semibold">{actor?.name ?? 'Someone'}</span>
                                        {' '}{a.text}{' '}
                                        <span className="font-semibold" style={{ color: header.accent }}>{a.subject}</span>
                                    </p>
                                    <p className="text-xs text-zinc-400 font-primary mt-1 m-0">{a.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
