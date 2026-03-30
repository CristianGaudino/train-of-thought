import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { Project } from "@/lib/projects/definitions";
import ProjectCard from "./ProjectCard";

export function SortableProjectCard({
    project,
    onFavourite,
    dragEnabled,
}: {
    project: Project;
    onFavourite: (id: string) => void;
    dragEnabled: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: project.id,
        disabled: !dragEnabled,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform:  CSS.Transform.toString(transform),
                transition,
                opacity:    isDragging ? 0.4 : 1,
                zIndex:     isDragging ? 50 : undefined,
            }}
            {...attributes}
        >
            <ProjectCard
                project={project}
                onFavourite={onFavourite}
                dragHandleProps={dragEnabled ? listeners : undefined}
            />
        </div>
    );
}