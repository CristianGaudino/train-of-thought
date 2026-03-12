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
    const [error, setError] = useState<string | null>(null);

    const isStale =
        summaryCache !== null && summaryCache.messageCount < messages.length;

    const fetchSummary = useCallback(async () => {
        setSummarising(true);
        setError(null);
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
            if (res.status === 429) {
                setError("Too many requests — please wait a moment before trying again.");
                return;
            }
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const idea = await res.json();
            setSummaryCache({ idea, messageCount: messages.length });
        } catch (err) {
            setError("Something went wrong generating the summary. Please try again.");
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
        setError(null);
    }

    return {
        summaryCache,
        summaryOpen,
        summarising,
        isStale,
        error,
        setError,
        openSummary,
        closeSummary,
        resetSummary,
        fetchSummary,
    };
}

export type { Idea };