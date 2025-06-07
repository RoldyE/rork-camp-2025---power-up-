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
  user: UserProfile | null; // Add alias for backward compatibility
  login: (profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userProfile: null,
      user: null, // Add alias for backward compatibility
      login: (profile) =>
        set({
          isAuthenticated: true,
          userProfile: profile,
          user: profile, // Update both properties
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          userProfile: null,
          user: null, // Update both properties
        }),
      updateProfile: (profile) =>
        set((state) => {
          const updatedProfile = state.userProfile
            ? { ...state.userProfile, ...profile }
            : null;
          return {
            userProfile: updatedProfile,
            user: updatedProfile, // Update both properties
          };
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);