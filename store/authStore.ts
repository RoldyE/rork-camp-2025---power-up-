import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

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
  isLoading: boolean;
  error: string | null;
  login: (profile: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
  syncUserProfile: (userId: string) => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userProfile: null,
      isLoading: false,
      error: null,
      
      fetchUserProfile: async (userId) => {
        if (!userId) return;
        
        set({ isLoading: true, error: null });
        try {
          // Skip Supabase fetch to avoid database errors
          // Just use the local profile data
          const profile = get().userProfile;
          if (profile && profile.id === userId) {
            set({ 
              userProfile: profile,
              isAuthenticated: true
            });
          }
        } catch (error: any) {
          console.error('Error fetching user profile:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      syncUserProfile: (userId) => {
        if (!userId) return () => {};
        
        // Return a no-op cleanup function
        return () => {};
      },
      
      login: async (profile) => {
        try {
          set({ isLoading: true, error: null });
          
          // Skip Supabase operations to avoid database errors
          // Just set the local state
          set({
            isAuthenticated: true,
            userProfile: profile,
          });
        } catch (error: any) {
          console.error('Error during login:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          set({
            isAuthenticated: false,
            userProfile: null,
          });
        } catch (error: any) {
          console.error('Error during logout:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateProfile: async (profile) => {
        try {
          set({ isLoading: true, error: null });
          
          // Update local state only
          set((state) => ({
            userProfile: state.userProfile
              ? { ...state.userProfile, ...profile }
              : null,
          }));
        } catch (error: any) {
          console.error('Error updating profile:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook to initialize and sync user profile
export const useAuthSync = () => {
  const { userProfile, fetchUserProfile } = useAuthStore();

  useEffect(() => {
    if (userProfile?.id) {
      // Initial fetch
      fetchUserProfile(userProfile.id);
    }
    
    // No real-time sync needed since we're not using Supabase
    return () => {};
  }, [userProfile?.id, fetchUserProfile]);
};