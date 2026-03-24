'use client';

import { useState } from 'react';
import {
    Plus, ChevronDown, ChevronRight,
    AlertTriangle, Check, SlidersHorizontal,
} from 'lucide-react';
import { PRIORITY_CONFIG } from '@/lib/projects/config';
import { getDeadlineInfo } from '@/lib/projects/utils';
import type { FlatTask } from '@/lib/projects/definitions';
import Pill from '@/components/projects/Pill';
import TaskPanel from '@/components/projects/TaskPanel';
import { useTasks } from '@/hooks/projects/useTasks';
import { Button } from '@/components/ui/buttons';
import { Input, Select } from '@/components/ui/inputs';
import SegmentedControl from '@/components/SegmentedControl';
import { RowSkeleton } from '@/components/ui/skeletons';
import EmptyState from '@/components/EmptyState';

export default function TasksPage() {
    const {
        groups, loading,
        totalOpen, todayCount, overdueCount,
        filterProject, filterPriority, groupBy,
        setFilterProject, setFilterPriority, setGroupBy,
        uniqueProjects,
        markDone, addQuickTask, updateTask, deleteTask,
    } = useTasks();

    const [activeTask, setActiveTask]       = useState<FlatTask | null>(null);
    const [collapsed, setCollapsed]         = useState<Record<string, boolean>>({});
    const [showQuick, setShowQuick]         = useState(false);
    const [quickTitle, setQuickTitle]       = useState('');
    const [quickProject, setQuickProject]   = useState('');

    const toggleCollapse = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }));
    const totalFiltered  = groups.reduce((sum, g) => sum + g.tasks.length, 0);

    const handleOpenQuick = () => {
        if (!quickProject && uniqueProjects.length > 0) {
            setQuickProject(uniqueProjects[0].id);
        }
        setShowQuick(true);
    };

    const handleQuickAdd = async () => {
        if (!quickTitle.trim() || !quickProject) return;
        await addQuickTask(quickTitle.trim(), quickProject);
        setQuickTitle('');
        setShowQuick(false);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-6 flex-shrink-0">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-secondary text-zinc-900 tracking-tight m-0">
                            My Tasks
                        </h1>
                        <p className="text-sm text-zinc-400 font-primary mt-1 m-0">
                            {loading ? 'Loading…' : (
                                <>
                                    {totalOpen} open
                                    {todayCount > 0 && (
                                        <> · <span className="text-amber-500 font-semibold">{todayCount} due today</span></>
                                    )}
                                    {overdueCount > 0 && (
                                        <> · <span className="text-red-500 font-semibold">{overdueCount} overdue</span></>
                                    )}
                                </>
                            )}
                        </p>
                    </div>
                    <Button onClick={handleOpenQuick} icon={<Plus size={15} />}>
                        Add Task
                    </Button>
                </div>

                {/* Quick add */}
                {showQuick && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4 flex gap-2.5 flex-wrap items-end shadow-sm">
                        <div className="flex-1 min-w-48">
                            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-primary mb-1.5">
                                Task
                            </div>
                            <Input
                                autoFocus
                                value={quickTitle}
                                onChange={e => setQuickTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(); }}
                                placeholder="What needs to be done?"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-primary mb-1.5">
                                Project
                            </div>
                            <Select
                                value={quickProject}
                                onChange={e => setQuickProject(e.target.value)}
                                className="min-w-36"
                            >
                                {uniqueProjects.length === 0 && <option value="">No projects</option>}
                                {uniqueProjects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button
                                variant="secondary"
                                onClick={() => { setShowQuick(false); setQuickTitle(''); }}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!quickTitle.trim() || !quickProject}
                                onClick={handleQuickAdd}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                )}

                {/* Filters + group by */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 flex-wrap">
                    <Select
                        variant="pill"
                        value={filterProject}
                        onChange={e => setFilterProject(e.target.value)}
                    >
                        <option value="all">All projects</option>
                        {uniqueProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </Select>

                    <Select
                        variant="pill"
                        value={filterPriority}
                        onChange={e => setFilterPriority(e.target.value)}
                    >
                        <option value="all">All priorities</option>
                        {['Critical', 'High', 'Medium', 'Low'].map(p => (
                            <option key={p}>{p}</option>
                        ))}
                    </Select>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-primary flex items-center gap-1">
                            <SlidersHorizontal size={12} />
                            Group by
                        </span>
                        <SegmentedControl
                            segments={[
                                { value: 'time',     label: 'Date'     },
                                { value: 'project',  label: 'Project'  },
                                { value: 'priority', label: 'Priority' },
                            ]}
                            value={groupBy}
                            onChange={setGroupBy}
                        />
                    </div>
                </div>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto px-8 py-5">

                {loading && (
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3, 4, 5].map(i => <RowSkeleton key={i} />)}
                    </div>
                )}

                {!loading && totalFiltered === 0 && (
                    <EmptyState
                        icon={Check}
                        title={
                            filterProject !== 'all' || filterPriority !== 'all'
                                ? 'No tasks match your filters'
                                : "You're all caught up!"
                        }
                    />
                )}

                {!loading && totalFiltered > 0 && (
                    <div className="flex flex-col gap-6">
                        {groups.map(group => {
                            const isC = collapsed[group.id];
                            return (
                                <div key={group.id}>
                                    {/* Group heading */}
                                    <button
                                        onClick={() => toggleCollapse(group.id)}
                                        className="flex items-center gap-2.5 mb-2.5 w-full cursor-pointer"
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: group.accent }} />
                                        <span className="text-sm font-bold text-zinc-900 font-primary">{group.label}</span>
                                        <span className="text-xs text-zinc-300 font-primary">{group.tasks.length}</span>
                                        <div className="flex-1 h-px bg-zinc-100" />
                                        {isC
                                            ? <ChevronRight size={13} className="text-zinc-300" />
                                            : <ChevronDown  size={13} className="text-zinc-300" />
                                        }
                                    </button>

                                    {/* Task rows */}
                                    {!isC && (
                                        <div className="flex flex-col gap-1.5">
                                            {group.tasks.map(task => {
                                                const pr  = PRIORITY_CONFIG[task.priority];
                                                const tdl = getDeadlineInfo(task.due);
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-zinc-100 transition-all duration-150 relative overflow-hidden"
                                                        onMouseEnter={e => {
                                                            (e.currentTarget as HTMLDivElement).style.background   = '#FAFAFA';
                                                            (e.currentTarget as HTMLDivElement).style.borderColor  = task.projectAccent + '40';
                                                            (e.currentTarget as HTMLDivElement).style.transform    = 'translateX(2px)';
                                                        }}
                                                        onMouseLeave={e => {
                                                            (e.currentTarget as HTMLDivElement).style.background  = '';
                                                            (e.currentTarget as HTMLDivElement).style.borderColor = '';
                                                            (e.currentTarget as HTMLDivElement).style.transform   = '';
                                                        }}
                                                    >
                                                        {/* Project colour strip */}
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 w-0.5"
                                                            style={{ background: task.projectAccent }}
                                                        />

                                                        {/* Checkbox */}
                                                        <button
                                                            onClick={e => { e.stopPropagation(); markDone(task.id); }}
                                                            className="w-[18px] h-[18px] rounded-full flex-shrink-0 border-2 border-zinc-300 bg-transparent flex items-center justify-center transition-all duration-200 cursor-pointer ml-1.5"
                                                            onMouseEnter={e => {
                                                                (e.currentTarget as HTMLButtonElement).style.borderColor = task.projectAccent;
                                                                (e.currentTarget as HTMLButtonElement).style.background  = task.projectAccent + '20';
                                                            }}
                                                            onMouseLeave={e => {
                                                                (e.currentTarget as HTMLButtonElement).style.borderColor = '';
                                                                (e.currentTarget as HTMLButtonElement).style.background  = '';
                                                            }}
                                                        />

                                                        {/* Content */}
                                                        <div
                                                            className="flex-1 min-w-0 cursor-pointer"
                                                            onClick={() => setActiveTask(task)}
                                                        >
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

                                                        {/* Meta */}
                                                        <div className="flex items-center gap-2.5 flex-shrink-0">
                                                            {task.subtasks.length > 0 && (
                                                                <span className="text-xs text-zinc-300 font-primary">
                                                                    {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} sub
                                                                </span>
                                                            )}
                                                            {pr && <Pill bg={pr.bg} color={pr.color}>{task.priority}</Pill>}
                                                            {tdl && (
                                                                <span
                                                                    className="text-xs font-primary flex items-center gap-1"
                                                                    style={{ color: tdl.urgent ? '#D44444' : '#A1A1AA', fontWeight: tdl.urgent ? 600 : 400 }}
                                                                >
                                                                    {tdl.urgent && <AlertTriangle size={11} />}
                                                                    {tdl.label}
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => setActiveTask(task)}
                                                                className="text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"
                                                            >
                                                                <ChevronRight size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Task panel */}
            {activeTask && (
                <TaskPanel
                    key={activeTask.id}
                    task={activeTask}
                    accent={activeTask.projectAccent}
                    projectColor={activeTask.projectColor}
                    onClose={() => setActiveTask(null)}
                    onUpdate={updateTask}
                    onDelete={async (taskId) => { await deleteTask(taskId); setActiveTask(null); }}
                />
            )}
        </div>
    );
}
