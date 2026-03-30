import { eq, and } from 'drizzle-orm';
import { db } from './index';
import {
    projects, sections, tasks, comments, notifications,
    type ProjectInsert, type SectionInsert, type TaskInsert, type CommentInsert,
} from './schema';
import type { Project, Task, Comment, Subtask } from '@/lib/projects/definitions';
import { generateId } from '@/lib/projects/utils';
import { shapeComment, shapeProject, shapeTask } from './data';

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function createProject(
    userId: string,
    data: {
        title:       string;
        description: string;
        status:      string;
        deadline:    string | null;
        accent:      string;
        color:       string;
        tags:        string[];
        members:     string[];
    }
): Promise<Project> {
    const projectId   = generateId('p');
    const sectionId   = generateId('s');

    const projectInsert: ProjectInsert = {
        id:          projectId,
        userId,
        title:       data.title,
        description: data.description,
        status:      data.status,
        deadline:    data.deadline ? new Date(data.deadline) : null,
        accent:      data.accent,
        color:       data.color,
        tags:        data.tags,
        members:     data.members,
    };

    const sectionInsert: SectionInsert = {
        id:        sectionId,
        projectId,
        title:     'Tasks',
        order:     0,
    };

    await db.insert(projects).values(projectInsert);
    await db.insert(sections).values(sectionInsert);

    const now = new Date();
    return shapeProject(
        {
            id:          projectInsert.id,
            userId:      projectInsert.userId,
            title:       projectInsert.title,
            description: projectInsert.description ?? '',
            status:      projectInsert.status      ?? 'Planning',
            deadline:    projectInsert.deadline    ?? null,
            accent:      projectInsert.accent,
            color:       projectInsert.color,
            tags:        projectInsert.tags        ?? [],
            members:     projectInsert.members     ?? [],
            order:       0,
            favourite:   false,
            createdAt:   now,
            updatedAt:   now,
        },
        [{
            id:        sectionInsert.id,
            projectId: sectionInsert.projectId,
            title:     sectionInsert.title,
            order:     sectionInsert.order ?? 0,
        }],
        [],
        [],
    );
}

export async function updateProject(
    id:     string,
    userId: string,
    data:   Partial<{
        title:       string;
        description: string;
        status:      string;
        deadline:    string | null;
        accent:      string;
        color:       string;
        tags:        string[];
        members:     string[];
        order:       number;
        favourite:   boolean;
    }>
): Promise<void> {
    await db
        .update(projects)
        .set({
            ...data,
            deadline:  data.deadline !== undefined
                ? (data.deadline ? new Date(data.deadline) : null)
                : undefined,
            updatedAt: new Date(),
        })
        .where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function deleteProject(id: string, userId: string): Promise<void> {
    await db
        .delete(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function reorderProjects(
    userId: string,
    updates: { id: string; order: number }[]
): Promise<void> {
    await Promise.all(
        updates.map(({ id, order }) =>
            db.update(projects)
                .set({ order })
                .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        )
    );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export async function createSection(projectId: string, title: string, order: number): Promise<string> {
    const id = generateId('s');
    await db.insert(sections).values({ id, projectId, title, order });
    return id;
}

export async function renameSection(id: string, title: string): Promise<void> {
    await db.update(sections).set({ title }).where(eq(sections.id, id));
}

export async function deleteSection(id: string): Promise<void> {
    await db.delete(sections).where(eq(sections.id, id));
}

export async function reorderSections(updates: { id: string; order: number }[]): Promise<void> {
    await Promise.all(
        updates.map(({ id, order }) =>
            db.update(sections).set({ order }).where(eq(sections.id, id))
        )
    );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function createTask(
    sectionId: string,
    projectId: string,
    data: {
        title:    string;
        priority: string;
        due:      string | null;
        assignees: string[];
    },
    order: number,
): Promise<Task> {
    const id = generateId('t');
    const insert: TaskInsert = {
        id,
        sectionId,
        projectId,
        title:       data.title,
        description: '',
        priority:    data.priority,
        due:         data.due ? new Date(data.due) : null,
        assignees:   data.assignees,
        subtasks:    [],
        order,
    };
    await db.insert(tasks).values(insert);
    const taskNow = new Date();
    return shapeTask(
        {
            id:          insert.id,
            sectionId:   insert.sectionId,
            projectId:   insert.projectId,
            title:       insert.title,
            description: insert.description ?? '',
            done:        false,
            priority:    insert.priority    ?? 'Medium',
            due:         insert.due         ?? null,
            assignees:   insert.assignees   ?? [],
            subtasks:    insert.subtasks    ?? [],
            order:       insert.order       ?? 0,
            createdAt:   taskNow,
            updatedAt:   taskNow,
        },
        [],
    );
}

export async function updateTask(
    id:   string,
    data: Partial<{
        title:       string;
        description: string;
        done:        boolean;
        priority:    string;
        due:         string | null;
        assignees:   string[];
        subtasks:    Subtask[];
    }>
): Promise<void> {
    await db
        .update(tasks)
        .set({
            ...data,
            due:       data.due !== undefined
                ? (data.due ? new Date(data.due) : null)
                : undefined,
            updatedAt: new Date(),
        })
        .where(eq(tasks.id, id));
}

export async function deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
}

export async function reorderTasks(
    updates: { id: string; sectionId: string; order: number }[]
): Promise<void> {
    await Promise.all(
        updates.map(({ id, sectionId, order }) =>
            db.update(tasks).set({ sectionId, order }).where(eq(tasks.id, id))
        )
    );
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function createComment(
    taskId: string,
    userId: string,
    text:   string,
): Promise<Comment> {
    const id  = generateId('c');
    const now = new Date();
    const insert: CommentInsert = { id, taskId, userId, text };
    await db.insert(comments).values(insert);
    return shapeComment({ id, userId, text, createdAt: now });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function markNotificationRead(id: string, userId: string): Promise<void> {
    await db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
    await db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}

export async function createNotification(data: {
    userId:       string;
    type:         string;
    actorId:      string;
    projectId:    string;
    projectTitle: string;
    projectAccent: string;
    taskId?:       string;
    sectionTitle?: string;
    subject:       string;
    text:          string;
}): Promise<void> {
    await db.insert(notifications).values({
        id: generateId('n'),
        ...data,
    });
}
