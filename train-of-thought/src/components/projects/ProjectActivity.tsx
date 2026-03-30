'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Notification, ProjectActivityProps } from '@/lib/projects/definitions';
import { NOTIFICATION_CONFIG } from '@/lib/projects/config';
import { useMembers } from '@/hooks/useMembers';
import { Avatar } from './Avatar';
import { RowSkeleton } from '@/components/ui/skeletons';
import { activityText, groupByDate } from '@/lib/projects/utils';

export function ProjectActivity({ header, projectId, onTaskClick }: ProjectActivityProps) {
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

    const actorIds = useMemo(() => [...new Set(activity.map(a => a.actor))], [activity]);
    const memberMap = useMembers(actorIds);
    const grouped   = useMemo(() => groupByDate(activity), [activity]);

    return (
        <div className="px-4 md:px-8 py-6 max-w-2xl">
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[...Array(4)].map((_, i) => <RowSkeleton key={i} />)}
                </div>
            ) : activity.length === 0 ? (
                <p className="text-sm text-zinc-400 font-primary">No activity yet.</p>
            ) : (
                <div className="flex flex-col gap-7">
                    {grouped.map(group => (
                        <div key={group.label}>
                            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-300 font-primary mb-4">
                                {group.label}
                            </div>
                            <div className="flex flex-col">
                                {group.items.map((a, i) => {
                                    const actor  = memberMap[a.actor];
                                    const cfg    = NOTIFICATION_CONFIG[a.type] ?? NOTIFICATION_CONFIG.comment;
                                    const verb   = activityText(a.text);
                                    const isLast = i === group.items.length - 1;

                                    return (
                                        <div key={a.id} className="flex gap-3.5 items-start pb-5 relative">
                                            {!isLast && (
                                                <div className="absolute left-[15px] top-10 bottom-0 w-px bg-zinc-100" />
                                            )}

                                            {/* Avatar + type badge */}
                                            <div className="relative flex-shrink-0 z-10">
                                                {actor
                                                    ? <Avatar member={actor} size={32} />
                                                    : <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200" />
                                                }
                                                <div
                                                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] border-2 border-white"
                                                    style={{ background: cfg.bg, color: cfg.color }}
                                                >
                                                    {cfg.icon}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <p className="text-sm font-primary text-zinc-700 leading-snug m-0">
                                                    <span className="font-semibold text-zinc-900">
                                                        {actor?.name ?? 'Someone'}
                                                    </span>
                                                    {' '}{verb}{' '}
                                                    {a.taskId && onTaskClick ? (
                                                        <button
                                                            onClick={() => onTaskClick(a.taskId!)}
                                                            className="font-semibold cursor-pointer hover:underline underline-offset-2 bg-transparent border-0 p-0 text-sm font-primary"
                                                            style={{ color: header.accent }}
                                                        >
                                                            {a.subject}
                                                        </button>
                                                    ) : (
                                                        <span className="font-semibold" style={{ color: header.accent }}>
                                                            {a.subject}
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {a.sectionTitle && (
                                                        <>
                                                            <span className="text-xs text-zinc-400 font-primary">{a.sectionTitle}</span>
                                                            <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 inline-block" />
                                                        </>
                                                    )}
                                                    <span className="text-xs text-zinc-300 font-primary">{a.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
