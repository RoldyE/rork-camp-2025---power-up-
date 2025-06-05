import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  facebookId?: string;
  isAdmin: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userProfile: null,
      login: (profile) =>
        set({
          isAuthenticated: true,
          userProfile: profile,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          userProfile: null,
        }),
      updateProfile: (profile) =>
        set((state) => ({
          userProfile: state.userProfile
            ? { ...state.userProfile, ...profile }
            : null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);