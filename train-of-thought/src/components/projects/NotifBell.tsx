'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import type { Notification } from '@/lib/projects/definitions';
import { MOCK_NOTIFICATIONS, NOTIF_CONFIG } from '@/lib/projects/config';
import { getMember } from '@/lib/projects/utils';

export default function NotifBell() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markRead = (id: string) => {
        setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAll = () => {
        setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    };

    return (
        <div ref={ref} className="relative">

            {/* Bell button */}
            <button
                onClick={() => setOpen(v => !v)}
                className={`
                    w-8 h-8 rounded-xl flex items-center justify-center relative
                    transition-colors duration-150 cursor-pointer
                    ${open ? 'bg-zinc-100' : 'hover:bg-zinc-100'}
                `}
            >
                <Bell size={16} className="text-zinc-500" />
                {unreadCount > 0 && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-full top-0 ml-3 w-[360px] bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold font-secondary text-zinc-900">
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span className="text-[11px] font-semibold bg-zinc-900 text-white rounded-full px-2 py-0.5 font-primary">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAll}
                                className="flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-600 font-primary transition-colors cursor-pointer"
                            >
                                <CheckCheck size={13} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.slice(0, 5).length === 0 ? (
                            <div className="py-10 text-center text-zinc-300 text-[13px] font-primary">
                                <Bell size={28} className="mx-auto mb-2 text-zinc-200" />
                                All caught up!
                            </div>
                        ) : (
                            notifications.slice(0, 5).map(n => (
                                <NotifRow key={n.id} notif={n} onRead={markRead} compact />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-100 p-2.5">
                        <Link
                            href="/notifications"
                            onClick={() => setOpen(false)}
                            className="block w-full text-center py-2 rounded-xl border border-zinc-200 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors font-primary"
                        >
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Shared notification row ──────────────────────────────────────────────────

interface NotifRowProps {
    notif: Notification;
    onRead: (id: string) => void;
    compact?: boolean;
}

export function NotifRow({ notif, onRead, compact = false }: NotifRowProps) {
    const cfg   = NOTIF_CONFIG[notif.type];
    const actor = getMember(notif.actor);
    const py    = compact ? 'py-3' : 'py-3.5';

    return (
        <div
            onClick={() => onRead(notif.id)}
            className={`
                flex items-start gap-3 px-4 ${py} cursor-pointer transition-colors duration-150
                relative border-b border-zinc-50 last:border-none
                ${notif.read ? 'bg-white hover:bg-zinc-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'}
            `}
        >
            {/* Unread dot */}
            {!notif.read && (
                <div
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: cfg.color }}
                />
            )}

            {/* Type icon */}
            <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${!notif.read ? 'ml-2' : ''}`}
                style={{ background: cfg.bg, color: cfg.color }}
            >
                {cfg.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-primary text-zinc-800 leading-snug m-0">
                    <span className="font-semibold">{actor?.name ?? 'Someone'}</span>
                    {' '}{notif.text}{' '}
                    <span className="font-semibold" style={{ color: notif.projectAccent }}>
                        {notif.subject}
                    </span>
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] text-zinc-400 font-primary">{notif.time}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 inline-block" />
                    <span className="flex items-center gap-1">
                        <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ background: notif.projectAccent }}
                        />
                        <span className="text-[11px] text-zinc-500 font-primary">{notif.projectTitle}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
