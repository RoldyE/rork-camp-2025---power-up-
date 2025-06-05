import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Nomination, NominationType } from "@/types";
import { nominations as initialNominations } from "@/mocks/nominations";
import { trpcClient } from "@/lib/trpc";

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
          const result = await trpcClient.nominations.getNominations.query({
            type,
            day
          });
          
          // If type and day are provided, only update those specific nominations
          if (type && day) {
            set((state) => {
              const updatedNominations = state.nominations.filter(
                nom => nom.type !== type || nom.day !== day
              );
              return {
                nominations: [...updatedNominations, ...result.nominations],
                lastUpdated: new Date(result.timestamp),
                isLoading: false
              };
            });
          } else if (type) {
            // If only type is provided, update all nominations of that type
            set((state) => {
              const updatedNominations = state.nominations.filter(
                nom => nom.type !== type
              );
              return {
                nominations: [...updatedNominations, ...result.nominations],
                lastUpdated: new Date(result.timestamp),
                isLoading: false
              };
            });
          } else {
            // If no filters, update all nominations
            set({ 
              nominations: result.nominations,
              lastUpdated: new Date(result.timestamp),
              isLoading: false
            });
          }
        } catch (error) {
          console.error("Error fetching nominations:", error);
          set({ isLoading: false });
        }
      },
      
      fetchUserVotes: async (userId, nominationType, day) => {
        try {
          set({ isLoading: true });
          const result = await trpcClient.nominations.getUserVotes.query({
            userId,
            nominationType,
            day
          });
          
          // Update user votes in the store
          set((state) => {
            // If type and day are provided, only update those specific votes
            if (nominationType && day) {
              const filteredVotes = state.userVotes.filter(
                vote => vote.nominationType !== nominationType || vote.day !== day
              );
              return {
                userVotes: [...filteredVotes, ...result.votes],
                isLoading: false
              };
            } else if (nominationType) {
              // If only type is provided, update all votes of that type
              const filteredVotes = state.userVotes.filter(
                vote => vote.nominationType !== nominationType
              );
              return {
                userVotes: [...filteredVotes, ...result.votes],
                isLoading: false
              };
            } else {
              // If no filters, update all votes for this user
              const filteredVotes = state.userVotes.filter(
                vote => vote.userId !== userId
              );
              return {
                userVotes: [...filteredVotes, ...result.votes],
                isLoading: false
              };
            }
          });
        } catch (error) {
          console.error("Error fetching user votes:", error);
          set({ isLoading: false });
        }
      },
      
      addNomination: async (nomination) => {
        try {
          set({ isLoading: true });
          
          // First add locally for immediate feedback
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
          
          // Then add on the server
          await trpcClient.nominations.addNomination.mutate({
            camperId: nomination.camperId,
            reason: nomination.reason,
            day: nomination.day,
            type: nomination.type,
          });
          
          // Refresh nominations to ensure consistency
          await get().fetchNominations(nomination.type, nomination.day);
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error adding nomination:", error);
          set({ isLoading: false });
          
          // Refresh nominations to ensure consistency even if there was an error
          await get().fetchNominations();
        }
      },
        
      voteForNomination: async (nominationId, userId, nominationType, day) => {
        try {
          set({ isLoading: true });
          
          // First update locally for immediate feedback
          set((state) => ({
            nominations: state.nominations.map((nom) =>
              nom.id === nominationId
                ? { ...nom, votes: nom.votes + 1 }
                : nom
            ),
          }));
          
          // Record the user vote locally
          set((state) => ({
            userVotes: [
              ...state.userVotes,
              {
                userId,
                nominationType,
                day,
                timestamp: new Date().toISOString(),
              },
            ],
          }));
          
          // Then update on the server
          await trpcClient.nominations.voteForNomination.mutate({
            nominationId,
            userId,
            nominationType,
            day,
          });
          
          // Refresh nominations to ensure consistency
          await get().fetchNominations(nominationType, day);
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error voting for nomination:", error);
          set({ isLoading: false });
          
          // Refresh nominations to ensure consistency even if there was an error
          await get().fetchNominations();
        }
      },
        
      deleteNomination: (nominationId) => {
        set((state) => ({
          nominations: state.nominations.filter((nom) => nom.id !== nominationId),
        }));
      },
        
      resetVotes: async (day, type) => {
        try {
          set({ isLoading: true });
          
          // First update locally for immediate feedback
          set((state) => ({
            nominations: state.nominations.map((nom) =>
              nom.day === day && nom.type === type ? { ...nom, votes: 0 } : nom
            ),
          }));
          
          // Then update on the server
          await trpcClient.nominations.resetVotes.mutate({
            day,
            type,
          });
          
          // Refresh nominations to ensure consistency
          await get().fetchNominations(type, day);
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error resetting votes:", error);
          set({ isLoading: false });
          
          // Refresh nominations to ensure consistency even if there was an error
          await get().fetchNominations();
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
        }));
      },
        
      resetUserVotes: () => {
        set({
          userVotes: [],
        });
      }
    }),
    {
      name: "nomination-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);