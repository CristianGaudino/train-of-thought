'use client';

import { useState } from 'react';
import { X, Plus, ArrowUp, ChevronRight } from 'lucide-react';
import type { Task, Subtask, Comment } from '@/lib/projects/definitions';
import { PRIORITY_CONFIG } from '@/lib/projects/config';
import { getMember, generateId } from '@/lib/projects/utils';
import { ME_ID } from '@/lib/projects/config';
import Pill from './Pill';
import { Avatar } from './Avatar';
import { formatDate } from '@/lib/utils';

interface TaskPanelProps {
    task: Task;
    accent: string;
    projectColor: string;
    onClose: () => void;
}

export default function TaskPanel({ task, accent, projectColor, onClose }: TaskPanelProps) {
    const [comments, setComments] = useState<Comment[]>(task.comments ?? []);
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks ?? []);
    const [comment, setComment]   = useState('');
    const [newSub, setNewSub]     = useState('');

    const pr = PRIORITY_CONFIG[task.priority];

    const addComment = () => {
        if (!comment.trim()) return;
        setComments(c => [
            ...c,
            { id: generateId('c'), author: ME_ID, text: comment.trim(), time: 'just now' },
        ]);
        setComment('');
    };

    const toggleSub = (id: string) => {
        setSubtasks(s => s.map(st => st.id === id ? { ...st, done: !st.done } : st));
    };

    const addSub = () => {
        if (!newSub.trim()) return;
        setSubtasks(s => [...s, { id: generateId('st'), label: newSub.trim(), done: false }]);
        setNewSub('');
    };

    return (
        <>
            {/* Backdrop */}
            <div onClick={onClose} className="fixed inset-0 z-[200]" />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-[min(440px,90vw)] bg-white z-[201] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">

                {/* Header */}
                <div
                    className="px-6 py-5 border-b border-zinc-100 flex-shrink-0"
                    style={{ background: projectColor }}
                >
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {pr && <Pill bg={pr.bg} color={pr.color}>{task.priority}</Pill>}
                                {task.due && (
                                    <span className="text-[12px] text-zinc-500 font-primary">
                                        Due {formatDate(task.due)}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-[19px] font-bold font-secondary text-zinc-900 leading-snug m-0">
                                {task.title}
                            </h3>
                            {task.projectTitle && (
                                <div className="mt-1.5 text-[12px] text-zinc-500 font-primary flex items-center gap-1">
                                    <span
                                        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: accent }}
                                    />
                                    {task.projectTitle}
                                    {task.sectionTitle && (
                                        <>
                                            <ChevronRight size={12} className="text-zinc-300" />
                                            {task.sectionTitle}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-600 flex-shrink-0 transition-colors cursor-pointer p-1 rounded-lg hover:bg-black/5"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Assignees */}
                    {task.assignees.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-[12px] text-zinc-400 font-primary">Assigned to</span>
                            <div className="flex">
                                {task.assignees.map((id, i) => {
                                    const m = getMember(id);
                                    return m ? (
                                        <div key={id} style={{ marginLeft: i ? -8 : 0 }}>
                                            <Avatar member={m} size={24} />
                                        </div>
                                    ) : null;
                                })}
                            </div>
                            <span className="text-[12px] text-zinc-600 font-primary">
                                {task.assignees.map(id => getMember(id)?.name).filter(Boolean).join(', ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

                    {/* Description */}
                    {task.description && (
                        <div>
                            <SectionLabel>Description</SectionLabel>
                            <p className="text-[14px] text-zinc-600 font-primary leading-relaxed m-0">
                                {task.description}
                            </p>
                        </div>
                    )}

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
                                <p className="text-[13px] text-zinc-300 font-primary m-0">No sub-tasks yet.</p>
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
                                            border: `2px solid ${st.done ? accent : '#D1D5DB'}`,
                                            background: st.done ? accent : 'transparent',
                                        }}
                                    >
                                        {st.done && (
                                            <span className="text-white text-[9px] leading-none">✓</span>
                                        )}
                                    </div>
                                    <span
                                        className="text-[13px] font-primary transition-colors"
                                        style={{
                                            color: st.done ? '#BBBBBB' : '#374151',
                                            textDecoration: st.done ? 'line-through' : 'none',
                                        }}
                                    >
                                        {st.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-1.5">
                            <input
                                value={newSub}
                                onChange={e => setNewSub(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSub()}
                                placeholder="Add sub-task…"
                                className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-[13px] font-primary text-zinc-800 bg-zinc-50 outline-none focus:border-zinc-400 transition-colors"
                            />
                            <button
                                onClick={addSub}
                                className="px-3 py-2 rounded-lg text-white cursor-pointer transition-opacity hover:opacity-80 flex items-center justify-center"
                                style={{ background: accent }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <SectionLabel>
                            Comments{' '}
                            <span className="text-zinc-300 font-normal">({comments.length})</span>
                        </SectionLabel>
                        {comments.length === 0 && (
                            <p className="text-[13px] text-zinc-300 font-primary mb-2.5 m-0">No comments yet.</p>
                        )}
                        <div className="flex flex-col gap-2.5 mb-3">
                            {comments.map(c => {
                                const author = getMember(c.author);
                                return (
                                    <div key={c.id} className="flex gap-2.5 items-start">
                                        {author && <Avatar member={author} size={28} />}
                                        <div className="flex-1 bg-zinc-50 rounded-xl px-3.5 py-2.5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[12px] font-semibold text-zinc-800 font-primary">
                                                    {author?.name ?? 'Unknown'}
                                                </span>
                                                <span className="text-[11px] text-zinc-400 font-primary">
                                                    {c.time}
                                                </span>
                                            </div>
                                            <p className="text-[13px] text-zinc-600 font-primary leading-relaxed m-0">
                                                {c.text}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Comment input */}
                        <div className="flex gap-2 items-center">
                            {(() => {
                                const me = getMember(ME_ID);
                                return me ? <Avatar member={me} size={28} /> : null;
                            })()}
                            <input
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addComment()}
                                placeholder="Add a comment…"
                                className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-[13px] font-primary text-zinc-800 bg-zinc-50 outline-none focus:border-zinc-400 transition-colors"
                            />
                            <button
                                onClick={addComment}
                                className="px-3 py-2 rounded-lg text-white cursor-pointer transition-opacity hover:opacity-80 flex items-center justify-center"
                                style={{ background: accent }}
                            >
                                <ArrowUp size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-[11px] font-semibold tracking-widest uppercase text-zinc-300 font-primary mb-2.5">
            {children}
        </div>
    );
}
