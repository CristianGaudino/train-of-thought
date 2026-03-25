'use client';

import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { Task } from './Task';
import { Button, DashedButton } from '@/components/ui/buttons';
import type { ProjectTasksProps } from '@/lib/projects/definitions';

export function ProjectTasks({
    sections,
    header,
    collapsed,
    toggleCollapse,
    newTaskSec,
    setNewTaskSec,
    newTaskVal,
    setNewTaskVal,
    newSecMode,
    setNewSecMode,
    newSecVal,
    setNewSecVal,
    toggleTask,
    deleteTask,
    setActiveTaskId,
    handleAddTask,
    handleAddSection,
}: ProjectTasksProps) {
    return (
        <div className="px-8 py-7 flex flex-col gap-7">
            {sections.map(section => {
                const secDone = section.tasks.filter(t => t.done).length;
                const isCollapsed = collapsed[section.id];
                return (
                    <div key={section.id}>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <button
                                onClick={() => toggleCollapse(section.id)}
                                className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
                            >
                                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <span className="text-sm font-bold text-zinc-900 font-primary">{section.title}</span>
                            <span className="text-xs text-zinc-300 font-primary">{secDone}/{section.tasks.length}</span>
                            <div className="flex-1 h-px bg-zinc-100" />
                            <div className="w-16 h-1 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width:      `${section.tasks.length ? (secDone / section.tasks.length) * 100 : 0}%`,
                                        background: header.accent,
                                    }}
                                />
                            </div>
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col gap-1.5 pl-1">
                                {section.tasks.map(task => (
                                    <Task
                                        key={task.id}
                                        task={task}
                                        accent={header.accent}
                                        toggleTask={toggleTask}
                                        setActiveTaskId={setActiveTaskId}
                                        deleteTask={deleteTask}
                                    />
                                ))}

                                {newTaskSec === section.id ? (
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            autoFocus
                                            value={newTaskVal}
                                            onChange={e => setNewTaskVal(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter')  handleAddTask(section.id);
                                                if (e.key === 'Escape') { setNewTaskSec(null); setNewTaskVal(''); }
                                            }}
                                            placeholder="Task name…"
                                            className="flex-1 px-3.5 py-2 rounded-xl border text-sm font-primary text-zinc-800 bg-white outline-none"
                                            style={{ borderColor: header.accent }}
                                        />
                                        <Button
                                            size="md"
                                            onClick={() => handleAddTask(section.id)}
                                            style={{ background: header.accent }}
                                            className="border-0"
                                        >
                                            Add
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="md"
                                            onClick={() => { setNewTaskSec(null); setNewTaskVal(''); }}
                                            icon={<X size={14} />}
                                        />
                                    </div>
                                ) : (
                                    <DashedButton
                                        accent={header.accent}
                                        onClick={() => setNewTaskSec(section.id)}
                                        icon={<Plus size={13} />}
                                        className="mt-1"
                                    >
                                        Add task
                                    </DashedButton>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {newSecMode ? (
                <div className="flex gap-2 items-center">
                    <input
                        autoFocus
                        value={newSecVal}
                        onChange={e => setNewSecVal(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter')  handleAddSection();
                            if (e.key === 'Escape') { setNewSecMode(false); setNewSecVal(''); }
                        }}
                        placeholder="Section name…"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm font-semibold font-primary text-zinc-800 bg-white outline-none"
                        style={{ borderColor: header.accent }}
                    />
                    <Button
                        size="md"
                        onClick={handleAddSection}
                        style={{ background: header.accent }}
                        className="border-0"
                    >
                        Add
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => { setNewSecMode(false); setNewSecVal(''); }}
                        icon={<X size={14} />}
                    />
                </div>
            ) : (
                <DashedButton accent={header.accent} onClick={() => setNewSecMode(true)}>
                    Add section
                </DashedButton>
            )}
        </div>
    );
}
