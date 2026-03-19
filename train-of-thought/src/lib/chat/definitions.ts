import { GeneratedProject } from "@/app/api/generate-project/route";
import { Idea } from "./schemas";

// Constants
export const DEPTH_OPTIONS = [
  { label: "Light", value: 1, hint: "Quick, casual" },
  { label: "Structured", value: 2, hint: "Organised thinking" },
  { label: "Deep", value: 3, hint: "Detailed exploration" },
];

export const STAGES_REGEX = /%%STAGES:([\s\S]*?)%%/;

export const BRIEF_REGEX = /%%BRIEF:([\s\S]*?)%%/g;

export const IDEA_STAGE_ID = "idea";

export const FREEFORM_STORAGE_KEY = "freeformMessages";

export const STRUCTURED_STORAGE_KEY = "structuredMessages";

// Types 
export type IdeaCard = {
    id: string;
    title?: string;
    content: string;
    source: "message" | "summary" | "manual";
    createdAt: number;
};

export type SummaryCache = {
    idea: Idea;
    messageCount: number;
};

export type SummaryMarker = {
    id: string;
    messageIndex: number;
    idea: Idea;
};

export type StageThreads = Record<string, any[]>;

export type ShapeResult = {
    stages: Stage[];
    brief: Record<string, string>;
};

export type GenerateInput = GenerateFromFreeform | GenerateFromStructured;


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

export interface GenerateFromFreeform {
    source: 'freeform';
    idea:   Idea;
}

export interface GenerateFromStructured {
    source:  'structured';
    stages:  Stage[];
    brief:   Record<string, string>;
}

export interface UseGenerateProjectReturn {
    generating:       boolean;
    generatedProject: GeneratedProject | null;
    error:            string | null;
    generate:         (input: GenerateInput) => Promise<void>;
    reset:            () => void;
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
    showSaveButton?: boolean;
    markers?: SummaryMarker[];
    onMarkerClick?: (markerId: string) => void;
    generating?: boolean;
    generatedAtIndex?: number | null;
    generated?: boolean;
}

export interface ChatEventProps {
    label: string;
    loading?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
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
    showSaveButton?: boolean;
    placeholder?: string;
    hint?: string | null;
    error?: string | null;
    onErrorClose?: () => void;
    // Freeform summary markers
    markers?: SummaryMarker[];
    onMarkerClick?: (markerId: string) => void;
    // Structured shaping
    generatedAtIndex?: number | null;
    generating?: boolean;
    generated?: boolean;
}

export interface ResumeModalProps {
    messages: any[];
    onContinue: () => void;
    onStartFresh: (keepConcepts: boolean) => void;
    showConceptsStep?: boolean;
}

export interface BriefPanelProps {
    sections: BriefSection[];
    filledCount: number;
    onExport: () => void;
    onAddToProjects?: () => void;
    generating?:      boolean;
}

export interface StagePanelProps {
    stages: Stage[];
    activeStageId: string;
    brief: Record<string, string>;
    ideaStageId: string;
    onStageClick: (stageId: string) => void;
    onClose: () => void;
}