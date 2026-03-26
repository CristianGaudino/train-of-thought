'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import type { Notification } from '@/lib/projects/definitions';
import { NotificationRow } from './NotificationRow';
import { useMembers } from '@/hooks/useMembers';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen]                   = useState(false);
    const ref                               = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const actorIds  = useMemo(() => [...new Set(notifications.map(n => n.actor))], [notifications]);
    const memberMap = useMembers(actorIds);

    // ── Fetch ──

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;
            setNotifications(await res.json());
        } catch {
            // Non-critical — bell shows empty state
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    // ── Poll every 30 seconds for new notifications ──
    useEffect(() => {
        const interval = setInterval(fetchNotifications, 60_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // ── Close on outside click ──

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Handlers ──

    const markRead = async (id: string) => {
        // Optimistic
        setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await fetch('/api/notifications', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id }),
            });
        } catch {
            // Rollback
            setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: false } : n));
        }
    };

    const markAll = async () => {
        const prev = notifications;
        setNotifications(ns => ns.map(n => ({ ...n, read: true })));
        try {
            await fetch('/api/notifications', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ all: true }),
            });
        } catch {
            setNotifications(prev);
        }
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
                            <span className="font-bold font-secondary text-zinc-900">
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span className="text-xs font-semibold bg-zinc-900 text-white rounded-full px-2 py-0.5 font-primary">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAll}
                                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 font-primary transition-colors cursor-pointer"
                            >
                                <CheckCheck size={13} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center text-zinc-300 font-primary">
                                <Bell size={28} className="mx-auto mb-2 text-zinc-200" />
                                <p className="text-sm m-0">All caught up!</p>
                            </div>
                        ) : (
                            notifications.slice(0, 5).map(n => (
                                <NotificationRow key={n.id} notification={n} onRead={markRead} compact memberMap={memberMap} />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-100 p-2.5">
                        <Link
                            href="/notifications"
                            onClick={() => setOpen(false)}
                            className="block w-full text-center py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors font-primary"
                        >
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}