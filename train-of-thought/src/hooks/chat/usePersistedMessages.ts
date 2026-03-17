import { useEffect, useRef } from "react";
import { cleanMessages } from "@/lib/chat/utils";

export function useSaveMessages(messages: any[], storageKey: string) {
    const initialised = useRef(false);

    useEffect(() => {
        if (!initialised.current) {
            initialised.current = true;
            return;
        }
        const clean = cleanMessages(messages);
        if (clean.length === 0) {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, JSON.stringify(clean));
        }
    }, [messages, storageKey]);
}

export function loadPersistedMessages(storageKey: string): any[] {
    if (typeof window === "undefined") return [];
    try {
        const saved = localStorage.getItem(storageKey);
        const messages = saved ? JSON.parse(saved) : [];
        return cleanMessages(messages);
    } catch {
        return [];
    }
}

export function clearPersistedMessages(storageKey: string) {
    localStorage.removeItem(storageKey);
}
