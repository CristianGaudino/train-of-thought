'use client';

import { useState, useEffect } from 'react';
import type { Member } from '@/lib/projects/definitions';

const cache    = new Map<string, Member>(); // resolved members
const inflight = new Set<string>();         // IDs currently being fetched

function snapshot(ids: string[]): Record<string, Member> {
    return Object.fromEntries(ids.filter(id => cache.has(id)).map(id => [id, cache.get(id)!]));
}

export function useMembers(ids: string[]): Record<string, Member> {
    const key = [...ids].sort().join(',');

    const [map, setMap] = useState<Record<string, Member>>(() => snapshot(ids));

    useEffect(() => {
        if (!key) return;
        const allIds = key.split(',').filter(Boolean);
        const missing = allIds.filter(id => !cache.has(id) && !inflight.has(id));

        if (missing.length === 0) {
            setMap(snapshot(allIds));
            return;
        }

        missing.forEach(id => inflight.add(id));

        fetch(`/api/users?ids=${missing.join(',')}`)
            .then(r => r.json())
            .then((data: Member[]) => {
                data.forEach(m => { cache.set(m.id, m); inflight.delete(m.id); });
                setMap(snapshot(allIds));
            })
            .catch(() => {
                missing.forEach(id => inflight.delete(id));
            });
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    return map;
}
