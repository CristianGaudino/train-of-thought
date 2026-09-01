'use client';

import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { MemberRow } from '../MemberRow';
import { Button } from '@/components/ui/buttons';
import { Input } from '@/components/ui/inputs';
import { ProjectMembersProps } from '@/lib/projects/definitions';

export function ProjectMembers({
    members, accent, ownerId, currentUserId, addMember, removeMember, onLeave,
}: ProjectMembersProps) {
    const [email, setEmail]         = useState('');
    const [submitting, setSubmit]   = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [busyId, setBusyId]       = useState<string | null>(null);

    // Owner is always implicitly a member — make sure they show up.
    const displayIds = useMemo(() => {
        const ids = new Set(members);
        ids.add(ownerId);
        return [...ids];
    }, [members, ownerId]);

    const memberMap  = useMembers(displayIds);
    const isOwner    = currentUserId === ownerId;

    const handleShare = async () => {
        const value = email.trim();
        if (!value || submitting) return;
        setSubmit(true);
        setFormError(null);
        const result = await addMember(value);
        setSubmit(false);
        if (result.ok) {
            setEmail('');
        } else {
            setFormError(result.error ?? 'Could not share the project.');
        }
    };

    const handleRemove = async (id: string) => {
        setBusyId(id);
        await removeMember(id);
        setBusyId(null);
    };

    return (
        <div className="px-4 md:px-8 py-6 md:py-7 max-w-lg">

            {/* ── Share by email ── */}
            <div className="mb-7">
                <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 font-primary mb-2">
                    Share this project
                </div>
                <p className="text-sm text-zinc-500 font-primary mb-3 leading-relaxed">
                    Enter the email of someone with a Train of Thought account. They&apos;ll be able to do
                    everything on this project except delete it.
                </p>
                <div className="flex gap-2">
                    <Input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setFormError(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleShare(); } }}
                        placeholder="name@example.com"
                        className="flex-1"
                    />
                    <Button
                        loading={submitting}
                        onClick={handleShare}
                        icon={<UserPlus size={15} />}
                        style={{ background: accent }}
                        className="border-0 flex-shrink-0"
                    >
                        Share
                    </Button>
                </div>
                {formError && (
                    <p className="text-xs text-danger font-primary mt-2">{formError}</p>
                )}
            </div>

            {/* ── Member list ── */}
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 font-primary mb-2">
                People with access
            </div>
            <div className="flex flex-col gap-2">
                {displayIds.map(id => {
                    const member = memberMap[id];
                    if (!member) return null;
                    const isProjectOwner = id === ownerId;
                    const isMe           = id === currentUserId;

                    let action: React.ReactNode = undefined;
                    if (!isProjectOwner && isOwner) {
                        action = (
                            <button
                                onClick={() => handleRemove(id)}
                                disabled={busyId === id}
                                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium font-primary text-zinc-500 cursor-pointer transition-all duration-150 hover:border-danger hover:text-danger disabled:opacity-50"
                            >
                                {busyId === id ? 'Removing…' : 'Remove'}
                            </button>
                        );
                    } else if (!isProjectOwner && isMe) {
                        action = (
                            <button
                                onClick={onLeave}
                                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium font-primary text-zinc-500 cursor-pointer transition-all duration-150 hover:border-danger hover:text-danger"
                            >
                                Leave
                            </button>
                        );
                    }

                    return (
                        <MemberRow
                            key={id}
                            member={member}
                            isMe={isMe}
                            sublabel={isProjectOwner ? 'Owner' : 'Member'}
                            className="p-3.5 rounded-xl border transition-all duration-150"
                            style={{
                                borderColor: accent + '40',
                                background:  '#fff',
                            }}
                            action={action}
                        />
                    );
                })}
            </div>

            {!isOwner && (
                <p className="text-xs text-zinc-400 font-primary mt-4">
                    Only the owner can delete this project.
                </p>
            )}
        </div>
    );
}
