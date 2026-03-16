import { useState, useEffect } from "react";
import { IdeaCard } from "@/lib/definitions";

export function useConceptCards() {
    const [cards, setCards] = useState<IdeaCard[]>([]);
    const [drafting, setDrafting] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("freeformCards");
        if (saved) setCards(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("freeformCards", JSON.stringify(cards));
    }, [cards]);

    function addCard(card: Omit<IdeaCard, "id" | "createdAt">) {
        const id = crypto.randomUUID();
        setCards((prev) => [
            { ...card, id, createdAt: Date.now() },
            ...prev,
        ]);
        return id;
    }

    function commitDraft(draft: { title?: string; content: string }) {
        if (!draft.title?.trim() && !draft.content?.trim()) {
            setDrafting(false);
            return;
        }
        addCard({
            title: draft.title?.trim() || undefined,
            content: draft.content.trim(),
            source: "manual",
        });
        setDrafting(false);
    }

    function editCard(id: string, updates: Partial<IdeaCard>) {
        setCards((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
        );
    }

    function removeCard(id: string) {
        setCards((prev) => prev.filter((c) => c.id !== id));
    }

    function removeAllCards() {
        setCards([]);
    }

    function toggleCardFromMessage(message: any) {
        const content =
            message.parts?.map((p: any) => p.text).join(" ") || message.text;
        const existing = cards.find((c) => c.content === content);
        if (existing) {
            removeCard(existing.id);
        } else {
            addCard({ title: undefined, content, source: "message" });
        }
    }

    function isMessageSaved(message: any) {
        const content =
            message.parts?.map((p: any) => p.text).join(" ") || message.text;
        return cards.some((c) => c.content === content);
    }

    return {
        cards,
        drafting,
        setDrafting,
        addCard,
        commitDraft,
        editCard,
        removeCard,
        removeAllCards,
        toggleCardFromMessage,
        isMessageSaved,
    };
}
