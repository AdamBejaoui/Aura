import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin';
};

type AuthState = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
};

// Configure axios interceptor to add token to requests
const configureAxios = (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                configureAxios(token);
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                configureAxios(null);
                set({ user: null, token: null, isAuthenticated: false });
            },
            checkAuth: async () => {
                const { token } = get();
                if (!token) return;

                try {
                    configureAxios(token);
                    const response = await axios.get('/api/auth/me');
                    set({ user: response.data, isAuthenticated: true });
                } catch (error) {
                    // Token invalid or expired
                    get().logout();
                }
            },
        }),
        {
            name: 'aura-auth',
            onRehydrateStorage: () => (state) => {
                // Re-configure axios when store rehydrates
                if (state?.token) {
                    configureAxios(state.token);
                }
            },
        }
    )
);
