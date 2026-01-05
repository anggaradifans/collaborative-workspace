'use client';

import { useState, useEffect } from 'react';

export interface UserProfile {
    name: string;
    initials: string;
    color: string;
}

const COLORS = [
    'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
];

export const useIdentity = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('user_profile');
        if (saved) {
            setUser(JSON.parse(saved));
        }
        setIsLoaded(true);
    }, []);

    const saveProfile = (name: string) => {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const profile = { name, initials, color };

        localStorage.setItem('user_profile', JSON.stringify(profile));
        setUser(profile);
    };

    return { user, isLoaded, saveProfile };
};
