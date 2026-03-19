import type { Project, FlatTask, Member, TaskGroup, PreviewSection, Priority } from './definitions';
import { MOCK_MEMBERS, ME_ID } from './config';
import { formatDate } from '../utils';
import { GeneratedProject } from '@/app/api/generate-project/route';

export interface DeadlineInfo {
    label: string;
    urgent: boolean;
    diff: number;
}

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
        })),
    }));
}