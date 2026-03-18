'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { Notification, ReadFilter, TypeFilter, UseNotificationsReturn } from '@/lib/projects/definitions';

export function useNotifications(): UseNotificationsReturn {
    const { error: toastError } = useToast();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading]             = useState(true);
    const [typeFilter, setTypeFilter]       = useState<TypeFilter>('all');
    const [readFilter, setReadFilter]       = useState<ReadFilter>('all');

    // ── Fetch ──

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) throw new Error('Failed');
            setNotifications(await res.json());
        } catch {
            // Non-critical
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    // ── Derived ──

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.read).length,
        [notifications],
    );

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

    // ── Mark read ──

    const markRead = async (id: string) => {
        const prev = notifications.find(n => n.id === id);
        // Optimistic
        setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await fetch('/api/notifications', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id }),
            });
        } catch {
            toastError('Failed to mark as read');
            if (prev) {
                setNotifications(ns => ns.map(n => n.id === id ? prev : n));
            }
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
            toastError('Failed to mark all as read');
            setNotifications(prev);
        }
    };

    return {
        notifications,
        filtered,
        grouped,
        loading,
        unreadCount,
        typeFilter,
        readFilter,
        setTypeFilter,
        setReadFilter,
        markRead,
        markAll,
    };
}
