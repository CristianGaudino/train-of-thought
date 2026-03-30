import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ClientLayout } from '@/components/projects/ClientLayout';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    return <ClientLayout>{children}</ClientLayout>;
}
