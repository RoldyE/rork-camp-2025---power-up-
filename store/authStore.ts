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
  syncUserProfile: (userId: string) => void;
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
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') {
              // Record not found, will be created on login
              return;
            }
            throw error;
          }
          
          if (data) {
            set({ 
              userProfile: data as UserProfile,
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
        
        const subscription = supabase
          .channel(`user-profile-${userId}`)
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'user_profiles',
              filter: `id=eq.${userId}`
            }, 
            async () => {
              // Refresh user profile when there's a change
              await get().fetchUserProfile(userId);
            }
          )
          .subscribe();

        // Return unsubscribe function
        return () => {
          subscription.unsubscribe();
        };
      },
      
      login: async (profile) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if user exists
          const { data, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', profile.id)
            .single();
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
          }
          
          if (!data) {
            // User doesn't exist, create new profile
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert(profile);
            
            if (insertError) throw insertError;
          } else {
            // User exists, update last login time
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ lastLoginAt: new Date().toISOString() })
              .eq('id', profile.id);
            
            if (updateError) throw updateError;
          }
          
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
          
          // No need to update Supabase for logout
          
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
          
          // Update local state
          set((state) => ({
            userProfile: state.userProfile
              ? { ...state.userProfile, ...profile }
              : null,
          }));
          
          // Update in Supabase
          if (get().userProfile) {
            const { error } = await supabase
              .from('user_profiles')
              .update(profile)
              .eq('id', get().userProfile!.id);
            
            if (error) throw error;
          }
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
  const { userProfile, fetchUserProfile, syncUserProfile } = useAuthStore();

  useEffect(() => {
    if (userProfile?.id) {
      // Initial fetch
      fetchUserProfile(userProfile.id);

      // Set up real-time sync
      const unsubscribe = syncUserProfile(userProfile.id);

      // Cleanup subscription on unmount
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [userProfile?.id, fetchUserProfile, syncUserProfile]);
};