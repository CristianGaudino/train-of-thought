import { useState, useCallback } from "react";
import { ShapeResult } from "@/lib/definitions";

export function useShapeIdea() {
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shapeIdea = useCallback(async (
        messages: any[],
        depth: number,
        onSuccess: (result: ShapeResult, messageIndex: number) => void
    ) => {
        setGenerating(true);
        setError(null);

        const messageIndex = messages.length;

        try {
            const simpleMessages = messages.map((m) => ({
                role: m.role,
                text: m.parts
                    ?.filter((p: any) => p.type === "text")
                    .map((p: any) => p.text)
                    .join(" ") ?? "",
            }));

            const res = await fetch("/api/shape-idea", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: simpleMessages, depth }),
            });

            if (res.status === 429) {
                setError("Too many requests — please wait a moment.");
                return;
            }
            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const result: ShapeResult = await res.json();

            if (!result.stages?.length) {
                setError("Couldn't shape this idea yet — try sharing a bit more first.");
                return;
            }

            setGenerated(true);
            onSuccess(result, messageIndex);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setGenerating(false);
        }
    }, []);

    function reset() {
        setGenerating(false);
        setGenerated(false);
        setError(null);
    }

    return { generating, generated, error, shapeIdea, reset };
}