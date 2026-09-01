'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/Toast';
import type { Project, Section, Task, HeaderData, UseProjectReturn } from '@/lib/projects/definitions';
import { generateId } from '@/lib/projects/utils';

export function useProject(id: string): UseProjectReturn {
    const { user } = useUser();
    const userId = user?.id ?? '';
    const { success, error: toastError } = useToast();

    const [project, setProject]       = useState<Project | null>(null);
    const [sections, setSections]     = useState<Section[]>([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);
    const [savingHeader, setSaving]   = useState(false);
    const [deleting, setDeleting]     = useState(false);

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
        const task = sections.flatMap(s => s.tasks).find(t => t.id === taskId);
        const previousDone = task?.done ?? false;
        const newDone = !previousDone;

        // Optimistic
        setSections(ss => ss.map(s => ({
            ...s,
            tasks: s.tasks.map(t => t.id === taskId ? { ...t, done: newDone } : t),
        })));

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ done: newDone }),
            });
            if (!res.ok) throw new Error('Failed');
            if (newDone) success('Task completed');
        } catch {
            toastError('Failed to update task', 'Your change could not be saved.');
            // Rollback
            setSections(ss => ss.map(s => ({
                ...s,
                tasks: s.tasks.map(t =>
                    t.id === taskId ? { ...t, done: previousDone } : t
                ),
            })));
        }
    };


    // ── Update task fields ──

    const updateTask = async (taskId: string, data: Partial<Task>, options?: { silent?: boolean }) => {
        // Optimistic
        setSections(ss => ss.map(s => ({
            ...s,
            tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...data } : t),
        })));

        try {
            const payload: Record<string, unknown> = { ...data };
            // Convert due date to ISO string if present
            if ('due' in payload && payload.due) {
                payload.due = payload.due;
            }
            const res = await fetch(`/api/tasks/${taskId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed');
            if (!options?.silent) {
                success('Task updated');
            };
        } catch {
            toastError('Failed to update task', 'Your changes could not be saved.');
            // Rollback by refetching
            fetch_();
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
            success('Task added');
        } catch {
            toastError('Failed to add task', 'Your task could not be saved.');
            setSections(ss => ss.map(s => ({
                ...s,
                tasks: s.tasks.filter(t => t.id !== tempId),
            })));
        }
    };


    // ── Delete task ──

    const deleteTask = async (taskId: string) => {
        // Snapshot for rollback
        const snapshot = sections;

        // Optimistic — mark as deleted (soft delete keeps it available for activity/notifications)
        setSections(ss => ss.map(s => ({
            ...s,
            tasks: s.tasks.map(t => t.id === taskId ? { ...t, deleted: true } : t),
        })));

        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            success('Task deleted');
        } catch {
            toastError('Failed to delete task');
            setSections(snapshot);
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
            success('Section added');
        } catch {
            toastError('Failed to add section');
            setSections(ss => ss.filter(s => s.id !== tempId));
        }
    };

    // ── Reorder tasks (within or across sections) ──

    const reorderTasks = async (updatedSections: Section[]) => {
        const prev = sections;
        setSections(updatedSections);
        try {
            const updates = updatedSections.flatMap((s) =>
                s.tasks.map((t, i) => ({ id: t.id, sectionId: s.id, order: i }))
            );
            const res = await fetch('/api/tasks/reorder', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Failed');
        } catch {
            toastError('Failed to reorder tasks');
            setSections(prev);
        }
    };

    // ── Reorder sections ──

    const reorderSections = async (reordered: Section[]) => {
        const prev = sections;
        setSections(reordered);
        try {
            const res = await fetch('/api/sections/reorder', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(reordered.map((s, i) => ({ id: s.id, order: i }))),
            });
            if (!res.ok) throw new Error('Failed');
        } catch {
            toastError('Failed to reorder sections');
            setSections(prev);
        }
    };

    // ── Rename section ──

    const renameSection = async (sectionId: string, title: string) => {
        const prev = sections.find(s => s.id === sectionId)?.title;
        setSections(ss => ss.map(s => s.id === sectionId ? { ...s, title } : s));
        try {
            const res = await fetch(`/api/sections/${sectionId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ title }),
            });
            if (!res.ok) throw new Error('Failed');
        } catch {
            toastError('Failed to rename section');
            setSections(ss => ss.map(s => s.id === sectionId ? { ...s, title: prev ?? s.title } : s));
        }
    };

    // ── Delete section ──

    const deleteSection = async (sectionId: string) => {
        const snapshot = sections;
        setSections(ss => ss.filter(s => s.id !== sectionId));
        try {
            const res = await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            success('Section deleted');
        } catch {
            toastError('Failed to delete section');
            setSections(snapshot);
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


    // ── Toggle favourite ──

    const toggleFavourite = async () => {
        if (!project) return;
        const newValue = !project.favourite;
        setProject(p => p ? { ...p, favourite: newValue } : p);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ favourite: newValue }),
            });
            if (!res.ok) throw new Error('Failed');
        } catch {
            setProject(p => p ? { ...p, favourite: !newValue } : p);
        }
    };

    // ── Members ──

    const addMember = async (email: string): Promise<{ ok: boolean; members?: string[]; error?: string }> => {
        try {
            const res = await fetch(`/api/projects/${id}/members`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { ok: false, error: data.error ?? 'Could not share the project.' };
            }
            setProject(p => p ? { ...p, members: data.members } : p);
            success('Project shared', data.member?.name ? `${data.member.name} can now access this project.` : undefined);
            return { ok: true, members: data.members };
        } catch {
            return { ok: false, error: 'Could not share the project.' };
        }
    };

    const removeMember = async (memberId: string): Promise<string[] | null> => {
        const snapshot = project?.members ?? [];
        setProject(p => p ? { ...p, members: p.members.filter(m => m !== memberId) } : p);
        try {
            const res = await fetch(`/api/projects/${id}/members?userId=${encodeURIComponent(memberId)}`, {
                method: 'DELETE',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? 'Failed');
            setProject(p => p ? { ...p, members: data.members } : p);
            success('Member removed');
            return data.members as string[];
        } catch (err) {
            toastError('Failed to remove member', err instanceof Error ? err.message : undefined);
            setProject(p => p ? { ...p, members: snapshot } : p);
            return null;
        }
    };

    const leaveProject = async (): Promise<boolean> => {
        if (!userId) return false;
        try {
            const res = await fetch(`/api/projects/${id}/members?userId=${encodeURIComponent(userId)}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed');
            success('You left the project');
            return true;
        } catch {
            toastError('Failed to leave project', 'Please try again.');
            return false;
        }
    };

    // ── Delete project ──

    const deleteProject = async (): Promise<boolean> => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            success('Project deleted');
            return true;
        } catch {
            toastError('Failed to delete project', 'Please try again.');
            return false;
        } finally {
            setDeleting(false);
        }
    };

    return {
        project,
        sections,
        loading,
        error,
        toggleTask,
        updateTask,
        addTask,
        deleteTask,
        addSection,
        reorderTasks,
        reorderSections,
        renameSection,
        deleteSection,
        saveHeader,
        savingHeader,
        toggleFavourite,
        addMember,
        removeMember,
        leaveProject,
        deleteProject,
        deleting,
    };
}
