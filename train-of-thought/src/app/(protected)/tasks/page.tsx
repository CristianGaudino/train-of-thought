'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
    Plus, ChevronDown, ChevronRight,
    AlertTriangle, Check, SlidersHorizontal,
} from 'lucide-react';
import type { Project, FlatTask, GroupBy } from '@/lib/projects/definitions';
import { PRIORITY_CONFIG } from '@/lib/projects/config';
import {
    getFlatMyTasks,
    groupTasksByTime,
    groupTasksByProject,
    groupTasksByPriority,
    type TaskGroup,
} from '@/lib/projects/utils';
import Pill from '@/components/projects/Pill';
import TaskPanel from '@/components/projects/TaskPanel'

export default function TasksPage() {
    const { user } = useUser();

    const [projects, setProjects]               = useState<Project[]>([]);
    const [loading, setLoading]                 = useState(true);
    const [doneIds, setDoneIds]                 = useState<Set<string>>(new Set());
    const [activeTask, setActiveTask]           = useState<FlatTask | null>(null);
    const [filterProject, setFilterProject]     = useState<string>('all');
    const [filterPriority, setFilterPriority]   = useState<string>('all');
    const [groupBy, setGroupBy]                 = useState<GroupBy>('time');
    const [collapsed, setCollapsed]             = useState<Record<string, boolean>>({});
    const [showQuick, setShowQuick]             = useState(false);
    const [quickTitle, setQuickTitle]           = useState('');

    // ── Fetch projects ──

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) throw new Error('Failed to fetch');
            setProjects(await res.json());
        } catch {
            // Non-critical — page shows empty state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    // ── Derive my tasks using the real Clerk user ID ──

    const allMyTasks = useMemo(() => {
        if (!user) return [];
        // Pass the real Clerk userId so we match assignees in the DB
        return getFlatMyTasks(projects, user.id);
    }, [projects, user]);

    const totalOpen = allMyTasks.length;

    const todayCount = useMemo(() => allMyTasks.filter(t => {
        if (!t.due) return false;
        const d  = new Date(t.due); d.setHours(0, 0, 0, 0);
        const td = new Date();      td.setHours(0, 0, 0, 0);
        return d.getTime() === td.getTime();
    }).length, [allMyTasks]);

    const overdueCount = useMemo(() => allMyTasks.filter(t => {
        if (!t.due) return false;
        return Math.ceil((new Date(t.due).getTime() - Date.now()) / 86400000) < 0;
    }).length, [allMyTasks]);

    // ── Filtered + grouped tasks ──

    const filtered = useMemo(() =>
        allMyTasks
            .filter(t => !doneIds.has(t.id))
            .filter(t => filterProject  === 'all' || t.projectId === filterProject)
            .filter(t => filterPriority === 'all' || t.priority  === filterPriority),
        [allMyTasks, doneIds, filterProject, filterPriority],
    );

    const groups: TaskGroup[] = useMemo(() => {
        if (groupBy === 'time')     return groupTasksByTime(filtered);
        if (groupBy === 'project')  return groupTasksByProject(filtered);
        if (groupBy === 'priority') return groupTasksByPriority(filtered);
        return [];
    }, [filtered, groupBy]);

    const uniqueProjects = useMemo(() =>
        Array.from(
            new Map(allMyTasks.map(t => [t.projectId, { id: t.projectId, title: t.projectTitle }])).values()
        ),
        [allMyTasks],
    );

    // ── Handlers ──

    const toggleCollapse = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

    const markDone = async (taskId: string) => {
        // Optimistic
        setDoneIds(d => new Set([...d, taskId]));

        try {
            await fetch(`/api/tasks/${taskId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ done: true }),
            });
        } catch {
            // Rollback
            setDoneIds(d => { const next = new Set(d); next.delete(taskId); return next; });
        }
    };

    // ── Render ──

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-6 flex-shrink-0">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h1 className="text-[26px] font-secondary text-zinc-900 tracking-tight m-0">
                            My Tasks
                        </h1>
                        <p className="text-[13px] text-zinc-400 font-primary mt-1 m-0">
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
                    <button
                        onClick={() => setShowQuick(v => !v)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold font-primary cursor-pointer hover:bg-zinc-700 transition-colors"
                    >
                        <Plus size={15} />
                        Add Task
                    </button>
                </div>

                {/* Quick add */}
                {showQuick && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4 flex gap-2.5 flex-wrap items-end shadow-sm">
                        <div className="flex-1 min-w-48">
                            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest font-primary mb-1.5">
                                Task
                            </div>
                            <input
                                autoFocus
                                value={quickTitle}
                                onChange={e => setQuickTitle(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && quickTitle.trim()) {
                                        setShowQuick(false);
                                        setQuickTitle('');
                                    }
                                }}
                                placeholder="What needs to be done?"
                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-[13.5px] font-primary text-zinc-800 bg-zinc-50 outline-none focus:border-zinc-400 transition-colors"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowQuick(false)}
                                className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-500 text-[13px] font-primary cursor-pointer hover:bg-zinc-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!quickTitle.trim()) return;
                                    setShowQuick(false);
                                    setQuickTitle('');
                                }}
                                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold font-primary cursor-pointer hover:bg-zinc-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters + group by */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 flex-wrap">
                    <select
                        value={filterProject}
                        onChange={e => setFilterProject(e.target.value)}
                        className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[12px] font-primary text-zinc-600 outline-none cursor-pointer hover:border-zinc-300 transition-colors"
                    >
                        <option value="all">All projects</option>
                        {uniqueProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>

                    <select
                        value={filterPriority}
                        onChange={e => setFilterPriority(e.target.value)}
                        className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[12px] font-primary text-zinc-600 outline-none cursor-pointer hover:border-zinc-300 transition-colors"
                    >
                        <option value="all">All priorities</option>
                        {['Critical', 'High', 'Medium', 'Low'].map(p => (
                            <option key={p}>{p}</option>
                        ))}
                    </select>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-zinc-400 font-primary flex items-center gap-1">
                            <SlidersHorizontal size={12} />
                            Group by
                        </span>
                        <div className="flex bg-zinc-100 rounded-xl p-0.5">
                            {(['time', 'project', 'priority'] as GroupBy[]).map(v => (
                                <button
                                    key={v}
                                    onClick={() => setGroupBy(v)}
                                    className={`
                                        px-3 py-1 rounded-lg text-[12px] font-primary
                                        transition-all duration-150 cursor-pointer
                                        ${groupBy === v
                                            ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-700'
                                        }
                                    `}
                                >
                                    {v === 'time' ? 'Date' : v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto px-8 py-5">

                {/* Loading skeleton */}
                {loading && (
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-14 bg-white border border-zinc-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-300 gap-3">
                        <Check size={36} className="text-zinc-200" />
                        <span className="text-[14px] font-primary">
                            {filterProject !== 'all' || filterPriority !== 'all'
                                ? 'No tasks match your filters'
                                : "You're all caught up!"
                            }
                        </span>
                    </div>
                )}

                {/* Groups */}
                {!loading && filtered.length > 0 && (
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
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ background: group.accent }}
                                        />
                                        <span className="text-[13px] font-bold text-zinc-900 font-primary">
                                            {group.label}
                                        </span>
                                        <span className="text-[11px] text-zinc-300 font-primary">
                                            {group.tasks.length}
                                        </span>
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
                                                const tdl = task.due ? (() => {
                                                    const diff  = Math.ceil((new Date(task.due).getTime() - Date.now()) / 86400000);
                                                    const label = new Date(task.due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                                    if (diff < 0)  return { label: `${label} · Overdue`, urgent: true };
                                                    if (diff <= 7) return { label: `${label} · ${diff}d`,  urgent: true };
                                                    return { label, urgent: false };
                                                })() : null;

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
                                                            <div className="text-[14px] font-medium font-primary text-zinc-900 truncate">
                                                                {task.title}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                                                                    style={{ background: task.projectAccent }}
                                                                />
                                                                <span className="text-[11px] text-zinc-400 font-primary">
                                                                    {task.projectTitle}
                                                                    {task.sectionTitle && ` · ${task.sectionTitle}`}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Meta */}
                                                        <div className="flex items-center gap-2.5 flex-shrink-0">
                                                            {task.subtasks.length > 0 && (
                                                                <span className="text-[11px] text-zinc-300 font-primary">
                                                                    {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} sub
                                                                </span>
                                                            )}
                                                            {pr && (
                                                                <Pill bg={pr.bg} color={pr.color}>
                                                                    {task.priority}
                                                                </Pill>
                                                            )}
                                                            {tdl && (
                                                                <span
                                                                    className="text-[12px] font-primary flex items-center gap-1"
                                                                    style={{
                                                                        color:      tdl.urgent ? '#D44444' : '#A1A1AA',
                                                                        fontWeight: tdl.urgent ? 600 : 400,
                                                                    }}
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
                />
            )}
        </div>
    );
}
