'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { Task } from './Task';
import { SortableSection } from './SortableSection';
import { SectionHeader } from './SectionHeader';
import { Button, DashedButton } from '@/components/ui/buttons';
import ConfirmModal from '@/components/ConfirmModal';
import type { ProjectTasksProps } from '@/lib/projects/definitions';

export function ProjectTasks({
    sections,
    header,
    collapsed,
    toggleCollapse,
    newTaskSec,
    setNewTaskSec,
    newTaskVal,
    setNewTaskVal,
    newSecMode,
    setNewSecMode,
    newSecVal,
    setNewSecVal,
    toggleTask,
    deleteTask,
    setActiveTaskId,
    handleAddTask,
    handleAddSection,
    reorderSections,
    renameSection,
    deleteSection,
}: ProjectTasksProps) {
    const [renamingId, setRenamingId]           = useState<string | null>(null);
    const [renameVal, setRenameVal]             = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [draggingId, setDraggingId]           = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    }));

    const startRename = (sectionId: string, currentTitle: string) => {
        setRenamingId(sectionId);
        setRenameVal(currentTitle);
    };

    const commitRename = async (sectionId: string) => {
        setRenamingId(null);
        if (renameVal.trim() && renameVal !== sections.find(s => s.id === sectionId)?.title) {
            await renameSection(sectionId, renameVal.trim());
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setDraggingId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = sections.findIndex(s => s.id === active.id);
        const newIndex = sections.findIndex(s => s.id === over.id);
        reorderSections(arrayMove(sections, oldIndex, newIndex));
    };

    return (
        <div className="px-8 py-7 flex flex-col gap-7">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={e => setDraggingId(String(e.active.id))}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setDraggingId(null)}
            >
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {sections.map(section => {
                        const isCollapsed = collapsed[section.id];
                        const isRenaming  = renamingId === section.id;

                        return (
                            <SortableSection
                                key={section.id}
                                section={section}
                                isDragging={draggingId === section.id}
                            >
                                {handleProps => (
                                    <div>
                                        <SectionHeader
                                            section={section}
                                            accent={header.accent}
                                            isCollapsed={isCollapsed}
                                            isRenaming={isRenaming}
                                            renameVal={renameVal}
                                            dragHandleProps={handleProps}
                                            onToggleCollapse={() => toggleCollapse(section.id)}
                                            onRenameChange={setRenameVal}
                                            onRenameCommit={() => commitRename(section.id)}
                                            onRenameCancel={() => setRenamingId(null)}
                                            onStartRename={() => startRename(section.id, section.title)}
                                            onDelete={() => setConfirmDeleteId(section.id)}
                                        />

                                        {!isCollapsed && (
                                            <div className="flex flex-col gap-1.5 pl-1">
                                                {section.tasks.map(task => (
                                                    <Task
                                                        key={task.id}
                                                        task={task}
                                                        accent={header.accent}
                                                        toggleTask={toggleTask}
                                                        setActiveTaskId={setActiveTaskId}
                                                        deleteTask={deleteTask}
                                                    />
                                                ))}

                                                {newTaskSec === section.id ? (
                                                    <div className="flex gap-2 mt-1">
                                                        <input
                                                            autoFocus
                                                            value={newTaskVal}
                                                            onChange={e => setNewTaskVal(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter')  handleAddTask(section.id);
                                                                if (e.key === 'Escape') { setNewTaskSec(null); setNewTaskVal(''); }
                                                            }}
                                                            placeholder="Task name…"
                                                            className="flex-1 px-3.5 py-2 rounded-xl border text-sm font-primary text-zinc-800 bg-white outline-none"
                                                            style={{ borderColor: header.accent }}
                                                        />
                                                        <Button
                                                            size="md"
                                                            onClick={() => handleAddTask(section.id)}
                                                            style={{ background: header.accent }}
                                                            className="border-0"
                                                        >
                                                            Add
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="md"
                                                            onClick={() => { setNewTaskSec(null); setNewTaskVal(''); }}
                                                            icon={<X size={14} />}
                                                        />
                                                    </div>
                                                ) : (
                                                    <DashedButton
                                                        accent={header.accent}
                                                        onClick={() => setNewTaskSec(section.id)}
                                                        icon={<Plus size={13} />}
                                                        className="mt-1"
                                                    >
                                                        Add task
                                                    </DashedButton>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </SortableSection>
                        );
                    })}
                </SortableContext>
            </DndContext>

            {newSecMode ? (
                <div className="flex gap-2 items-center">
                    <input
                        autoFocus
                        value={newSecVal}
                        onChange={e => setNewSecVal(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter')  handleAddSection();
                            if (e.key === 'Escape') { setNewSecMode(false); setNewSecVal(''); }
                        }}
                        placeholder="Section name…"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm font-semibold font-primary text-zinc-800 bg-white outline-none"
                        style={{ borderColor: header.accent }}
                    />
                    <Button
                        size="md"
                        onClick={handleAddSection}
                        style={{ background: header.accent }}
                        className="border-0"
                    >
                        Add
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => { setNewSecMode(false); setNewSecVal(''); }}
                        icon={<X size={14} />}
                    />
                </div>
            ) : (
                <DashedButton accent={header.accent} onClick={() => setNewSecMode(true)}>
                    Add section
                </DashedButton>
            )}

            {confirmDeleteId && (
                <ConfirmModal
                    title="Delete section"
                    message={`Are you sure you want to delete "${sections.find(s => s.id === confirmDeleteId)?.title}"? All tasks in this section will be permanently removed.`}
                    confirmLabel="Delete section"
                    destructive
                    onConfirm={async () => {
                        await deleteSection(confirmDeleteId);
                        setConfirmDeleteId(null);
                    }}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}
        </div>
    );
}
