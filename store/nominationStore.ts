import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Nomination, NominationType } from "@/types";
import { nominations as initialNominations } from "@/mocks/nominations";
import { supabase } from "@/lib/supabase";

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
  lastUpdated: Date | null;
  addNomination: (nomination: Omit<Nomination, "id" | "votes">) => Promise<void>;
  voteForNomination: (nominationId: string, userId: string, nominationType: NominationType, day: string) => Promise<void>;
  deleteNomination: (nominationId: string) => void;
  resetVotes: (day: string, type: NominationType) => Promise<void>;
  fetchNominations: (type?: NominationType, day?: string) => Promise<void>;
  fetchUserVotes: (userId: string, nominationType?: NominationType, day?: string) => Promise<void>;
  getCurrentDayNominations: (day: string, type: NominationType) => Nomination[];
  getWeeklyNominations: (type: NominationType) => Nomination[];
  getTopNominationsByType: (type: NominationType, limit?: number) => Nomination[];
  hasUserVoted: (userId: string, nominationType: NominationType) => boolean;
  getUserVoteCount: (userId: string, nominationType: NominationType, day: string) => number;
  recordUserVote: (userId: string, nominationType: NominationType, day: string) => void;
  resetUserVotes: () => void;
}

export const useNominationStore = create<NominationState>()(
  persist(
    (set, get) => ({
      nominations: initialNominations,
      userVotes: [],
      isLoading: false,
      lastUpdated: null,
      
      fetchNominations: async (type, day) => {
        try {
          set({ isLoading: true });
          
          // Build the query to fetch nominations from Supabase
          let query = supabase.from('nominations').select('*');
          
          if (type) {
            query = query.eq('category', type);
          }
          
          if (day) {
            query = query.eq('day', day);
          }
          
          const { data, error } = await query;
          
          if (error) {
            console.error("Error fetching nominations from Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          if (data) {
            set({
              nominations: data.map(nom => ({
                id: nom.nomination_id,
                camperId: nom.camper_id,
                reason: nom.reason || "",
                day: nom.day,
                type: nom.category as NominationType,
                votes: nom.votes || 0
              })),
              lastUpdated: new Date(),
              isLoading: false
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching nominations:", error);
          set({ isLoading: false });
        }
      },
      
      fetchUserVotes: async (userId, nominationType, day) => {
        try {
          set({ isLoading: true });
          
          // Build the query to fetch user votes from Supabase
          let query = supabase.from('user_votes').select('*').eq('user_id', userId);
          
          if (nominationType) {
            query = query.eq('nomination_type', nominationType);
          }
          
          if (day) {
            query = query.eq('day', day);
          }
          
          const { data, error } = await query;
          
          if (error) {
            console.error("Error fetching user votes from Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          if (data) {
            set({
              userVotes: data.map(vote => ({
                userId: vote.user_id,
                nominationType: vote.nomination_type as NominationType,
                day: vote.day,
                timestamp: vote.timestamp
              })),
              isLoading: false
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching user votes:", error);
          set({ isLoading: false });
        }
      },
      
      addNomination: async (nomination) => {
        try {
          set({ isLoading: true });
          
          // Add nomination to Supabase
          const { data, error } = await supabase
            .from('nominations')
            .insert([{
              camper_id: nomination.camperId,
              camper_name: nomination.camperName || "Unknown",
              reason: nomination.reason,
              day: nomination.day,
              category: nomination.type,
              votes: 0
            }])
            .select();
          
          if (error) {
            console.error("Error adding nomination to Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          if (data && data.length > 0) {
            const newNomination = {
              id: data[0].nomination_id,
              camperId: data[0].camper_id,
              camperName: data[0].camper_name,
              reason: data[0].reason || "",
              day: data[0].day,
              type: data[0].category as NominationType,
              votes: data[0].votes || 0
            };
            
            set((state) => ({
              nominations: [...state.nominations, newNomination],
              lastUpdated: new Date(),
            }));
          }
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error adding nomination:", error);
          set({ isLoading: false });
        }
      },
        
      voteForNomination: async (nominationId, userId, nominationType, day) => {
        try {
          set({ isLoading: true });
          
          // Update vote count in Supabase
          const { data: nominationData, error } = await supabase
            .from('nominations')
            .select('votes')
            .eq('nomination_id', nominationId)
            .single();
          
          if (error) {
            console.error("Error fetching nomination votes from Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          const newVotes = (nominationData?.votes || 0) + 1;
          
          const { error: updateError } = await supabase
            .from('nominations')
            .update({ votes: newVotes })
            .eq('nomination_id', nominationId);
          
          if (updateError) {
            console.error("Error updating nomination votes in Supabase:", updateError);
            set({ isLoading: false });
            return;
          }
          
          // Record user vote in Supabase
          const { error: voteError } = await supabase
            .from('user_votes')
            .insert([{
              user_id: userId,
              nomination_id: nominationId,
              nomination_type: nominationType,
              day: day,
              timestamp: new Date().toISOString()
            }]);
          
          if (voteError) {
            console.error("Error recording user vote in Supabase:", voteError);
            set({ isLoading: false });
            return;
          }
          
          // Update local state
          set((state) => ({
            nominations: state.nominations.map((nom) =>
              nom.id === nominationId
                ? { ...nom, votes: nom.votes + 1 }
                : nom
            ),
            userVotes: [
              ...state.userVotes,
              {
                userId,
                nominationType,
                day,
                timestamp: new Date().toISOString(),
              },
            ],
            lastUpdated: new Date(),
          }));
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error voting for nomination:", error);
          set({ isLoading: false });
        }
      },
        
      deleteNomination: (nominationId) => {
        set((state) => ({
          nominations: state.nominations.filter((nom) => nom.id !== nominationId),
          lastUpdated: new Date(),
        }));
      },
        
      resetVotes: async (day, type) => {
        try {
          set({ isLoading: true });
          
          // Reset votes in Supabase
          const { error } = await supabase
            .from('nominations')
            .update({ votes: 0 })
            .eq('day', day)
            .eq('category', type);
          
          if (error) {
            console.error("Error resetting votes in Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          // Delete user votes for this day and type from Supabase
          const { error: voteError } = await supabase
            .from('user_votes')
            .delete()
            .eq('day', day)
            .eq('nomination_type', type);
          
          if (voteError) {
            console.error("Error resetting user votes in Supabase:", voteError);
            set({ isLoading: false });
            return;
          }
          
          // Update local state
          set((state) => ({
            nominations: state.nominations.map((nom) =>
              nom.day === day && nom.type === type ? { ...nom, votes: 0 } : nom
            ),
            userVotes: state.userVotes.filter(
              vote => !(vote.day === day && vote.nominationType === type)
            ),
            lastUpdated: new Date(),
          }));
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error resetting votes:", error);
          set({ isLoading: false });
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
        
        if (nominationType === "daily") {
          const dailyVotes = get().userVotes.filter(
            vote => vote.userId === userId && 
                   vote.nominationType === nominationType &&
                   new Date(vote.timestamp).toLocaleDateString() === today
          );
          return dailyVotes.length >= 2;
        }
        
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
      
      recordUserVote: (userId, nominationType, day) => {
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
          lastUpdated: new Date(),
        }));
      },
        
      resetUserVotes: () => {
        set({
          userVotes: [],
          lastUpdated: new Date(),
        });
      }
    }),
    {
      name: "nomination-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        nominations: state.nominations,
        userVotes: state.userVotes,
        lastUpdated: state.lastUpdated
      }),
    }
  )
);