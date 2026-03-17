/**
 * Seed script — populates Neon with sample data for development.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires:
 *   npm install -D tsx
 *   DATABASE_URL set in .env.local
 *
 * Replace USER_ID below with your real Clerk user ID.
 * Find it in the Clerk dashboard → Users, or by logging `user.id` in any
 * protected page temporarily.
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { projects, sections, tasks, notifications } from '../src/lib/db/schema';

// ─── !! Replace this with your real Clerk user ID !! ─────────────────────────
const USER_ID = 'user_3B34zc1CNCTvXstQciZIrCcu5rq';
// ─────────────────────────────────────────────────────────────────────────────

const sql = neon(process.env.DATABASE_URL!);
const db  = drizzle(sql);

function id(prefix: string) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function seed() {
    console.log('🌱 Seeding database…');

    // ── Project 1: Brand Redesign ──

    const p1 = id('p');
    await db.insert(projects).values({
        id:          p1,
        userId:      USER_ID,
        title:       'Brand Redesign',
        description: 'Refresh the visual identity across all touchpoints — logo, typography, colour system and brand guidelines.',
        status:      'In Progress',
        deadline:    new Date('2026-04-15'),
        accent:      '#2D7A5F',
        color:       '#E8F4F0',
        tags:        ['Design', 'Marketing'],
        members:     [USER_ID],
    });

    const s1a = id('s'), s1b = id('s'), s1c = id('s');
    await db.insert(sections).values([
        { id: s1a, projectId: p1, title: 'Discovery',       order: 0 },
        { id: s1b, projectId: p1, title: 'Visual Identity', order: 1 },
        { id: s1c, projectId: p1, title: 'Delivery',        order: 2 },
    ]);

    const t1a = id('t'), t1b = id('t'), t1c = id('t'), t1d = id('t'), t1e = id('t');
    await db.insert(tasks).values([
        {
            id:          t1a,
            sectionId:   s1a,
            projectId:   p1,
            title:       'Competitor audit',
            description: 'Review 10 competitor brands and document findings.',
            done:        true,
            priority:    'Medium',
            due:         new Date('2026-03-10'),
            assignees:   [USER_ID],
            subtasks:    [
                { id: id('st'), label: 'Gather brand examples',  done: true },
                { id: id('st'), label: 'Write comparison matrix', done: true },
            ],
            order: 0,
        },
        {
            id:          t1b,
            sectionId:   s1a,
            projectId:   p1,
            title:       'Stakeholder interviews',
            description: 'Run 30-min interviews with key stakeholders.',
            done:        true,
            priority:    'High',
            due:         new Date('2026-03-14'),
            assignees:   [USER_ID],
            subtasks:    [],
            order:       1,
        },
        {
            id:          t1c,
            sectionId:   s1b,
            projectId:   p1,
            title:       'Colour system',
            description: 'Define primary, secondary and semantic token set.',
            done:        false,
            priority:    'High',
            due:         new Date('2026-03-28'),
            assignees:   [USER_ID],
            subtasks:    [
                { id: id('st'), label: 'Explore palettes',    done: true  },
                { id: id('st'), label: 'Accessibility check', done: false },
            ],
            order: 0,
        },
        {
            id:          t1d,
            sectionId:   s1b,
            projectId:   p1,
            title:       'Typography pairing',
            description: 'Select and license display and body typefaces.',
            done:        false,
            priority:    'Medium',
            due:         new Date('2026-04-02'),
            assignees:   [USER_ID],
            subtasks:    [],
            order:       1,
        },
        {
            id:          t1e,
            sectionId:   s1c,
            projectId:   p1,
            title:       'Brand guidelines doc',
            description: 'Comprehensive PDF covering all brand elements.',
            done:        false,
            priority:    'Medium',
            due:         new Date('2026-04-10'),
            assignees:   [USER_ID],
            subtasks:    [],
            order:       0,
        },
    ]);

    // ── Project 2: Learn Ceramics ──

    const p2 = id('p');
    await db.insert(projects).values({
        id:          p2,
        userId:      USER_ID,
        title:       'Learn Ceramics',
        description: 'Work through beginner wheel-throwing techniques and fire first pieces before summer.',
        status:      'In Progress',
        deadline:    null,
        accent:      '#A0714F',
        color:       '#F5F0EA',
        tags:        ['Personal', 'Creative'],
        members:     [USER_ID],
    });

    const s2a = id('s'), s2b = id('s');
    await db.insert(sections).values([
        { id: s2a, projectId: p2, title: 'Foundations', order: 0 },
        { id: s2b, projectId: p2, title: 'Projects',    order: 1 },
    ]);

    await db.insert(tasks).values([
        {
            id:          id('t'),
            sectionId:   s2a,
            projectId:   p2,
            title:       'Watch intro series',
            description: 'YouTube series by Earth & Fire studio.',
            done:        true,
            priority:    'Low',
            due:         null,
            assignees:   [USER_ID],
            subtasks:    [],
            order:       0,
        },
        {
            id:          id('t'),
            sectionId:   s2a,
            projectId:   p2,
            title:       'First wheel session',
            description: 'Book intro session with instructor.',
            done:        false,
            priority:    'Medium',
            due:         new Date('2026-03-22'),
            assignees:   [USER_ID],
            subtasks:    [
                { id: id('st'), label: 'Call studio',  done: false },
                { id: id('st'), label: 'Bring apron',  done: false },
            ],
            order: 1,
        },
        {
            id:          id('t'),
            sectionId:   s2b,
            projectId:   p2,
            title:       'Throw 5 cylinders',
            description: 'Practice the foundational cylinder form.',
            done:        false,
            priority:    'Low',
            due:         null,
            assignees:   [USER_ID],
            subtasks:    [],
            order:       0,
        },
    ]);

    // ── Notifications ──

    await db.insert(notifications).values([
        {
            id:            id('n'),
            userId:        USER_ID,
            type:          'assigned',
            actorId:       USER_ID,
            projectId:     p1,
            projectTitle:  'Brand Redesign',
            projectAccent: '#2D7A5F',
            subject:       'Colour system',
            text:          'Assigned you to',
            read:          false,
        },
        {
            id:            id('n'),
            userId:        USER_ID,
            type:          'completed',
            actorId:       USER_ID,
            projectId:     p1,
            projectTitle:  'Brand Redesign',
            projectAccent: '#2D7A5F',
            subject:       'Competitor audit',
            text:          'You completed',
            read:          false,
        },
        {
            id:            id('n'),
            userId:        USER_ID,
            type:          'project',
            actorId:       USER_ID,
            projectId:     p2,
            projectTitle:  'Learn Ceramics',
            projectAccent: '#A0714F',
            subject:       'Learn Ceramics',
            text:          'Created project',
            read:          true,
        },
    ]);

    console.log('✅ Seed complete.');
    console.log('   Projects created: Brand Redesign, Learn Ceramics');
    console.log('   Tasks created: 8');
    console.log('   Notifications created: 3');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
