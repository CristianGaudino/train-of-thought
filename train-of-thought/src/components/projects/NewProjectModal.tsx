'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { X, Plus, ChevronRight, Copy, Check } from 'lucide-react';
import { EMPTY_FORM, STEPS, type FormState, type NewProjectModalProps, type Project, type ProjectStatus } from '@/lib/projects/definitions';
import { ACCENT_PALETTE, STATUS_CONFIG, STATUS_OPTIONS } from '@/lib/projects/config';
import { generateId } from '@/lib/projects/utils';
import { parseProjectOutline, PROJECT_IMPORT_TEMPLATE, PROJECT_IMPORT_GUIDE } from '@/lib/projects/import';
import Pill from '../ui/Pill';
import SegmentedControl from '../SegmentedControl';
import { formatDate } from '@/lib/utils';
import { Input, Textarea } from '../ui/inputs';
import Button from '../ui/buttons';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
type Mode = 'build' | 'import';

export default function NewProjectModal({ onClose, onCreate, onImport }: NewProjectModalProps) {
    const [mode, setMode]         = useState<Mode>('build');
    const [form, setForm]         = useState<FormState>(EMPTY_FORM);
    const [step, setStep]         = useState(1);
    const [tags, setTags]         = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
    const [importText, setImportText]   = useState('');
    const [importError, setImportError] = useState<string | null>(null);
    const [copied, setCopied]           = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);
    const { user } = useUser();

    useEffect(() => {
        setTimeout(() => titleRef.current?.focus(), 80);
    }, []);

    useEffect(() => {
        if (user?.id) setForm(f => ({ ...f, members: [user.id] }));
    }, [user?.id]);

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

    const copyGuide = async () => {
        try {
            await navigator.clipboard.writeText(PROJECT_IMPORT_GUIDE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard unavailable — no-op */ }
    };

    const handleImport = () => {
        const { generated, error } = parseProjectOutline(importText);
        if (error || !generated) {
            setImportError(error ?? 'Could not read that outline.');
            return;
        }
        onImport(generated);
        onClose();
    };

    const handleCreate = () => {
        if (!validate()) return;
        const project: Project = {
            id:          generateId('p'),
            ownerId:     user?.id ?? '',
            title:       form.title.trim(),
            description: form.description.trim(),
            tags,
            status:      form.status,
            deadline:    form.deadline || null,
            accent:      form.accent,
            color:       form.color,
            members:     form.members,
            sections:    [{ id: generateId('s'), title: 'Tasks', tasks: [] }],
            order:       0,
            favourite:   false,
        };
        onCreate(project);
        onClose();
    };

    const sc = STATUS_CONFIG[form.status] ?? STATUS_CONFIG['Planning'];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Live preview header */}
                <div className="px-8 py-7 border-b border-black/5 flex-shrink-0" style={{ background: form.color }}>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div
                                className="text-xs font-semibold tracking-widest uppercase font-primary mb-1.5"
                                style={{ color: form.accent }}
                            >
                                {mode === 'import' ? 'Import Project' : 'New Project'}
                            </div>
                            <h2 className="text-2xl font-secondary text-zinc-900 tracking-tight m-0 min-h-8">
                                {form.title || <span className="text-zinc-300">Untitled project</span>}
                            </h2>
                            {form.description && (
                                <p className="text-sm text-zinc-500 font-primary mt-1.5 m-0 line-clamp-2">
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
                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                        <Pill bg={sc.bg} color={sc.text}>
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: sc.dot }} />
                            {form.status}
                        </Pill>
                        {tags.map(t => (
                            <span
                                key={t}
                                className="text-xs font-medium px-2.5 py-0.5 rounded-full font-primary"
                                style={{ background: 'rgba(255,255,255,0.6)', color: form.accent }}
                            >
                                {t}
                            </span>
                        ))}
                        {form.deadline && (
                            <span className="text-xs text-zinc-400 font-primary">
                                Due {formatDate(form.deadline)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Mode toggle */}
                <div className="px-8 pt-4 flex-shrink-0">
                    <SegmentedControl<Mode>
                        segments={[
                            { value: 'build',  label: 'Build manually' },
                            { value: 'import', label: 'Import outline'  },
                        ]}
                        value={mode}
                        onChange={setMode}
                        className="w-fit"
                    />
                </div>

                {mode === 'import' ? (
                    <>
                        {/* Import content */}
                        <div className="flex-1 overflow-y-auto px-8 py-5 flex flex-col gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-zinc-600 font-primary">
                                        Project outline
                                    </label>
                                    <button
                                        onClick={copyGuide}
                                        className="flex items-center gap-1.5 text-xs font-primary text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                                    >
                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                        {copied ? 'Copied' : 'Copy format for AI'}
                                    </button>
                                </div>
                                <Textarea
                                    value={importText}
                                    onChange={e => { setImportText(e.target.value); setImportError(null); }}
                                    placeholder={PROJECT_IMPORT_TEMPLATE}
                                    rows={12}
                                    style={{ fontFamily: MONO }}
                                    className="text-xs leading-relaxed"
                                />
                                {importError && (
                                    <p className="text-xs text-red-400 font-primary mt-1.5">{importError}</p>
                                )}
                            </div>

                            <details className="bg-zinc-50 rounded-xl px-4 py-3 group">
                                <summary className="text-sm font-semibold text-zinc-700 font-primary cursor-pointer list-none flex items-center gap-1.5">
                                    <ChevronRight size={13} className="transition-transform group-open:rotate-90" />
                                    Format guide
                                </summary>
                                <pre
                                    className="text-xs text-zinc-500 whitespace-pre-wrap mt-2.5 m-0"
                                    style={{ fontFamily: MONO }}
                                >{PROJECT_IMPORT_GUIDE}</pre>
                            </details>

                            <p className="text-sm text-zinc-400 font-primary m-0 leading-relaxed">
                                Write an outline in this format, or copy it and ask any AI to
                                &ldquo;create a project outline in this format for &lt;your idea&gt;&rdquo;,
                                then paste the result here. You&apos;ll get a preview to review and edit before
                                anything is created.
                            </p>
                        </div>

                        {/* Footer (import) */}
                        <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-100 flex-shrink-0">
                            <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button
                                onClick={handleImport}
                                disabled={!importText.trim()}
                                iconRight={<ChevronRight size={15} />}
                                style={{ background: form.accent }}
                                className="border-0"
                            >
                                Preview import
                            </Button>
                        </div>
                    </>
                ) : (
                <>
                {/* Step indicators */}
                <div className="flex items-center px-8 py-4 border-b border-zinc-100 flex-shrink-0">
                    {STEPS.map((s, i) => {
                        const done   = step > i + 1;
                        const active = step === i + 1;
                        return (
                            <div key={s} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                                <button
                                    onClick={() => done && setStep(i + 1)}
                                    className={`flex items-center gap-2 ${done ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-primary transition-all duration-200 border-2"
                                        style={{
                                            background:  done ? form.accent : active ? form.accent + '22' : '#F4F4F5',
                                            color:       done ? '#fff'       : active ? form.accent       : '#A1A1AA',
                                            borderColor: active ? form.accent : 'transparent',
                                        }}
                                    >
                                        {done ? '✓' : i + 1}
                                    </div>
                                    <span
                                        className="text-sm font-primary"
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

                    {/* Step 1 — Basics */}
                    {step === 1 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="text-xs font-semibold text-zinc-600 font-primary mb-1.5 block">
                                    Project name <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    ref={titleRef}
                                    value={form.title}
                                    onChange={e => { set('title', e.target.value); setErrors(er => ({ ...er, title: undefined })); }}
                                    placeholder="e.g. Website Redesign, Novel Draft…"
                                    error={errors.title}
                                    className="text-base"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-600 font-primary mb-1.5 block">
                                    Description <span className="text-zinc-300 font-normal">optional</span>
                                </label>
                                <Textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="What is this project about?"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-600 font-primary mb-2 block">
                                    Project colour
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {ACCENT_PALETTE.map(pair => (
                                        <button
                                            key={pair.accent}
                                            onClick={() => setForm(f => ({ ...f, accent: pair.accent, color: pair.color }))}
                                            className="w-8 h-8 rounded-full cursor-pointer transition-all duration-150 flex-shrink-0"
                                            style={{
                                                background: pair.accent,
                                                boxShadow:  form.accent === pair.accent ? `0 0 0 3px #fff, 0 0 0 5px ${pair.accent}` : 'none',
                                                transform:  form.accent === pair.accent ? 'scale(1.15)' : 'scale(1)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-600 font-primary mb-1.5 block">
                                    Tags <span className="text-zinc-300 font-normal">optional</span>
                                </label>
                                {tags.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap mb-2">
                                        {tags.map(t => (
                                            <span
                                                key={t}
                                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full font-primary"
                                                style={{ background: form.color, color: form.accent }}
                                            >
                                                {t}
                                                <button onClick={() => setTags(ts => ts.filter(x => x !== t))} className="cursor-pointer opacity-60 hover:opacity-100">
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-1.5">
                                    <Input
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                                        placeholder="Type a tag and press Enter…"
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={addTag}
                                        icon={<Plus size={16} />}
                                        style={{ background: form.accent }}
                                        className="flex-shrink-0 border-0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Details */}
                    {step === 2 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="text-xs font-semibold text-zinc-600 font-primary mb-2 block">Status</label>
                                <div className="flex gap-2 flex-wrap">
                                    {STATUS_OPTIONS.map(s => {
                                        const cfg    = STATUS_CONFIG[s];
                                        const active = form.status === s;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => set('status', s as ProjectStatus)}
                                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-primary cursor-pointer transition-all duration-150"
                                                style={{
                                                    border:     `1.5px solid ${active ? form.accent : '#E4E4E7'}`,
                                                    background: active ? form.color : '#fff',
                                                    color:      active ? form.accent : '#52525B',
                                                    fontWeight: active ? 600 : 400,
                                                }}
                                            >
                                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: cfg.dot }} />
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-600 font-primary mb-1.5 block">
                                    Deadline <span className="text-zinc-300 font-normal">optional</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={form.deadline}
                                        onChange={e => set('deadline', e.target.value)}
                                        className="w-auto min-w-44"
                                    />
                                    {form.deadline && (
                                        <button
                                            onClick={() => set('deadline', '')}
                                            className="text-xs text-zinc-400 hover:text-zinc-600 font-primary transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                            <X size={12} /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-zinc-50 rounded-xl px-4 py-3.5">
                                <p className="text-sm font-semibold text-zinc-700 font-primary m-0 mb-1">
                                    Starting with one section
                                </p>
                                <p className="text-sm text-zinc-400 font-primary m-0 leading-relaxed">
                                    Your project starts with a single &ldquo;Tasks&rdquo; section. Once created, you can add more sections in the full view.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3 — Team */}
                    {step === 3 && (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-zinc-400 font-primary m-0 leading-relaxed">
                                You&apos;re included as owner by default.
                            </p>
                            {user && (
                                <div
                                    className="flex items-center gap-3.5 p-3.5 rounded-xl border"
                                    style={{ borderColor: form.accent + '55', background: form.color }}
                                >
                                    {user.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={user.imageUrl} alt={user.firstName ?? 'You'} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white font-primary text-sm flex-shrink-0"
                                            style={{ background: '#2D7A5F' }}
                                        >
                                            {(user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-zinc-900 font-primary">
                                            {user.fullName ?? user.firstName ?? 'You'}
                                            <span className="text-xs font-normal text-zinc-400 ml-1.5">you</span>
                                        </div>
                                        <div className="text-xs text-zinc-400 font-primary mt-0.5">Owner</div>
                                    </div>
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                                        style={{ borderColor: form.accent, background: form.accent }}
                                    >
                                        <span className="text-white text-xs leading-none">✓</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-100 flex-shrink-0">
                    <Button
                        variant="secondary"
                        onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
                    >
                        {step === 1 ? 'Cancel' : '← Back'}
                    </Button>

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
                            <Button
                                onClick={handleNext}
                                iconRight={<ChevronRight size={15} />}
                                style={{ background: form.accent }}
                                className="border-0"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleCreate}
                                style={{ background: form.accent }}
                                className="border-0"
                            >
                                Create project
                            </Button>
                        )}
                    </div>
                </div>
                </>
                )}
            </div>
        </div>
    );
}
