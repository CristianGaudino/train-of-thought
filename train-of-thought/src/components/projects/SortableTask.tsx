'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableTask({
    id,
    sectionId,
    children,
}: {
    id: string;
    sectionId: string;
    children: (handleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: { type: 'task', sectionId },
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={isDragging ? 'opacity-40' : ''}
        >
            {children({ ...attributes, ...listeners })}
        </div>
    );
}
