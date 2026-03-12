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

export const DEPTH_OPTIONS = [
  { label: "Light", value: 1, hint: "Quick, casual" },
  { label: "Structured", value: 2, hint: "Organised thinking" },
  { label: "Deep", value: 3, hint: "Detailed exploration" },
];