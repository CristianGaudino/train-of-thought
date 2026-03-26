'use client';

import { useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMembers } from '@/hooks/useMembers';
import { Avatar } from './Avatar';
import { Button } from '@/components/ui/buttons';
import { ProjectMembersProps } from '@/lib/projects/definitions';

export function ProjectMembers({ header, setHeader, handleSaveHeader, savingHeader }: ProjectMembersProps) {
    const { user } = useUser();

    const displayIds = useMemo(() => {
        const ids = new Set(header.members);
        if (user?.id) ids.add(user.id);
        return [...ids];
    }, [header.members, user?.id]);

    const memberMap = useMembers(displayIds);

    return (
        <div className="px-8 py-7 max-w-lg">
            <div className="flex flex-col gap-2 mb-6">
                {displayIds.map(id => {
                    const member  = memberMap[id];
                    if (!member) return null;
                    const isMember = header.members.includes(id);
                    const isMe     = id === user?.id;
                    return (
                        <div
                            key={id}
                            className="flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150"
                            style={{
                                borderColor: isMember ? header.accent + '40' : '#E4E4E7',
                                background:  isMember ? '#fff' : '#FAFAFA',
                            }}
                        >
                            <Avatar member={member} size={36} />
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-zinc-900 font-primary">
                                    {member.name}
                                    {isMe && <span className="text-xs font-normal text-zinc-400 ml-1.5">you</span>}
                                </div>
                                <div className="text-xs text-zinc-400 font-primary mt-0.5">
                                    {isMember ? 'Member' : 'Not a member'}
                                </div>
                            </div>
                            {!isMe && (
                                <button
                                    onClick={() => setHeader(f => f ? {
                                        ...f,
                                        members: isMember
                                            ? f.members.filter(mid => mid !== id)
                                            : [...f.members, id],
                                    } : f)}
                                    className="px-3.5 py-1.5 rounded-lg border text-xs font-medium font-primary cursor-pointer transition-all duration-150"
                                    style={{
                                        borderColor: isMember ? '#E4E4E7' : header.accent,
                                        background:  isMember ? '#fff'    : header.color,
                                        color:       isMember ? '#71717A' : header.accent,
                                    }}
                                >
                                    {isMember ? 'Remove' : 'Add'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            <Button
                loading={savingHeader}
                onClick={handleSaveHeader}
                style={{ background: header.accent }}
                className="border-0"
            >
                Save changes
            </Button>
        </div>
    );
}
