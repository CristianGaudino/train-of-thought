'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import type { Project } from '@/lib/projects/definitions';
import { STATUS_CONFIG } from '@/lib/projects/config';
import { countTasks, getDeadlineInfo } from '@/lib/projects/utils';
import { AvatarStack } from './Avatar';
import Ring from './Ring';
import Pill from './Pill';

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();
    const sc = STATUS_CONFIG[project.status] ?? STATUS_CONFIG['Not Started'];
    const dl = getDeadlineInfo(project.deadline);
    const { done, total } = countTasks(project);

    return (
        <div
            onClick={() => router.push(`/projects/${project.id}`)}
            className="bg-white border border-zinc-200 rounded-2xl p-6 cursor-pointer flex flex-col gap-3.5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = project.accent + '55';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '';
            }}
        >
            {/* Accent bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: project.accent }}
            />

            {/* Title + ring */}
            <div className="flex justify-between items-start mt-1">
                <div className="flex-1 pr-3">
                    <h3 className="text-[16px] font-semibold font-primary text-zinc-900 leading-snug m-0">
                        {project.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] text-zinc-400 font-primary leading-relaxed m-0 line-clamp-2">
                        {project.description || (
                            <span className="italic text-zinc-300">No description yet</span>
                        )}
                    </p>
                </div>
                <Ring done={done} total={total} accent={project.accent} />
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                    {project.tags.map(tag => (
                        <span
                            key={tag}
                            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full font-primary"
                            style={{ background: project.color, color: project.accent }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100">
                <div className="flex items-center gap-2.5">
                    <Pill bg={sc.bg} color={sc.text}>
                        <span
                            className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                            style={{ background: sc.dot }}
                        />
                        {project.status}
                    </Pill>
                    <AvatarStack ids={project.members} size={22} />
                </div>
                {dl && (
                    <span
                        className="text-[12px] font-primary flex items-center gap-1"
                        style={{
                            color: dl.urgent ? '#D44444' : '#AAAAAA',
                            fontWeight: dl.urgent ? 600 : 400,
                        }}
                    >
                        {dl.urgent && <AlertTriangle size={12} />}
                        {dl.label}
                    </span>
                )}
            </div>
        </div>
    );
}
