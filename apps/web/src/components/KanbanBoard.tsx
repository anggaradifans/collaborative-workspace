'use client';

import React, { useState } from 'react';
import { useKanban, Task, Column } from '../hooks/useKanban';
import {
    Plus,
    MoreHorizontal,
    GripVertical,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UserProfile } from '../hooks/useIdentity';
import { TaskModal } from './TaskModal';

// --- Components ---

const TaskCard = ({
    task,
    onDelete,
    onClick
}: {
    task: Task,
    onDelete: (id: string) => void,
    onClick: (task: Task) => void
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-indigo-50 border-2 border-indigo-400 h-24 rounded-lg mb-3 opacity-50"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all mb-3 cursor-pointer"
            onClick={() => onClick(task)}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-800 text-sm leading-tight">{task.title}</h4>
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab p-1 hover:bg-slate-100 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={14} />
                </div>
            </div>

            {task.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    {task.assignee && (
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-medium">
                            <UserIcon size={10} />
                            <span className="truncate max-w-[80px]">{task.assignee}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
};

const KanbanColumn = ({
    column,
    tasks,
    onAddTask,
    onDeleteTask,
    onDeleteColumn,
    onTaskClick
}: {
    column: Column,
    tasks: Task[],
    onAddTask: (colId: string, title: string) => void,
    onDeleteTask: (id: string) => void,
    onDeleteColumn: (id: string) => void,
    onTaskClick: (task: Task) => void
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column
        }
    });

    const handleAdd = () => {
        if (newTitle.trim()) {
            onAddTask(column.id, newTitle);
            setNewTitle('');
            setIsAdding(false);
        }
    };

    return (
        <div ref={setNodeRef} className="flex flex-col w-80 min-w-[320px] bg-slate-50/50 rounded-xl max-h-full">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">{column.title}</h3>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onDeleteColumn(column.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        title="Delete Column"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={onDeleteTask}
                            onClick={onTaskClick}
                        />
                    ))}
                </SortableContext>
            </div>

            <div className="p-4">
                {isAdding ? (
                    <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-top-1">
                        <input
                            autoFocus
                            className="w-full text-sm p-1 border-none focus:ring-0 placeholder:text-slate-300"
                            placeholder="What needs to be done?"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            onBlur={() => !newTitle && setIsAdding(false)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all text-sm font-medium"
                    >
                        <Plus size={16} />
                        <span>Add Task</span>
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Main Board ---

export const KanbanBoard = ({ user }: { user: UserProfile | null }) => {
    const { tasks, columns, roomUsers, addTask, moveTask, deleteTask, addColumn, deleteColumn, updateTask } = useKanban('demo-kanban', user);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDragStart = (event: any) => {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const overColumnData = over.data.current?.column as Column;
        const overTaskData = over.data.current?.task as Task;

        if (overColumnData) {
            moveTask(activeId, overColumnData.id);
        } else if (overTaskData) {
            moveTask(activeId, overTaskData.status);
        }

        setActiveTask(null);
    };

    const tasksByColumn = (colId: string) => {
        return Object.values(tasks).filter(t => t.status === colId);
    };

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col">
            <div className="flex items-center justify-between mb-8 px-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Project Delivery</h2>
                    <p className="text-slate-500 text-sm">Collaborative task management board</p>
                </div>
                <button
                    onClick={() => {
                        const name = prompt('Column name?');
                        if (name) addColumn(name);
                    }}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm font-semibold"
                >
                    <Plus size={16} />
                    New Column
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-4 flex gap-6 pb-8 items-start">
                    <SortableContext items={columns.map(c => c.id)}>
                        {columns.map((col, index) => (
                            <KanbanColumn
                                key={`${col.id}-${index}`}
                                column={col}
                                tasks={tasksByColumn(col.id)}
                                onAddTask={addTask}
                                onDeleteTask={deleteTask}
                                onDeleteColumn={deleteColumn}
                                onTaskClick={(t) => setSelectedTask(t)}
                            />
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="bg-white p-4 rounded-lg border-2 border-indigo-500 shadow-2xl w-80 rotate-2 cursor-grabbing">
                            <h4 className="font-semibold text-slate-800 text-sm mb-2">{activeTask.title}</h4>
                            <p className="text-xs text-slate-500 mb-3">{activeTask.description}</p>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={updateTask}
                    columns={columns}
                    roomUsers={roomUsers}
                />
            )}
        </div>
    );
};
