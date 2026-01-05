import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { UserProfile } from './useIdentity';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: string; // matches column id
    labels: string[];
    assignee?: string;
    color?: string;
}

export interface Column {
    id: string;
    title: string;
}

export const useKanban = (roomId: string, user: UserProfile | null) => {
    const [doc] = useState(() => new Y.Doc());
    const socketRef = useRef<Socket | null>(null);

    // Yjs Shared Types
    const tasksMap = doc.getMap<Task>('tasks');
    const columnsArray = doc.getArray<Column>('columns');

    const [tasks, setTasks] = useState<Record<string, Task>>({});
    const [columns, setColumns] = useState<Column[]>([]);
    const [roomUsers, setRoomUsers] = useState<UserProfile[]>([]);

    useEffect(() => {
        if (!user) return;

        // Connect to Backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const socket = io(apiUrl);
        socketRef.current = socket;

        socket.emit('join-room', { roomId, user });

        socket.on('room-users', (users: UserProfile[]) => {
            setRoomUsers(users);
        });

        socket.on('state-updated', (update: Uint8Array) => {
            Y.applyUpdate(doc, new Uint8Array(update));
        });

        doc.on('update', (update) => {
            socket.emit('update-state', { roomId, update });
        });

        // Observer for UI State
        const updateLocalState = () => {
            setTasks(tasksMap.toJSON() as Record<string, Task>);
            setColumns(columnsArray.toArray());
        };

        tasksMap.observe(updateLocalState);
        columnsArray.observe(updateLocalState);

        updateLocalState();

        return () => {
            socket.disconnect();
            doc.destroy();
        };
    }, [roomId, user]);

    // Actions
    const addTask = (columnId: string, title: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newTask: Task = {
            id,
            title,
            description: '',
            status: columnId,
            labels: [],
        };
        tasksMap.set(id, newTask);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        const current = tasksMap.get(id);
        if (current) {
            tasksMap.set(id, { ...current, ...updates });
        }
    };

    const deleteTask = (id: string) => {
        tasksMap.delete(id);
    };

    const addColumn = (title: string) => {
        const slug = title.toLowerCase().replace(/\s+/g, '-');
        const id = `${slug}-${Math.random().toString(36).substr(2, 5)}`;
        columnsArray.push([{ id, title }]);
    };

    const deleteColumn = (id: string) => {
        const index = columnsArray.toArray().findIndex(c => c.id === id);
        if (index !== -1) {
            columnsArray.delete(index);
        }
    };

    const moveTask = (taskId: string, newStatus: string) => {
        const task = tasksMap.get(taskId);
        if (task) {
            tasksMap.set(taskId, { ...task, status: newStatus });
        }
    };

    return {
        tasks,
        columns,
        roomUsers,
        addTask,
        updateTask,
        deleteTask,
        addColumn,
        deleteColumn,
        moveTask,
    };
};
