import type {
    StatusConfig,
    PriorityConfig,
    NotificationConfig,
    AccentPair,
    Member,
    Project,
    Notification,
} from './definitions';

// ─── Config maps ──────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<string, StatusConfig> = {
    'Not Started': { dot: '#C4C4C4', bg: '#F2F2F2',  text: '#888888' },
    'Planning':    { dot: '#F0A500', bg: '#FFF8E6',  text: '#A07000' },
    'In Progress': { dot: '#3A7FD5', bg: '#EDF3FC',  text: '#2A5FA0' },
    'Review':      { dot: '#9B59B6', bg: '#F5EEF8',  text: '#7D3C98' },
    'Done':        { dot: '#27AE60', bg: '#EAFAF1',  text: '#1E8449' },
};

export const PRIORITY_CONFIG: Record<string, PriorityConfig> = {
    Critical: { color: '#D44444', bg: '#FEF0F0' },
    High:     { color: '#E07800', bg: '#FFF5E6' },
    Medium:   { color: '#3A7FD5', bg: '#EDF3FC' },
    Low:      { color: '#888888', bg: '#F2F2F2' },
};

export const NOTIFICATION_CONFIG: Record<string, NotificationConfig> = {
    assigned:  { icon: '◈', color: '#3A5FA0', bg: '#EDF3FC', label: 'Assignment' },
    comment:   { icon: '◎', color: '#8A4FA0', bg: '#F5EEF5', label: 'Comment'    },
    completed: { icon: '✓', color: '#2D7A5F', bg: '#E8F4F0', label: 'Completed'  },
    project:   { icon: '⬡', color: '#A0714F', bg: '#F5F0EA', label: 'Project'    },
};

// Maps action codes (stored in the `text` DB column) to human-readable verb phrases.
// Format: "{actor} {verb} {subject}"
export const ACTION_VERB: Record<string, string> = {
    ASSIGNED:                 'assigned you to',
    COMMENTED:                'commented on',
    COMPLETED:                'completed',
    PRIORITY_CHANGED:         'changed priority on',
    DUE_DATE_CHANGED:         'updated due date on',
    TASK_DELETED:             'deleted',
    TASK_CREATED:             'created',
    SECTION_CREATED:          'created section',
    SECTION_DELETED:          'deleted section',
    MEMBER_ADDED:             'added you to',
    PROJECT_RENAMED:          'renamed',
    PROJECT_STATUS_CHANGED:   'changed status on',
    PROJECT_DEADLINE_CHANGED: 'updated deadline on',
};

export const ACCENT_PALETTE: AccentPair[] = [
    { accent: '#2D7A5F', color: '#E8F4F0' },
    { accent: '#3A5FA0', color: '#EEF2F8' },
    { accent: '#A0714F', color: '#F5F0EA' },
    { accent: '#8A4FA0', color: '#F5EEF5' },
    { accent: '#C0392B', color: '#FDECEA' },
    { accent: '#D4880A', color: '#FDF5E6' },
    { accent: '#1A7A8A', color: '#E6F5F7' },
    { accent: '#4A6741', color: '#ECF4EB' },
    { accent: '#5C4A8A', color: '#EFECF8' },
    { accent: '#8A4A5C', color: '#F8ECEF' },
];

export const STATUS_OPTIONS = Object.keys(STATUS_CONFIG) as string[];

export const PRIORITY_OPTIONS = Object.keys(PRIORITY_CONFIG) as string[];

// ─── Mock members ─────────────────────────────────────────────────────────────
// In production these will be real Clerk users fetched from your DB.
// Member id "1" is treated as the current user (ME) in mock data.

export const ME_ID = '1';

