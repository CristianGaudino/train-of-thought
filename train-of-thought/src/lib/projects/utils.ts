import type { Project, FlatTask, Member, TaskGroup, PreviewSection, Priority, ProjectStatus, DeadlineInfo, Notification, ProjectImportResult } from './definitions';
import {
    MOCK_MEMBERS, ME_ID, ACTION_VERB,
    STATUS_OPTIONS, PRIORITY_OPTIONS, DEFAULT_PROJECT_STATUS, DEFAULT_TASK_PRIORITY,
} from './config';
import { formatDate } from '../utils';
import { GeneratedProject } from '@/app/api/generate-project/route';

export function getDeadlineInfo(str: string | null): DeadlineInfo | null {
    if (!str) return null;
    const diff = Math.ceil((new Date(str).getTime() - Date.now()) / 86400000);
    const label = formatDate(str)!;
    if (diff < 0)  return { label: `${label} · Overdue`, urgent: true,  diff };
    if (diff <= 7) return { label: `${label} · ${diff}d`, urgent: true,  diff };
    return { label, urgent: false, diff };
}

export function countTasks(project: Project): { total: number; done: number } {
    const all = project.sections.flatMap(s => s.tasks);
    return {
        total: all.length,
        done: all.filter(t => t.done).length,
    };
}

export function getFlatMyTasks(projects: Project[], userId = ME_ID): FlatTask[] {
    const out: FlatTask[] = [];
    for (const p of projects) {
        for (const s of p.sections) {
            for (const t of s.tasks) {
                if (t.assignees.includes(userId) && !t.done) {
                    out.push({
                        ...t,
                        projectId:    p.id,
                        projectTitle: p.title,
                        projectAccent: p.accent,
                        projectColor:  p.color,
                        sectionTitle:  s.title,
                    });
                }
            }
        }
    }
    return out;
}

export function groupTasksByTime(tasks: FlatTask[]): TaskGroup[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const overdue:  FlatTask[] = [];
    const todayArr: FlatTask[] = [];
    const thisWeek: FlatTask[] = [];
    const later:    FlatTask[] = [];
    const noDue:    FlatTask[] = [];

    for (const t of tasks) {
        if (!t.due) { noDue.push(t); continue; }
        const d = new Date(t.due);
        d.setHours(0, 0, 0, 0);
        const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
        if (diff < 0)        overdue.push(t);
        else if (diff === 0) todayArr.push(t);
        else if (d <= weekEnd) thisWeek.push(t);
        else                 later.push(t);
    }

    const groups: TaskGroup[] = [];
    if (overdue.length)  groups.push({ id: 'overdue',  label: 'Overdue',     accent: '#D44444', tasks: overdue  });
    if (todayArr.length) groups.push({ id: 'today',    label: 'Today',       accent: '#E07800', tasks: todayArr });
    if (thisWeek.length) groups.push({ id: 'thisweek', label: 'This Week',   accent: '#3A7FD5', tasks: thisWeek });
    if (later.length)    groups.push({ id: 'later',    label: 'Later',       accent: '#888888', tasks: later    });
    if (noDue.length)    groups.push({ id: 'nodue',    label: 'No Due Date', accent: '#AAAAAA', tasks: noDue    });
    return groups;
}

export function groupTasksByProject(tasks: FlatTask[]): TaskGroup[] {
    const map = new Map<string, TaskGroup>();
    for (const t of tasks) {
        if (!map.has(t.projectId)) {
            map.set(t.projectId, {
                id:     'p' + t.projectId,
                label:  t.projectTitle,
                accent: t.projectAccent,
                tasks:  [],
            });
        }
        map.get(t.projectId)!.tasks.push(t);
    }
    return Array.from(map.values());
}

