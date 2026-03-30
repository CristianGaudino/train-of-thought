'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Shapes } from 'lucide-react';
import { STATUS_FILTERS, type Project, type ProjectStatus } from '@/lib/projects/definitions';
import { STATUS_CONFIG } from '@/lib/projects/config';
import ProjectCard from '@/components/projects/ProjectCard';
import NewProjectModal from '@/components/projects/NewProjectModal';
import OnboardingEmptyState from '@/components/projects/OnboardingState';
import { useProjects } from '@/hooks/projects/useProjects';
import { Input } from '@/components/ui/inputs';
import { Button } from '@/components/ui/buttons';
import { CardSkeleton } from '@/components/ui/skeletons';
import EmptyState from '@/components/EmptyState';

export default function ProjectsPage() {
    useEffect(() => { document.title = 'Projects | Train of Thought'; }, []);

    const { projects, loading, error, refetch, addProject, updateProject, notifySuccess, notifyError } = useProjects();

    const [filter, setFilter]       = useState<ProjectStatus | 'All'>('All');
    const [search, setSearch]       = useState('');
    const [showModal, setShowModal] = useState(false);

    const filtered = projects.filter(p => {
        const matchStatus = filter === 'All' || p.status === filter;
        const q = search.toLowerCase();
        const matchSearch =
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const handleCreate = async (project: Project) => {
        // Optimistic add
        addProject(project);
        try {
            const res = await fetch('/api/projects', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(project),
            });
            if (!res.ok) throw new Error('Failed');
            const saved: Project = await res.json();
            updateProject(saved);
            notifySuccess('Project created', project.title);
        } catch {
            notifyError('Failed to create project', 'Please try again.');
            refetch();
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="flex flex-wrap gap-3 items-start justify-between px-4 md:px-8 pt-6 flex-shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-secondary text-zinc-900 tracking-tight m-0">
                        Project Space
                    </h1>
                    <p className="text-sm text-zinc-400 font-primary mt-1 m-0">
                        {loading
                            ? 'Loading…'
                            : `${projects.length} projects · ${projects.filter(p => p.status === 'In Progress').length} active`
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="pl-8 py-2 w-36 sm:w-44 text-sm"
                        />
                    </div>
                    <Button onClick={() => setShowModal(true)} icon={<Plus size={15} />}>
                        New Project
                    </Button>
                </div>
            </div>

            {/* Status filters */}
            <div className="flex gap-1.5 px-4 md:px-8 pt-4 flex-shrink-0 flex-wrap">
                {STATUS_FILTERS.map(s => {
                    const cfg    = s !== 'All' ? STATUS_CONFIG[s] : null;
                    const active = filter === s;
                    return (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`
                                flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                                text-xs font-primary border transition-all duration-150 cursor-pointer
                                ${active
                                    ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700'
                                }
                            `}
                        >
                            {cfg && (
                                <span
                                    className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                                    style={{ background: cfg.dot }}
                                />
                            )}
                            {s}
                        </button>
                    );
                })}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5">

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-primary flex items-center justify-between">
                        {error}
                        <button onClick={refetch} className="underline cursor-pointer">Retry</button>
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                    </div>
                )}

                {/* Onboarding — no projects at all yet */}
                {!loading && !error && projects.length === 0 && (
                // {!loading && !error && true && (
                    <OnboardingEmptyState onNewProject={() => setShowModal(true)} />
                )}

                {/* Filtered empty — has projects but none match filters */}
                {!loading && !error && projects.length > 0 && filtered.length === 0 && (
                    <EmptyState title="No projects match your filters" icon={Shapes} />
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
                        <button
                            onClick={() => setShowModal(true)}
                            className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 min-h-40 cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all duration-150"
                        >
                            <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                                <Plus size={18} />
                            </div>
                            <span className="text-sm text-zinc-400 font-primary">New project</span>
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <NewProjectModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}