export const MOCK_MEMBERS: Member[] = [
    { id: '1', name: 'Alex Reed',  initials: 'AR', color: '#2D7A5F' },
    { id: '2', name: 'Jordan Kim', initials: 'JK', color: '#3A5FA0' },
    { id: '3', name: 'Sam Torres', initials: 'ST', color: '#A0714F' },
    { id: '4', name: 'Morgan Lee', initials: 'ML', color: '#8A4FA0' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with API calls once DB is wired up.

export const MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        title: 'Brand Redesign',
        description: 'Refresh the visual identity across all touchpoints — logo, typography, colour system and brand guidelines.',
        tags: ['Design', 'Marketing'],
        status: 'In Progress',
        deadline: '2026-04-15',
        color: '#E8F4F0',
        accent: '#2D7A5F',
        members: ['1', '2'],
        sections: [
            {
                id: 's1',
                title: 'Discovery',
                tasks: [
                    {
                        id: 't1',
                        title: 'Competitor audit',
                        description: 'Review 10 competitor brands and document findings.',
                        done: true,
                        priority: 'Medium',
                        due: '2026-03-10',
                        assignees: ['1'],
                        subtasks: [
                            { id: 'st1', label: 'Gather brand examples', done: true },
                            { id: 'st2', label: 'Write comparison matrix', done: true },
                        ],
                        comments: [
                            { id: 'c1', author: '1', text: 'Done — doc is in Drive.', time: '2d ago' },
                        ],
                    },
                    {
                        id: 't2',
                        title: 'Stakeholder interviews',
                        description: 'Run 30-min interviews with key stakeholders.',
                        done: true,
                        priority: 'High',
                        due: '2026-03-14',
                        assignees: ['1', '2'],
                        subtasks: [
                            { id: 'st3', label: 'Write interview guide', done: true },
                            { id: 'st4', label: 'Schedule sessions', done: true },
                        ],
                        comments: [],
                    },
                ],
            },
            {
                id: 's2',
                title: 'Visual Identity',
                tasks: [
                    {
                        id: 't3',
                        title: 'Logo concepts (round 1)',
                        description: 'Three distinct logo directions for review.',
                        done: true,
                        priority: 'High',
                        due: '2026-03-20',
                        assignees: ['2'],
                        subtasks: [
                            { id: 'st5', label: 'Sketch directions', done: true },
                            { id: 'st6', label: 'Digitise top 3', done: true },
                        ],
                        comments: [
                            { id: 'c2', author: '2', text: 'Shared in Figma.', time: '1d ago' },
                        ],
                    },
                    {
                        id: 't4',
                        title: 'Colour system',
                        description: 'Define primary, secondary and semantic token set.',
                        done: false,
                        priority: 'High',
                        due: '2026-03-28',
                        assignees: ['1'],
                        subtasks: [
                            { id: 'st7', label: 'Explore palettes', done: true },
                            { id: 'st8', label: 'Accessibility check', done: false },
                        ],
                        comments: [],
                    },
                    {
                        id: 't5',
                        title: 'Typography pairing',
                        description: 'Select and license display and body typefaces.',
                        done: false,
                        priority: 'Medium',
                        due: '2026-04-02',
                        assignees: ['1', '2'],
                        subtasks: [
                            { id: 'st9', label: 'Shortlist fonts', done: false },
                        ],
                        comments: [],
                    },
                ],
            },
            {
                id: 's3',
                title: 'Delivery',
                tasks: [
                    {
                        id: 't6',
                        title: 'Brand guidelines doc',
                        description: 'Comprehensive PDF covering all brand elements.',
                        done: false,
                        priority: 'Medium',
                        due: '2026-04-10',
                        assignees: ['1'],
                        subtasks: [],
                        comments: [],
                    },
                    {
                        id: 't7',
                        title: 'Asset export package',
                        description: 'SVG/PNG/PDF exports for all logo variants.',
                        done: false,
                        priority: 'Low',
                        due: '2026-04-15',
                        assignees: ['2'],
                        subtasks: [],
                        comments: [],
                    },
                ],
            },
        ],
        order:       0,
        favourite:   true,
    },
    {
        id: '2',
        title: 'Learn Ceramics',
        description: 'Work through beginner wheel-throwing techniques and fire first pieces before summer.',
        tags: ['Personal', 'Creative'],
        status: 'In Progress',
        deadline: null,
        color: '#F5F0EA',
        accent: '#A0714F',
        members: ['1'],
        sections: [
            {
                id: 's1',
                title: 'Foundations',
                tasks: [
                    {
                        id: 't1',
                        title: 'Watch intro series',
                        description: 'YouTube series by Earth & Fire studio.',
                        done: true,
                        priority: 'Low',
                        due: null,
                        assignees: ['1'],
                        subtasks: [],
                        comments: [],
                    },
                    {
                        id: 't2',
                        title: 'Join local studio',
                        description: 'Sign up for monthly open studio access.',
                        done: true,
                        priority: 'Medium',
                        due: null,
                        assignees: ['1'],
                        subtasks: [],
                        comments: [],
                    },
                    {
                        id: 't3',
                        title: 'First wheel session',
                        description: 'Book intro session with instructor.',
                        done: false,
                        priority: 'Medium',
                        due: '2026-03-22',
                        assignees: ['1'],
                        subtasks: [
                            { id: 'st1', label: 'Call studio', done: false },
                        ],
                        comments: [],
                    },
                ],
            },
            {
                id: 's2',
                title: 'Projects',
                tasks: [
                    {
                        id: 't4',
                        title: 'Throw 5 cylinders',
                        description: 'Practice the foundational cylinder form.',
                        done: false,
                        priority: 'Low',
                        due: null,
                        assignees: ['1'],
                        subtasks: [],
                        comments: [],
                    },
                    {
                        id: 't5',
                        title: 'First glaze firing',
                        description: 'Apply and fire a glaze.',
                        done: false,
                        priority: 'Low',
                        due: '2026-04-20',
                        assignees: ['1'],
                        subtasks: [],
                        comments: [],
                    },
                ],
            },
        ],
        order:       0,
        favourite:   false,
    },
    {
        id: '3',
        title: 'Q2 Product Launch',
        description: 'Coordinate engineering, marketing and support for the v2.0 release.',
        tags: ['Product', 'Engineering'],
        status: 'Planning',
        deadline: '2026-05-01',
        color: '#EEF2F8',
        accent: '#3A5FA0',
        members: ['1', '2', '3', '4'],
        sections: [
            {
                id: 's1',
                title: 'Pre-launch',
                tasks: [
                    {
                        id: 't1',
                        title: 'Feature freeze',
                        description: 'No new features after this date.',
                        done: false,
                        priority: 'Critical',
                        due: '2026-04-01',
                        assignees: ['3', '4'],
                        subtasks: [],
                        comments: [],
                    },
                    {
                        id: 't2',
                        title: 'QA regression pass',
                        description: 'Full regression on staging.',
                        done: false,
                        priority: 'High',
                        due: '2026-04-10',
                        assignees: ['3'],
                        subtasks: [
                            { id: 'st1', label: 'Write test plan', done: false },
                            { id: 'st2', label: 'Execute tests', done: false },
                        ],
                        comments: [],
                    },
                    {
                        id: 't3',
                        title: 'Update docs site',
                        description: 'API reference and changelog.',
                        done: false,
                        priority: 'Medium',
                        due: '2026-04-15',
                        assignees: ['1'],
                        subtasks: [],
                        comments: [],
                    },
                ],
            },
            {
                id: 's2',
                title: 'Marketing',
                tasks: [
                    {
                        id: 't4',
                        title: 'Launch blog post',
                        description: '2000-word announcement post.',
                        done: false,
                        priority: 'High',
                        due: '2026-04-28',
                        assignees: ['1'],
                        subtasks: [
                            { id: 'st3', label: 'Draft', done: false },
                            { id: 'st4', label: 'Review', done: false },
                        ],
                        comments: [],
                    },
                    {
                        id: 't5',
                        title: 'Email campaign',
                        description: '3-email drip sequence.',
                        done: false,
                        priority: 'High',
                        due: '2026-05-01',
                        assignees: ['1', '2'],
                        subtasks: [],
                        comments: [],
                    },
                ],
            },
        ],
        order:       1,
        favourite:   false,
    },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1',  type: 'comment',   read: false, time: '2 min ago',  actor: '2', projectId: '1', projectTitle: 'Brand Redesign',    projectAccent: '#2D7A5F', text: 'COMMENTED',  subject: 'Colour system'           },
    { id: 'n2',  type: 'assigned',  read: false, time: '14 min ago', actor: '3', projectId: '3', projectTitle: 'Q2 Product Launch', projectAccent: '#3A5FA0', text: 'ASSIGNED',   subject: 'Update docs site'        },
    { id: 'n3',  type: 'completed', read: false, time: '1 hr ago',   actor: '2', projectId: '1', projectTitle: 'Brand Redesign',    projectAccent: '#2D7A5F', text: 'COMPLETED',  subject: 'Logo concepts (round 1)' },
    { id: 'n4',  type: 'project',   read: false, time: '2 hr ago',   actor: '4', projectId: '3', projectTitle: 'Q2 Product Launch', projectAccent: '#3A5FA0', text: 'MEMBER_ADDED', subject: 'Q2 Product Launch'     },
    { id: 'n5',  type: 'comment',   read: true,  time: '3 hr ago',   actor: '3', projectId: '3', projectTitle: 'Q2 Product Launch', projectAccent: '#3A5FA0', text: 'COMMENTED',  subject: 'QA regression pass'      },
    { id: 'n6',  type: 'assigned',  read: true,  time: 'Yesterday',  actor: '2', projectId: '1', projectTitle: 'Brand Redesign',    projectAccent: '#2D7A5F', text: 'ASSIGNED',   subject: 'Typography pairing'      },
    { id: 'n7',  type: 'completed', read: true,  time: 'Yesterday',  actor: '1', projectId: '1', projectTitle: 'Brand Redesign',    projectAccent: '#2D7A5F', text: 'COMPLETED',  subject: 'Competitor audit'        },
    { id: 'n8',  type: 'comment',   read: true,  time: '2 days ago', actor: '4', projectId: '2', projectTitle: 'Learn Ceramics',    projectAccent: '#A0714F', text: 'COMMENTED',  subject: 'First wheel session'     },
    { id: 'n9',  type: 'project',   read: true,  time: '2 days ago', actor: '1', projectId: '2', projectTitle: 'Learn Ceramics',    projectAccent: '#A0714F', text: 'MEMBER_ADDED', subject: 'Learn Ceramics'        },
    { id: 'n10', type: 'assigned',  read: true,  time: '3 days ago', actor: '3', projectId: '3', projectTitle: 'Q2 Product Launch', projectAccent: '#3A5FA0', text: 'ASSIGNED',   subject: 'Launch blog post'        },
];

