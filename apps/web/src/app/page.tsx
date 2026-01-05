'use client';

import React, { useState, useEffect } from 'react';
import { Whiteboard } from '@/components/Whiteboard';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Layout, Palette, Kanban } from 'lucide-react';
import { useIdentity, UserProfile } from '@/hooks/useIdentity';
import { NameModal } from '@/components/NameModal';
import { io } from 'socket.io-client';

export default function Home() {
  const [view, setView] = useState<'whiteboard' | 'kanban'>('kanban');
  const { user, isLoaded, saveProfile } = useIdentity();
  const [roomUsers, setRoomUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!user) return;

    // Use a separate room name for "total site presence"
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiUrl);

    socket.emit('join-room', { roomId: 'global-presence', user });

    socket.on('room-users', (users: UserProfile[]) => {
      setRoomUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {!user && <NameModal onSave={saveProfile} />}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Radifan <span className="text-indigo-600">Workspace</span>
            </h1>
          </div>
        </div>

        <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'kanban'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Kanban size={18} />
            Kanban
          </button>
          <button
            onClick={() => setView('whiteboard')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'whiteboard'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Palette size={18} />
            Whiteboard
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex flex-row -space-x-2 overflow-hidden">
            {roomUsers.slice(0, 5).map((u, i) => (
              <div
                key={i}
                title={u.name}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 ring-white ${u.color} text-[12px] font-black text-white uppercase shadow-sm cursor-help transition-all hover:scale-110 hover:z-10`}
              >
                {u.initials}
              </div>
            ))}
            {roomUsers.length > 5 && (
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                <span className="leading-none">+{roomUsers.length - 5}</span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-black text-slate-500 ml-2 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md tracking-tighter flex items-center h-6 uppercase leading-none">
            {roomUsers.length} ONLINE
          </span>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 py-10">
        {view === 'whiteboard' ? (
          <div className="flex flex-col items-center">
            <Whiteboard user={user} />
          </div>
        ) : (
          <KanbanBoard user={user} />
        )}
      </div>
    </main>
  );
}
