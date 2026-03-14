import { useEffect, useRef } from "react";

export function useSaveMessages(messages: any[], storageKey: string) {
    const initialised = useRef(false);

    useEffect(() => {
        if (!initialised.current) {
            initialised.current = true;
            return;
        }
        if (messages.length === 0) {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, storageKey]);
}

export function loadPersistedMessages(storageKey: string): any[] {
    if (typeof window === "undefined") return [];
    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function clearPersistedMessages(storageKey: string) {
    localStorage.removeItem(storageKey);
}
