'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, EyeOff, Eye } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
    type CollisionDetection,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { Task } from './Task';
import { SortableSection } from './SortableSection';
import { SortableTask } from './SortableTask';
import { SectionHeader } from './SectionHeader';
import { Button, DashedButton } from '@/components/ui/buttons';
import ConfirmModal from '@/components/ConfirmModal';
import type { ProjectTasksProps, Section } from '@/lib/projects/definitions';

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
    reorderTasks,
    renameSection,
    deleteSection,
}: ProjectTasksProps) {
    const [renamingId, setRenamingId]           = useState<string | null>(null);
    const [renameVal, setRenameVal]             = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [draggingId, setDraggingId]       = useState<string | null>(null);
    const [localSections, setLocalSections] = useState<Section[]>(sections);
    const [hideCompleted, setHideCompleted] = useState(false);

    // Tracks which section the dragged task started in (set once, never updated)
    const dragOriginalSectionRef = useRef<string | null>(null);
    // Tracks which section the dragged task is currently in (updates on cross-section moves)
    const draggingTaskSectionRef = useRef<string | null>(null);

    // Sync local state from prop whenever we're not mid-drag
    useEffect(() => {
        if (!draggingId) setLocalSections(sections);
    }, [sections, draggingId]);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    }));

    // Sections only collide with sections; tasks use default closestCenter
    const collisionDetection: CollisionDetection = (args) => {
        if (args.active.data.current?.type === 'section') {
            return closestCenter({
                ...args,
                droppableContainers: args.droppableContainers.filter(
                    c => c.data.current?.type === 'section'
                ),
            });
        }
        return closestCenter(args);
    };

    const startRename = (sectionId: string, currentTitle: string) => {
        setRenamingId(sectionId);
        setRenameVal(currentTitle);
    };

    const commitRename = async (sectionId: string) => {
        setRenamingId(null);
        if (renameVal.trim() && renameVal !== localSections.find(s => s.id === sectionId)?.title) {
            await renameSection(sectionId, renameVal.trim());
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const type = active.data.current?.type as 'section' | 'task';
        setDraggingId(String(active.id));
        if (type === 'task') {
            const sectionId = active.data.current?.sectionId ?? null;
            dragOriginalSectionRef.current  = sectionId;
            draggingTaskSectionRef.current  = sectionId;
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.data.current?.type !== 'task') return;

        const activeTaskId    = String(active.id);
        const activeSectionId = draggingTaskSectionRef.current;
        if (!activeSectionId) return;

        const overType = over.data.current?.type as string | undefined;
        const targetSectionId: string | undefined =
            overType === 'task'    ? (over.data.current?.sectionId as string) :
            overType === 'section' ? String(over.id) :
            undefined;

        if (!targetSectionId || activeSectionId === targetSectionId) return;

        setLocalSections(prev => {
            const fromSection = prev.find(s => s.id === activeSectionId);
            const toSection   = prev.find(s => s.id === targetSectionId);
            if (!fromSection || !toSection) return prev;

            const task = fromSection.tasks.find(t => t.id === activeTaskId);
            if (!task) return prev;

            let insertIndex: number;
            if (overType === 'task') {
                const overIdx = toSection.tasks.findIndex(t => t.id === String(over.id));
                const activeCenter = (event.active.rect.current.translated?.top ?? 0)
                    + (event.active.rect.current.translated?.height ?? 0) / 2;
                const overCenter   = over.rect.top + over.rect.height / 2;
                insertIndex = activeCenter > overCenter ? overIdx + 1 : overIdx;
            } else {
                insertIndex = toSection.tasks.length;
            }

            return prev.map(s => {
                if (s.id === activeSectionId) return { ...s, tasks: s.tasks.filter(t => t.id !== activeTaskId) };
                if (s.id === targetSectionId) {
                    const next = [...s.tasks];
                    next.splice(insertIndex, 0, task);
                    return { ...s, tasks: next };
                }
                return s;
            });
        });

        draggingTaskSectionRef.current = targetSectionId;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setDraggingId(null);

        const originalSectionId        = dragOriginalSectionRef.current;
        dragOriginalSectionRef.current  = null;
        draggingTaskSectionRef.current  = null;

        if (!over) return;

        const activeType = active.data.current?.type as 'section' | 'task';

        if (activeType === 'section') {
            if (active.id === over.id) return;
            const oldIdx = localSections.findIndex(s => s.id === String(active.id));
            const newIdx = localSections.findIndex(s => s.id === String(over.id));
            if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                reorderSections(arrayMove(localSections, oldIdx, newIdx));
            }
            return;
        }

        if (activeType === 'task') {
            // Find where the task currently lives (may have moved via onDragOver)
            const currentSection = localSections.find(s => s.tasks.some(t => t.id === String(active.id)));
            if (!currentSection) return;

            const crossSection = originalSectionId !== currentSection.id;

            if (crossSection) {
                // State already updated by handleDragOver — just persist
                reorderTasks(localSections);
                return;
            }

            // Same-section reorder
            if (active.id === over.id || over.data.current?.type !== 'task') return;

            const oldIdx = currentSection.tasks.findIndex(t => t.id === String(active.id));
            const newIdx = currentSection.tasks.findIndex(t => t.id === String(over.id));
            if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                reorderTasks(localSections.map(s =>
                    s.id === currentSection.id
                        ? { ...s, tasks: arrayMove(s.tasks, oldIdx, newIdx) }
                        : s
                ));
            }
        }
    };

    const handleDragCancel = () => {
        setDraggingId(null);
        dragOriginalSectionRef.current  = null;
        draggingTaskSectionRef.current  = null;
        setLocalSections(sections);
    };

    return (
        <div className="px-4 md:px-8 py-7 flex flex-col gap-7">
            <div className="flex justify-end -my-3">
                <button
                    onClick={() => setHideCompleted(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-medium font-primary text-zinc-500 transition-colors cursor-pointer"
                >
                    {hideCompleted ? <Eye size={13} /> : <EyeOff size={13} />}
                    {hideCompleted ? 'Show completed' : 'Hide completed'}
                </button>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {localSections.map(section => {
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
                                                <SortableContext
                                                    items={section.tasks.filter(t => !t.deleted && (!hideCompleted || !t.done)).map(t => t.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {section.tasks.filter(t => !t.deleted && (!hideCompleted || !t.done)).map(task => (
                                                        <SortableTask
                                                            key={task.id}
                                                            id={task.id}
                                                            sectionId={section.id}
                                                        >
                                                            {taskHandleProps => (
                                                                <Task
                                                                    task={task}
                                                                    accent={header.accent}
                                                                    toggleTask={toggleTask}
                                                                    setActiveTaskId={setActiveTaskId}
                                                                    deleteTask={deleteTask}
                                                                    dragHandleProps={taskHandleProps}
                                                                />
                                                            )}
                                                        </SortableTask>
                                                    ))}
                                                </SortableContext>

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
                    message={`Are you sure you want to delete "${localSections.find(s => s.id === confirmDeleteId)?.title}"? All tasks in this section will be permanently removed.`}
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
