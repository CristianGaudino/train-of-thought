import {
    pgTable,
    text,
    boolean,
    timestamp,
    integer,
    jsonb,
} from 'drizzle-orm/pg-core';

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = pgTable('projects', {
    id:          text('id').primaryKey(),
    userId:      text('user_id').notNull(),
    title:       text('title').notNull(),
    description: text('description').notNull().default(''),
    status:      text('status').notNull().default('Planning'),
    deadline:    timestamp('deadline'),
    accent:      text('accent').notNull(),
    color:       text('color').notNull(),
    tags:        text('tags').array().notNull().default([]),
    members:     text('members').array().notNull().default([]),
    order:       integer('order').notNull().default(0),
    favourite:   boolean('favourite').notNull().default(false),
    createdAt:   timestamp('created_at').notNull().defaultNow(),
    updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});

// ─── Sections ─────────────────────────────────────────────────────────────────

export const sections = pgTable('sections', {
    id:        text('id').primaryKey(),
    projectId: text('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    title:     text('title').notNull(),
    order:     integer('order').notNull().default(0),
});

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasks = pgTable('tasks', {
    id:          text('id').primaryKey(),
    sectionId:   text('section_id')
        .notNull()
        .references(() => sections.id, { onDelete: 'cascade' }),
    projectId:   text('project_id').notNull(),
    title:       text('title').notNull(),
    description: text('description').notNull().default(''),
    done:        boolean('done').notNull().default(false),
    deleted:     boolean('deleted').notNull().default(false),
    priority:    text('priority').notNull().default('Medium'),
    due:         timestamp('due'),
    assignees:   text('assignees').array().notNull().default([]),
    // Subtasks stored as JSON — simple enough to not warrant a separate table
    subtasks:    jsonb('subtasks').notNull().default([]),
    order:       integer('order').notNull().default(0),
    createdAt:   timestamp('created_at').notNull().defaultNow(),
    updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});

// ─── Comments ─────────────────────────────────────────────────────────────────

export const comments = pgTable('comments', {
    id:        text('id').primaryKey(),
    taskId:    text('task_id')
        .notNull()
        .references(() => tasks.id, { onDelete: 'cascade' }),
    userId:    text('user_id').notNull(),
    text:      text('text').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
    id:           text('id').primaryKey(),
    userId:       text('user_id').notNull(),
    type:         text('type').notNull(),
    actorId:      text('actor_id').notNull(),
    projectId:    text('project_id').notNull(),
    projectTitle: text('project_title').notNull(),
    projectAccent: text('project_accent').notNull(),
    taskId:        text('task_id'),
    sectionTitle:  text('section_title'),
    subject:       text('subject').notNull(),
    text:         text('text').notNull(),
    read:         boolean('read').notNull().default(false),
    createdAt:    timestamp('created_at').notNull().defaultNow(),
});

// ─── Exported types ───────────────────────────────────────────────────────────

export type ProjectRow      = typeof projects.$inferSelect;
export type ProjectInsert   = typeof projects.$inferInsert;
export type SectionRow      = typeof sections.$inferSelect;
export type SectionInsert   = typeof sections.$inferInsert;
export type TaskRow         = typeof tasks.$inferSelect;
export type TaskInsert      = typeof tasks.$inferInsert;
export type CommentRow      = typeof comments.$inferSelect;
export type CommentInsert   = typeof comments.$inferInsert;
export type NotificationRow = typeof notifications.$inferSelect;