export function groupTasksByPriority(tasks: FlatTask[]): TaskGroup[] {
    const order = ['Critical', 'High', 'Medium', 'Low'];
    const PRIORITY_ACCENTS: Record<string, string> = {
        Critical: '#D44444',
        High:     '#E07800',
        Medium:   '#3A7FD5',
        Low:      '#888888',
    };
    const map = new Map<string, TaskGroup>();
    for (const t of tasks) {
        if (!map.has(t.priority)) {
            map.set(t.priority, {
                id:     'pri' + t.priority,
                label:  t.priority,
                accent: PRIORITY_ACCENTS[t.priority] ?? '#888888',
                tasks:  [],
            });
        }
        map.get(t.priority)!.tasks.push(t);
    }
    return order.filter(p => map.has(p)).map(p => map.get(p)!);
}

// ─── Member helpers ───────────────────────────────────────────────────────────

export function getMember(id: string, members: Member[] = MOCK_MEMBERS): Member | undefined {
    return members.find(m => m.id === id);
}

export function getMemberName(id: string, members: Member[] = MOCK_MEMBERS): string {
    return getMember(id, members)?.name ?? 'Unknown';
}

// ─── ID generation ────────────────────────────────────────────────────────────
// Simple client-side ID for mock data. Replace with cuid2 or DB-generated IDs
// once the backend is wired up.

