import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Nomination, NominationType } from "@/types";
import { nominations as initialNominations } from "@/mocks/nominations";
import { supabase } from "@/lib/supabaseClient";

interface UserVote {
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
}

interface NominationState {
  nominations: Nomination[];
  userVotes: UserVote[];
  addNomination: (nomination: Omit<Nomination, "id" | "votes">) => void;
  voteForNomination: (nominationId: string, userId: string) => void;
  deleteNomination: (nominationId: string) => void;
  resetVotes: (day: string, type: NominationType) => void;
  getCurrentDayNominations: (day: string, type: NominationType) => Nomination[];
  getWeeklyNominations: (type: NominationType) => Nomination[];
  getTopNominationsByType: (type: NominationType, limit?: number) => Nomination[];
  hasUserVoted: (userId: string, nominationType: NominationType) => boolean;
  getUserVoteCount: (userId: string, nominationType: NominationType, day: string) => number;
  recordUserVote: (userId: string, nominationType: NominationType, day: string) => void;
  resetUserVotes: () => void;
  syncWithSupabase: () => Promise<void>;
}

export const useNominationStore = create<NominationState>()(
  persist(
    (set, get) => ({
      nominations: initialNominations,
      userVotes: [],
      
      addNomination: async (nomination) => {
        const newId = Date.now().toString();
        const newNomination = {
          ...nomination,
          id: newId,
          votes: 0,
        };
        
        set((state) => ({
          nominations: [
            ...state.nominations,
            newNomination,
          ],
        }));
        
        // Try to add to Supabase
        try {
          supabase
            .from('nominations')
            .insert([{
              id: newId,
              camperid: nomination.camperId,
              reason: nomination.reason,
              votes: 0,
              day: nomination.day,
              type: nomination.type,
              created_at: new Date().toISOString()
            }])
            .then(({ error }) => {
              if (error) console.error('Error adding nomination to Supabase:', error);
            });
        } catch (error) {
          console.error('Failed to add nomination to Supabase:', error);
        }
      },
        
      voteForNomination: async (nominationId, userId) => {
        // Update locally
        set((state) => ({
          nominations: state.nominations.map((nom) =>
            nom.id === nominationId
              ? { ...nom, votes: nom.votes + 1 }
              : nom
          ),
        }));
        
        // Try to update in Supabase
        try {
          // First get the current nomination
          const nomination = get().nominations.find(nom => nom.id === nominationId);
          
          if (nomination) {
            supabase
              .from('nominations')
              .update({ votes: nomination.votes + 1 })
              .eq('id', nominationId)
              .then(({ error }) => {
                if (error) console.error('Error updating votes in Supabase:', error);
              });
            
            // Record the vote
            const voteId = Date.now().toString();
            supabase
              .from('user_votes')
              .insert([{
                id: voteId,
                userid: userId,
                nominationid: nominationId,
                nominationtype: nomination.type,
                day: nomination.day,
                timestamp: new Date().toISOString()
              }])
              .then(({ error }) => {
                if (error) console.error('Error recording vote in Supabase:', error);
              });
          }
        } catch (error) {
          console.error('Failed to update votes in Supabase:', error);
        }
      },
        
      deleteNomination: async (nominationId) => {
        set((state) => ({
          nominations: state.nominations.filter((nom) => nom.id !== nominationId),
        }));
        
        // Try to delete from Supabase
        try {
          supabase
            .from('nominations')
            .delete()
            .eq('id', nominationId)
            .then(({ error }) => {
              if (error) console.error('Error deleting nomination from Supabase:', error);
            });
        } catch (error) {
          console.error('Failed to delete nomination from Supabase:', error);
        }
      },
        
      resetVotes: async (day, type) => {
        set((state) => ({
          nominations: state.nominations.map((nom) =>
            nom.day === day && nom.type === type ? { ...nom, votes: 0 } : nom
          ),
        }));
        
        // Try to reset votes in Supabase
        try {
          supabase
            .from('nominations')
            .update({ votes: 0 })
            .eq('day', day)
            .eq('type', type)
            .then(({ error }) => {
              if (error) console.error('Error resetting votes in Supabase:', error);
            });
          
          // Also clear user votes for this type and day
          supabase
            .from('user_votes')
            .delete()
            .eq('day', day)
            .eq('nominationtype', type)
            .then(({ error }) => {
              if (error) console.error('Error clearing user votes in Supabase:', error);
            });
        } catch (error) {
          console.error('Failed to reset votes in Supabase:', error);
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
        const today = new Date().toLocaleDateString();
        
        // For daily nominations, check if user has voted 2 times for the current day
        if (nominationType === "daily") {
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
        
        const today = new Date().toLocaleDateString();
        return get().userVotes.filter(
          vote => vote.userId === userId && 
                 vote.nominationType === nominationType &&
                 (day === "today" 
                  ? new Date(vote.timestamp).toLocaleDateString() === today
                  : vote.day === day)
        ).length;
      },
      
      recordUserVote: async (userId, nominationType, day) => {
        const newVote = {
          userId,
          nominationType,
          day,
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          userVotes: [
            ...state.userVotes,
            newVote,
          ],
        }));
        
        // Try to record in Supabase
        try {
          const voteId = Date.now().toString();
          supabase
            .from('user_votes')
            .insert([{
              id: voteId,
              userid: userId,
              nominationtype: nominationType,
              day: day,
              timestamp: new Date().toISOString()
            }])
            .then(({ error }) => {
              if (error) console.error('Error recording user vote in Supabase:', error);
            });
        } catch (error) {
          console.error('Failed to record user vote in Supabase:', error);
        }
      },
        
      resetUserVotes: async () => {
        set({
          userVotes: [],
        });
        
        // Try to reset in Supabase
        try {
          supabase
            .from('user_votes')
            .delete()
            .gte('id', '0')
            .then(({ error }) => {
              if (error) console.error('Error resetting user votes in Supabase:', error);
            });
        } catch (error) {
          console.error('Failed to reset user votes in Supabase:', error);
        }
      },
      
      syncWithSupabase: async () => {
        try {
          // Fetch nominations
          const { data: nominationsData, error: nominationsError } = await supabase
            .from('nominations')
            .select('*');
            
          if (nominationsError) {
            console.error('Error fetching nominations from Supabase:', nominationsError);
            return;
          }
          
          // Fetch user votes
          const { data: votesData, error: votesError } = await supabase
            .from('user_votes')
            .select('*');
            
          if (votesError) {
            console.error('Error fetching user votes from Supabase:', votesError);
          }
          
          if (nominationsData && nominationsData.length > 0) {
            // Map the data to match our app's structure
            const mappedNominations = nominationsData.map(nom => ({
              id: nom.id.toString(),
              camperId: nom.camperid,
              reason: nom.reason,
              votes: nom.votes,
              day: nom.day,
              type: nom.type
            }));
            
            set({ nominations: mappedNominations });
          }
          
          if (votesData && votesData.length > 0) {
            // Map the data to match our app's structure
            const mappedVotes = votesData.map(vote => ({
              userId: vote.userid,
              nominationType: vote.nominationtype,
              day: vote.day,
              timestamp: vote.timestamp
            }));
            
            set({ userVotes: mappedVotes });
          }
        } catch (error) {
          console.error('Failed to sync with Supabase:', error);
        }
      }
    }),
    {
      name: "nomination-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);