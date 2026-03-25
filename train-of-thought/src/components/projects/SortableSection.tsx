'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SortableSectionProps } from '@/lib/projects/definitions';

export function SortableSection({ section, isDragging, children }: SortableSectionProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: section.id,
        data: { type: 'section' },
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={isDragging ? 'opacity-50' : ''}
        >
            {children({ ...attributes, ...listeners })}
        </div>
    );
}
