import { LayoutGrid, CheckSquare, Bell, Lightbulb, LayoutTemplate } from 'lucide-react';
import { ACCENT_PALETTE, ME_ID } from './config';
import { GeneratedProject } from '@/app/api/generate-project/route';

// Constants

export const NAV_ITEMS = [
    { id: 'projects',      href: '/projects',     icon: LayoutGrid,     label: 'Project Space' },
    { id: 'tasks',         href: '/tasks',         icon: CheckSquare,    label: 'My Tasks'      },
    { id: 'notifications', href: '/notifications', icon: Bell,           label: 'Notifications' },
    { id: 'ideas',         href: '/ideas',         icon: Lightbulb,      label: 'Ideas'         },
    { id: 'templates',     href: '/templates',     icon: LayoutTemplate, label: 'Templates'     },
];

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

export const STEPS = ['Basics', 'Details', 'Team'] as const;

export const EMPTY_FORM: FormState = {
    title:       '',
    description: '',
    status:      'Planning',
    deadline:    '',
    accent:      ACCENT_PALETTE[0].accent,
    color:       ACCENT_PALETTE[0].color,
    members:     [ME_ID],
};

export const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

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
    taskId?: string;        // set for task-level notifications
    sectionTitle?: string;
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

export interface NotificationConfig {
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

export interface FormState {
    title:       string;
    description: string;
    status:      ProjectStatus;
    deadline:    string;
    accent:      string;
    color:       string;
    members:     string[];
}

export interface TaskGroup {
    id: string;
    label: string;
    accent: string;
    tasks: FlatTask[];
}

export interface PreviewSection {
    id:    string;
    title: string;
    tasks: PreviewTask[];
}

export interface PreviewTask {
    id:       string;
    title:    string;
    priority: Priority;
    notes?:   string;
}

export interface HeaderData {
    title:       string;
    description: string;
    status:      string;
    deadline:    string;
    accent:      string;
    color:       string;
    members:     string[];
}

export interface DeadlineInfo {
    label: string;
    urgent: boolean;
    diff: number;
}

// Props

export interface NotificationRowProps {
    notification: Notification;
    onRead:       (id: string) => void;
    compact?:     boolean;
    memberMap?:   Record<string, Member>;
}

export interface TaskPanelProps {
    task:         Task;
    accent:       string;
    projectColor: string;
    memberIds?:   string[];
    onClose:      () => void;
    onUpdate?:    (taskId: string, data: Partial<Task>, options?: { silent?: boolean }) => Promise<void>;
    onDelete?:    (taskId: string) => Promise<void>;
}

export interface AvatarProps {
    member: Member;
    size?: number;
}

export interface AvatarStackProps {
    ids: string[];
    size?: number;
}

export interface NewProjectModalProps {
    onClose: () => void;
    onCreate: (project: Project) => void;
}

export interface PillProps {
    children: React.ReactNode;
    bg: string;
    color: string;
    className?: string;
}

export interface ProjectCardProps {
    project: Project;
}

export interface RingProps {
    done: number;
    total: number;
    accent: string;
    size?: number;
}

export interface ProjectPreviewModalProps {
    generated:   GeneratedProject;
    onClose:     () => void;
    onCreated?:  (projectId: string) => void;
}

export interface OnboardingEmptyStateProps {
    onNewProject: () => void;
}

export interface SectionLabelProps {
    children:  React.ReactNode;
    className?: string;
}

export interface TaskProps {
    task: Task;
    accent: string;
    toggleTask?: (id: string) => void;
    markDone?: (id: string) => void;
    setActiveTaskId: (id: string) => void;
    deleteTask?: (id: string) => void;
    variant?: 'project' | 'tasks';
    dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export interface ProjectTasksProps {
    sections:        Section[];
    header:          HeaderData;
    collapsed:       Record<string, boolean>;
    toggleCollapse:  (id: string) => void;
    newTaskSec:      string | null;
    setNewTaskSec:   (id: string | null) => void;
    newTaskVal:      string;
    setNewTaskVal:   (val: string) => void;
    newSecMode:      boolean;
    setNewSecMode:   (val: boolean) => void;
    newSecVal:       string;
    setNewSecVal:    (val: string) => void;
    toggleTask:      (taskId: string) => Promise<void>;
    deleteTask:      (taskId: string) => Promise<void>;
    setActiveTaskId: (id: string | null) => void;
    handleAddTask:    (secId: string) => Promise<void>;
    handleAddSection: () => Promise<void>;
    reorderSections:  (reordered: Section[]) => Promise<void>;
    reorderTasks:     (updatedSections: Section[]) => Promise<void>;
    renameSection:    (sectionId: string, title: string) => Promise<void>;
    deleteSection:    (sectionId: string) => Promise<void>;
}

export interface ProjectActivityProps {
    header:       HeaderData;
    projectId:    string;
    onTaskClick?: (taskId: string) => void;
}

export interface ProjectMembersProps {
    header:           HeaderData;
    setHeader:        (fn: (f: HeaderData | null) => HeaderData | null) => void;
    handleSaveHeader: () => Promise<void>;
    savingHeader:     boolean;
}

export interface SortableSectionProps {
    section:    Section;
    isDragging: boolean;
    children:   (handleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
}

// Hook Interfaces

export interface UseProjectsReturn {
    projects:      Project[];
    loading:       boolean;
    error:         string | null;
    refetch:       () => Promise<void>;
    addProject:    (project: Project) => void;
    updateProject: (updated: Project) => void;
    removeProject:   (id: string) => void;
    notifySuccess:   (title: string, message?: string) => void;
    notifyError:     (title: string, message?: string) => void;
}

export interface UseProjectReturn {
    project:        Project | null;
    sections:       Section[];
    loading:        boolean;
    error:          string | null;
    // Task mutations
    toggleTask:     (taskId: string) => Promise<void>;
    updateTask:     (taskId: string, data: Partial<Task>) => Promise<void>;
    addTask:        (sectionId: string, title: string) => Promise<void>;
    deleteTask:     (taskId: string) => Promise<void>;
    // Section mutations
    addSection:      (title: string) => Promise<void>;
    reorderTasks:    (updatedSections: Section[]) => Promise<void>;
    reorderSections: (reordered: Section[]) => Promise<void>;
    renameSection:   (sectionId: string, title: string) => Promise<void>;
    deleteSection:   (sectionId: string) => Promise<void>;
    // Header mutations
    saveHeader:     (data: HeaderData) => Promise<void>;
    savingHeader:   boolean;
    // Project deletion
    deleteProject:  () => Promise<boolean>;
    deleting:       boolean;
}

export interface UseTasksReturn {
    // Data
    groups:          TaskGroup[];
    allMyTasks:      FlatTask[];
    filtered:        FlatTask[];
    loading:         boolean;
    // Counts
    totalOpen:       number;
    todayCount:      number;
    overdueCount:    number;
    // Filters
    filterProject:   string;
    filterPriority:  string;
    groupBy:         GroupBy;
    setFilterProject:  (v: string) => void;
    setFilterPriority: (v: string) => void;
    setGroupBy:        (v: GroupBy) => void;
    // Unique project list for filter dropdown
    uniqueProjects:  { id: string; title: string }[];
    // Mutations
    markDone:        (taskId: string) => Promise<void>;
    addQuickTask:    (title: string, projectId: string) => Promise<void>;
    updateTask:      (taskId: string, data: Partial<import('@/lib/projects/definitions').Task>) => Promise<void>;
    deleteTask:      (taskId: string) => Promise<void>;
}

export interface UseNotificationsReturn {
    // Data
    notifications: Notification[];
    filtered:      Notification[];
    grouped:       { label: string; items: Notification[] }[];
    loading:       boolean;
    unreadCount:   number;
    // Filters
    typeFilter:    TypeFilter;
    readFilter:    ReadFilter;
    setTypeFilter: (v: TypeFilter) => void;
    setReadFilter: (v: ReadFilter) => void;
    // Mutations
    markRead:      (id: string) => Promise<void>;
    markAll:       () => Promise<void>;
}