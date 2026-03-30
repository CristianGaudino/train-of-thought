'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Shapes, Star } from 'lucide-react';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
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
import { SortableProjectCard } from '@/components/projects/SortableProjectCard';

// ─── Sortable card wrapper ────────────────────────────────────────────────────



// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
    useEffect(() => { document.title = 'Projects | Train of Thought'; }, []);

    const {
        projects,
        loading,
        error,
        refetch,
        addProject,
        updateProject,
        removeProject: _removeProject,
        reorderProjects,
        toggleFavourite,
        notifySuccess,
        notifyError,
    } = useProjects();

    const [filter, setFilter]         = useState<ProjectStatus | 'All'>('All');
    const [search, setSearch]         = useState('');
    const [showModal, setShowModal]   = useState(false);
    const [activeId, setActiveId]     = useState<string | null>(null);

    const dragEnabled = filter === 'All' && !search;

    const filtered = projects.filter(p => {
        const matchStatus = filter === 'All' || p.status === filter;
        const q = search.toLowerCase();
        const matchSearch =
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const sortedFavourites = filtered
        .filter(p => p.favourite)
        .sort((a, b) => a.order - b.order);

    const sortedRegular = filtered
        .filter(p => !p.favourite)
        .sort((a, b) => a.order - b.order);

    const activeProject = activeId ? projects.find(p => p.id === activeId) ?? null : null;

    // ── DnD ──────────────────────────────────────────────────────────────────

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(String(event.active.id));
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = String(active.id);
        const overId   = String(over.id);

        const inFav  = sortedFavourites.some(p => p.id === activeId);
        const inFav2 = sortedFavourites.some(p => p.id === overId);
        if (inFav !== inFav2) return; // can't drag across groups

        const group    = inFav ? sortedFavourites : sortedRegular;
        const oldIndex = group.findIndex(p => p.id === activeId);
        const newIndex = group.findIndex(p => p.id === overId);
        const reordered = arrayMove(group, oldIndex, newIndex);

        const updates = reordered.map((p, i) => ({ id: p.id, order: i }));
        reorderProjects(updates);

        fetch('/api/projects', {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ updates }),
        }).catch(() => refetch());
    }

    // ── Favourite ─────────────────────────────────────────────────────────────

    async function handleToggleFavourite(id: string) {
        const project = projects.find(p => p.id === id);
        if (!project) return;
        const newValue = !project.favourite;
        toggleFavourite(id);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ favourite: newValue }),
            });
            if (!res.ok) throw new Error('Failed');
        } catch {
            toggleFavourite(id); // rollback
        }
    }

    // ── Create ────────────────────────────────────────────────────────────────

    const handleCreate = async (project: Project) => {
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

    // ── Render ────────────────────────────────────────────────────────────────

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

                {!loading && !error && projects.length === 0 && (
                    <OnboardingEmptyState onNewProject={() => setShowModal(true)} />
                )}

                {!loading && !error && projects.length > 0 && filtered.length === 0 && (
                    <EmptyState title="No projects match your filters" icon={Shapes} />
                )}

                {!loading && filtered.length > 0 && (
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Starred section */}
                        {sortedFavourites.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 font-primary">
                                        Starred
                                    </span>
                                </div>
                                <SortableContext
                                    items={sortedFavourites.map(p => p.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sortedFavourites.map(p => (
                                            <SortableProjectCard
                                                key={p.id}
                                                project={p}
                                                onFavourite={handleToggleFavourite}
                                                dragEnabled={dragEnabled}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        )}

                        {/* Regular projects */}
                        {sortedRegular.length > 0 && (
                            <div>
                                {sortedFavourites.length > 0 && (
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 font-primary">
                                            Projects
                                        </span>
                                    </div>
                                )}
                                <SortableContext
                                    items={sortedRegular.map(p => p.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sortedRegular.map(p => (
                                            <SortableProjectCard
                                                key={p.id}
                                                project={p}
                                                onFavourite={handleToggleFavourite}
                                                dragEnabled={dragEnabled}
                                            />
                                        ))}
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
                                </SortableContext>
                            </div>
                        )}

                        {/* New project button when all projects are starred */}
                        {sortedRegular.length === 0 && sortedFavourites.length > 0 && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 border-2 border-dashed border-zinc-200 rounded-2xl p-6 w-full flex flex-col items-center justify-center gap-2.5 min-h-24 cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all duration-150"
                            >
                                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                                    <Plus size={18} />
                                </div>
                                <span className="text-sm text-zinc-400 font-primary">New project</span>
                            </button>
                        )}

                        {/* Drag overlay */}
                        <DragOverlay>
                            {activeProject && (
                                <div className="opacity-90 rotate-1 shadow-2xl">
                                    <ProjectCard project={activeProject} />
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
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
