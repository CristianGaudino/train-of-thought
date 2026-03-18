import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/projects/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    return (
        <ToastProvider>
            <div className="flex h-screen bg-zinc-50 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-hidden flex flex-col">
                    {children}
                </main>
            </div>
        </ToastProvider>
    );
}
