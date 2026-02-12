"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { logError } from '../../lib/utils/logger';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isAuthPage = pathname === '/login' || pathname === '/signup';

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (!session && !isAuthPage) {
                router.push('/login');
            }
        }).catch((err: unknown) => {
            logError('Failed to get auth session:', err);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (!session && !isAuthPage) {
                router.push('/login');
            } else if (session && isAuthPage) {
                router.push('/');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [pathname, router]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push('/login');
        } catch (err: unknown) {
            logError('Failed to sign out:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
