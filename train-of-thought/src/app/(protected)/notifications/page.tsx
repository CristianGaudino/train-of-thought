'use client';

import { useEffect } from 'react';
import { CheckCheck, Bell } from 'lucide-react';
import { NOTIFICATION_CONFIG } from '@/lib/projects/config';
import { useNotifications } from '@/hooks/projects/useNotifications';
import { NotificationRow } from '@/components/projects/NotificationRow';
import { ReadFilter, TYPE_FILTERS } from '@/lib/projects/definitions';
import Button from '@/components/ui/buttons';
import SegmentedControl from '@/components/SegmentedControl';
import { RowSkeleton } from '@/components/ui/skeletons';
import EmptyState from '@/components/EmptyState';

export default function NotificationsPage() {
    useEffect(() => { document.title = 'Notifications | Train of Thought'; }, []);

    const {
        notifications, grouped, loading, unreadCount,
        typeFilter, readFilter,
        setTypeFilter, setReadFilter,
        markRead, markAll,
    } = useNotifications();

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-6 flex-shrink-0">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-secondary text-zinc-900 tracking-tight m-0">
                            Notifications
                        </h1>
                        <p className="text-sm text-zinc-400 font-primary mt-1 m-0">
                            {loading ? 'Loading…' : unreadCount > 0 ? (
                                <>
                                    <span className="text-zinc-900 font-semibold">{unreadCount} unread</span>
                                    {' · '}{notifications.length} total
                                </>
                            ) : `${notifications.length} notifications`}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="secondary" onClick={markAll} icon={<CheckCheck size={14} />}>
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 flex-wrap">
                    <div className="flex gap-1.5 flex-wrap">
                        {TYPE_FILTERS.map(({ value, label }) => {
                            const cfg    = value !== 'all' ? NOTIFICATION_CONFIG[value] : null;
                            const active = typeFilter === value;
                            return (
                                <button
                                    key={value}
                                    onClick={() => setTypeFilter(value)}
                                    className={`
                                        flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs
                                        font-primary border transition-all duration-150 cursor-pointer
                                        ${active
                                            ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700'
                                        }
                                    `}
                                >
                                    {cfg && (
                                        <span style={{ color: active ? '#fff' : cfg.color, fontSize: 11 }}>
                                            {cfg.icon}
                                        </span>
                                    )}
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex-1" />

                    <SegmentedControl
                        segments={[
                            { value: 'all',    label: 'All'    },
                            { value: 'unread', label: 'Unread' },
                            { value: 'read',   label: 'Read'   },
                        ]}
                        value={readFilter}
                        onChange={setReadFilter}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-8 py-5">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map(i => <RowSkeleton key={i} height="h-16" />)}
                    </div>
                ) : grouped.length === 0 ? (
                    <EmptyState icon={Bell} title="No notifications here" />
                ) : (
                    <div className="flex flex-col gap-7">
                        {grouped.map(group => (
                            <div key={group.label}>
                                <div className="text-xs font-semibold tracking-widest uppercase text-zinc-300 font-primary mb-3">
                                    {group.label}
                                </div>
                                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                                    {group.items.map((n, i) => (
                                        <div
                                            key={n.id}
                                            className={i < group.items.length - 1 ? 'border-b border-zinc-50' : ''}
                                        >
                                            <NotificationRow notification={n} onRead={markRead} />
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
