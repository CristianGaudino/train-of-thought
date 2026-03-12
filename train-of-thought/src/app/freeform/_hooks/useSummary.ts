import { useState, useCallback } from "react";

type Idea = {
    title?: string;
    coreConcept?: string;
    audience?: string;
    problem?: string;
    variations?: string[];
    openQuestions?: string[];
    summary?: string;
};

type SummaryCache = {
    idea: Idea;
    messageCount: number;
};

export function useSummary(messages: any[]) {
    const [summaryCache, setSummaryCache] = useState<SummaryCache | null>(null);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [summarising, setSummarising] = useState(false);

    const isStale =
        summaryCache !== null && summaryCache.messageCount < messages.length;

    const fetchSummary = useCallback(async () => {
        setSummarising(true);
        try {
            const simpleMessages = messages.map((m) => ({
                role: m.role,
                text:
                    m.parts
                        ?.filter((p: any) => p.type === "text")
                        .map((p: any) => p.text)
                        .join(" ") ?? "",
            }));
            const res = await fetch("/api/summarize-idea", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: simpleMessages }),
            });
            if (!res.ok) throw new Error("Failed");
            const idea = await res.json();
            setSummaryCache({ idea, messageCount: messages.length });
        } catch {
            alert("Error summarising. Try again.");
        } finally {
            setSummarising(false);
        }
    }, [messages]);

    async function openSummary() {
        if (summaryCache && !isStale) {
            setSummaryOpen(true);
            return;
        }
        await fetchSummary();
        setSummaryOpen(true);
    }

    function closeSummary() {
        setSummaryOpen(false);
    }

    function resetSummary() {
        setSummaryCache(null);
        setSummaryOpen(false);
    }

    return {
        summaryCache,
        summaryOpen,
        summarising,
        isStale,
        openSummary,
        closeSummary,
        resetSummary,
        fetchSummary,
    };
}

export type { Idea };