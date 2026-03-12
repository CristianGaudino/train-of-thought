import { useEffect, useRef } from "react";

const STORAGE_KEY = "freeformMessages";

export function useSaveMessages(messages: any[]) {
    const initialised = useRef(false);

    useEffect(() => {
        if (!initialised.current) {
            initialised.current = true;
            return;
        }
        if (messages.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);
}

export function loadPersistedMessages(): any[] {
    if (typeof window === "undefined") return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function clearPersistedMessages() {
    localStorage.removeItem(STORAGE_KEY);
}