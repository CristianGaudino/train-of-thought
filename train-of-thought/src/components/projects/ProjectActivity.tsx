import { ACTIVITY_DATA, NOTIFICATION_CONFIG } from '@/lib/projects/config';
import { ProjectActivityProps } from '@/lib/projects/definitions';
import { getMember } from '@/lib/projects/utils';

export function ProjectActivity({ header }: ProjectActivityProps) {
    return (
        <div className="px-8 py-7 max-w-2xl">
            <div className="flex flex-col">
                {ACTIVITY_DATA.map((a, i) => {
                    const actor = getMember(a.actor);
                    const cfg   = NOTIFICATION_CONFIG[a.type] ?? NOTIFICATION_CONFIG.comment;
                    return (
                        <div key={a.id} className="flex gap-3.5 items-start pb-5 relative">
                            {i < ACTIVITY_DATA.length - 1 && (
                                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-zinc-100" />
                            )}
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 z-10 border"
                                style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '30' }}
                            >
                                {cfg.icon}
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="text-sm font-primary text-zinc-700 leading-snug m-0">
                                    <span className="font-semibold">{actor?.name ?? 'Someone'}</span>
                                    {' '}{a.text}{' '}
                                    <span className="font-semibold" style={{ color: header.accent }}>{a.subject}</span>
                                </p>
                                <p className="text-xs text-zinc-400 font-primary mt-1 m-0">{a.time}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
