'use client';

import React, { useState, useEffect } from 'react';
import { X, User, AlignLeft, Tag, ChevronDown } from 'lucide-react';
import { Task, Column } from '../hooks/useKanban';
import { UserProfile } from '../hooks/useIdentity';

interface TaskModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    columns: Column[];
    roomUsers: UserProfile[];
}

export const TaskModal = ({ task, isOpen, onClose, onUpdate, columns, roomUsers }: TaskModalProps) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [assignee, setAssignee] = useState(task.assignee || '');

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description);
        setAssignee(task.assignee || '');
    }, [task]);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdate(task.id, { title, description, assignee });
        onClose();
    };

    const statusTitle = columns.find(c => c.id === task.status)?.title || task.status;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Task Details</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="px-8 py-6 space-y-6">
                    {/* Title */}
                    <div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold w-full border-none focus:ring-0 p-0 text-slate-900 placeholder:text-slate-300"
                            placeholder="Task Title"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {/* Assignee */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm uppercase tracking-wider">
                                    <User size={16} />
                                    <span>Assignee</span>
                                </div>
                                <div className="relative group">
                                    <select
                                        value={assignee}
                                        onChange={(e) => setAssignee(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none bg-white cursor-pointer hover:border-slate-300"
                                    >
                                        <option value="">Unassigned</option>
                                        {roomUsers.map((u, i) => (
                                            <option key={`${u.name}-${i}`} value={u.name}>
                                                {u.name}
                                            </option>
                                        ))}
                                        {/* If assignee is set but not currently online, still show it in the list */}
                                        {assignee && !roomUsers.find(u => u.name === assignee) && (
                                            <option value={assignee}>{assignee} (Offline)</option>
                                        )}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-500" />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm uppercase tracking-wider">
                                    <Tag size={16} />
                                    <span>Status</span>
                                </div>
                                <div className="px-4 py-2.5 rounded-xl bg-slate-100/50 border border-slate-200 text-sm font-bold text-slate-700 uppercase tracking-wide">
                                    {statusTitle}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm uppercase tracking-wider">
                                <AlignLeft size={16} />
                                <span>Description</span>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none"
                                placeholder="Add more details about this task..."
                            />
                        </div>
                    </div>
                </div>

                <div className="px-8 py-4 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-xl border border-indigo-600 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
