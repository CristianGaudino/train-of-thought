'use client';

import { Avatar } from './projects/Avatar';
import type { Member } from '@/lib/projects/definitions';

interface MemberRowProps {
    member:    Member;
    isMe?:     boolean;
    sublabel?: string;
    action?:   React.ReactNode;
    className?: string;
    style?:    React.CSSProperties;
}

export function MemberRow({ member, isMe, sublabel = 'Member', action, className = '', style }: MemberRowProps) {
    return (
        <div className={`flex items-center gap-3.5 ${className}`} style={style}>
            <Avatar member={member} size={36} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-zinc-900 font-primary truncate">
                        {member.name}
                    </span>
                    {isMe && (
                        <span className="text-xs font-normal text-zinc-400 font-primary flex-shrink-0">you</span>
                    )}
                </div>
                {sublabel && (
                    <div className="text-xs text-zinc-400 font-primary mt-0.5 truncate">{sublabel}</div>
                )}
            </div>
            {action}
        </div>
    );
}
