'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import {
    LayoutGrid, CheckSquare, Bell,
    Lightbulb, LayoutTemplate,
    Sparkles, FlaskConical,
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
    { id: 'projects',      href: '/projects',     icon: LayoutGrid,     label: 'Project Space' },
    { id: 'tasks',         href: '/tasks',         icon: CheckSquare,    label: 'My Tasks'      },
    { id: 'notifications', href: '/notifications', icon: Bell,           label: 'Notifications' },
    { id: 'ideas',         href: '/ideas',         icon: Lightbulb,      label: 'Ideas'         },
    { id: 'templates',     href: '/templates',     icon: LayoutTemplate, label: 'Templates'     },
];

const CHAT_ITEMS = [
    { id: 'freeform',   href: '/freeform',   icon: Sparkles,     label: 'Freeform'   },
    { id: 'structured', href: '/structured', icon: FlaskConical, label: 'Structured' },
];

export default function Sidebar() {
    const pathname    = usePathname();
    const { user }    = useUser();

    const displayName = user?.firstName
        ?? user?.username
        ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]
        ?? 'My Account';

    return (
        <aside className="w-56 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col py-7">

            {/* Logo + bell */}
            <div className="flex items-center justify-between px-5 pb-6 border-b border-zinc-100">
                <div>
                    <div className="text-xl font-secondary text-zinc-900 tracking-tight">
                        Train of Thought
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5 font-primary">
                        a thinking space
                    </div>
                </div>
                <NotificationBell />
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 pt-4 flex flex-col">

                {/* Main project items */}
                <div className="flex-1">
                    {NAV_ITEMS.map(item => {
                        const active = pathname.startsWith(item.href);
                        const Icon   = item.icon;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`
                                    flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5
                                    text-sm font-primary transition-colors duration-150
                                    ${active
                                        ? 'bg-zinc-100 text-zinc-900 font-semibold'
                                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                                    }
                                `}
                            >
                                <Icon size={16} className={active ? 'text-zinc-900' : 'text-zinc-400'} />
                                <span className="flex-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Explore section — AI chat tools */}
                <div className="pt-4 border-t border-zinc-100">
                    <div className="px-2.5 mb-1.5">
                        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-300 font-primary">
                            Explore
                        </span>
                    </div>
                    {CHAT_ITEMS.map(item => {
                        const active = pathname.startsWith(item.href);
                        const Icon   = item.icon;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`
                                    flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5
                                    text-sm font-primary transition-colors duration-150
                                    ${active
                                        ? 'bg-zinc-100 text-zinc-900 font-semibold'
                                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                                    }
                                `}
                            >
                                <Icon size={16} className={active ? 'text-zinc-900' : 'text-zinc-400'} />
                                <span className="flex-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User */}
            <div className="px-5 pt-4 border-t border-zinc-100 flex items-center gap-2.5">
                <UserButton
                    appearance={{
                        elements: { avatarBox: 'w-8 h-8' },
                    }}
                />
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 font-primary truncate">
                        {displayName}
                    </div>
                    {user?.emailAddresses?.[0]?.emailAddress && (
                        <div className="text-xs text-zinc-400 font-primary truncate">
                            {user.emailAddresses[0].emailAddress}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