export function generateId(prefix = ''): string {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function toPreviewSections(generated: GeneratedProject): PreviewSection[] {
    return generated.sections.map(s => ({
        id:    generateId('s'),
        title: s.title,
        tasks: s.tasks.map(t => ({
            id:       generateId('t'),
            title:    t.title,
            priority: t.priority as Priority,
            notes:    t.notes,
            subtasks: (t.subtasks ?? []).map(st => ({
                id:    generateId('st'),
                label: st.label,
                done:  st.done,
            })),
        })),
    }));
}

export function activityText(text: string): string {
    return ACTION_VERB[text] ?? text.toLowerCase();
}

export function groupByDate(items: Notification[]): { label: string; items: Notification[] }[] {
    const groups = new Map<string, Notification[]>();
    for (const item of items) {
        const label = (item.time === 'just now' || item.time.includes('ago'))
            ? 'Today'
            : item.time === 'yesterday' ? 'Yesterday' : item.time;
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(item);
    }
    return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

// ─── Project import ───────────────────────────────────────────────────────────
// Parse a text outline (see PROJECT_IMPORT_TEMPLATE) into the same shape as an
// AI-generated project so it flows through the normal preview → create path.

const IMPORT_HEADING_RE       = /^(#{1,6})\s+(.*)$/;
const IMPORT_BULLET_RE        = /^(?:[-*+]|\d+[.)])\s+(.*)$/;
const IMPORT_FIELD_RE         = /^([A-Za-z][A-Za-z ]*):\s*(.*)$/;
const IMPORT_CHECKBOX_RE      = /^\[[ xX]?\]\s*/;
const IMPORT_CHECKBOX_DONE_RE = /^\[[xX]\]/;
const IMPORT_LEAD_PRIO_RE     = /^[[(]\s*(critical|high|medium|low)\s*[\])][\s:.\-–]*/i;
const IMPORT_TRAIL_PRIO_RE    = /[\s\-–—]*[[(]\s*(critical|high|medium|low)\s*[\])]\s*$/i;

function matchImportStatus(raw: string): ProjectStatus {
    const found = STATUS_OPTIONS.find(s => s.toLowerCase() === raw.trim().toLowerCase());
    return (found as ProjectStatus | undefined) ?? DEFAULT_PROJECT_STATUS;
}

function matchImportPriority(raw: string): Priority {
    const found = PRIORITY_OPTIONS.find(p => p.toLowerCase() === raw.trim().toLowerCase());
    return (found as Priority | undefined) ?? DEFAULT_TASK_PRIORITY;
}

// Strip markdown emphasis / code ticks an AI might add around plain text.
function stripInlineMarkdown(text: string): string {
    return text.replace(/\*\*/g, '').replace(/`/g, '').trim();
}

export function parseProjectOutline(raw: string): ProjectImportResult {
    const lines = raw.replace(/\r\n/g, '\n').split('\n');

    let title    = '';
    let status: ProjectStatus = DEFAULT_PROJECT_STATUS;
    let sawTitle = false;
    const descriptionParts: string[] = [];
    const tags: string[] = [];

    const sections: GeneratedProject['sections'] = [];
    let currentSection: GeneratedProject['sections'][number] | null = null;
    let currentTask: GeneratedProject['sections'][number]['tasks'][number] | null = null;

    for (const rawLine of lines) {
        const trimmed  = rawLine.trim();
        const indented = /^(\s{2,}|\t)/.test(rawLine);

        if (!trimmed) continue;

        const bullet = trimmed.match(IMPORT_BULLET_RE);

        // Indented bullet under a task → subtask (supports "- [ ]" / "- [x]")
        if (indented && currentTask && bullet) {
            let label = bullet[1].trim();
            const done = IMPORT_CHECKBOX_DONE_RE.test(label);
            label = stripInlineMarkdown(label.replace(IMPORT_CHECKBOX_RE, ''));
            if (label) currentTask.subtasks.push({ label, done });
            continue;
        }

        // Indented, non-bullet text → notes for the task above it
        if (indented && currentTask && !IMPORT_HEADING_RE.test(trimmed)) {
            const note = stripInlineMarkdown(trimmed.replace(/^>\s?/, ''));
            currentTask.notes = currentTask.notes ? `${currentTask.notes} ${note}` : note;
            continue;
        }

        const heading = trimmed.match(IMPORT_HEADING_RE);
        if (heading) {
            const text = stripInlineMarkdown(heading[2]).replace(/:$/, '');
            if (!sawTitle) {
                title = text;
                sawTitle = true;
            } else {
                currentSection = { title: text || 'Section', tasks: [] };
                sections.push(currentSection);
                currentTask = null;
            }
            continue;
        }

        if (bullet) {
            let body = bullet[1].trim().replace(IMPORT_CHECKBOX_RE, '');

            let priority: Priority = DEFAULT_TASK_PRIORITY;
            const lead = body.match(IMPORT_LEAD_PRIO_RE);
            if (lead) {
                priority = matchImportPriority(lead[1]);
                body = body.slice(lead[0].length);
            } else {
                const trail = body.match(IMPORT_TRAIL_PRIO_RE);
                if (trail) {
                    priority = matchImportPriority(trail[1]);
                    body = body.slice(0, trail.index).trim();
                }
            }

            body = stripInlineMarkdown(body);
            if (!body) continue;

            if (!currentSection) {
                currentSection = { title: 'Tasks', tasks: [] };
                sections.push(currentSection);
            }
            currentTask = { title: body, priority, subtasks: [] };
            currentSection.tasks.push(currentTask);
            continue;
        }

        // Metadata fields + description live above the first section
        if (!currentSection) {
            const field = trimmed.match(IMPORT_FIELD_RE);
            if (field) {
                const key = field[1].trim().toLowerCase();
                const val = field[2].trim();
                if (key === 'status') { status = matchImportStatus(val); continue; }
                if (key === 'tags' || key === 'labels') {
                    tags.push(...val.split(',').map(stripInlineMarkdown).filter(Boolean));
                    continue;
                }
                if (key === 'deadline' || key === 'due') continue; // reserved
            }
            if (sawTitle) {
                descriptionParts.push(stripInlineMarkdown(trimmed.replace(/^>\s?/, '')));
            }
            continue;
        }

        // A loose line inside a section → treat as notes for the current task
        if (currentTask) {
            const note = stripInlineMarkdown(trimmed);
            currentTask.notes = currentTask.notes ? `${currentTask.notes} ${note}` : note;
        }
    }

    if (!title) {
        return { generated: null, error: 'Start the outline with the project name on a "# " line.' };
    }

    const cleanedSections = sections.filter(s => s.tasks.length > 0);
    if (cleanedSections.length === 0) {
        return {
            generated: null,
            error: 'Add at least one task — use "## Section name" followed by "- Task" lines.',
        };
    }

    return {
        generated: {
            title,
            description: descriptionParts.join(' ').replace(/\s+/g, ' ').trim(),
            status,
            tags,
            sections: cleanedSections,
        },
        error: null,
    };
}