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
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      
      logout: () => {
        // Clear state
        set({ user: null, token: null });
        // Optional: Clear SecureStore token if you used it separately
        // SecureStore.deleteItemAsync('userToken'); 
      },
    }),
    {
      name: 'fluxdevs-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);