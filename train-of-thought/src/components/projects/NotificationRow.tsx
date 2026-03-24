import { NOTIFICATION_CONFIG } from "@/lib/projects/config";
import { NotificationRowProps } from "@/lib/projects/definitions";
import { getMember } from "@/lib/projects/utils";

export function NotificationRow({ notification, onRead, compact = false }: NotificationRowProps) {
    const cfg   = NOTIFICATION_CONFIG[notification.type];
    const actor = getMember(notification.actor);
    const py    = compact ? 'py-3' : 'py-3.5';

    return (
        <div
            onClick={() => onRead(notification.id)}
            className={`
                flex items-start gap-3 px-4 ${py} cursor-pointer transition-colors
                duration-150 relative border-b border-zinc-50 last:border-none
                ${notification.read
                    ? 'bg-white hover:bg-zinc-50'
                    : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                }
            `}
        >
            {/* Unread dot */}
            {!notification.read && (
                <div
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: cfg.color }}
                />
            )}

            {/* Type icon */}
            <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${!notification.read ? 'ml-2' : ''}`}
                style={{ background: cfg.bg, color: cfg.color }}
            >
                {cfg.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-primary text-zinc-800 leading-snug m-0">
                    <span className="font-semibold">
                        {actor?.name ?? 'Someone'}
                    </span>
                    {' '}{notification.text}{' '}
                    <span className="font-semibold" style={{ color: notification.projectAccent }}>
                        {notification.subject}
                    </span>
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-zinc-400 font-primary">{notification.time}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 inline-block" />
                    <span className="flex items-center gap-1">
                        <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ background: notification.projectAccent }}
                        />
                        <span className="text-xs text-zinc-500 font-primary">
                            {notification.projectTitle}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
}
