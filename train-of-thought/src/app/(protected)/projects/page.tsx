'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { STATUS_FILTERS, type Project, type ProjectStatus } from '@/lib/projects/definitions';
import { STATUS_CONFIG } from '@/lib/projects/config';
import ProjectCard from '@/components/projects/ProjectCard';
import NewProjectModal from '@/components/projects/NewProjectModal';
import { useProjects } from '@/hooks/projects/useProjects';

export default function ProjectsPage() {
    const { projects, loading, error, refetch, addProject, updateProject } = useProjects();

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
        } catch {
            // Rollback by removing the temp project
            refetch();
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between px-8 pt-6 flex-shrink-0">
                <div>
                    <h1 className="text-[26px] font-secondary text-zinc-900 tracking-tight m-0">
                        Project Space
                    </h1>
                    <p className="text-[13px] text-zinc-400 font-primary mt-1 m-0">
                        {loading
                            ? 'Loading…'
                            : `${projects.length} projects · ${projects.filter(p => p.status === 'In Progress').length} active`
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="pl-8 pr-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-[13px] font-primary text-zinc-800 outline-none focus:border-zinc-400 transition-colors w-44"
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold font-primary cursor-pointer hover:bg-zinc-700 transition-colors"
                    >
                        <Plus size={15} />
                        New Project
                    </button>
                </div>
            </div>

            {/* Status filters */}
            <div className="flex gap-1.5 px-8 pt-4 flex-shrink-0 flex-wrap">
                {STATUS_FILTERS.map(s => {
                    const cfg    = s !== 'All' ? STATUS_CONFIG[s] : null;
                    const active = filter === s;
                    return (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`
                                flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                                text-[12px] font-primary border transition-all duration-150 cursor-pointer
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
            <div className="flex-1 overflow-y-auto px-8 py-5">

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600 font-primary flex items-center justify-between">
                        {error}
                        <button onClick={refetch} className="underline cursor-pointer">Retry</button>
                    </div>
                )}

                {loading && (
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white border border-zinc-100 rounded-2xl p-6 h-48 animate-pulse">
                                <div className="h-4 bg-zinc-100 rounded-lg w-3/4 mb-3" />
                                <div className="h-3 bg-zinc-100 rounded-lg w-full mb-1.5" />
                                <div className="h-3 bg-zinc-100 rounded-lg w-2/3" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-300 gap-3">
                        <span className="text-4xl">◎</span>
                        <span className="text-[14px] font-primary">
                            {search || filter !== 'All'
                                ? 'No projects match your filters'
                                : 'No projects yet'
                            }
                        </span>
                        {!search && filter === 'All' && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-primary cursor-pointer hover:bg-zinc-700 transition-colors"
                            >
                                <Plus size={14} />
                                New Project
                            </button>
                        )}
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
                        <button
                            onClick={() => setShowModal(true)}
                            className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 min-h-40 cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all duration-150"
                        >
                            <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                                <Plus size={18} />
                            </div>
                            <span className="text-[13px] text-zinc-400 font-primary">New project</span>
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
