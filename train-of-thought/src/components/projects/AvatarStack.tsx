import { AvatarStackProps } from "@/lib/projects/definitions";
import { getMember } from "@/lib/projects/utils";
import { Avatar } from "./Avatar";

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