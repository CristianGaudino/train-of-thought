import { PRIORITY_CONFIG } from "@/lib/projects/config";
import { TaskProps } from "@/lib/projects/definitions";
import { getDeadlineInfo } from "@/lib/projects/utils";
import { AlertTriangle, Check, ChevronRight, MessageSquare, Trash2 } from "lucide-react";
import { AvatarStack } from "./AvatarStack";
import Pill from "../ui/Pill";

export const Task = ({
    task,
    hf,
    toggleTask,
    setActiveTaskId,
    deleteTask,
}: TaskProps) => {
    const pr = PRIORITY_CONFIG[task.priority];
    const tdl = getDeadlineInfo(task.due);

    return (
        <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-zinc-100 transition-all duration-150 group"
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = hf.accent + '35';
                e.currentTarget.style.background = '#FAFAFA';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.background = '';
            }}
        >
            {/* Checkbox */}
            <button
                onClick={() => toggleTask(task.id)}
                className="w-[18px] h-[18px] rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                    borderColor: task.done ? hf.accent : '#D1D5DB',
                    background: task.done ? hf.accent : 'transparent',
                }}
                onMouseEnter={e => {
                    if (!task.done) {
                        e.currentTarget.style.borderColor = hf.accent;
                        e.currentTarget.style.background = hf.accent + '20';
                    }
                }}
                onMouseLeave={e => {
                    if (!task.done) {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                        e.currentTarget.style.background = 'transparent';
                    }
                }}
            >
                {task.done && <Check size={10} color="#fff" strokeWidth={3} />}
            </button>

            {/* Title */}
            <span
                onClick={() => setActiveTaskId(task.id)}
                className="flex-1 text-sm font-primary cursor-pointer transition-colors"
                style={{
                    color: task.done ? '#BBBBBB' : '#18181B',
                    textDecoration: task.done ? 'line-through' : 'none',
                }}
            >
                {task.title}
            </span>

            {/* Meta */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
                {task.subtasks.length > 0 && (
                    <span className="text-xs text-zinc-300 font-primary">
                        {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} sub
                    </span>
                )}

                {task.assignees.length > 0 && (
                    <AvatarStack ids={task.assignees} size={22} />
                )}

                {tdl && (
                    <span
                        className="text-xs font-primary flex items-center gap-1"
                        style={{
                            color: tdl.urgent ? '#D44444' : '#A1A1AA',
                            fontWeight: tdl.urgent ? 600 : 400,
                        }}
                    >
                        {tdl.urgent && <AlertTriangle size={11} />}
                        {tdl.label}
                    </span>
                )}

                {pr && <Pill bg={pr.bg} color={pr.color}>{task.priority}</Pill>}

                {task.comments.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-zinc-300 font-primary">
                        <MessageSquare size={12} />
                        {task.comments.length}
                    </span>
                )}

                <button
                    onClick={() => setActiveTaskId(task.id)}
                    className="text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"
                >
                    <ChevronRight size={16} />
                </button>

                <button
                    onClick={e => {
                        e.stopPropagation();
                        deleteTask(task.id);
                    }}
                    className="text-zinc-200 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete task"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
};