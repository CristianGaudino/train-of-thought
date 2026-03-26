'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Users } from 'lucide-react';
import { MemberRow } from '@/components/MemberRow';
import { useMembers } from '@/hooks/useMembers';
import { RowSkeleton } from '@/components/ui/skeletons';
import type { Member } from '@/lib/projects/definitions';

export default function OrganisationPage() {
    useEffect(() => { document.title = 'Organisation | Train of Thought'; }, []);

    const { user } = useUser();

    const [memberIds, setMemberIds]   = useState<string[]>([]);
    const [loading, setLoading]       = useState(true);

    const fetchOrgMembers = useCallback(async () => {
        try {
            const res = await fetch('/api/organisation/members');
            if (!res.ok) throw new Error('Failed');
            const data: string[] = await res.json();
            setMemberIds(data);
        } catch {
            // fall back to showing just current user
            if (user?.id) setMemberIds([user.id]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchOrgMembers(); }, [fetchOrgMembers]);

    const memberMap = useMembers(memberIds);

    const members: Member[] = memberIds.map(id => memberMap[id]).filter(Boolean) as Member[];

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-6 pb-5 flex-shrink-0 border-b border-zinc-100">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-secondary text-zinc-900 tracking-tight m-0">
                            Organisation
                        </h1>
                        <p className="text-sm text-zinc-400 font-primary mt-1 m-0">
                            {loading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                {loading ? (
                    <div className="flex flex-col gap-3 max-w-lg">
                        {[1, 2, 3].map(i => <RowSkeleton key={i} height="h-16" />)}
                    </div>
                ) : members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Users size={36} className="text-zinc-300 mb-3" />
                        <p className="text-sm text-zinc-400 font-primary">No members found</p>
                    </div>
                ) : (
                    <div className="max-w-lg">
                        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                            {members.map((member, i) => (
                                <MemberRow
                                    key={member.id}
                                    member={member}
                                    isMe={member.id === user?.id}
                                    className={`px-4 py-3.5 ${i < members.length - 1 ? 'border-b border-zinc-50' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
