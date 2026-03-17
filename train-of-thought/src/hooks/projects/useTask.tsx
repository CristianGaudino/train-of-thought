'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import type { GroupBy, Project, TaskGroup, UseTasksReturn } from '@/lib/projects/definitions';
import {
    getFlatMyTasks,
    groupTasksByTime,
    groupTasksByProject,
    groupTasksByPriority,
} from '@/lib/projects/utils';

export function useTasks(): UseTasksReturn {
    const { user }    = useUser();

    const [projects, setProjects]             = useState<Project[]>([]);
    const [loading, setLoading]               = useState(true);
    const [doneIds, setDoneIds]               = useState<Set<string>>(new Set());
    const [filterProject, setFilterProject]   = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [groupBy, setGroupBy]               = useState<GroupBy>('time');

    // ── Fetch all projects (tasks are embedded) ──

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) throw new Error('Failed');
            setProjects(await res.json());
        } catch {
            // Non-critical — shows empty state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    // ── Derive flat tasks for the current user ──

    const allMyTasks = useMemo(() => {
        if (!user) return [];
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

    const filtered = useMemo(() =>
        allMyTasks
            .filter(t => !doneIds.has(t.id))
            .filter(t => filterProject  === 'all' || t.projectId === filterProject)
            .filter(t => filterPriority === 'all' || t.priority  === filterPriority),
        [allMyTasks, doneIds, filterProject, filterPriority],
    );

    const groups = useMemo((): TaskGroup[] => {
        if (groupBy === 'time')     return groupTasksByTime(filtered);
        if (groupBy === 'project')  return groupTasksByProject(filtered);
        if (groupBy === 'priority') return groupTasksByPriority(filtered);
        return [];
    }, [filtered, groupBy]);

    const uniqueProjects = useMemo(() =>
        Array.from(
            new Map(
                allMyTasks.map(t => [t.projectId, { id: t.projectId, title: t.projectTitle }])
            ).values()
        ),
        [allMyTasks],
    );

    // ── Mark done ──

    const markDone = async (taskId: string) => {
        // Optimistic — remove from list immediately
        setDoneIds(d => new Set([...d, taskId]));

        try {
            await fetch(`/api/tasks/${taskId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ done: true }),
            });
        } catch {
            // Rollback — task reappears
            setDoneIds(d => {
                const next = new Set(d);
                next.delete(taskId);
                return next;
            });
        }
    };

    return {
        groups,
        allMyTasks,
        filtered,
        loading,
        totalOpen,
        todayCount,
        overdueCount,
        filterProject,
        filterPriority,
        groupBy,
        setFilterProject,
        setFilterPriority,
        setGroupBy,
        uniqueProjects,
        markDone,
    };
}
