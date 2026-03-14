// Constants
export const DEPTH_OPTIONS = [
  { label: "Light", value: 1, hint: "Quick, casual" },
  { label: "Structured", value: 2, hint: "Organised thinking" },
  { label: "Deep", value: 3, hint: "Detailed exploration" },
];

export const STAGES_REGEX = /%%STAGES:([\s\S]*?)%%/;

export const BRIEF_REGEX = /%%BRIEF:([\s\S]*?)%%/g;

// Types 
export type IdeaCard = {
    id: string;
    title?: string;
    content: string;
    source: "message" | "summary" | "manual";
    createdAt: number;
};

export type Idea = {
    title?: string;
    coreConcept?: string;
    audience?: string;
    problem?: string;
    variations?: string[];
    openQuestions?: string[];
    summary?: string;
};

export type StageThreads = Record<string, any[]>;

// Interfaces
export interface BriefSection {
    id: string;
    label: string;
    content: string | undefined;
}

export interface Stage {
    id: string;
    label: string;
    question: string;
}

// Props
export interface ChatHeaderProps {
    title: string;
    depth: number;
    setDepth: (depth: number) => void;
    left?: React.ReactNode;
    children?: React.ReactNode;
}
export interface ChatInputBarProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e?: React.FormEvent) => void;
    disabled: boolean;
    placeholder?: string;
    hint?: string | null;
    error?: string | null;
    onErrorClose?: () => void;
}

export interface ChatWindowProps {
    messages: any[];
    status: string;
    showIntro: boolean;
    introTitle: string;
    introSubtitle: string;
    isMessageSaved: (message: any) => boolean;
    onToggleSave: (message: any) => void;
    getDisplayContent?: (message: any) => string;
}

export interface ChatProps {
    messages: any[];
    status: string;
    input: string;
    onInputChange: (value: string) => void;
    onSubmit: (e?: React.FormEvent) => void;
    showIntro: boolean;
    introTitle: string;
    introSubtitle: string;
    isMessageSaved: (message: any) => boolean;
    onToggleSave: (message: any) => void;
    getDisplayContent?: (message: any) => string;
    placeholder?: string;
    hint?: string | null;
    error?: string | null;
    onErrorClose?: () => void;
}

export interface BriefPanelProps {
    sections: BriefSection[];
    filledCount: number;
    canExport: boolean;
    onExport: () => void;
}

export interface StagePanelProps {
    stages: Stage[];
    activeStageId: string;
    brief: Record<string, string>;
    ideaStageId: string;
    onStageClick: (stageId: string) => void;
    onClose: () => void;
}