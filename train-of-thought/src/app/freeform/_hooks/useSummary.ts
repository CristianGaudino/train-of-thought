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

    const canSummarise = !summarising && (summaryCache === null || isStale);

    const fetchSummary = useCallback(async () => {
        // Capture index before the async call so marker lands in the right place
        const markerIndex = messages.length;

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

            const isEmpty = !idea || Object.values(idea).every(
                (v) => !v || (Array.isArray(v) && v.length === 0)
            );

            if (isEmpty) {
                setError("Not enough conversation yet to generate a summary — keep going and try again.");
                return;
            }

            setSummaryCache({ idea, messageCount: markerIndex });

            const marker: SummaryMarker = {
                id: crypto.randomUUID(),
                messageIndex: markerIndex,
                idea,
            };
            setMarkers((prev) => [...prev, marker]);

            return idea;
        } catch (err) {
            setError("An error occurred while generating the summary. Please try again.");
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
