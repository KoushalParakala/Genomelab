import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    profile: any | null;
    isLoading: boolean;
    authModalOpen: boolean;
    
    // Actions
    setUser: (user: User | null) => void;
    setProfile: (profile: any | null) => void;
    setLoading: (loading: boolean) => void;
    toggleAuthModal: () => void;
    signOut: () => Promise<void>;
    initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    isLoading: true,
    authModalOpen: false,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),
    
    toggleAuthModal: () => set(state => ({ authModalOpen: !state.authModalOpen })),

    signOut: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, profile: null, isLoading: false });
    },

    initializeAuth: () => {
        // Get initial session
        (supabase.auth.getSession() as unknown as Promise<any>).then(({ data: { session } }: any) => {
            set({ user: session?.user ?? null });
            if (session?.user) {
                // Fetch profile
                (supabase.from('profiles').select('*').eq('id', session.user.id).single() as unknown as Promise<any>)
                    .then(({ data, error }: any) => {
                        if (error) console.error("Error fetching profile", error);
                        else set({ profile: data });
                    });
            }
            set({ isLoading: false });
        });

        // Listen for changes
        supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
            set({ user: session?.user ?? null });
            if (session?.user) {
                (supabase.from('profiles').select('*').eq('id', session.user.id).single() as unknown as Promise<any>)
                    .then(({ data, error }: any) => {
                        if (error) console.error("Error fetching profile", error);
                        else set({ profile: data });
                    });
            } else {
                set({ profile: null });
            }
        });
    }
}));
