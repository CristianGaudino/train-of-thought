'use client';

import Link from 'next/link';
import { NOTIFICATION_CONFIG } from '@/lib/projects/config';
import { getMember } from '@/lib/projects/utils';
import type { NotificationRowProps } from '@/lib/projects/definitions';

export function NotificationRow({ notification, onRead, compact = false, memberMap }: NotificationRowProps) {
    const cfg   = NOTIFICATION_CONFIG[notification.type];
    const actor = memberMap?.[notification.actor] ?? getMember(notification.actor);
    const py    = compact ? 'py-3' : 'py-3.5';

    const href = notification.taskId
        ? `/projects/${notification.projectId}?task=${notification.taskId}`
        : `/projects/${notification.projectId}`;

    return (
        <div className={`flex items-start gap-3 px-4 ${py} group transition-colors duration-150 ${notification.read ? 'bg-white hover:bg-zinc-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'}`}>

            {/* Dot — space always reserved to prevent layout shift */}
            <div className="w-4 flex-shrink-0 flex items-center justify-center self-center">
                {!notification.read && (
                    <button
                        onClick={() => onRead(notification.id)}
                        title="Mark as read"
                        className="w-1.5 h-1.5 rounded-full cursor-pointer hover:scale-150 transition-transform duration-150"
                        style={{ background: cfg.color }}
                    />
                )}
            </div>

            {/* Icon */}
            <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color }}
            >
                {cfg.icon}
            </div>

            {/* Text + meta — clicking navigates and marks read */}
            <Link
                href={href}
                onClick={() => { if (!notification.read) onRead(notification.id); }}
                className="flex-1 min-w-0 no-underline"
            >
                <p className="text-sm font-primary text-zinc-800 leading-snug m-0">
                    <span className="font-semibold">
                        {actor?.name ?? 'Someone'}
                    </span>
                    {' '}{notification.text}{' '}
                    <span className="font-semibold" style={{ color: notification.projectAccent }}>
                        {notification.subject}
                    </span>
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-zinc-400 font-primary">{notification.time}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 inline-block" />
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: notification.projectAccent }} />
                        <span className="text-xs text-zinc-500 font-primary">{notification.projectTitle}</span>
                    </span>
                </div>
            </Link>

            {/* Mark as read — visible on hover for unread rows */}
            <div className="flex-shrink-0 self-center w-20 flex justify-end">
                {!notification.read && (
                    <button
                        onClick={() => onRead(notification.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs text-zinc-400 hover:text-zinc-600 font-primary cursor-pointer whitespace-nowrap"
                    >
                        Mark read
                    </button>
                )}
            </div>
        </div>
    );
}
