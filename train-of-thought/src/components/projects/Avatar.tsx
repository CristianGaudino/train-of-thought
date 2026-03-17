import { getMember } from '@/lib/projects/utils';
import type { Member } from '@/lib/projects/definitions';

interface AvatarProps {
    member: Member;
    size?: number;
}

export function Avatar({ member, size = 26 }: AvatarProps) {
    return (
        <div
            title={member.name}
            className="rounded-full flex items-center justify-center font-bold flex-shrink-0 border-2 border-white font-primary text-white overflow-hidden"
            style={{
                width: size,
                height: size,
                background: member.color,
                fontSize: size * 0.36,
            }}
        >
            {member.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                member.initials
            )}
        </div>
    );
}

interface AvatarStackProps {
    ids: string[];
    size?: number;
}

export function AvatarStack({ ids, size = 24 }: AvatarStackProps) {
    return (
        <div className="flex">
            {ids.map((id, i) => {
                const member = getMember(id);
                if (!member) return null;
                return (
                    <div
                        key={id}
                        style={{ marginLeft: i ? -8 : 0, zIndex: ids.length - i }}
                    >
                        <Avatar member={member} size={size} />
                    </div>
                );
            })}
        </div>
    );
}
