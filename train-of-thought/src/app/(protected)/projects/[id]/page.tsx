'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Pencil, Plus, ChevronDown, ChevronRight,
    AlertTriangle, MessageSquare, X, Check, Trash2,
} from 'lucide-react';
import {
    STATUS_CONFIG, ACCENT_PALETTE, STATUS_OPTIONS,
    PRIORITY_CONFIG, NOTIFICATION_CONFIG, ACTIVITY_DATA,
    MOCK_MEMBERS,
} from '@/lib/projects/config';
import { getDeadlineInfo, getMember } from '@/lib/projects/utils';
import { Avatar } from '@/components/projects/Avatar';
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
import { Task } from '@/components/projects/Task';

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
    const [hf, setHf]                            = useState<HeaderData | null>(null);

    // Sync header form when project first loads
    if (project && !hf) {
        setHf({
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

    if (loading || !hf || !project) {
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

    const sc       = STATUS_CONFIG[hf.status] ?? STATUS_CONFIG['Planning'];
    const dl       = getDeadlineInfo(hf.deadline || null);
    const allTasks = sections.flatMap(s => s.tasks);
    const done     = allTasks.filter(t => t.done).length;
    const pct      = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;

    // ── Handlers ──

    const handleSaveHeader = async () => {
        await saveHeader(hf);
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
            <div className="flex-shrink-0 border-b border-black/7" style={{ background: hf.color }}>

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
                    <span className="text-sm text-zinc-500 font-primary flex-1 truncate">{hf.title}</span>
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
                                        value={hf.title}
                                        onChange={e => setHf(f => f ? { ...f, title: e.target.value } : f)}
                                    />
                                </div>
                                <div className="flex-1 min-w-52">
                                    <SectionLabel className="mb-1.5">Description</SectionLabel>
                                    <Input
                                        value={hf.description}
                                        onChange={e => setHf(f => f ? { ...f, description: e.target.value } : f)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap items-end">
                                <div>
                                    <SectionLabel className="mb-1.5">Status</SectionLabel>
                                    <select
                                        value={hf.status}
                                        onChange={e => setHf(f => f ? { ...f, status: e.target.value } : f)}
                                        className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-primary text-zinc-800 outline-none focus:border-zinc-400 transition-colors cursor-pointer"
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <SectionLabel className="mb-1.5">Deadline</SectionLabel>
                                    <Input
                                        type="date"
                                        value={hf.deadline}
                                        onChange={e => setHf(f => f ? { ...f, deadline: e.target.value } : f)}
                                        className="w-auto"
                                    />
                                </div>
                                <div>
                                    <SectionLabel className="mb-1.5">Colour</SectionLabel>
                                    <div className="flex gap-1.5">
                                        {ACCENT_PALETTE.map(pair => (
                                            <button
                                                key={pair.accent}
                                                onClick={() => setHf(f => f ? { ...f, accent: pair.accent, color: pair.color } : f)}
                                                className="w-6 h-6 rounded-full cursor-pointer transition-all duration-150 flex-shrink-0"
                                                style={{
                                                    background: pair.accent,
                                                    boxShadow:  hf.accent === pair.accent ? `0 0 0 2px #fff, 0 0 0 4px ${pair.accent}` : 'none',
                                                    transform:  hf.accent === pair.accent ? 'scale(1.2)' : 'scale(1)',
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
                                        style={{ background: hf.accent }}
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
                                        {hf.title}
                                    </h1>
                                    {hf.description && (
                                        <p className="text-sm text-zinc-500 font-primary mt-1.5 m-0 leading-relaxed max-w-lg">
                                            {hf.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                                        <Pill bg={sc.bg} color={sc.text}>
                                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: sc.dot }} />
                                            {hf.status}
                                        </Pill>
                                        {dl && (
                                            <span
                                                className="text-xs font-primary flex items-center gap-1"
                                                style={{ color: dl.urgent ? '#D44444' : '#71717A', fontWeight: dl.urgent ? 600 : 400 }}
                                            >
                                                {dl.urgent && <AlertTriangle size={12} />}
                                                {dl.label}
                                            </span>
                                        )}
                                        <AvatarStack ids={hf.members} size={24} />
                                    </div>
                                </div>

                                {/* Progress card */}
                                <div
                                    className="rounded-2xl px-4 py-3.5 min-w-44"
                                    style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)' }}
                                >
                                    <SectionLabel className="mb-2">Progress</SectionLabel>
                                    <div className="flex items-center gap-3">
                                        <Ring done={done} total={allTasks.length} accent={hf.accent} size={48} />
                                        <div>
                                            <div className="text-2xl font-bold text-zinc-900 font-primary leading-none">{pct}%</div>
                                            <div className="text-xs text-zinc-400 font-primary mt-1">{done}/{allTasks.length} tasks</div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-black/8 overflow-hidden mt-3">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, background: hf.accent }}
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
                                color:       activeTab === t ? hf.accent : '#A1A1AA',
                                fontWeight:  activeTab === t ? 600 : 400,
                                borderColor: activeTab === t ? hf.accent : 'transparent',
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab body ── */}
            <div className="flex-1 overflow-y-auto">

                {/* Tasks tab */}
                {activeTab === 'tasks' && (
                    <div className="px-8 py-7 flex flex-col gap-7">
                        {sections.map(section => {
                            const secDone    = section.tasks.filter(t => t.done).length;
                            const isC = collapsed[section.id];
                            return (
                                <div key={section.id}>
                                    {/* Section heading */}
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <button
                                            onClick={() => toggleCollapse(section.id)}
                                            className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
                                        >
                                            {isC ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        <span className="text-sm font-bold text-zinc-900 font-primary">{section.title}</span>
                                        <span className="text-xs text-zinc-300 font-primary">{secDone}/{section.tasks.length}</span>
                                        <div className="flex-1 h-px bg-zinc-100" />
                                        <div className="w-16 h-1 rounded-full bg-zinc-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width:      `${section.tasks.length ? (secDone / section.tasks.length) * 100 : 0}%`,
                                                    background: hf.accent,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Task rows */}
                                    {!isC && (
                                        <div className="flex flex-col gap-1.5 pl-1">
                                            {section.tasks.map(task => (
                                                <Task
                                                    key={task.id}
                                                    task={task}
                                                    hf={hf}
                                                    toggleTask={toggleTask}
                                                    setActiveTaskId={setActiveTaskId}
                                                    deleteTask={deleteTask}
                                                />
                                            ))}

                                            {/* Add task */}
                                            {newTaskSec === section.id ? (
                                                <div className="flex gap-2 mt-1">
                                                    <input
                                                        autoFocus
                                                        value={newTaskVal}
                                                        onChange={e => setNewTaskVal(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter')  handleAddTask(section.id);
                                                            if (e.key === 'Escape') { setNewTaskSec(null); setNewTaskVal(''); }
                                                        }}
                                                        placeholder="Task name…"
                                                        className="flex-1 px-3.5 py-2 rounded-xl border text-sm font-primary text-zinc-800 bg-white outline-none"
                                                        style={{ borderColor: hf.accent }}
                                                    />
                                                    <Button
                                                        size="md"
                                                        onClick={() => handleAddTask(section.id)}
                                                        style={{ background: hf.accent }}
                                                        className="border-0"
                                                    >
                                                        Add
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="md"
                                                        onClick={() => { setNewTaskSec(null); setNewTaskVal(''); }}
                                                        icon={<X size={14} />}
                                                    />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setNewTaskSec(section.id)}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-dashed border-zinc-200 text-sm text-zinc-300 font-primary w-fit mt-1 transition-all duration-150 cursor-pointer"
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.borderColor = hf.accent;
                                                        (e.currentTarget as HTMLButtonElement).style.color       = hf.accent;
                                                        (e.currentTarget as HTMLButtonElement).style.borderStyle = 'solid';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.borderColor = '';
                                                        (e.currentTarget as HTMLButtonElement).style.color       = '';
                                                        (e.currentTarget as HTMLButtonElement).style.borderStyle = 'dashed';
                                                    }}
                                                >
                                                    <Plus size={13} /> Add task
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add section */}
                        {newSecMode ? (
                            <div className="flex gap-2 items-center">
                                <input
                                    autoFocus
                                    value={newSecVal}
                                    onChange={e => setNewSecVal(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter')  handleAddSection();
                                        if (e.key === 'Escape') { setNewSecMode(false); setNewSecVal(''); }
                                    }}
                                    placeholder="Section name…"
                                    className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm font-semibold font-primary text-zinc-800 bg-white outline-none"
                                    style={{ borderColor: hf.accent }}
                                />
                                <Button
                                    size="md"
                                    onClick={handleAddSection}
                                    style={{ background: hf.accent }}
                                    className="border-0"
                                >
                                    Add
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="md"
                                    onClick={() => { setNewSecMode(false); setNewSecVal(''); }}
                                    icon={<X size={14} />}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setNewSecMode(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-sm text-zinc-300 font-primary w-fit transition-all duration-150 cursor-pointer"
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = hf.accent;
                                    (e.currentTarget as HTMLButtonElement).style.color       = hf.accent;
                                    (e.currentTarget as HTMLButtonElement).style.borderStyle = 'solid';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = '';
                                    (e.currentTarget as HTMLButtonElement).style.color       = '';
                                    (e.currentTarget as HTMLButtonElement).style.borderStyle = 'dashed';
                                }}
                            >
                                <Plus size={14} /> Add section
                            </button>
                        )}
                    </div>
                )}

                {/* Activity tab */}
                {activeTab === 'activity' && (
                    <div className="px-8 py-7 max-w-2xl">
                        <div className="flex flex-col">
                            {ACTIVITY_DATA.map((a, i) => {
                                const actor = getMember(a.actor);
                                const cfg   = NOTIFICATION_CONFIG[a.type] ?? NOTIFICATION_CONFIG.comment;
                                return (
                                    <div key={a.id} className="flex gap-3.5 items-start pb-5 relative">
                                        {i < ACTIVITY_DATA.length - 1 && (
                                            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-zinc-100" />
                                        )}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 z-10 border"
                                            style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '30' }}
                                        >
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className="text-sm font-primary text-zinc-700 leading-snug m-0">
                                                <span className="font-semibold">{actor?.name ?? 'Someone'}</span>
                                                {' '}{a.text}{' '}
                                                <span className="font-semibold" style={{ color: hf.accent }}>{a.subject}</span>
                                            </p>
                                            <p className="text-xs text-zinc-400 font-primary mt-1 m-0">{a.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Members tab */}
                {activeTab === 'members' && (
                    <div className="px-8 py-7 max-w-lg">
                        <div className="flex flex-col gap-2 mb-6">
                            {MOCK_MEMBERS.map(member => {
                                const isMember = hf.members.includes(member.id);
                                const isMe     = member.id === '1';
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150"
                                        style={{
                                            borderColor: isMember ? hf.accent + '40' : '#E4E4E7',
                                            background:  isMember ? '#fff' : '#FAFAFA',
                                        }}
                                    >
                                        <Avatar member={member} size={36} />
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-zinc-900 font-primary">
                                                {member.name}
                                                {isMe && <span className="text-xs font-normal text-zinc-400 ml-1.5">you</span>}
                                            </div>
                                            <div className="text-xs text-zinc-400 font-primary mt-0.5">
                                                {isMember ? 'Member' : 'Not a member'}
                                            </div>
                                        </div>
                                        {!isMe && (
                                            <button
                                                onClick={() => setHf(f => f ? {
                                                    ...f,
                                                    members: isMember
                                                        ? f.members.filter(id => id !== member.id)
                                                        : [...f.members, member.id],
                                                } : f)}
                                                className="px-3.5 py-1.5 rounded-lg border text-xs font-medium font-primary cursor-pointer transition-all duration-150"
                                                style={{
                                                    borderColor: isMember ? '#E4E4E7' : hf.accent,
                                                    background:  isMember ? '#fff'    : hf.color,
                                                    color:       isMember ? '#71717A' : hf.accent,
                                                }}
                                            >
                                                {isMember ? 'Remove' : 'Add'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <Button
                            onClick={handleSaveHeader}
                            style={{ background: hf.accent }}
                            className="border-0"
                        >
                            Save changes
                        </Button>
                    </div>
                )}
            </div>

            {/* Task panel — derives from live sections so subtasks/comments stay fresh */}
            {activeTask && (
                <TaskPanel
                    key={activeTask.id}
                    task={activeTask}
                    accent={hf.accent}
                    projectColor={hf.color}
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
