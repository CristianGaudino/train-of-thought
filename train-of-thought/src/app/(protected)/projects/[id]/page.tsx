'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Pencil, AlertTriangle, Trash2,
} from 'lucide-react';
import {
    STATUS_CONFIG, ACCENT_PALETTE, STATUS_OPTIONS,
} from '@/lib/projects/config';
import { getDeadlineInfo } from '@/lib/projects/utils';
import Ring from '@/components/projects/Ring';
import Pill from '@/components/ui/Pill';
import TaskPanel from '@/components/projects/TaskPanel';
import ConfirmModal from '@/components/ConfirmModal';
import type { HeaderData, Tab } from '@/lib/projects/definitions';
import { useProject } from '@/hooks/projects/useProject';
import { AvatarStack } from '@/components/projects/AvatarStack';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/buttons';
import SectionLabel from '@/components/projects/SectionLabel';
import { Input } from '@/components/ui/inputs';
import { ProjectTasks } from '@/components/projects/ProjectTasks';
import { ProjectActivity } from '@/components/projects/ProjectActivity';
import { ProjectMembers } from '@/components/projects/ProjectMembers';

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const id     = params.id as string;

    const {
        project, sections, loading, error,
        toggleTask, updateTask, addTask, deleteTask, addSection,
        saveHeader, savingHeader,
        deleteProject, deleting,
    } = useProject(id);

    // Use id-based active task so panel always reads from live sections state
    const [activeTaskId, setActiveTaskId]         = useState<string | null>(null);
    const activeTask = activeTaskId
        ? sections.flatMap(s => s.tasks).find(t => t.id === activeTaskId) ?? null
        : null;

    const [collapsed, setCollapsed]               = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab]               = useState<Tab>('tasks');
    const [editingHeader, setEditingHeader]       = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newTaskSec, setNewTaskSec]             = useState<string | null>(null);
    const [newTaskVal, setNewTaskVal]             = useState('');
    const [newSecMode, setNewSecMode]             = useState(false);
    const [newSecVal, setNewSecVal]               = useState('');
    const [header, setHeader]                            = useState<HeaderData | null>(null);

    // Sync header form when project first loads
    if (project && !header) {
        setHeader({
            title:       project.title,
            description: project.description,
            status:      project.status,
            deadline:    project.deadline ?? '',
            accent:      project.accent,
            color:       project.color,
            members:     [...project.members],
        });
    }

    // ── Loading / error ──

    if (loading || !header || !project) {
        if (error === 'not_found') { router.push('/projects'); return null; }
        return (
            <div className="flex-1 flex items-center justify-center">
                {error
                    ? <p className="text-sm text-zinc-400 font-primary">{error}</p>
                    : <PageSkeleton />
                }
            </div>
        );
    }

    // ── Derived ──

    const sc       = STATUS_CONFIG[header.status] ?? STATUS_CONFIG['Planning'];
    const dl       = getDeadlineInfo(header.deadline || null);
    const allTasks = sections.flatMap(s => s.tasks);
    const done     = allTasks.filter(t => t.done).length;
    const pct      = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;

    // ── Handlers ──

    const handleSaveHeader = async () => {
        await saveHeader(header);
        setEditingHeader(false);
    };

    const handleAddTask = async (secId: string) => {
        if (!newTaskVal.trim()) { setNewTaskSec(null); return; }
        await addTask(secId, newTaskVal);
        setNewTaskVal('');
        setNewTaskSec(null);
    };

    const handleAddSection = async () => {
        if (!newSecVal.trim()) { setNewSecMode(false); return; }
        await addSection(newSecVal);
        setNewSecVal('');
        setNewSecMode(false);
    };

    const handleDelete = async () => {
        const ok = await deleteProject();
        if (ok) router.push('/projects');
    };

    const toggleCollapse = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* ── Page header ── */}
            <div className="flex-shrink-0 border-b border-black/7" style={{ background: header.color }}>

                {/* Top bar */}
                <div className="flex items-center gap-3 px-8 pt-4">
                    <button
                        onClick={() => router.push('/projects')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/7 hover:bg-black/12 text-xs font-medium font-primary text-zinc-600 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        Projects
                    </button>
                    <div className="w-px h-4 bg-black/12" />
                    <span className="text-sm text-zinc-500 font-primary flex-1 truncate">{header.title}</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditingHeader(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-primary text-zinc-600 transition-colors cursor-pointer ${editingHeader ? 'bg-black/12' : 'bg-black/7 hover:bg-black/12'}`}
                        >
                            <Pencil size={13} />
                            Edit
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/7 hover:bg-red-50 hover:text-red-500 text-xs font-medium font-primary text-zinc-600 transition-colors cursor-pointer"
                        >
                            <Trash2 size={13} />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Identity / edit form */}
                <div className="px-8 pt-5">
                    {editingHeader ? (
                        <div className="flex flex-col gap-3 pb-5">
                            <div className="flex gap-3 flex-wrap">
                                <div className="flex-1 min-w-52">
                                    <SectionLabel className="mb-1.5">Name</SectionLabel>
                                    <Input
                                        value={header.title}
                                        onChange={e => setHeader(f => f ? { ...f, title: e.target.value } : f)}
                                    />
                                </div>
                                <div className="flex-1 min-w-52">
                                    <SectionLabel className="mb-1.5">Description</SectionLabel>
                                    <Input
                                        value={header.description}
                                        onChange={e => setHeader(f => f ? { ...f, description: e.target.value } : f)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap items-end">
                                <div>
                                    <SectionLabel className="mb-1.5">Status</SectionLabel>
                                    <select
                                        value={header.status}
                                        onChange={e => setHeader(f => f ? { ...f, status: e.target.value } : f)}
                                        className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-primary text-zinc-800 outline-none focus:border-zinc-400 transition-colors cursor-pointer"
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <SectionLabel className="mb-1.5">Deadline</SectionLabel>
                                    <Input
                                        type="date"
                                        value={header.deadline}
                                        onChange={e => setHeader(f => f ? { ...f, deadline: e.target.value } : f)}
                                        className="w-auto"
                                    />
                                </div>
                                <div>
                                    <SectionLabel className="mb-1.5">Colour</SectionLabel>
                                    <div className="flex gap-1.5">
                                        {ACCENT_PALETTE.map(pair => (
                                            <button
                                                key={pair.accent}
                                                onClick={() => setHeader(f => f ? { ...f, accent: pair.accent, color: pair.color } : f)}
                                                className="w-6 h-6 rounded-full cursor-pointer transition-all duration-150 flex-shrink-0"
                                                style={{
                                                    background: pair.accent,
                                                    boxShadow:  header.accent === pair.accent ? `0 0 0 2px #fff, 0 0 0 4px ${pair.accent}` : 'none',
                                                    transform:  header.accent === pair.accent ? 'scale(1.2)' : 'scale(1)',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-auto">
                                    <Button variant="secondary" onClick={() => setEditingHeader(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        loading={savingHeader}
                                        onClick={handleSaveHeader}
                                        style={{ background: header.accent }}
                                        className="border-0"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="pb-5">
                            <div className="flex items-start gap-4 flex-wrap">
                                <div className="flex-1 min-w-48">
                                    <h1 className="text-3xl font-secondary text-zinc-900 tracking-tight m-0 leading-tight">
                                        {header.title}
                                    </h1>
                                    {header.description && (
                                        <p className="text-sm text-zinc-500 font-primary mt-1.5 m-0 leading-relaxed max-w-lg">
                                            {header.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                                        <Pill bg={sc.bg} color={sc.text}>
                                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: sc.dot }} />
                                            {header.status}
                                        </Pill>
                                        {dl && (
                                            <span
                                                className={`text-xs font-primary flex items-center gap-1 ${dl.urgent ? 'text-danger font-semibold' : 'text-zinc-500'}`}
                                            >
                                                {dl.urgent && <AlertTriangle size={12} />}
                                                {dl.label}
                                            </span>
                                        )}
                                        <AvatarStack ids={header.members} size={24} />
                                    </div>
                                </div>

                                {/* Progress card */}
                                <div
                                    className="rounded-2xl px-4 py-3.5 min-w-44"
                                    style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)' }}
                                >
                                    <SectionLabel className="mb-2">Progress</SectionLabel>
                                    <div className="flex items-center gap-3">
                                        <Ring done={done} total={allTasks.length} accent={header.accent} size={48} />
                                        <div>
                                            <div className="text-2xl font-bold text-zinc-900 font-primary leading-none">{pct}%</div>
                                            <div className="text-xs text-zinc-400 font-primary mt-1">{done}/{allTasks.length} tasks</div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-black/8 overflow-hidden mt-3">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, background: header.accent }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex px-8 -mb-px">
                    {(['tasks', 'activity', 'members'] as Tab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className="px-4 py-2.5 text-sm font-primary border-b-2 transition-all duration-150 cursor-pointer capitalize"
                            style={{
                                color:       activeTab === t ? header.accent : '#A1A1AA',
                                fontWeight:  activeTab === t ? 600 : 400,
                                borderColor: activeTab === t ? header.accent : 'transparent',
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab body ── */}
            <div className="flex-1 overflow-y-auto">

                {activeTab === 'tasks' && (
                    <ProjectTasks
                        sections={sections}
                        header={header}
                        collapsed={collapsed}
                        toggleCollapse={toggleCollapse}
                        newTaskSec={newTaskSec}
                        setNewTaskSec={setNewTaskSec}
                        newTaskVal={newTaskVal}
                        setNewTaskVal={setNewTaskVal}
                        newSecMode={newSecMode}
                        setNewSecMode={setNewSecMode}
                        newSecVal={newSecVal}
                        setNewSecVal={setNewSecVal}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                        setActiveTaskId={setActiveTaskId}
                        handleAddTask={handleAddTask}
                        handleAddSection={handleAddSection}
                    />
                )}

                {activeTab === 'activity' && (
                    <ProjectActivity header={header} />
                )}

                {activeTab === 'members' && (
                    <ProjectMembers
                        header={header}
                        setHeader={setHeader}
                        handleSaveHeader={handleSaveHeader}
                        savingHeader={savingHeader}
                    />
                )}
            </div>

            {/* Task panel — derives from live sections so subtasks/comments stay fresh */}
            {activeTask && (
                <TaskPanel
                    key={activeTask.id}
                    task={activeTask}
                    accent={header.accent}
                    projectColor={header.color}
                    onClose={() => setActiveTaskId(null)}
                    onUpdate={updateTask}
                    onDelete={async (taskId) => { await deleteTask(taskId); setActiveTaskId(null); }}
                />
            )}

            {/* Delete project confirmation */}
            {showDeleteConfirm && (
                <ConfirmModal
                    title="Delete project"
                    message={`Are you sure you want to delete "${project.title}"? All sections, tasks and comments will be permanently removed. This cannot be undone.`}
                    confirmLabel="Delete project"
                    destructive
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </div>
    );
}
