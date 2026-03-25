import { PRIORITY_CONFIG } from '@/lib/projects/config';
import { TaskProps } from '@/lib/projects/definitions';
import { getDeadlineInfo } from '@/lib/projects/utils';
import { Check, AlertTriangle, MessageSquare, ChevronRight, Trash2, GripVertical } from 'lucide-react';
import { AvatarStack } from './AvatarStack';
import Pill from '../ui/Pill';

export const Task = ({
    task,
    accent,
    toggleTask,
    markDone,
    setActiveTaskId,
    deleteTask,
    variant = 'project',
    dragHandleProps,
}: TaskProps) => {
    const pr = PRIORITY_CONFIG[task.priority];
    const deadline = getDeadlineInfo(task.due);

    return (
        <div
            onClick={() => setActiveTaskId(task.id)}
            style={{ ['--accent' as any]: accent }}
            className={`
                flex items-center gap-3 px-4 rounded-xl
                bg-white border border-zinc-100
                transition-all duration-150 group cursor-pointer
                hover:bg-zinc-50
                hover:border-[color:var(--accent)]
                active:scale-[0.995]
                ${variant === 'project' ? 'py-2.5' : 'py-3 relative overflow-hidden'}
                ${variant === 'tasks' ? 'hover:translate-x-[2px]' : ''}
            `}
        >
            {variant === 'tasks' && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ background: task.projectAccent }}
                />
            )}

            {dragHandleProps && (
                <span
                    {...dragHandleProps}
                    onClick={e => e.stopPropagation()}
                    className="text-zinc-200 hover:text-zinc-400 cursor-grab active:cursor-grabbing transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 -ml-1"
                >
                    <GripVertical size={13} />
                </span>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (variant === 'tasks') {
                        markDone?.(task.id);
                    } else {
                        toggleTask?.(task.id);
                    }
                }}
                className={`
                    w-[18px] h-[18px] rounded-full flex-shrink-0 border-2
                    flex items-center justify-center transition-all duration-200 cursor-pointer
                    border-zinc-300
                    group-hover:border-[color:var(--accent)]
                    group-hover:bg-[color:color-mix(in srgb, var(--accent) 20%, transparent)]
                    ${variant === 'tasks' ? 'ml-1.5' : ''}
                `}
                style={{
                    borderColor: task.done ? accent : undefined,
                    background: task.done ? accent : undefined,
                }}
            >
                {task.done && <Check size={10} color="#fff" strokeWidth={3} />}
            </button>

            {variant === 'tasks' ? (
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium font-primary text-zinc-900 truncate">
                        {task.title}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                            className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                            style={{ background: task.projectAccent }}
                        />
                        <span className="text-xs text-zinc-400 font-primary">
                            {task.projectTitle}
                            {task.sectionTitle && ` · ${task.sectionTitle}`}
                        </span>
                    </div>
                </div>
            ) : (
                <span
                    className={`flex-1 text-sm font-primary transition-colors ${task.done ? 'text-muted line-through' : 'text-zinc-900'}`}
                >
                    {task.title}
                </span>
            )}

            <div className="flex items-center gap-2.5 flex-shrink-0">
                {task.subtasks.length > 0 && (
                    <span className="text-xs text-zinc-300 font-primary">
                        {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} sub
                    </span>
                )}

                {variant === 'project' && task.assignees.length > 0 && (
                    <AvatarStack ids={task.assignees} size={22} />
                )}

                {deadline && (
                    <span
                        className={`text-xs font-primary flex items-center gap-1 ${deadline.urgent ? 'text-danger font-semibold' : 'text-zinc-400'}`}
                    >
                        {deadline.urgent && <AlertTriangle size={11} />}
                        {deadline.label}
                    </span>
                )}

                {/* Priority */}
                {pr && <Pill bg={pr.bg} color={pr.color}>{task.priority}</Pill>}

                {task.comments.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-zinc-300 font-primary">
                        <MessageSquare size={12} />
                        {task.comments.length}
                    </span>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveTaskId(task.id);
                    }}
                    className="text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"
                >
                    <ChevronRight size={variant === 'tasks' ? 15 : 16} />
                </button>

                {variant === 'project' && deleteTask && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                        }}
                        className="text-zinc-200 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Delete task"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>
    );
};