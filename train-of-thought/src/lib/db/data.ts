import { eq, ne, and, desc, asc } from 'drizzle-orm';
import { db } from './index';
import { projects, sections, tasks, comments, notifications } from './schema';
import type { Project, Section, Task, Comment, Notification, Subtask } from '@/lib/projects/definitions';
import { timeAgo } from '@/lib/utils';

// ─── Shape helpers ────────────────────────────────────────────────────────────
// Convert DB rows → app types used by the UI

export function shapeComment(row: {
    id: string;
    userId: string;
    text: string;
    createdAt: Date;
}): Comment {
    return {
        id:     row.id,
        author: row.userId,
        text:   row.text,
        time:   timeAgo(row.createdAt),
    };
}

export function shapeTask(
    row: typeof tasks.$inferSelect,
    taskComments: (typeof comments.$inferSelect)[],
): Task {
    return {
        id:          row.id,
        title:       row.title,
        description: row.description,
        done:        row.done,
        priority:    row.priority as Task['priority'],
        due:         row.due ? row.due.toISOString().split('T')[0] : null,
        assignees:   row.assignees ?? [],
        subtasks:    (row.subtasks as Subtask[]) ?? [],
        comments:    taskComments.map(shapeComment),
    };
}

export function shapeProject(
    projectRow:  typeof projects.$inferSelect,
    sectionRows: (typeof sections.$inferSelect)[],
    taskRows:    (typeof tasks.$inferSelect)[],
    commentRows: (typeof comments.$inferSelect)[],
): Project {
    const shapedSections: Section[] = sectionRows
        .sort((a, b) => a.order - b.order)
        .map(s => ({
            id:    s.id,
            title: s.title,
            tasks: taskRows
                .filter(t => t.sectionId === s.id)
                .sort((a, b) => a.order - b.order)
                .map(t => shapeTask(t, commentRows.filter(c => c.taskId === t.id))),
        }));

    return {
        id:          projectRow.id,
        title:       projectRow.title,
        description: projectRow.description,
        tags:        projectRow.tags ?? [],
        status:      projectRow.status as Project['status'],
        deadline:    projectRow.deadline ? projectRow.deadline.toISOString().split('T')[0] : null,
        accent:      projectRow.accent,
        color:       projectRow.color,
        members:     projectRow.members ?? [],
        sections:    shapedSections,
    };
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjectsByUser(userId: string): Promise<Project[]> {
    const projectRows = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.createdAt));

    if (projectRows.length === 0) return [];

    const projectIds = projectRows.map(p => p.id);

    // Fetch all related data in parallel
    const [sectionRows, taskRows] = await Promise.all([
        db.select().from(sections).where(
            projectIds.length === 1
                ? eq(sections.projectId, projectIds[0])
                : undefined
        ).orderBy(asc(sections.order)),
        db.select().from(tasks).where(
            projectIds.length === 1
                ? eq(tasks.projectId, projectIds[0])
                : undefined
        ).orderBy(asc(tasks.order)),
    ]);

    // Filter manually for multiple projects (Drizzle doesn't support inArray easily without raw SQL)
    const filteredSections = sectionRows.filter(s => projectIds.includes(s.projectId));
    const filteredTasks    = taskRows.filter(t => projectIds.includes(t.projectId));

    const taskIds = filteredTasks.map(t => t.id);
    const commentRows = taskIds.length > 0
        ? (await db.select().from(comments).orderBy(asc(comments.createdAt)))
            .filter(c => taskIds.includes(c.taskId))
        : [];

    return projectRows.map(p =>
        shapeProject(
            p,
            filteredSections.filter(s => s.projectId === p.id),
            filteredTasks.filter(t => t.projectId === p.id),
            commentRows,
        )
    );
}

export async function getProjectById(id: string, userId: string): Promise<Project | null> {
    const [projectRow] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)));

    if (!projectRow) return null;

    const [sectionRows, taskRows] = await Promise.all([
        db.select().from(sections).where(eq(sections.projectId, id)).orderBy(asc(sections.order)),
        db.select().from(tasks).where(eq(tasks.projectId, id)).orderBy(asc(tasks.order)),
    ]);

    const taskIds     = taskRows.map(t => t.id);
    const commentRows = taskIds.length > 0
        ? (await db.select().from(comments).orderBy(asc(comments.createdAt)))
            .filter(c => taskIds.includes(c.taskId))
        : [];

    return shapeProject(projectRow, sectionRows, taskRows, commentRows);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getActivityByProject(projectId: string): Promise<Notification[]> {
    const rows = await db
        .select()
        .from(notifications)
        .where(eq(notifications.projectId, projectId))
        .orderBy(desc(notifications.createdAt));

    // Deduplicate — multiple recipients can share the same event row
    const seen    = new Set<string>();
    const unique: Notification[] = [];

    for (const n of rows) {
        const key = `${n.actorId}|${n.text}|${n.subject}|${n.createdAt.toISOString().slice(0, 16)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push({
            id:            n.id,
            type:          n.type          as Notification['type'],
            read:          n.read,
            time:          timeAgo(n.createdAt),
            actor:         n.actorId,
            projectId:     n.projectId,
            projectTitle:  n.projectTitle,
            projectAccent: n.projectAccent,
            text:          n.text,
            subject:       n.subject,
        });
    }

    return unique;
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
    const rows = await db
        .select()
        .from(notifications)
        .where(and(eq(notifications.userId, userId), ne(notifications.actorId, userId)))
        .orderBy(desc(notifications.createdAt));

    return rows.map(n => ({
        id:           n.id,
        type:         n.type as Notification['type'],
        read:         n.read,
        time:         n.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        actor:        n.actorId,
        projectId:    n.projectId,
        projectTitle: n.projectTitle,
        projectAccent: n.projectAccent,
        text:         n.text,
        subject:      n.subject,
    }));
}