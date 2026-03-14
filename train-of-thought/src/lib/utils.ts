import { BRIEF_REGEX, Stage, STAGES_REGEX } from "./definitions";

export function defaultGetDisplayContent(message: any): string {
    return message.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") ?? "";
}

export function extractText(message: any): string {
    return message.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") ?? "";
}

export function stripBlocks(text: string): string {
    if (text.includes("%%STAGES:") && !text.includes("%%", text.indexOf("%%STAGES:") + 9)) return "";
    return text.replace(STAGES_REGEX, "").replace(BRIEF_REGEX, "").trimStart();
}

export function getDisplayContent(message: any): string {
    const raw = extractText(message);
    return message.role === "assistant" ? stripBlocks(raw) : raw;
}

export function parseStages(text: string): Stage[] | null {
    const match = text.match(STAGES_REGEX);
    if (!match) return null;
    try {
        const parsed = JSON.parse(match[1]);
        return parsed.stages ?? null;
    } catch {
        return null;
    }
}

export function parseBrief(text: string): Record<string, string> | null {
    const match = text.match(/%%BRIEF:([\s\S]*?)%%/);
    if (!match) return null;
    try {
        return JSON.parse(match[1]);
    } catch {
        return null;
    }
}