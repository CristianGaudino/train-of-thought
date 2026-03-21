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
} from '@/lib/projects/config';
import { getDeadlineInfo, getMember } from '@/lib/projects/utils';
import { Avatar } from '@/components/projects/Avatar';
import Ring from '@/components/projects/Ring';
import Pill from '@/components/projects/Pill';
import TaskPanel from '@/components/projects/TaskPanel';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { HeaderData, Tab, Task } from '@/lib/projects/definitions';
import { useProject } from '@/hooks/projects/useProject';
import { AvatarStack } from '@/components/projects/AvatarStack';

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

    const [activeTask, setActiveTask]         = useState<Task | null>(null);
    const [collapsed, setCollapsed]           = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab]           = useState<Tab>('tasks');
    const [editingHeader, setEditingHeader]   = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newTaskSec, setNewTaskSec]         = useState<string | null>(null);
    const [newTaskVal, setNewTaskVal]         = useState('');
    const [newSecMode, setNewSecMode]         = useState(false);
    const [newSecVal, setNewSecVal]           = useState('');
    const [hf, setHf]                        = useState<HeaderData | null>(null);

    // Sync hf when project first loads
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
                {error ? (
                    <p className="text-[14px] text-zinc-400 font-primary">{error}</p>
                ) : (
                    <div className="flex flex-col gap-3 w-full max-w-2xl px-8 pt-8">
                        <div className="h-8 bg-zinc-100 rounded-xl animate-pulse w-64" />
                        <div className="h-4 bg-zinc-100 rounded-lg animate-pulse w-full" />
                        <div className="h-4 bg-zinc-100 rounded-lg animate-pulse w-3/4" />
                    </div>
                )}
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
        await addTask(secId, newTaskVal);
        setNewTaskVal('');
        setNewTaskSec(null);
    };

    const handleAddSection = async () => {
        await addSection(newSecVal);
        setNewSecVal('');
        setNewSecMode(false);
    };

    const handleDelete = async () => {
        const ok = await deleteProject();
        if (ok) router.push('/projects');
    };

    const toggleCollapse = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

    const inputCls = `
        px-3 py-2 rounded-lg border border-zinc-200 bg-white text-[13.5px]
        font-primary text-zinc-800 outline-none focus:border-zinc-400 transition-colors w-full
    `;

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* ── Header ── */}
            <div className="flex-shrink-0 border-b border-black/7" style={{ background: hf.color }}>

                {/* Top bar */}
                <div className="flex items-center gap-3 px-8 pt-4">
                    <button
                        onClick={() => router.push('/projects')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/7 hover:bg-black/12 text-[12px] font-medium font-primary text-zinc-600 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        Projects
                    </button>
                    <div className="w-px h-4 bg-black/12" />
                    <span className="text-[13px] text-zinc-500 font-primary flex-1 truncate">{hf.title}</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditingHeader(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium font-primary text-zinc-600 transition-colors cursor-pointer ${editingHeader ? 'bg-black/12' : 'bg-black/7 hover:bg-black/12'}`}
                        >
                            <Pencil size={13} />
                            Edit
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/7 hover:bg-red-50 hover:text-red-500 text-[12px] font-medium font-primary text-zinc-600 transition-colors cursor-pointer"
                        >
                            <Trash2 size={13} />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Identity */}
                <div className="px-8 pt-5">
                    {editingHeader ? (
                        <div className="flex flex-col gap-3 pb-5">
                            <div className="flex gap-3 flex-wrap">
                                <div className="flex-1 min-w-52">
                                    <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary mb-1.5">Name</div>
                                    <input value={hf.title} onChange={e => setHf(f => f ? { ...f, title: e.target.value } : f)} className={inputCls} />
                                </div>
                                <div className="flex-1 min-w-52">
                                    <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary mb-1.5">Description</div>
                                    <input value={hf.description} onChange={e => setHf(f => f ? { ...f, description: e.target.value } : f)} className={inputCls} />
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap items-end">
                                <div>
                                    <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary mb-1.5">Status</div>
                                    <select value={hf.status} onChange={e => setHf(f => f ? { ...f, status: e.target.value } : f)} className={inputCls + ' w-auto cursor-pointer'}>
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary mb-1.5">Deadline</div>
                                    <input type="date" value={hf.deadline} onChange={e => setHf(f => f ? { ...f, deadline: e.target.value } : f)} className={inputCls + ' w-auto'} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary mb-1.5">Colour</div>
                                    <div className="flex gap-1.5">
                                        {ACCENT_PALETTE.map(pair => (
                                            <button key={pair.accent} onClick={() => setHf(f => f ? { ...f, accent: pair.accent, color: pair.color } : f)} className="w-6 h-6 rounded-full cursor-pointer transition-all duration-150 flex-shrink-0" style={{ background: pair.accent, boxShadow: hf.accent === pair.accent ? `0 0 0 2px #fff, 0 0 0 4px ${pair.accent}` : 'none', transform: hf.accent === pair.accent ? 'scale(1.2)' : 'scale(1)' }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-auto">
                                    <button onClick={() => setEditingHeader(false)} className="px-4 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 text-[13px] font-primary cursor-pointer hover:bg-zinc-50 transition-colors">Cancel</button>
                                    <button onClick={handleSaveHeader} disabled={savingHeader} className="px-5 py-2 rounded-lg text-white text-[13px] font-semibold font-primary cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-60" style={{ background: hf.accent }}>
                                        {savingHeader ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="pb-5">
                            <div className="flex items-start gap-4 flex-wrap">
                                <div className="flex-1 min-w-48">
                                    <h1 className="text-[28px] font-secondary text-zinc-900 tracking-tight m-0 leading-tight">{hf.title}</h1>
                                    {hf.description && <p className="text-[14px] text-zinc-500 font-primary mt-1.5 m-0 leading-relaxed max-w-lg">{hf.description}</p>}
                                    <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                                        <Pill bg={sc.bg} color={sc.text}>
                                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: sc.dot }} />
                                            {hf.status}
                                        </Pill>
                                        {dl && (
                                            <span className="text-[12px] font-primary flex items-center gap-1" style={{ color: dl.urgent ? '#D44444' : '#71717A', fontWeight: dl.urgent ? 600 : 400 }}>
                                                {dl.urgent && <AlertTriangle size={12} />}
                                                {dl.label}
                                            </span>
                                        )}
                                        <AvatarStack ids={hf.members} size={24} />
                                    </div>
                                </div>
                                <div className="rounded-2xl px-4 py-3.5 min-w-44" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)' }}>
                                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest font-primary mb-2">Progress</div>
                                    <div className="flex items-center gap-3">
                                        <Ring done={done} total={allTasks.length} accent={hf.accent} size={48} />
                                        <div>
                                            <div className="text-[22px] font-bold text-zinc-900 font-primary leading-none">{pct}%</div>
                                            <div className="text-[12px] text-zinc-400 font-primary mt-1">{done}/{allTasks.length} tasks</div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-black/8 overflow-hidden mt-3">
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: hf.accent }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex px-8 -mb-px">
                    {(['tasks', 'activity', 'members'] as Tab[]).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className="px-4 py-2.5 text-[13px] font-primary border-b-2 transition-all duration-150 cursor-pointer capitalize" style={{ color: activeTab === t ? hf.accent : '#A1A1AA', fontWeight: activeTab === t ? 600 : 400, borderColor: activeTab === t ? hf.accent : 'transparent' }}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab body ── */}
            <div className="flex-1 overflow-y-auto">

                {/* Tasks */}
                {activeTab === 'tasks' && (
                    <div className="px-8 py-7 flex flex-col gap-7">
                        {sections.map(section => {
                            const secDone = section.tasks.filter(t => t.done).length;
                            const isCollapsed     = collapsed[section.id];
                            return (
                                <div key={section.id}>
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <button onClick={() => toggleCollapse(section.id)} className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer">
                                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        <span className="text-[14px] font-bold text-zinc-900 font-primary">{section.title}</span>
                                        <span className="text-[11px] text-zinc-300 font-primary">{secDone}/{section.tasks.length}</span>
                                        <div className="flex-1 h-px bg-zinc-100" />
                                        <div className="w-16 h-1 rounded-full bg-zinc-100 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${section.tasks.length ? (secDone / section.tasks.length) * 100 : 0}%`, background: hf.accent }} />
                                        </div>
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex flex-col gap-1.5 pl-1">
                                            {section.tasks.map(task => {
                                                const pr  = PRIORITY_CONFIG[task.priority];
                                                const tdl = getDeadlineInfo(task.due);
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-zinc-100 transition-all duration-150 group"
                                                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = hf.accent + '35'; (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = ''; (e.currentTarget as HTMLDivElement).style.background = ''; }}
                                                    >
                                                        <button
                                                            onClick={() => toggleTask(task.id)}
                                                            className="w-[18px] h-[18px] rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                                            style={{ borderColor: task.done ? hf.accent : '#D1D5DB', background: task.done ? hf.accent : 'transparent' }}
                                                            onMouseEnter={e => { if (!task.done) { (e.currentTarget as HTMLButtonElement).style.borderColor = hf.accent; (e.currentTarget as HTMLButtonElement).style.background = hf.accent + '20'; }}}
                                                            onMouseLeave={e => { if (!task.done) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}}
                                                        >
                                                            {task.done && <Check size={10} color="#fff" strokeWidth={3} />}
                                                        </button>
                                                        <span onClick={() => setActiveTask(task)} className="flex-1 text-[14px] font-primary cursor-pointer transition-colors" style={{ color: task.done ? '#BBBBBB' : '#18181B', textDecoration: task.done ? 'line-through' : 'none' }}>
                                                            {task.title}
                                                        </span>
                                                        <div className="flex items-center gap-2.5 flex-shrink-0">
                                                            {task.subtasks.length > 0 && <span className="text-[11px] text-zinc-300 font-primary">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} sub</span>}
                                                            {task.assignees.length > 0 && <AvatarStack ids={task.assignees} size={22} />}
                                                            {tdl && <span className="text-[11px] font-primary flex items-center gap-1" style={{ color: tdl.urgent ? '#D44444' : '#A1A1AA', fontWeight: tdl.urgent ? 600 : 400 }}>{tdl.urgent && <AlertTriangle size={11} />}{tdl.label}</span>}
                                                            {pr && <Pill bg={pr.bg} color={pr.color}>{task.priority}</Pill>}
                                                            {task.comments.length > 0 && <span className="flex items-center gap-1 text-[11px] text-zinc-300 font-primary"><MessageSquare size={12} />{task.comments.length}</span>}
                                                            <button onClick={() => setActiveTask(task)} className="text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                                                                className="text-zinc-200 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                                                title="Delete task"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {newTaskSec === section.id ? (
                                                <div className="flex gap-2 mt-1">
                                                    <input autoFocus value={newTaskVal} onChange={e => setNewTaskVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddTask(section.id); if (e.key === 'Escape') { setNewTaskSec(null); setNewTaskVal(''); }}} placeholder="Task name…" className="flex-1 px-3.5 py-2 rounded-xl border text-[13px] font-primary text-zinc-800 bg-white outline-none" style={{ borderColor: hf.accent }} />
                                                    <button onClick={() => handleAddTask(section.id)} className="px-4 py-2 rounded-xl text-white text-[13px] font-semibold font-primary cursor-pointer hover:opacity-85 transition-opacity" style={{ background: hf.accent }}>Add</button>
                                                    <button onClick={() => { setNewTaskSec(null); setNewTaskVal(''); }} className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-400 cursor-pointer hover:bg-zinc-50"><X size={14} /></button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setNewTaskSec(section.id)}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-dashed border-zinc-200 text-[13px] text-zinc-300 font-primary w-fit mt-1 transition-all duration-150 cursor-pointer"
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = hf.accent; (e.currentTarget as HTMLButtonElement).style.color = hf.accent; (e.currentTarget as HTMLButtonElement).style.borderStyle = 'solid'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ''; (e.currentTarget as HTMLButtonElement).style.color = ''; (e.currentTarget as HTMLButtonElement).style.borderStyle = 'dashed'; }}
                                                >
                                                    <Plus size={13} /> Add task
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {newSecMode ? (
                            <div className="flex gap-2 items-center">
                                <input autoFocus value={newSecVal} onChange={e => setNewSecVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') { setNewSecMode(false); setNewSecVal(''); }}} placeholder="Section name…" className="flex-1 px-3.5 py-2.5 rounded-xl border text-[14px] font-semibold font-primary text-zinc-800 bg-white outline-none" style={{ borderColor: hf.accent }} />
                                <button onClick={handleAddSection} className="px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold font-primary cursor-pointer hover:opacity-85 transition-opacity" style={{ background: hf.accent }}>Add</button>
                                <button onClick={() => { setNewSecMode(false); setNewSecVal(''); }} className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-400 cursor-pointer hover:bg-zinc-50"><X size={14} /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setNewSecMode(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-[13px] text-zinc-300 font-primary w-fit transition-all duration-150 cursor-pointer"
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = hf.accent; (e.currentTarget as HTMLButtonElement).style.color = hf.accent; (e.currentTarget as HTMLButtonElement).style.borderStyle = 'solid'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ''; (e.currentTarget as HTMLButtonElement).style.color = ''; (e.currentTarget as HTMLButtonElement).style.borderStyle = 'dashed'; }}
                            >
                                <Plus size={14} /> Add section
                            </button>
                        )}
                    </div>
                )}

                {/* Activity */}
                {activeTab === 'activity' && (
                    <div className="px-8 py-7 max-w-2xl">
                        <div className="flex flex-col">
                            {ACTIVITY_DATA.map((a, i) => {
                                const actor = getMember(a.actor);
                                const cfg   = NOTIFICATION_CONFIG[a.type] ?? NOTIFICATION_CONFIG.comment;
                                return (
                                    <div key={a.id} className="flex gap-3.5 items-start pb-5 relative">
                                        {i < ACTIVITY_DATA.length - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-zinc-100" />}
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] flex-shrink-0 z-10 border" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '30' }}>{cfg.icon}</div>
                                        <div className="flex-1 pt-1">
                                            <p className="text-[13.5px] font-primary text-zinc-700 leading-snug m-0">
                                                <span className="font-semibold">{actor?.name ?? 'Someone'}</span>
                                                {' '}{a.text}{' '}
                                                <span className="font-semibold" style={{ color: hf.accent }}>{a.subject}</span>
                                            </p>
                                            <p className="text-[11px] text-zinc-400 font-primary mt-1 m-0">{a.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Members */}
                {activeTab === 'members' && (
                    <div className="px-8 py-7 max-w-lg">
                        <div className="flex flex-col gap-2 mb-6">
                            {['1', '2', '3', '4'].map(memberId => {
                                const member   = getMember(memberId);
                                const isMember = hf.members.includes(memberId);
                                const isMe     = memberId === '1';
                                if (!member) return null;
                                return (
                                    <div key={memberId} className="flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150" style={{ borderColor: isMember ? hf.accent + '40' : '#E4E4E7', background: isMember ? '#fff' : '#FAFAFA' }}>
                                        <Avatar member={member} size={36} />
                                        <div className="flex-1">
                                            <div className="text-[14px] font-semibold text-zinc-900 font-primary">{member.name}{isMe && <span className="text-[11px] font-normal text-zinc-400 ml-1.5">you</span>}</div>
                                            <div className="text-[12px] text-zinc-400 font-primary mt-0.5">{isMember ? 'Member' : 'Not a member'}</div>
                                        </div>
                                        {!isMe && (
                                            <button onClick={() => setHf(f => f ? { ...f, members: isMember ? f.members.filter(id => id !== memberId) : [...f.members, memberId] } : f)} className="px-3.5 py-1.5 rounded-lg border text-[12px] font-medium font-primary cursor-pointer transition-all duration-150" style={{ borderColor: isMember ? '#E4E4E7' : hf.accent, background: isMember ? '#fff' : hf.color, color: isMember ? '#71717A' : hf.accent }}>
                                                {isMember ? 'Remove' : 'Add'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={handleSaveHeader} className="px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold font-primary cursor-pointer hover:opacity-85 transition-opacity" style={{ background: hf.accent }}>
                            Save changes
                        </button>
                    </div>
                )}
            </div>

            {/* Task panel — passes updateTask so edits persist */}
            {activeTask && (
                <TaskPanel
                    key={activeTask.id}
                    task={activeTask}
                    accent={hf.accent}
                    projectColor={hf.color}
                    onClose={() => setActiveTask(null)}
                    onUpdate={updateTask}
                    onDelete={async (taskId) => { await deleteTask(taskId); setActiveTask(null); }}
                />
            )}

            {/* Delete confirmation */}
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
