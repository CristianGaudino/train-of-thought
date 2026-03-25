'use client';

import { ChevronDown, ChevronRight, GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { Section } from '@/lib/projects/definitions';

interface SectionHeaderProps {
    section:        Section;
    accent:         string;
    isCollapsed:    boolean;
    isRenaming:     boolean;
    renameVal:      string;
    dragHandleProps: React.HTMLAttributes<HTMLElement>;
    onToggleCollapse: () => void;
    onRenameChange:  (val: string) => void;
    onRenameCommit:  () => void;
    onRenameCancel:  () => void;
    onStartRename:   () => void;
    onDelete:        () => void;
}

export function SectionHeader({
    section,
    accent,
    isCollapsed,
    isRenaming,
    renameVal,
    dragHandleProps,
    onToggleCollapse,
    onRenameChange,
    onRenameCommit,
    onRenameCancel,
    onStartRename,
    onDelete,
}: SectionHeaderProps) {
    const secDone = section.tasks.filter(t => t.done).length;

    return (
        <div className="flex items-center gap-2.5 mb-2.5 group/section">
            {/* Drag handle */}
            <span
                {...dragHandleProps}
                className="text-zinc-200 hover:text-zinc-400 cursor-grab active:cursor-grabbing transition-colors opacity-0 group-hover/section:opacity-100"
            >
                <GripVertical size={14} />
            </span>

            {/* Collapse toggle */}
            <button
                onClick={onToggleCollapse}
                className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Title / rename input */}
            {isRenaming ? (
                <input
                    autoFocus
                    value={renameVal}
                    onChange={e => onRenameChange(e.target.value)}
                    onBlur={onRenameCommit}
                    onKeyDown={e => {
                        if (e.key === 'Enter')  onRenameCommit();
                        if (e.key === 'Escape') onRenameCancel();
                    }}
                    className="text-sm font-bold text-zinc-900 font-primary bg-transparent border-b border-zinc-300 outline-none"
                />
            ) : (
                <span className="text-sm font-bold text-zinc-900 font-primary">{section.title}</span>
            )}

            <span className="text-xs text-zinc-300 font-primary">{secDone}/{section.tasks.length}</span>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                <button
                    onClick={onStartRename}
                    className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
                    title="Rename section"
                >
                    <Pencil size={12} />
                </button>
                <button
                    onClick={onDelete}
                    className="text-zinc-300 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete section"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            <div className="flex-1 h-px bg-zinc-100" />

            {/* Progress bar */}
            <div className="w-16 h-1 rounded-full bg-zinc-100 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width:      `${section.tasks.length ? (secDone / section.tasks.length) * 100 : 0}%`,
                        background: accent,
                    }}
                />
            </div>
        </div>
    );
}
