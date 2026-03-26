'use client';

import { useState, useEffect } from 'react';
import type { Member } from '@/lib/projects/definitions';

const cache = new Map<string, Member>();

export function useMembers(ids: string[]): Record<string, Member> {
    const key = [...ids].sort().join(',');

    const [map, setMap] = useState<Record<string, Member>>(() =>
        Object.fromEntries(ids.filter(id => cache.has(id)).map(id => [id, cache.get(id)!]))
    );

    useEffect(() => {
        if (!key) return;
        const allIds = key.split(',').filter(Boolean);
        const missing = allIds.filter(id => !cache.has(id));

        if (missing.length === 0) {
            setMap(Object.fromEntries(allIds.filter(id => cache.has(id)).map(id => [id, cache.get(id)!])));
            return;
        }

        fetch(`/api/users?ids=${missing.join(',')}`)
            .then(r => r.json())
            .then((data: Member[]) => {
                data.forEach(m => cache.set(m.id, m));
                setMap(Object.fromEntries(allIds.filter(id => cache.has(id)).map(id => [id, cache.get(id)!])));
            })
            .catch(() => {});
    }, [key]);

    return map;
}
