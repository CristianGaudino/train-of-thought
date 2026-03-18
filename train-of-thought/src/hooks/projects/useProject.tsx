'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HeaderData, Project, Section, Task, UseProjectReturn } from '@/lib/projects/definitions';
import { generateId } from '@/lib/projects/utils';
import { useUser } from '@clerk/nextjs';



export function useProject(id: string): UseProjectReturn {
    const { user } = useUser();
    const userId = user?.id ?? '';

    const [project, setProject]       = useState<Project | null>(null);
    const [sections, setSections]     = useState<Section[]>([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);
    const [savingHeader, setSaving]   = useState(false);

    // ── Fetch ──

    const fetch_ = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (res.status === 404) { setError('not_found'); return; }
            if (!res.ok) throw new Error('Failed to fetch');
            const data: Project = await res.json();
            setProject(data);
            setSections(data.sections);
            setError(null);
        } catch {
            setError('Could not load project.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetch_(); }, [fetch_]);

    // ── Toggle task done ──

    const toggleTask = async (taskId: string) => {
        let previousDone: boolean | undefined;

        // Optimistic
        setSections(ss => ss.map(s => ({
            ...s,
            tasks: s.tasks.map(t => {
                if (t.id !== taskId) return t;
                previousDone = t.done;
                return { ...t, done: !t.done };
            }),
        })));

        try {
            await fetch(`/api/tasks/${taskId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ done: !previousDone }),
            });
        } catch {
            // Rollback
            setSections(ss => ss.map(s => ({
                ...s,
                tasks: s.tasks.map(t =>
                    t.id === taskId ? { ...t, done: previousDone ?? t.done } : t
                ),
            })));
        }
    };

    // ── Add task ──

    const addTask = async (sectionId: string, title: string) => {
        if (!title.trim()) return;

        const tempId  = generateId('t');
        const newTask: Task = {
            id:          tempId,
            title:       title.trim(),
            description: '',
            done:        false,
            priority:    'Medium',
            due:         null,
            assignees:   [userId],
            subtasks:    [],
            comments:    [],
        };

        // Optimistic
        setSections(ss => ss.map(s =>
            s.id === sectionId ? { ...s, tasks: [...s.tasks, newTask] } : s
        ));

        try {
            const res = await fetch('/api/tasks', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    sectionId,
                    projectId: id,
                    title:     newTask.title,
                    assignees: [userId],
                    order:     sections.find(s => s.id === sectionId)?.tasks.length ?? 0,
                }),
            });
            if (!res.ok) throw new Error('Failed');
            const saved: Task = await res.json();
            // Replace temp with server response
            setSections(ss => ss.map(s => ({
                ...s,
                tasks: s.tasks.map(t => t.id === tempId ? saved : t),
            })));
        } catch {
            // Rollback
            setSections(ss => ss.map(s => ({
                ...s,
                tasks: s.tasks.filter(t => t.id !== tempId),
            })));
        }
    };

    // ── Add section ──

    const addSection = async (title: string) => {
        if (!title.trim()) return;

        const tempId     = generateId('s');
        const newSection: Section = { id: tempId, title: title.trim(), tasks: [] };

        // Optimistic
        setSections(ss => [...ss, newSection]);

        try {
            const res = await fetch('/api/sections', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    projectId: id,
                    title:     newSection.title,
                    order:     sections.length,
                }),
            });
            if (!res.ok) throw new Error('Failed');
            const { id: savedId } = await res.json();
            setSections(ss => ss.map(s => s.id === tempId ? { ...s, id: savedId } : s));
        } catch {
            setSections(ss => ss.filter(s => s.id !== tempId));
        }
    };

    // ── Save header ──

    const saveHeader = async (data: HeaderData) => {
        setSaving(true);
        // Optimistic — update local project state immediately
        setProject(p => p ? {
            ...p,
            title:       data.title,
            description: data.description,
            status:      data.status as Project['status'],
            deadline:    data.deadline || null,
            accent:      data.accent,
            color:       data.color,
            members:     data.members,
        } : p);
        try {
            await fetch(`/api/projects/${id}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ ...data, deadline: data.deadline || null }),
            });
        } catch {
            // Re-fetch to restore server state on failure
            fetch_();
        } finally {
            setSaving(false);
        }
    };

    return {
        project,
        sections,
        loading,
        error,
        toggleTask,
        addTask,
        addSection,
        saveHeader,
        savingHeader,
    };
}
