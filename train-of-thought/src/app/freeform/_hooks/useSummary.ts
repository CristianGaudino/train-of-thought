import { SummaryCache, SummaryMarker } from "@/lib/definitions";
import { Idea } from "@/lib/schemas";
import { useState, useCallback } from "react";

export function useSummary(messages: any[]) {
    const [summaryCache, setSummaryCache] = useState<SummaryCache | null>(null);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [summarising, setSummarising] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [markers, setMarkers] = useState<SummaryMarker[]>([]);
    const [activeMarkerIdea, setActiveMarkerIdea] = useState<Idea | null>(null);

    const isStale =
        summaryCache !== null && summaryCache.messageCount < messages.length;

    // Summarise is useful if there's no cache yet, or the cache is stale
    const canSummarise = summarising === false && (summaryCache === null || isStale);

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
            const res = await fetch("/api/summarise", {
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

            // Add a marker at the current message position
            const marker: SummaryMarker = {
                id: crypto.randomUUID(),
                messageIndex: messages.length,
                idea,
            };
            setMarkers((prev) => [...prev, marker]);

            return idea;
        } catch (err) {
            setError("Something went wrong generating the summary. Please try again.");
        } finally {
            setSummarising(false);
        }
    }, [messages]);

    async function openSummary() {
        setActiveMarkerIdea(null);
        if (summaryCache && !isStale) {
            setSummaryOpen(true);
            return;
        }
        const idea = await fetchSummary();
        if (idea) setSummaryOpen(true);
    }

    function openMarkerSummary(markerId: string) {
        const marker = markers.find((m) => m.id === markerId);
        if (!marker) return;
        setActiveMarkerIdea(marker.idea);
        setSummaryOpen(true);
    }

    function closeSummary() {
        setSummaryOpen(false);
        setActiveMarkerIdea(null);
    }

    function resetSummary() {
        setSummaryCache(null);
        setSummaryOpen(false);
        setActiveMarkerIdea(null);
        setMarkers([]);
        setError(null);
    }

    const activeSummaryIdea = activeMarkerIdea ?? summaryCache?.idea ?? null;

    return {
        summaryCache,
        summaryOpen,
        summarising,
        isStale,
        canSummarise,
        error,
        setError,
        markers,
        activeSummaryIdea,
        openSummary,
        openMarkerSummary,
        closeSummary,
        resetSummary,
        fetchSummary,
    };
}

export type { Idea };
