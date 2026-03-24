'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/Toast';
import {
    X, Plus, ArrowUp, ChevronRight,
    Pencil, Check, Calendar, Flag,
    UserPlus,
    Trash2,
} from 'lucide-react';
import { type Task, type Subtask, type Comment, type Priority, type TaskPanelProps, PRIORITIES } from '@/lib/projects/definitions';
import { MOCK_MEMBERS, PRIORITY_CONFIG } from '@/lib/projects/config';
import { getMember, generateId } from '@/lib/projects/utils';
import Pill from './Pill';
import { Avatar } from './Avatar';
import { formatDate } from '@/lib/utils';
import { Button } from '../ui/buttons';
import { Input, Textarea } from '../ui/inputs';
import SectionLabel from './SectionLabel';

export default function TaskPanel({
    task,
    accent,
    projectColor,
    onClose,
    onUpdate,
    onDelete,
}: TaskPanelProps) {
    const { user }    = useUser();
    const { success, error: toastError } = useToast();

    // ── Editable field state ──
    const [title, setTitle]               = useState(task.title);
    const [description, setDescription]   = useState(task.description);
    const [priority, setPriority]         = useState<Priority>(task.priority);
    const [due, setDue]                   = useState(task.due ?? '');
    const [assignees, setAssignees]       = useState<string[]>(task.assignees ?? []);

    const [editingTitle, setEditingTitle]     = useState(false);
    const [editingDesc, setEditingDesc]       = useState(false);
    const [showPriority, setShowPriority]     = useState(false);
    const [showDue, setShowDue]               = useState(false);
    const [showAssignees, setShowAssignees]   = useState(false);
    const [saving, setSaving]                 = useState(false);
    const [deleting, setDeleting]             = useState(false);
    const [confirmDelete, setConfirmDelete]   = useState(false);

    // ── Sub-tasks + comments ──
    const [comments, setComments]     = useState<Comment[]>(task.comments ?? []);
    const [subtasks, setSubtasks]     = useState<Subtask[]>(task.subtasks ?? []);
    const [comment, setComment]       = useState('');
    const [newSub, setNewSub]         = useState('');
    const [submitting, setSubmitting] = useState(false);

    const pr = PRIORITY_CONFIG[priority];

    const closeAllDropdowns = () => {
        setShowPriority(false);
        setShowDue(false);
        setShowAssignees(false);
    };

    // ── Save helper ──

    const saveField = async (data: Partial<Task>) => {
        if (!onUpdate) return;
        setSaving(true);
        try {
            await onUpdate(task.id, data);
        } finally {
            setSaving(false);
        }
    };

    // ── Field commits ──

    const commitTitle = async () => {
        setEditingTitle(false);
        if (title.trim() && title !== task.title) {
            await saveField({ title: title.trim() });
        } else {
            setTitle(task.title);
        }
    };

    const commitDesc = async () => {
        setEditingDesc(false);
        if (description !== task.description) {
            await saveField({ description });
        }
    };

    const commitPriority = async (p: Priority) => {
        setPriority(p);
        closeAllDropdowns();
        if (p !== task.priority) await saveField({ priority: p });
    };

    const commitDue = async (val: string) => {
        setDue(val);
        closeAllDropdowns();
        await saveField({ due: val || null });
    };

    const clearDue = async () => {
        setDue('');
        closeAllDropdowns();
        await saveField({ due: null });
    };

    // ── Assignees ──

    const toggleAssignee = async (memberId: string) => {
        const next = assignees.includes(memberId)
            ? assignees.filter(id => id !== memberId)
            : [...assignees, memberId];
        setAssignees(next);
        await saveField({ assignees: next });
    };

    // ── Delete ──

    const handleDelete = async () => {
        if (!onDelete) return;
        setDeleting(true);
        try {
            await onDelete(task.id);
            onClose();
        } catch {
            toastError('Failed to delete task');
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    // ── Sub-tasks ──

    const toggleSub = async (id: string) => {
        const updated = subtasks.map(st => st.id === id ? { ...st, done: !st.done } : st);
        setSubtasks(updated);
        try {
            await fetch(`/api/tasks/${task.id}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ subtasks: updated }),
            });
        } catch {
            toastError('Failed to update sub-task');
            setSubtasks(subtasks);
        }
    };

    const addSub = async () => {
        if (!newSub.trim()) return;
        const newSubtask: Subtask = { id: generateId('st'), label: newSub.trim(), done: false };
        const updated = [...subtasks, newSubtask];
        setSubtasks(updated);
        setNewSub('');
        try {
            await fetch(`/api/tasks/${task.id}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ subtasks: updated }),
            });
        } catch {
            toastError('Failed to add sub-task');
            setSubtasks(subtasks);
        }
    };

    // ── Comments ──

    const addComment = async () => {
        if (!comment.trim() || submitting) return;
        const tempComment: Comment = {
            id:     generateId('c'),
            author: user?.id ?? 'unknown',
            text:   comment.trim(),
            time:   'just now',
        };
        setComments(c => [...c, tempComment]);
        setComment('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${task.id}/comments`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ text: tempComment.text }),
            });
            if (!res.ok) throw new Error('Failed');
            const saved: Comment = await res.json();
            setComments(c => c.map(cm => cm.id === tempComment.id ? saved : cm));
            success('Comment posted');
        } catch {
            toastError('Failed to post comment');
            setComments(c => c.filter(cm => cm.id !== tempComment.id));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Author resolution ──

    const resolveAuthor = (authorId: string) => {
        if (user && authorId === user.id) {
            return {
                name:     user.firstName ?? user.username ?? 'You',
                imageUrl: user.imageUrl,
                initials: (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? ''),
                color:    '#2D7A5F',
            };
        }
        return getMember(authorId);
    };

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 z-[200]" />

            <div className="fixed right-0 top-0 bottom-0 w-[min(480px,92vw)] bg-white z-[201] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">

                {/* ── Header ── */}
                <div className="px-6 py-5 border-b border-zinc-100 flex-shrink-0" style={{ background: projectColor }}>
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">

                            {/* Title */}
                            {editingTitle ? (
                                <input
                                    autoFocus
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    onBlur={commitTitle}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter')  commitTitle();
                                        if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false); }
                                    }}
                                    className="w-full text-xl font-bold font-secondary text-zinc-900 bg-white/70 rounded-lg px-2 py-1 outline-none border border-zinc-300 focus:border-zinc-500"
                                />
                            ) : (
                                <button
                                    onClick={() => setEditingTitle(true)}
                                    className="group flex items-start gap-1.5 text-left w-full"
                                >
                                    <h3 className="text-xl font-bold font-secondary text-zinc-900 leading-snug flex-1">
                                        {title}
                                    </h3>
                                    <Pencil size={13} className="text-zinc-300 group-hover:text-zinc-500 mt-1.5 flex-shrink-0 transition-colors" />
                                </button>
                            )}

                            {/* Breadcrumb */}
                            {task.projectTitle && (
                                <div className="mt-1.5 text-xs text-zinc-500 font-primary flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
                                    {task.projectTitle}
                                    {task.sectionTitle && (
                                        <><ChevronRight size={12} className="text-zinc-300" />{task.sectionTitle}</>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                            {onDelete && !confirmDelete && (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="p-1.5 rounded-lg text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete task"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-black/5 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Delete confirm */}
                    {confirmDelete && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                            <span className="text-xs text-red-700 font-primary flex-1">
                                Delete this task permanently?
                            </span>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="text-xs text-zinc-500 font-primary hover:text-zinc-700 transition-colors cursor-pointer px-2"
                            >
                                Cancel
                            </button>
                            <Button
                                variant="destructive"
                                size="sm"
                                loading={deleting}
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    )}

                    {/* Meta pills */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">

                        {/* Priority */}
                        <div className="relative">
                            <button
                                onClick={() => { closeAllDropdowns(); setShowPriority(v => !v); }}
                                className="flex items-center gap-1 cursor-pointer"
                            >
                                {pr ? (
                                    <Pill bg={pr.bg} color={pr.color}>
                                        <Flag size={10} /> {priority}
                                    </Pill>
                                ) : (
                                    <span className="text-xs text-zinc-400 font-primary flex items-center gap-1 hover:text-zinc-600 transition-colors">
                                        <Flag size={12} /> Priority
                                    </span>
                                )}
                            </button>
                            {showPriority && (
                                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-zinc-200 shadow-lg z-10 overflow-hidden min-w-32">
                                    {PRIORITIES.map(p => {
                                        const cfg = PRIORITY_CONFIG[p];
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => commitPriority(p)}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-primary hover:bg-zinc-50 transition-colors cursor-pointer"
                                                style={{ color: cfg.color }}
                                            >
                                                <Flag size={11} />
                                                {p}
                                                {priority === p && <Check size={11} className="ml-auto" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Due date */}
                        <div className="relative">
                            <button
                                onClick={() => { closeAllDropdowns(); setShowDue(v => !v); }}
                                className="flex items-center gap-1 cursor-pointer"
                            >
                                {due ? (
                                    <span className="text-xs font-primary text-zinc-600 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 hover:bg-white/80 transition-colors">
                                        <Calendar size={11} />
                                        {formatDate(due)}
                                    </span>
                                ) : (
                                    <span className="text-xs text-zinc-400 font-primary flex items-center gap-1 hover:text-zinc-600 transition-colors">
                                        <Calendar size={12} /> Due date
                                    </span>
                                )}
                            </button>
                            {showDue && (
                                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-zinc-200 shadow-lg z-10 p-3 flex flex-col gap-2">
                                    <Input
                                        autoFocus
                                        type="date"
                                        value={due}
                                        onChange={e => commitDue(e.target.value)}
                                        className="text-xs"
                                    />
                                    {due && (
                                        <button
                                            onClick={clearDue}
                                            className="text-xs text-zinc-400 hover:text-zinc-600 font-primary transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                            <X size={11} /> Clear date
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {saving && <span className="text-xs text-zinc-400 font-primary ml-auto">Saving…</span>}
                    </div>

                    {/* Assignees */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-zinc-400 font-primary">Assigned to</span>

                        {assignees.length > 0 && (
                            <div className="flex">
                                {assignees.map((id, i) => {
                                    const m = getMember(id);
                                    return m ? (
                                        <div key={id} style={{ marginLeft: i ? -8 : 0 }}>
                                            <Avatar member={m} size={24} />
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}

                        {/* Assignee picker */}
                        <div className="relative">
                            <button
                                onClick={() => { closeAllDropdowns(); setShowAssignees(v => !v); }}
                                className={`flex items-center gap-1 text-xs font-primary px-2 py-1 rounded-full transition-colors cursor-pointer ${showAssignees ? 'bg-zinc-200 text-zinc-700' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/60'}`}
                            >
                                <UserPlus size={11} />
                                {assignees.length === 0 ? 'Assign' : 'Edit'}
                            </button>
                            {showAssignees && (
                                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-zinc-200 shadow-lg z-10 overflow-hidden min-w-44">
                                    <div className="px-3 py-2 border-b border-zinc-100">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 font-primary">
                                            Assignees
                                        </span>
                                    </div>
                                    {MOCK_MEMBERS.map(member => {
                                        const assigned = assignees.includes(member.id);
                                        return (
                                            <button
                                                key={member.id}
                                                onClick={() => toggleAssignee(member.id)}
                                                className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-zinc-50 transition-colors cursor-pointer"
                                            >
                                                <Avatar member={member} size={22} />
                                                <span className="text-xs font-primary text-zinc-700 flex-1 text-left">{member.name}</span>
                                                {assigned && <Check size={13} className="text-zinc-500 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {assignees.length > 0 && (
                            <span className="text-xs text-zinc-500 font-primary">
                                {assignees.map(id => getMember(id)?.name).filter(Boolean).join(', ')}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

                    {/* Description */}
                    <div>
                        <SectionLabel>Description</SectionLabel>
                        {editingDesc ? (
                            <div className="flex flex-col gap-2">
                                <Textarea
                                    autoFocus
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Add a description…"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={commitDesc}
                                        icon={<Check size={12} />}
                                        style={{ background: accent }}
                                        className="border-0"
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => { setDescription(task.description); setEditingDesc(false); }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setEditingDesc(true)} className="group w-full text-left">
                                {description ? (
                                    <p className="text-sm text-zinc-600 font-primary leading-relaxed group-hover:text-zinc-800 transition-colors">
                                        {description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-zinc-300 font-primary italic group-hover:text-zinc-400 transition-colors">
                                        Add a description…
                                    </p>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Sub-tasks */}
                    <div>
                        <SectionLabel>
                            Sub-tasks{' '}
                            <span className="text-zinc-300 font-normal">
                                ({subtasks.filter(s => s.done).length}/{subtasks.length})
                            </span>
                        </SectionLabel>
                        <div className="flex flex-col gap-1.5 mb-2">
                            {subtasks.length === 0 && (
                                <p className="text-sm text-zinc-300 font-primary m-0">No sub-tasks yet.</p>
                            )}
                            {subtasks.map(st => (
                                <div
                                    key={st.id}
                                    onClick={() => toggleSub(st.id)}
                                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors"
                                >
                                    <div
                                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                        style={{
                                            border:     `2px solid ${st.done ? accent : '#D1D5DB'}`,
                                            background: st.done ? accent : 'transparent',
                                        }}
                                    >
                                        {st.done && <span className="text-white text-xs leading-none">✓</span>}
                                    </div>
                                    <span
                                        className="text-sm font-primary transition-colors flex-1"
                                        style={{
                                            color:          st.done ? '#BBBBBB' : '#374151',
                                            textDecoration: st.done ? 'line-through' : 'none',
                                        }}
                                    >
                                        {st.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-1.5">
                            <Input
                                value={newSub}
                                onChange={e => setNewSub(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSub()}
                                placeholder="Add sub-task…"
                                className="text-sm py-2"
                            />
                            <Button
                                onClick={addSub}
                                icon={<Plus size={16} />}
                                style={{ background: accent }}
                                className="border-0 flex-shrink-0"
                            />
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <SectionLabel>
                            Comments{' '}
                            <span className="text-zinc-300 font-normal">({comments.length})</span>
                        </SectionLabel>
                        {comments.length === 0 && (
                            <p className="text-sm text-zinc-300 font-primary mb-2.5 m-0">No comments yet.</p>
                        )}
                        <div className="flex flex-col gap-2.5 mb-3">
                            {comments.map(c => {
                                const author = resolveAuthor(c.author);
                                return (
                                    <div key={c.id} className="flex gap-2.5 items-start">
                                        {author && (
                                            'imageUrl' in author && author.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={author.imageUrl} alt={author.name ?? ''} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border-2 border-white" />
                                            ) : (
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white font-bold text-white font-primary text-xs"
                                                    style={{ background: 'color' in author ? author.color : '#888' }}
                                                >
                                                    {'initials' in author ? author.initials : '?'}
                                                </div>
                                            )
                                        )}
                                        <div className="flex-1 bg-zinc-50 rounded-xl px-3.5 py-2.5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs font-semibold text-zinc-800 font-primary">
                                                    {author?.name ?? 'Unknown'}
                                                </span>
                                                <span className="text-xs text-zinc-400 font-primary">{c.time}</span>
                                            </div>
                                            <p className="text-sm text-zinc-600 font-primary leading-relaxed m-0">{c.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Comment input */}
                        <div className="flex gap-2 items-center">
                            {user?.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.imageUrl} alt={user.firstName ?? 'You'} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border-2 border-white" />
                            ) : (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white font-bold text-white font-primary text-xs bg-zinc-400">
                                    {user?.firstName?.[0] ?? '?'}
                                </div>
                            )}
                            <Input
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addComment()}
                                placeholder="Add a comment…"
                                disabled={submitting}
                                className="text-sm py-2"
                            />
                            <Button
                                onClick={addComment}
                                disabled={submitting || !comment.trim()}
                                icon={<ArrowUp size={16} />}
                                style={{ background: accent }}
                                className="border-0 flex-shrink-0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
