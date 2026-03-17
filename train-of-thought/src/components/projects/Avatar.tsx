import type { AvatarProps } from '@/lib/projects/definitions';

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
