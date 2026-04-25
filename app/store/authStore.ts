import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * 1. Define the Auth Store Interface
 * This ensures 'token', 'user', and 'setToken' are recognized globally.
 */
interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  [key: string]: any; // Allows for other profile fields
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean; // Tracks if storage has been loaded
  setAuth: (user: AuthUser, token: string) => void;
  setToken: (token: string) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

/**
 * 2. Create the Store with Persistence
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false, // Initial state

      setAuth: (user, token) => set({ user, token }),
      
      setToken: (token) => set({ token }),

      setHasHydrated: (state) => set({ isHydrated: state }),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "bliss-auth-storage",
      // FIX: 'getStorage' is deprecated. Use 'storage' with 'createJSONStorage'
      storage: createJSONStorage(() => AsyncStorage),
      
      // Essential: Set hydration status when storage is loaded
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);