'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronRight } from 'lucide-react';
import type { Project, ProjectStatus } from '@/lib/projects/definitions';
import { ACCENT_PALETTE, STATUS_CONFIG, STATUS_OPTIONS } from '@/lib/projects/config';
import { MOCK_MEMBERS, ME_ID } from '@/lib/projects/config';
import { generateId } from '@/lib/projects/utils';
import Pill from './Pill';
import { Avatar } from './Avatar';
import { formatDate } from '@/lib/utils';

interface NewProjectModalProps {
    onClose: () => void;
    onCreate: (project: Project) => void;
}

const STEPS = ['Basics', 'Details', 'Team'] as const;

interface FormState {
    title:       string;
    description: string;
    status:      ProjectStatus;
    deadline:    string;
    accent:      string;
    color:       string;
    members:     string[];
}

const EMPTY_FORM: FormState = {
    title:       '',
    description: '',
    status:      'Planning',
    deadline:    '',
    accent:      ACCENT_PALETTE[0].accent,
    color:       ACCENT_PALETTE[0].color,
    members:     [ME_ID],
};

export default function NewProjectModal({ onClose, onCreate }: NewProjectModalProps) {
    const [form, setForm]         = useState<FormState>(EMPTY_FORM);
    const [step, setStep]         = useState(1);
    const [tags, setTags]         = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => titleRef.current?.focus(), 80);
    }, []);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
        setForm(f => ({ ...f, [k]: v }));
    };

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t)) setTags(ts => [...ts, t]);
        setTagInput('');
    };

    const toggleMember = (id: string) => {
        setForm(f => ({
            ...f,
            members: f.members.includes(id)
                ? f.members.filter(m => m !== id)
                : [...f.members, id],
        }));
    };

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.title.trim()) e.title = 'Project needs a name';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && !validate()) return;
        setStep(s => s + 1);
    };

    const handleCreate = () => {
        if (!validate()) return;
        const project: Project = {
            id:          generateId('p'),
            title:       form.title.trim(),
            description: form.description.trim(),
            tags,
            status:      form.status,
            deadline:    form.deadline || null,
            accent:      form.accent,
            color:       form.color,
            members:     form.members,
            sections:    [{ id: generateId('s'), title: 'Tasks', tasks: [] }],
        };
        onCreate(project);
        onClose();
    };

    const sc = STATUS_CONFIG[form.status] ?? STATUS_CONFIG['Planning'];

    const inputCls = (err?: string) => `
        w-full px-3.5 py-2.5 rounded-xl border text-[14px] font-primary text-zinc-800
        outline-none transition-colors bg-zinc-50
        ${err ? 'border-red-300 focus:border-red-400' : 'border-zinc-200 focus:border-zinc-400'}
    `;

    return (
        /* Backdrop */
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Live preview header */}
                <div
                    className="px-8 py-7 border-b border-black/5 flex-shrink-0"
                    style={{ background: form.color }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div
                                className="text-[11px] font-semibold tracking-widest uppercase font-primary mb-1.5"
                                style={{ color: form.accent }}
                            >
                                New Project
                            </div>
                            <h2 className="text-[22px] font-secondary text-zinc-900 tracking-tight m-0 min-h-8">
                                {form.title || (
                                    <span className="text-zinc-300">Untitled project</span>
                                )}
                            </h2>
                            {form.description && (
                                <p className="text-[13px] text-zinc-500 font-primary mt-1.5 m-0 line-clamp-2">
                                    {form.description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-black/7 flex items-center justify-center text-zinc-500 hover:bg-black/12 transition-colors cursor-pointer ml-4 flex-shrink-0"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Preview pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                        <Pill bg={sc.bg} color={sc.text}>
                            <span
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{ background: sc.dot }}
                            />
                            {form.status}
                        </Pill>
                        {tags.map(t => (
                            <span
                                key={t}
                                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full font-primary"
                                style={{ background: 'rgba(255,255,255,0.6)', color: form.accent }}
                            >
                                {t}
                            </span>
                        ))}
                        {form.deadline && (
                            <span className="text-[12px] text-zinc-400 font-primary">
                                Due {formatDate(form.deadline)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Step indicators */}
                <div className="flex items-center px-8 py-4 border-b border-zinc-100 flex-shrink-0">
                    {STEPS.map((s, i) => {
                        const done   = step > i + 1;
                        const active = step === i + 1;
                        return (
                            <div
                                key={s}
                                className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}
                            >
                                <button
                                    onClick={() => done && setStep(i + 1)}
                                    className={`flex items-center gap-2 ${done ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold font-primary transition-all duration-200 border-2"
                                        style={{
                                            background: done ? form.accent : active ? form.accent + '22' : '#F4F4F5',
                                            color:      done ? '#fff'       : active ? form.accent       : '#A1A1AA',
                                            borderColor: active ? form.accent : 'transparent',
                                        }}
                                    >
                                        {done ? '✓' : i + 1}
                                    </div>
                                    <span
                                        className="text-[13px] font-primary"
                                        style={{
                                            fontWeight: active ? 600 : 400,
                                            color:      active ? '#18181B' : done ? '#52525B' : '#A1A1AA',
                                        }}
                                    >
                                        {s}
                                    </span>
                                </button>
                                {i < STEPS.length - 1 && (
                                    <div
                                        className="flex-1 h-px mx-3 transition-colors duration-300"
                                        style={{ background: done ? form.accent + '40' : '#E4E4E7' }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">

                    {/* ── Step 1: Basics ── */}
                    {step === 1 && (
                        <div className="flex flex-col gap-5">
                            {/* Name */}
                            <div>
                                <label className="text-[12px] font-semibold text-zinc-600 font-primary mb-1.5 block">
                                    Project name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    ref={titleRef}
                                    value={form.title}
                                    onChange={e => { set('title', e.target.value); setErrors(er => ({ ...er, title: undefined })); }}
                                    placeholder="e.g. Website Redesign, Novel Draft…"
                                    className={inputCls(errors.title) + ' text-[15px]'}
                                />
                                {errors.title && (
                                    <p className="text-[12px] text-red-400 font-primary mt-1">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-[12px] font-semibold text-zinc-600 font-primary mb-1.5 block">
                                    Description <span className="text-zinc-300 font-normal">optional</span>
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="What is this project about?"
                                    rows={3}
                                    className={inputCls() + ' resize-none leading-relaxed'}
                                />
                            </div>

                            {/* Colour */}
                            <div>
                                <label className="text-[12px] font-semibold text-zinc-600 font-primary mb-2 block">
                                    Project colour
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {ACCENT_PALETTE.map(pair => (
                                        <button
                                            key={pair.accent}
                                            onClick={() => setForm(f => ({ ...f, accent: pair.accent, color: pair.color }))}
                                            className="w-8 h-8 rounded-full cursor-pointer transition-all duration-150 flex-shrink-0"
                                            style={{
                                                background:  pair.accent,
                                                boxShadow:   form.accent === pair.accent
                                                    ? `0 0 0 3px #fff, 0 0 0 5px ${pair.accent}`
                                                    : 'none',
                                                transform:   form.accent === pair.accent ? 'scale(1.15)' : 'scale(1)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="text-[12px] font-semibold text-zinc-600 font-primary mb-1.5 block">
                                    Tags <span className="text-zinc-300 font-normal">optional</span>
                                </label>
                                {tags.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap mb-2">
                                        {tags.map(t => (
                                            <span
                                                key={t}
                                                className="flex items-center gap-1 text-[12px] font-medium px-2.5 py-0.5 rounded-full font-primary"
                                                style={{ background: form.color, color: form.accent }}
                                            >
                                                {t}
                                                <button
                                                    onClick={() => setTags(ts => ts.filter(x => x !== t))}
                                                    className="opacity-60 hover:opacity-100 cursor-pointer"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-1.5">
                                    <input
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ',') {
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                        placeholder="Type a tag and press Enter…"
                                        className={inputCls() + ' flex-1'}
                                    />
                                    <button
                                        onClick={addTag}
                                        className="px-3 py-2 rounded-xl text-white cursor-pointer transition-opacity hover:opacity-80 flex items-center justify-center flex-shrink-0"
                                        style={{ background: form.accent }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Details ── */}
                    {step === 2 && (
                        <div className="flex flex-col gap-5">
                            {/* Status */}
                            <div>
                                <label className="text-[12px] font-semibold text-zinc-600 font-primary mb-2 block">
                                    Status
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {STATUS_OPTIONS.map(s => {
                                        const cfg    = STATUS_CONFIG[s];
                                        const active = form.status === s;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => set('status', s as ProjectStatus)}
                                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[13px] font-primary cursor-pointer transition-all duration-150"
                                                style={{
                                                    border:     `1.5px solid ${active ? form.accent : '#E4E4E7'}`,
                                                    background: active ? form.color : '#fff',
                                                    color:      active ? form.accent : '#52525B',
                                                    fontWeight: active ? 600 : 400,
                                                }}
                                            >
                                                <span
                                                    className="w-2 h-2 rounded-full inline-block"
                                                    style={{ background: cfg.dot }}
                                                />
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="text-[12px] font-semibold text-zinc-600 font-primary mb-1.5 block">
                                    Deadline{' '}
                                    <span className="text-zinc-300 font-normal">optional — skip for personal projects</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={e => set('deadline', e.target.value)}
                                        className={inputCls() + ' w-auto min-w-44'}
                                    />
                                    {form.deadline && (
                                        <button
                                            onClick={() => set('deadline', '')}
                                            className="text-[12px] text-zinc-400 hover:text-zinc-600 font-primary transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                            <X size={12} /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Info box */}
                            <div className="bg-zinc-50 rounded-xl px-4 py-3.5">
                                <p className="text-[13px] font-semibold text-zinc-700 font-primary m-0 mb-1">
                                    Starting with one section
                                </p>
                                <p className="text-[13px] text-zinc-400 font-primary m-0 leading-relaxed">
                                    Your project starts with a single "Tasks" section. Once created, you can add more sections in the Full view.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Team ── */}
                    {step === 3 && (
                        <div className="flex flex-col gap-4">
                            <p className="text-[13px] text-zinc-400 font-primary m-0 leading-relaxed">
                                Choose who has access to this project. You're included by default.
                            </p>
                            {MOCK_MEMBERS.map(member => {
                                const selected = form.members.includes(member.id);
                                const isMe     = member.id === ME_ID;
                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => !isMe && toggleMember(member.id)}
                                        className="flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-150 w-full"
                                        style={{
                                            border:     `1.5px solid ${selected ? form.accent + '55' : '#E4E4E7'}`,
                                            background: selected ? form.color : '#fff',
                                            cursor:     isMe ? 'default' : 'pointer',
                                        }}
                                    >
                                        <Avatar member={member} size={36} />
                                        <div className="flex-1">
                                            <div className="text-[14px] font-semibold text-zinc-900 font-primary">
                                                {member.name}
                                                {isMe && (
                                                    <span className="text-[11px] font-normal text-zinc-400 ml-1.5">you</span>
                                                )}
                                            </div>
                                            <div className="text-[12px] text-zinc-400 font-primary mt-0.5">Member</div>
                                        </div>
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200"
                                            style={{
                                                borderColor: selected ? form.accent : '#D1D5DB',
                                                background:  selected ? form.accent : 'transparent',
                                            }}
                                        >
                                            {selected && (
                                                <span className="text-white text-[11px] leading-none">✓</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-100 flex-shrink-0">
                    <button
                        onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
                        className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-[13px] font-primary cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                        {step === 1 ? 'Cancel' : '← Back'}
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Step dots */}
                        <div className="flex gap-1.5">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className="h-1.5 rounded-full transition-all duration-250"
                                    style={{
                                        width:      i + 1 === step ? 18 : 6,
                                        background: i + 1 === step ? form.accent : '#E4E4E7',
                                    }}
                                />
                            ))}
                        </div>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold font-primary cursor-pointer transition-opacity hover:opacity-85"
                                style={{ background: form.accent }}
                            >
                                Next
                                <ChevronRight size={15} />
                            </button>
                        ) : (
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold font-primary cursor-pointer transition-opacity hover:opacity-85"
                                style={{ background: form.accent }}
                            >
                                Create project
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
