
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  username: string | null;
  role: string;
  tenant_name: string | null;
  tenant_industry: string | null;
}

interface UserState {
  user: User | null;
  token: string | null;
  hasHydrated: boolean; // NEW: Track if store has hydrated
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setHasHydrated: (state: boolean) => void; // NEW
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasHydrated: false, // Default to false
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      
      setHasHydrated: (state) => set({ hasHydrated: state }), // NEW
      
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'fluxdevs-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // This runs AFTER rehydration
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);