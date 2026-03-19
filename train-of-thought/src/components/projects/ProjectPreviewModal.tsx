'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { X, Plus, Trash2, Sparkles, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { ACCENT_PALETTE, PRIORITY_CONFIG } from '@/lib/projects/config';
import { generateId, toPreviewSections } from '@/lib/projects/utils';
import { useToast } from '@/components/ui/Toast';
import type { PreviewSection, PreviewTask, Priority, ProjectPreviewModalProps } from '@/lib/projects/definitions';

export default function ProjectPreviewModal({
    generated,
    onClose,
    onCreated,
}: ProjectPreviewModalProps) {
    const router = useRouter();
    const { userId } = useAuth();
    const { success, error: toastError } = useToast();
    const [showSignInPrompt, setShowSignInPrompt] = useState(false);

    // Editable project fields
    const [title, setTitle]             = useState(generated.title);
    const [description, setDescription] = useState(generated.description);
    const [accent, setAccent]           = useState(ACCENT_PALETTE[0].accent);
    const [color, setColor]             = useState(ACCENT_PALETTE[0].color);
    const [tags, setTags]               = useState<string[]>(generated.tags ?? []);
    const [sections, setSections]       = useState<PreviewSection[]>(toPreviewSections(generated));
    const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({});
    const [creating, setCreating]       = useState(false);
    const [newTagInput, setNewTagInput] = useState('');

    const toggleCollapse = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

    // ── Section mutations ──

    const updateSectionTitle = (id: string, val: string) => {
        setSections(ss => ss.map(s => s.id === id ? { ...s, title: val } : s));
    };

    const removeSection = (id: string) => {
        setSections(ss => ss.filter(s => s.id !== id));
    };

    const addSection = () => {
        setSections(ss => [...ss, { id: generateId('s'), title: 'New section', tasks: [] }]);
    };

    // ── Task mutations ──

    const updateTask = (secId: string, taskId: string, val: Partial<PreviewTask>) => {
        setSections(ss => ss.map(s => s.id === secId ? {
            ...s,
            tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...val } : t),
        } : s));
    };

    const removeTask = (secId: string, taskId: string) => {
        setSections(ss => ss.map(s => s.id === secId ? {
            ...s,
            tasks: s.tasks.filter(t => t.id !== taskId),
        } : s));
    };

    const addTask = (secId: string) => {
        setSections(ss => ss.map(s => s.id === secId ? {
            ...s,
            tasks: [...s.tasks, { id: generateId('t'), title: 'New task', priority: 'Medium' as Priority }],
        } : s));
    };

    // ── Tags ──

    const addTag = () => {
        const t = newTagInput.trim();
        if (t && !tags.includes(t)) setTags(ts => [...ts, t]);
        setNewTagInput('');
    };

    // ── Create project ──

    const handleCreate = async () => {
        if (!title.trim() || sections.length === 0) return;
        // If not signed in, prompt to sign in before creating
        if (!userId) { setShowSignInPrompt(true); return; }
        setCreating(true);

        try {
            // Create the project shell
            const projectRes = await fetch('/api/projects', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    title:       title.trim(),
                    description: description.trim(),
                    status:      generated.status ?? 'Planning',
                    accent,
                    color,
                    tags,
                    members:     [],
                    deadline:    null,
                }),
            });
            if (!projectRes.ok) throw new Error('Failed to create project');
            const project = await projectRes.json();

            // Create sections + tasks in parallel batches
            for (let i = 0; i < sections.length; i++) {
                const sec = sections[i];

                // Create section
                const secRes = await fetch('/api/sections', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        projectId: project.id,
                        title:     sec.title,
                        order:     i,
                    }),
                });
                if (!secRes.ok) continue;
                const { id: sectionId } = await secRes.json();

                // Create tasks
                await Promise.all(sec.tasks.map((task, j) =>
                    fetch('/api/tasks', {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify({
                            sectionId,
                            projectId: project.id,
                            title:     task.title,
                            priority:  task.priority,
                            assignees: [],
                            order:     j,
                        }),
                    })
                ));
            }

            success('Project created', title.trim());
            onCreated?.(project.id);
            onClose();
            router.push(`/projects/${project.id}`);

        } catch {
            toastError('Failed to create project', 'Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const totalTasks = sections.reduce((sum, s) => sum + s.tasks.length, 0);

    const inputCls = `
        w-full px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-[13px]
        font-primary text-zinc-800 outline-none focus:border-zinc-400 transition-colors
    `;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
            <div
                className="relative w-full bg-white rounded-2xl shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{ maxWidth: 860, maxHeight: '90vh' }}
            >

                {/* ── Left: project meta ── */}
                <div className="w-72 flex-shrink-0 flex flex-col border-r border-zinc-100">

                    {/* Header */}
                    <div
                        className="px-6 py-5 flex-shrink-0 border-b border-black/7"
                        style={{ background: color }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} style={{ color: accent }} />
                            <span
                                className="text-[11px] font-semibold uppercase tracking-widest font-primary"
                                style={{ color: accent }}
                            >
                                AI Generated
                            </span>
                        </div>
                        <p className="text-[12px] text-zinc-500 font-primary leading-relaxed">
                            Review and edit before creating. All fields are editable.
                        </p>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                        {/* Title */}
                        <div>
                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary block mb-1.5">
                                Project name
                            </label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className={inputCls}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary block mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className={inputCls + ' resize-none leading-relaxed'}
                            />
                        </div>

                        {/* Colour */}
                        <div>
                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary block mb-2">
                                Colour
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {ACCENT_PALETTE.map(pair => (
                                    <button
                                        key={pair.accent}
                                        onClick={() => { setAccent(pair.accent); setColor(pair.color); }}
                                        className="w-7 h-7 rounded-full cursor-pointer transition-all duration-150 flex-shrink-0"
                                        style={{
                                            background: pair.accent,
                                            boxShadow:  accent === pair.accent
                                                ? `0 0 0 2px #fff, 0 0 0 4px ${pair.accent}`
                                                : 'none',
                                            transform:  accent === pair.accent ? 'scale(1.15)' : 'scale(1)',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest font-primary block mb-1.5">
                                Tags
                            </label>
                            <div className="flex gap-1.5 flex-wrap mb-2">
                                {tags.map(t => (
                                    <span
                                        key={t}
                                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full font-primary cursor-pointer"
                                        style={{ background: color, color: accent }}
                                        onClick={() => setTags(ts => ts.filter(x => x !== t))}
                                    >
                                        {t}
                                        <X size={9} />
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-1.5">
                                <input
                                    value={newTagInput}
                                    onChange={e => setNewTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                                    placeholder="Add tag…"
                                    className={inputCls + ' flex-1'}
                                />
                                <button
                                    onClick={addTag}
                                    className="px-3 py-2 rounded-lg text-white text-sm cursor-pointer hover:opacity-85 transition-opacity"
                                    style={{ background: accent }}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="pt-3 border-t border-zinc-100">
                            <div className="flex items-center justify-between text-[12px] font-primary text-zinc-400">
                                <span>{sections.length} sections</span>
                                <span>{totalTasks} tasks</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sign-in prompt overlay */}
            {showSignInPrompt && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
                    <div className="flex flex-col items-center text-center px-8 max-w-xs">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-2xl mb-4">
                            ✦
                        </div>
                        <h3 className="text-[17px] font-secondary text-zinc-900 tracking-tight mb-2">
                            Sign in to save your project
                        </h3>
                        <p className="text-[13px] text-zinc-400 font-primary leading-relaxed mb-6">
                            Create a free account to save this project and access it from anywhere.
                        </p>
                        <div className="flex flex-col gap-2 w-full">
                            <a
                                href={`/sign-up?redirect_url=${encodeURIComponent('/projects')}`}
                                className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold font-primary hover:bg-zinc-700 transition-colors text-center"
                            >
                                Create free account
                            </a>
                            <a
                                href={`/sign-in?redirect_url=${encodeURIComponent('/projects')}`}
                                className="w-full py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-[13px] font-medium font-primary hover:bg-zinc-50 transition-colors text-center"
                            >
                                Sign in
                            </a>
                            <button
                                onClick={() => setShowSignInPrompt(false)}
                                className="text-[12px] text-zinc-400 hover:text-zinc-600 font-primary transition-colors cursor-pointer mt-1"
                            >
                                ← Back to preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Right: sections + tasks ── */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
                        <div>
                            <h2 className="text-[17px] font-secondary text-zinc-900 tracking-tight">
                                {title || 'Untitled project'}
                            </h2>
                            <p className="text-[12px] text-zinc-400 font-primary mt-0.5">
                                Review tasks and sections — click to edit
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Sections */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                        {sections.map(section => {
                            const isC = collapsed[section.id];
                            return (
                                <div key={section.id}>
                                    {/* Section heading */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => toggleCollapse(section.id)}
                                            className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer flex-shrink-0"
                                        >
                                            {isC ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        <input
                                            value={section.title}
                                            onChange={e => updateSectionTitle(section.id, e.target.value)}
                                            className="flex-1 text-[13px] font-bold font-primary text-zinc-900 bg-transparent outline-none border-b border-transparent focus:border-zinc-300 transition-colors py-0.5"
                                        />
                                        <span className="text-[11px] text-zinc-300 font-primary flex-shrink-0">
                                            {section.tasks.length} tasks
                                        </span>
                                        <button
                                            onClick={() => removeSection(section.id)}
                                            className="text-zinc-200 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>

                                    {/* Tasks */}
                                    {!isC && (
                                        <div className="flex flex-col gap-1.5 pl-5">
                                            {section.tasks.map(task => {
                                                const pr = PRIORITY_CONFIG[task.priority];
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-100 group hover:border-zinc-200 transition-colors"
                                                    >
                                                        {/* Priority dot */}
                                                        <div className="flex-shrink-0 relative group/priority">
                                                            <div
                                                                className="w-2.5 h-2.5 rounded-full cursor-pointer"
                                                                style={{ background: pr?.color ?? '#888' }}
                                                                title={task.priority}
                                                            />
                                                            {/* Priority dropdown on click */}
                                                            <select
                                                                value={task.priority}
                                                                onChange={e => updateTask(section.id, task.id, { priority: e.target.value as Priority })}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                                                title="Change priority"
                                                            >
                                                                {(['Critical', 'High', 'Medium', 'Low'] as Priority[]).map(p => (
                                                                    <option key={p} value={p}>{p}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Task title */}
                                                        <input
                                                            value={task.title}
                                                            onChange={e => updateTask(section.id, task.id, { title: e.target.value })}
                                                            className="flex-1 text-[13px] font-primary text-zinc-800 bg-transparent outline-none"
                                                        />

                                                        {/* Priority label */}
                                                        <span
                                                            className="text-[10px] font-medium font-primary flex-shrink-0 px-2 py-0.5 rounded-full"
                                                            style={{ color: pr?.color, background: pr?.bg }}
                                                        >
                                                            {task.priority}
                                                        </span>

                                                        {/* Remove */}
                                                        <button
                                                            onClick={() => removeTask(section.id, task.id)}
                                                            className="text-zinc-200 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </div>
                                                );
                                            })}

                                            {/* Add task */}
                                            <button
                                                onClick={() => addTask(section.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-300 font-primary w-fit rounded-lg border border-dashed border-zinc-200 hover:text-zinc-500 hover:border-zinc-300 transition-all cursor-pointer"
                                            >
                                                <Plus size={11} />
                                                Add task
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add section */}
                        <button
                            onClick={addSection}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-[12px] text-zinc-300 font-primary w-fit transition-all cursor-pointer hover:border-zinc-400 hover:text-zinc-500"
                        >
                            <Plus size={13} />
                            Add section
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between flex-shrink-0">
                        <p className="text-[12px] text-zinc-400 font-primary">
                            {totalTasks} tasks across {sections.length} sections
                        </p>
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-[13px] font-primary cursor-pointer hover:bg-zinc-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !title.trim() || sections.length === 0}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-[13px] font-semibold font-primary cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: accent }}
                            >
                                {creating ? (
                                    <>Creating…</>
                                ) : (
                                    <>
                                        <Check size={14} />
                                        Create project
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
