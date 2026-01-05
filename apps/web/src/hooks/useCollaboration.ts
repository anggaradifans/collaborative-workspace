import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { UserProfile } from './useIdentity';

export const useCollaboration = (roomId: string, user: UserProfile | null) => {
    const [doc] = useState(() => new Y.Doc());
    const socketRef = useRef<Socket | null>(null);
    const shapesMap = doc.getMap('shapes');
    const [shapes, setShapes] = useState<any[]>([]);
    const [roomUsers, setRoomUsers] = useState<UserProfile[]>([]);

    useEffect(() => {
        if (!user) return;

        // 1. Connect to Backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const socket = io(apiUrl);
        socketRef.current = socket;

        socket.emit('join-room', { roomId, user });

        // 2. Presence
        socket.on('room-users', (users: UserProfile[]) => {
            setRoomUsers(users);
        });

        // 3. Handle Incoming Updates from Server
        socket.on('state-updated', (update: Uint8Array) => {
            Y.applyUpdate(doc, new Uint8Array(update));
        });

        // 4. Handle Local Changes and Broadcast
        doc.on('update', (update) => {
            socket.emit('update-state', { roomId, update });
        });

        // 5. Sync Local State for UI
        const observeChanges = () => {
            const data = shapesMap.toJSON();
            setShapes(Object.values(data));
        };

        shapesMap.observe(observeChanges);
        observeChanges();

        return () => {
            socket.disconnect();
            doc.destroy();
        };
    }, [roomId, user]);

    const updateShape = (id: string, shapeData: any) => {
        doc.transact(() => {
            shapesMap.set(id, { ...shapeData, id });
        });
    };

    const clearBoard = () => {
        doc.transact(() => {
            shapesMap.clear();
        });
    };

    return { shapes, updateShape, clearBoard, roomUsers };
};
