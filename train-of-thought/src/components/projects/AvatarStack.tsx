'use client';

import { AvatarStackProps } from "@/lib/projects/definitions";
import { useMembers } from "@/hooks/useMembers";
import { Avatar } from "./Avatar";

export function AvatarStack({ ids, size = 24 }: AvatarStackProps) {
    const memberMap = useMembers(ids);
    return (
        <div className="flex">
            {ids.map((id, i) => {
                const member = memberMap[id];
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
