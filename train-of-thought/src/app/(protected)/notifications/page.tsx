'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCheck, Bell } from 'lucide-react';
import { TYPE_FILTERS, type Notification, type ReadFilter, type TypeFilter } from '@/lib/projects/definitions';
import { NOTIF_CONFIG } from '@/lib/projects/config';
import { NotifRow } from '@/components/projects/NotifBell';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading]             = useState(true);
    const [typeFilter, setTypeFilter]       = useState<TypeFilter>('all');
    const [readFilter, setReadFilter]       = useState<ReadFilter>('all');

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) throw new Error('Failed to fetch');
            setNotifications(await res.json());
        } catch {
            // Keep empty state — non-critical
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

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
        // Optimistic
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

    const filtered = useMemo(() =>
        notifications
            .filter(n => typeFilter === 'all' || n.type === typeFilter)
            .filter(n => {
                if (readFilter === 'unread') return !n.read;
                if (readFilter === 'read')   return  n.read;
                return true;
            }),
        [notifications, typeFilter, readFilter],
    );

    const grouped = useMemo(() => {
        const today:   Notification[] = [];
        const earlier: Notification[] = [];
        filtered.forEach(n => {
            if (n.time.includes('min') || n.time.includes('hr')) today.push(n);
            else earlier.push(n);
        });
        const g: { label: string; items: Notification[] }[] = [];
        if (today.length)   g.push({ label: 'Today',   items: today   });
        if (earlier.length) g.push({ label: 'Earlier', items: earlier });
        return g;
    }, [filtered]);

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-6 flex-shrink-0">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h1 className="text-[26px] font-secondary text-zinc-900 tracking-tight m-0">
                            Notifications
                        </h1>
                        <p className="text-[13px] text-zinc-400 font-primary mt-1 m-0">
                            {loading ? 'Loading…' : unreadCount > 0 ? (
                                <><span className="text-zinc-900 font-semibold">{unreadCount} unread</span> · {notifications.length} total</>
                            ) : `${notifications.length} notifications`}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAll}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-[13px] font-medium font-primary cursor-pointer hover:bg-zinc-50 transition-colors"
                        >
                            <CheckCheck size={14} />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 flex-wrap">
                    <div className="flex gap-1.5 flex-wrap">
                        {TYPE_FILTERS.map(({ value, label }) => {
                            const cfg    = value !== 'all' ? NOTIF_CONFIG[value] : null;
                            const active = typeFilter === value;
                            return (
                                <button
                                    key={value}
                                    onClick={() => setTypeFilter(value)}
                                    className={`
                                        flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px]
                                        font-primary border transition-all duration-150 cursor-pointer
                                        ${active
                                            ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700'
                                        }
                                    `}
                                >
                                    {cfg && <span style={{ color: active ? '#fff' : cfg.color, fontSize: 11 }}>{cfg.icon}</span>}
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex-1" />
                    <div className="flex bg-zinc-100 rounded-xl p-0.5">
                        {(['all', 'unread', 'read'] as ReadFilter[]).map(v => (
                            <button
                                key={v}
                                onClick={() => setReadFilter(v)}
                                className={`px-3 py-1 rounded-lg text-[12px] font-primary capitalize transition-all duration-150 cursor-pointer ${readFilter === v ? 'bg-white text-zinc-900 font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-8 py-5">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-white border border-zinc-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-300 gap-3">
                        <Bell size={36} className="text-zinc-200" />
                        <span className="text-[14px] font-primary">No notifications here</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-7">
                        {grouped.map(group => (
                            <div key={group.label}>
                                <div className="text-[11px] font-semibold tracking-widest uppercase text-zinc-300 font-primary mb-3">
                                    {group.label}
                                </div>
                                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                                    {group.items.map((n, i) => (
                                        <div key={n.id} className={i < group.items.length - 1 ? 'border-b border-zinc-50' : ''}>
                                            <NotifRow notif={n} onRead={markRead} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
