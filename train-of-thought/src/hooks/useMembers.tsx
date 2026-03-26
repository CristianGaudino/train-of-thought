'use client';

import { useState, useEffect } from 'react';
import type { Member } from '@/lib/projects/definitions';

const cache       = new Map<string, Member>();  // id -> resolved member
const inflightIds = new Set<string>();          // IDs currently being fetched
const subscribers = new Set<() => void>();      // notify all watchers on cache update

function snapshot(ids: string[]): Record<string, Member> {
    return Object.fromEntries(ids.filter(id => cache.has(id)).map(id => [id, cache.get(id)!]));
}

function notify() {
    subscribers.forEach(fn => fn());
}

export function useMembers(ids: string[]): Record<string, Member> {
    const key = [...ids].sort().join(',');

    const [map, setMap] = useState<Record<string, Member>>(() => snapshot(ids));

    // Subscribe so this instance gets updated whenever any fetch resolves
    useEffect(() => {
        const allIds = key.split(',').filter(Boolean);
        const update = () => setMap(snapshot(allIds));
        subscribers.add(update);
        return () => { subscribers.delete(update); };
    }, [key]);

    // Kick off a fetch for any IDs not yet cached or in-flight
    useEffect(() => {
        if (!key) return;
        const allIds = key.split(',').filter(Boolean);
        const missing = allIds.filter(id => !cache.has(id) && !inflightIds.has(id));

        if (missing.length === 0) {
            setMap(snapshot(allIds));
            return;
        }

        missing.forEach(id => inflightIds.add(id));

        fetch(`/api/users?ids=${missing.join(',')}`)
            .then(r => r.json())
            .then((data: Member[]) => {
                data.forEach(m => { cache.set(m.id, m); inflightIds.delete(m.id); });
                notify(); // Update all subscribed components
            })
            .catch(() => {
                missing.forEach(id => inflightIds.delete(id));
            });
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    return map;
}
