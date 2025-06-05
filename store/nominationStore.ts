import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Nomination, NominationType } from "@/types";
import { nominations as initialNominations } from "@/mocks/nominations";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

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
  addNomination: (nomination: Omit<Nomination, "id" | "votes">) => void;
  voteForNomination: (nominationId: string) => void;
  deleteNomination: (nominationId: string) => void;
  resetVotes: (day: string, type: NominationType) => void;
  getCurrentDayNominations: (day: string, type: NominationType) => Nomination[];
  getWeeklyNominations: (type: NominationType) => Nomination[];
  getTopNominationsByType: (type: NominationType, limit?: number) => Nomination[];
  hasUserVoted: (userId: string, nominationType: NominationType, day: string) => boolean;
  getUserVoteCount: (userId: string, nominationType: NominationType, day: string) => number;
  recordUserVote: (userId: string, nominationType: NominationType, day: string) => void;
  resetUserVotes: () => void;
  fetchNominations: () => Promise<void>;
  syncNominations: () => void;
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
          // Fetch nominations from Supabase
          const { data: nominationsData, error: nominationsError } = await supabase
            .from('nominations')
            .select('*');

          if (nominationsError) throw nominationsError;

          if (nominationsData && nominationsData.length > 0) {
            set({ nominations: nominationsData });
          } else {
            // If no nominations in database, initialize with local data
            await get().syncNominations();
          }

          // Fetch user votes
          const { data: votesData, error: votesError } = await supabase
            .from('user_votes')
            .select('*');

          if (votesError) throw votesError;

          if (votesData) {
            set({ userVotes: votesData });
          }
        } catch (error) {
          console.error('Error fetching nominations:', error);
          set({ error: 'Failed to fetch nominations' });
        } finally {
          set({ isLoading: false });
        }
      },

      syncNominations: async () => {
        try {
          // Initialize nominations in Supabase if they don't exist
          const { data, error } = await supabase
            .from('nominations')
            .select('id');

          if (error) throw error;

          if (!data || data.length === 0) {
            // Insert initial nominations
            const { error: insertError } = await supabase
              .from('nominations')
              .insert(initialNominations);

            if (insertError) throw insertError;
          }
        } catch (error) {
          console.error('Error syncing nominations:', error);
          Alert.alert('Error', 'Failed to sync nominations with the server');
        }
      },
      
      addNomination: async (nomination) => {
        const newNomination = {
          ...nomination,
          id: Date.now().toString(),
          votes: 0,
        };
        
        // Update local state first
        set((state) => ({
          nominations: [
            ...state.nominations,
            newNomination,
          ],
        }));

        // Then update Supabase
        try {
          const { error } = await supabase
            .from('nominations')
            .insert(newNomination);

          if (error) throw error;
        } catch (error) {
          console.error('Error adding nomination:', error);
          Alert.alert('Error', 'Failed to save nomination to the server');
        }
      },
        
      voteForNomination: async (nominationId) => {
        // Update local state first
        set((state) => ({
          nominations: state.nominations.map((nom) =>
            nom.id === nominationId
              ? { ...nom, votes: nom.votes + 1 }
              : nom
          ),
        }));

        // Then update Supabase
        try {
          const nomination = get().nominations.find(nom => nom.id === nominationId);
          if (!nomination) return;

          const { error } = await supabase
            .from('nominations')
            .update({ votes: nomination.votes })
            .eq('id', nominationId);

          if (error) throw error;
        } catch (error) {
          console.error('Error voting for nomination:', error);
          Alert.alert('Error', 'Failed to save vote to the server');
        }
      },
        
      deleteNomination: async (nominationId) => {
        // Update local state first
        set((state) => ({
          nominations: state.nominations.filter((nom) => nom.id !== nominationId),
        }));

        // Then update Supabase
        try {
          const { error } = await supabase
            .from('nominations')
            .delete()
            .eq('id', nominationId);

          if (error) throw error;
        } catch (error) {
          console.error('Error deleting nomination:', error);
          Alert.alert('Error', 'Failed to delete nomination from the server');
        }
      },
        
      resetVotes: async (day, type) => {
        // Update local state first
        set((state) => ({
          nominations: state.nominations.map((nom) =>
            nom.day === day && nom.type === type ? { ...nom, votes: 0 } : nom
          ),
        }));

        // Then update Supabase
        try {
          const { error } = await supabase
            .from('nominations')
            .update({ votes: 0 })
            .eq('day', day)
            .eq('type', type);

          if (error) throw error;
        } catch (error) {
          console.error('Error resetting votes:', error);
          Alert.alert('Error', 'Failed to reset votes on the server');
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
      
      hasUserVoted: (userId, nominationType, day) => {
        // For daily nominations, check if user has voted 2 times for the current day
        if (nominationType === "daily") {
          const dailyVotes = get().userVotes.filter(
            vote => vote.userId === userId && 
                   vote.nominationType === nominationType &&
                   vote.day === day
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
        const newVote = {
          userId,
          nominationType,
          day,
          timestamp: new Date().toISOString(),
        };

        // Update local state first
        set((state) => ({
          userVotes: [
            ...state.userVotes,
            newVote,
          ],
        }));

        // Then update Supabase
        try {
          const { error } = await supabase
            .from('user_votes')
            .insert(newVote);

          if (error) throw error;
        } catch (error) {
          console.error('Error recording user vote:', error);
          Alert.alert('Error', 'Failed to save vote record to the server');
        }
      },
        
      resetUserVotes: async () => {
        // Update local state first
        set({ userVotes: [] });

        // Then update Supabase
        try {
          const { error } = await supabase
            .from('user_votes')
            .delete()
            .neq('userId', '0'); // Delete all user votes

          if (error) throw error;
        } catch (error) {
          console.error('Error resetting user votes:', error);
          Alert.alert('Error', 'Failed to reset user votes on the server');
        }
      },
    }),
    {
      name: "nomination-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);