'use client';

import { useState, useEffect } from 'react';
import {
    Plus, ChevronDown, ChevronRight,
    Check, SlidersHorizontal,
} from 'lucide-react';
import TaskPanel from '@/components/projects/TaskPanel';
import { useTasks } from '@/hooks/projects/useTasks';
import { Button } from '@/components/ui/buttons';
import { Input, Select } from '@/components/ui/inputs';
import SegmentedControl from '@/components/SegmentedControl';
import { RowSkeleton } from '@/components/ui/skeletons';
import EmptyState from '@/components/EmptyState';
import { Task } from '@/components/projects/Task';

export default function TasksPage() {
    useEffect(() => { document.title = 'My Tasks | Train of Thought'; }, []);

    const {
        groups, loading,
        totalOpen, todayCount, overdueCount,
        filterProject, filterPriority, groupBy,
        setFilterProject, setFilterPriority, setGroupBy,
        uniqueProjects,
        markDone, addQuickTask, updateTask, deleteTask,
    } = useTasks();
    
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const activeTask = groups
        .flatMap(g => g.tasks)
        .find(t => t.id === activeTaskId) ?? null;
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
                                            {group.tasks.map(task => (
                                                <Task
                                                    key={task.id}
                                                    task={task}
                                                    accent={task.projectAccent}
                                                    variant="tasks"
                                                    markDone={markDone}
                                                    setActiveTaskId={setActiveTaskId}
                                                />
                                            ))}
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
                    onClose={() => setActiveTaskId(null)}
                    onUpdate={updateTask}
                    onDelete={async (taskId) => { await deleteTask(taskId); setActiveTaskId(null); }}
                />
            )}
        </div>
    );
}
