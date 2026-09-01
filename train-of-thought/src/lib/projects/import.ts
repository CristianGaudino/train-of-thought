import type { GeneratedProject } from '@/app/api/generate-project/route';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from './config';

// ─── Text-based project import ────────────────────────────────────────────────
// A deliberately plain outline format that a person can write by hand or ask an
// AI to produce ("create a project outline in this format for <idea>"). Parsed
// into the same shape as an AI-generated project so it flows through the normal
// preview → create path.

type Status   = GeneratedProject['status'];
type Priority = GeneratedProject['sections'][number]['tasks'][number]['priority'];

const DEFAULT_STATUS:   Status   = 'Planning';
const DEFAULT_PRIORITY: Priority = 'Medium';

export const PROJECT_IMPORT_TEMPLATE = `# Project name

One or two sentences describing what this project is and why it matters.

Status: Planning
Tags: tag one, tag two

## First section
- [High] A specific, actionable task
  Optional extra detail about the task, indented under it.
- [Medium] Another task
- A task with no marker (defaults to ${DEFAULT_PRIORITY})

## Second section
- [Critical] Something urgent
- [Low] A nice-to-have
`;

export const PROJECT_IMPORT_GUIDE = `Create a project outline in this exact format:

${PROJECT_IMPORT_TEMPLATE}
Rules:
- The first "# " line is the project name.
- Plain text before the first "## " heading is the description.
- "Status:" (optional) — one of: ${STATUS_OPTIONS.join(', ')}. Defaults to ${DEFAULT_STATUS}.
- "Tags:" (optional) — a comma-separated list.
- Every "## " line starts a new section.
- Every "- " line is a task. Prefix it with [Critical], [High], [Medium] or [Low] to set priority (optional). Defaults to ${DEFAULT_PRIORITY}.
- Indent a line beneath a task to attach notes to it.
`;

export interface ParseResult {
    generated: GeneratedProject | null;
    error:     string | null;
}

const HEADING_RE     = /^(#{1,6})\s+(.*)$/;
const BULLET_RE      = /^(?:[-*+]|\d+[.)])\s+(.*)$/;
const FIELD_RE       = /^([A-Za-z][A-Za-z ]*):\s*(.*)$/;
const CHECKBOX_RE    = /^\[[ xX]?\]\s*/;
const LEAD_PRIO_RE   = /^[[(]\s*(critical|high|medium|low)\s*[\])][\s:.\-–]*/i;
const TRAIL_PRIO_RE  = /[\s\-–—]*[[(]\s*(critical|high|medium|low)\s*[\])]\s*$/i;

function matchStatus(raw: string): Status {
    const found = STATUS_OPTIONS.find(s => s.toLowerCase() === raw.trim().toLowerCase());
    return (found as Status | undefined) ?? DEFAULT_STATUS;
}

function matchPriority(raw: string): Priority {
    const found = PRIORITY_OPTIONS.find(p => p.toLowerCase() === raw.trim().toLowerCase());
    return (found as Priority | undefined) ?? DEFAULT_PRIORITY;
}

function cleanInline(text: string): string {
    return text.replace(/\*\*/g, '').replace(/`/g, '').trim();
}

export function parseProjectOutline(raw: string): ParseResult {
    const lines = raw.replace(/\r\n/g, '\n').split('\n');

    let title  = '';
    let status = DEFAULT_STATUS;
    let sawTitle = false;
    const descriptionParts: string[] = [];
    const tags: string[] = [];

    const sections: GeneratedProject['sections'] = [];
    let currentSection: GeneratedProject['sections'][number] | null = null;
    let currentTask: GeneratedProject['sections'][number]['tasks'][number] | null = null;

    for (const rawLine of lines) {
        const trimmed  = rawLine.trim();
        const indented = /^(\s{2,}|\t)/.test(rawLine);

        // Indented, non-structural text → notes for the task above it
        if (indented && trimmed && currentTask
            && !HEADING_RE.test(trimmed) && !BULLET_RE.test(trimmed)) {
            const note = cleanInline(trimmed.replace(/^>\s?/, ''));
            currentTask.notes = currentTask.notes ? `${currentTask.notes} ${note}` : note;
            continue;
        }

        if (!trimmed) continue;

        const heading = trimmed.match(HEADING_RE);
        if (heading) {
            const text = cleanInline(heading[2]).replace(/:$/, '');
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

        const bullet = trimmed.match(BULLET_RE);
        if (bullet) {
            let body = bullet[1].trim().replace(CHECKBOX_RE, '');

            let priority: Priority = DEFAULT_PRIORITY;
            const lead = body.match(LEAD_PRIO_RE);
            if (lead) {
                priority = matchPriority(lead[1]);
                body = body.slice(lead[0].length);
            } else {
                const trail = body.match(TRAIL_PRIO_RE);
                if (trail) {
                    priority = matchPriority(trail[1]);
                    body = body.slice(0, trail.index).trim();
                }
            }

            body = cleanInline(body);
            if (!body) continue;

            if (!currentSection) {
                currentSection = { title: 'Tasks', tasks: [] };
                sections.push(currentSection);
            }
            currentTask = { title: body, priority };
            currentSection.tasks.push(currentTask);
            continue;
        }

        // Metadata fields + description live above the first section
        if (!currentSection) {
            const field = trimmed.match(FIELD_RE);
            if (field) {
                const key = field[1].trim().toLowerCase();
                const val = field[2].trim();
                if (key === 'status')   { status = matchStatus(val); continue; }
                if (key === 'tags' || key === 'labels') {
                    tags.push(...val.split(',').map(t => cleanInline(t)).filter(Boolean));
                    continue;
                }
                if (key === 'deadline' || key === 'due') continue; // reserved
            }
            if (sawTitle) {
                descriptionParts.push(cleanInline(trimmed.replace(/^>\s?/, '')));
            }
            continue;
        }

        // A loose line inside a section → treat as notes for the current task
        if (currentTask) {
            const note = cleanInline(trimmed);
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
