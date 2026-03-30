'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-dvh bg-zinc-50 overflow-hidden">

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Mobile top bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100 flex-shrink-0 md:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="text-base font-secondary text-zinc-900 tracking-tight">
                        Train of Thought
                    </span>
                    <NotificationBell />
                </div>

                <main className="flex-1 overflow-hidden flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
