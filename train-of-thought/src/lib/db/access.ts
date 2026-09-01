import { eq, inArray } from 'drizzle-orm';
import { db } from './index';
import { projects, sections, tasks } from './schema';

// ─── Project access control ───────────────────────────────────────────────────
// A project is accessible to its owner (projects.userId) and to anyone listed in
// projects.members. Owners can do everything; members can do everything except
// delete the project.

export type ProjectRole = 'owner' | 'member';

export interface ProjectAccess {
    role:    ProjectRole;
    ownerId: string;
    members: string[];
}

export async function getProjectAccess(
    projectId: string,
    userId:    string,
): Promise<ProjectAccess | null> {
    const [row] = await db
        .select({ userId: projects.userId, members: projects.members })
        .from(projects)
        .where(eq(projects.id, projectId));

    if (!row) return null;

    const members = row.members ?? [];
    if (row.userId === userId)   return { role: 'owner',  ownerId: row.userId, members };
    if (members.includes(userId)) return { role: 'member', ownerId: row.userId, members };
    return null;
}

export async function getProjectAccessForTask(
    taskId: string,
    userId: string,
): Promise<(ProjectAccess & { projectId: string }) | null> {
    const [row] = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(eq(tasks.id, taskId));

    if (!row) return null;

    const access = await getProjectAccess(row.projectId, userId);
    return access ? { ...access, projectId: row.projectId } : null;
}

export async function getProjectAccessForSection(
    sectionId: string,
    userId:    string,
): Promise<(ProjectAccess & { projectId: string }) | null> {
    const [row] = await db
        .select({ projectId: sections.projectId })
        .from(sections)
        .where(eq(sections.id, sectionId));

    if (!row) return null;

    const access = await getProjectAccess(row.projectId, userId);
    return access ? { ...access, projectId: row.projectId } : null;
}

/**
 * Given a set of task ids, returns true only if `userId` has access to every
 * project those tasks belong to. Used to guard bulk operations like reordering.
 */
export async function hasAccessToAllTaskProjects(
    taskIds: string[],
    userId:  string,
): Promise<boolean> {
    if (taskIds.length === 0) return true;

    const rows = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(inArray(tasks.id, taskIds));

    const projectIds = [...new Set(rows.map(r => r.projectId))];

    const results = await Promise.all(projectIds.map(pid => getProjectAccess(pid, userId)));
    return results.every(Boolean);
}

/**
 * Same as above for section ids.
 */
export async function hasAccessToAllSectionProjects(
    sectionIds: string[],
    userId:     string,
): Promise<boolean> {
    if (sectionIds.length === 0) return true;

    const rows = await db
        .select({ projectId: sections.projectId })
        .from(sections)
        .where(inArray(sections.id, sectionIds));

    const projectIds = [...new Set(rows.map(r => r.projectId))];

    const results = await Promise.all(projectIds.map(pid => getProjectAccess(pid, userId)));
    return results.every(Boolean);
}
