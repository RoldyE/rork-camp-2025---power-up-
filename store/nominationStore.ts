import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Nomination, NominationType } from "@/types";
import { nominations as initialNominations } from "@/mocks/nominations";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface UserVote {
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
}

interface NominationState {
  nominations: Nomination[];
  userVotes: UserVote[];
  isLoading: boolean;
  error: string | null;
  addNomination: (nomination: Omit<Nomination, "id" | "votes">) => Promise<void>;
  voteForNomination: (nominationId: string, userId: string) => Promise<void>;
  deleteNomination: (nominationId: string) => Promise<void>;
  resetVotes: (day: string, type: NominationType) => Promise<void>;
  getCurrentDayNominations: (day: string, type: NominationType) => Nomination[];
  getWeeklyNominations: (type: NominationType) => Nomination[];
  getTopNominationsByType: (type: NominationType, limit?: number) => Nomination[];
  hasUserVoted: (userId: string, nominationType: NominationType) => boolean;
  getUserVoteCount: (userId: string, nominationType: NominationType, day: string) => number;
  recordUserVote: (userId: string, nominationType: NominationType, day: string) => Promise<void>;
  resetUserVotes: () => Promise<void>;
  fetchNominations: () => Promise<void>;
  syncNominations: () => () => void;
}

export const useNominationStore = create<NominationState>()(
  persist(
    (set, get) => ({
      nominations: initialNominations,
      userVotes: [],
      isLoading: false,
      error: null,
      
      fetchNominations: async () => {
        set({ isLoading: true, error: null });
        try {
          // Skip Supabase fetch to avoid database errors
          // Just use the local nominations data
          set({ nominations: initialNominations });
        } catch (error: any) {
          console.error('Error fetching nominations:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      syncNominations: () => {
        // Return a no-op cleanup function since we're not using Supabase real-time
        return () => {};
      },
      
      addNomination: async (nomination) => {
        try {
          const newNomination = {
            ...nomination,
            id: Date.now().toString(),
            votes: 0,
          };
          
          // Update local state only
          set((state) => ({
            nominations: [
              ...state.nominations,
              newNomination,
            ],
          }));
        } catch (error: any) {
          console.error('Error adding nomination:', error.message);
          set({ error: error.message });
        }
      },
        
      voteForNomination: async (nominationId, userId) => {
        try {
          // Update local state only
          set((state) => ({
            nominations: state.nominations.map((nom) =>
              nom.id === nominationId
                ? { ...nom, votes: nom.votes + 1 }
                : nom
            ),
          }));
        } catch (error: any) {
          console.error('Error voting for nomination:', error.message);
          set({ error: error.message });
        }
      },
        
      deleteNomination: async (nominationId) => {
        try {
          // Update local state only
          set((state) => ({
            nominations: state.nominations.filter((nom) => nom.id !== nominationId),
          }));
        } catch (error: any) {
          console.error('Error deleting nomination:', error.message);
          set({ error: error.message });
        }
      },
        
      resetVotes: async (day, type) => {
        try {
          // Update local state only
          set((state) => ({
            nominations: state.nominations.map((nom) =>
              nom.day === day && nom.type === type ? { ...nom, votes: 0 } : nom
            ),
          }));
        } catch (error: any) {
          console.error('Error resetting votes:', error.message);
          set({ error: error.message });
        }
      },
        
      getCurrentDayNominations: (day, type) => {
        return get().nominations.filter((nom) => nom.day === day && nom.type === type);
      },
      
      getWeeklyNominations: (type) => {
        return get().nominations.filter((nom) => nom.type === type);
      },
      
      getTopNominationsByType: (type, limit = 3) => {
        return [...get().nominations]
          .filter((nom) => nom.type === type)
          .sort((a, b) => b.votes - a.votes)
          .slice(0, limit);
      },
      
      hasUserVoted: (userId, nominationType) => {
        // For daily nominations, check if user has voted 2 times for the current day
        if (nominationType === "daily") {
          const today = new Date().toLocaleDateString();
          const dailyVotes = get().userVotes.filter(
            vote => vote.userId === userId && 
                   vote.nominationType === nominationType &&
                   new Date(vote.timestamp).toLocaleDateString() === today
          );
          return dailyVotes.length >= 2;
        }
        
        // For other nomination types, check if user has voted 2 times total
        const typeVotes = get().userVotes.filter(
          vote => vote.userId === userId && vote.nominationType === nominationType
        );
        return typeVotes.length >= 2;
      },
      
      getUserVoteCount: (userId, nominationType, day) => {
        if (day === "all") {
          return get().userVotes.filter(
            vote => vote.userId === userId && vote.nominationType === nominationType
          ).length;
        }
        
        return get().userVotes.filter(
          vote => vote.userId === userId && 
                 vote.nominationType === nominationType &&
                 vote.day === day
        ).length;
      },
      
      recordUserVote: async (userId, nominationType, day) => {
        try {
          const newVote = {
            userId,
            nominationType,
            day,
            timestamp: new Date().toISOString(),
          };
          
          // Update local state only
          set((state) => ({
            userVotes: [
              ...state.userVotes,
              newVote,
            ],
          }));
        } catch (error: any) {
          console.error('Error recording user vote:', error.message);
          set({ error: error.message });
        }
      },
        
      resetUserVotes: async () => {
        try {
          // Update local state only
          set({ userVotes: [] });
        } catch (error: any) {
          console.error('Error resetting user votes:', error.message);
          set({ error: error.message });
        }
      },
    }),
    {
      name: "nomination-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook to initialize and sync with Supabase
export const useNominationSync = () => {
  const { fetchNominations } = useNominationStore();

  useEffect(() => {
    // Initial fetch
    fetchNominations();
    
    // No real-time sync needed since we're not using Supabase
    return () => {};
  }, [fetchNominations]);
};