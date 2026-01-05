'use client';

import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useCollaboration } from '../hooks/useCollaboration';
import { Trash2 } from 'lucide-react';
import { UserProfile } from '../hooks/useIdentity';

export const Whiteboard = ({ user }: { user: UserProfile | null }) => {
    const { shapes, updateShape, clearBoard } = useCollaboration('main-room', user);

    const addRect = () => {
        const id = Math.random().toString(36).substr(2, 9);
        updateShape(id, {
            id,
            x: Math.random() * 500,
            y: Math.random() * 500,
            width: 100,
            height: 100,
            fill: '#' + Math.floor(Math.random() * 16777215).toString(16),
        });
    };

    const handleClear = () => {
        if (window.confirm('Clear everything on the board?')) {
            clearBoard();
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-8">
            <div className="flex gap-4">
                <button
                    onClick={addRect}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                >
                    Add Shared Rectangle
                </button>
                <button
                    onClick={handleClear}
                    className="px-6 py-2 bg-white text-rose-500 border border-rose-200 rounded-lg font-semibold shadow-sm hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Trash2 size={18} />
                    Clear Board
                </button>
            </div>
            <div className="border border-slate-200 rounded-xl shadow-2xl overflow-hidden bg-white">
                <Stage width={800} height={600}>
                    <Layer>
                        {shapes.map((shape: any) => (
                            <Rect
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                width={shape.width}
                                height={shape.height}
                                fill={shape.fill}
                                draggable
                                onDragEnd={(e) => {
                                    updateShape(shape.id, {
                                        ...shape,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    });
                                }}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
            <p className="text-slate-400 text-sm italic">Sharing room: main-room</p>
        </div>
    );
};
