
// Constants

export const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
    { value: 'all',       label: 'All'       },
    { value: 'assigned',  label: 'Assigned'  },
    { value: 'comment',   label: 'Comments'  },
    { value: 'completed', label: 'Completed' },
    { value: 'project',   label: 'Projects'  },
];

export const STATUS_FILTERS: (ProjectStatus | 'All')[] = [
    'All', 'Not Started', 'Planning', 'In Progress', 'Review', 'Done',
];

// Types

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ProjectStatus =
    | 'Not Started'
    | 'Planning'
    | 'In Progress'
    | 'Review'
    | 'Done';

export type NotificationType = 'assigned' | 'comment' | 'completed' | 'project';

export type FlatTask = Task & Required<Pick<Task,
    'projectId' |
    'projectTitle' |
    'projectAccent' |
    'projectColor' |
    'sectionTitle'
>>;

export type ReadFilter = 'all' | 'unread' | 'read';

export type TypeFilter = NotificationType | 'all';

export type Tab = 'tasks' | 'activity' | 'members';

export type GroupBy = 'time' | 'project' | 'priority';

// Interfaces

export interface Member {
    id: string;        // Clerk user ID in production, numeric string in mock
    name: string;
    initials: string;
    color: string;     // hex — used for avatar background
    imageUrl?: string; // Clerk profile image URL when available
}

export interface Subtask {
    id: string;
    label: string;
    done: boolean;
}

export interface Comment {
    id: string;
    author: string;    // Member id
    text: string;
    time: string;      // relative time string e.g. "2d ago" — replace with Date in DB version
}

export interface Task {
    id: string;
    title: string;
    description: string;
    done: boolean;
    priority: Priority;
    due: string | null; // ISO date string, null if no deadline
    assignees: string[]; // Member ids
    subtasks: Subtask[];
    comments: Comment[];
    // Populated when task is displayed outside its project context (e.g. My Tasks)
    projectId?: string;
    projectTitle?: string;
    projectAccent?: string;
    projectColor?: string;
    sectionTitle?: string;
}

export interface Section {
    id: string;
    title: string;
    tasks: Task[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    tags: string[];
    status: ProjectStatus;
    deadline: string | null; // ISO date string
    color: string;           // tinted background hex
    accent: string;          // primary colour hex
    members: string[];       // Member ids
    sections: Section[];
}

export interface Notification {
    id: string;
    type: NotificationType;
    read: boolean;
    time: string;
    actor: string;          // Member id
    projectId: string;
    projectTitle: string;
    projectAccent: string;
    text: string;           // verb phrase e.g. "Left a comment on"
    subject: string;        // task or project title
}

export interface StatusConfig {
    dot: string;
    bg: string;
    text: string;
}

export interface PriorityConfig {
    color: string;
    bg: string;
}

export interface NotifConfig {
    icon: string;
    color: string;
    bg: string;
    label: string;
}

export interface AccentPair {
    accent: string;
    color: string;
}

export interface HeaderForm {
    title:       string;
    description: string;
    status:      string;
    deadline:    string;
    accent:      string;
    color:       string;
    members:     string[];
}