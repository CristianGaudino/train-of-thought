'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { Project, UseProjectsReturn } from '@/lib/projects/definitions';

export function useProjects(): UseProjectsReturn {
    const { success, error: toastError } = useToast();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) throw new Error('Failed to fetch');
            setProjects(await res.json());
            setError(null);
        } catch {
            setError('Could not load projects. Please try again.');
            toastError('Failed to load projects', 'Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const addProject = (project: Project) => {
        setProjects(ps => [project, ...ps]);
    };

    const updateProject = (updated: Project) => {
        setProjects(ps => ps.map(p => p.id === updated.id ? updated : p));
    };

    const removeProject = (id: string) => {
        setProjects(ps => ps.filter(p => p.id !== id));
    };

    const notifySuccess = (title: string, message?: string) => success(title, message);
    const notifyError   = (title: string, message?: string) => toastError(title, message);

    return { projects, loading, error, refetch, addProject, updateProject, removeProject, notifySuccess, notifyError };
}
