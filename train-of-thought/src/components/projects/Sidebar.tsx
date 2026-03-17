'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { LayoutGrid, CheckSquare, Bell, Lightbulb, LayoutTemplate } from 'lucide-react';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
    { id: 'projects',      href: '/projects',      icon: LayoutGrid,     label: 'Project Space' },
    { id: 'tasks',         href: '/tasks',         icon: CheckSquare,    label: 'My Tasks'      },
    { id: 'notifications', href: '/notifications', icon: Bell,           label: 'Notifications' },
    { id: 'ideas',         href: '/ideas',         icon: Lightbulb,      label: 'Ideas'         },
    { id: 'templates',     href: '/templates',     icon: LayoutTemplate, label: 'Templates'     },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col py-7">

            {/* Logo + bell */}
            <div className="flex items-center justify-between px-5 pb-6 border-b border-zinc-100">
                <div>
                    <div className="text-xl font-secondary text-zinc-900 tracking-tight">
                        Train of Thought
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 font-primary">
                        your creative space
                    </div>
                </div>
                <NotificationBell />
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 pt-4">
                {NAV_ITEMS.map(item => {
                    const active = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5
                                text-[13.5px] font-primary transition-colors duration-150
                                ${active
                                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                                }
                            `}
                        >
                            <Icon
                                size={16}
                                className={active ? 'text-zinc-900' : 'text-zinc-400'}
                            />
                            <span className="flex-1">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User — Clerk UserButton */}
            <div className="px-5 pt-4 border-t border-zinc-100 flex items-center gap-2.5">
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: 'w-8 h-8',
                        },
                    }}
                />
                <div className="text-[13px] font-semibold text-zinc-900 font-primary">
                    My Account
                </div>
            </div>
        </aside>
    );
}
