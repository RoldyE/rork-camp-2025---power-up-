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
          
          // Only update if we have data from the server
          if (result && result.nominations) {
            // Update nominations based on type and day
            set((state) => {
              let updatedNominations = [...state.nominations];
              
              if (type && day) {
                // If both type and day are specified, replace only nominations of that type and day
                updatedNominations = updatedNominations.filter(
                  nom => !(nom.type === type && nom.day === day)
                );
                // Add the fetched nominations
                updatedNominations = [...updatedNominations, ...result.nominations];
              } else if (type) {
                // If only type is specified, replace only nominations of that type
                updatedNominations = updatedNominations.filter(
                  nom => nom.type !== type
                );
                // Add the fetched nominations
                updatedNominations = [...updatedNominations, ...result.nominations];
              } else if (day) {
                // If only day is specified, replace only nominations of that day
                updatedNominations = updatedNominations.filter(
                  nom => nom.day !== day
                );
                // Add the fetched nominations
                updatedNominations = [...updatedNominations, ...result.nominations];
              } else {
                // If neither is specified, merge with existing nominations by ID
                const existingIds = new Set(updatedNominations.map(nom => nom.id));
                const newNominations = result.nominations.filter(nom => !existingIds.has(nom.id));
                updatedNominations = [...updatedNominations, ...newNominations];
              }
              
              return {
                nominations: updatedNominations,
                lastUpdated: new Date(result.timestamp),
                isLoading: false
              };
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
          const result = await trpcClient.nominations.getUserVotes.query({
            userId,
            nominationType,
            day
          });
          
          // Update user votes in the store
          if (result && result.votes) {
            set((state) => {
              // Create a map of existing votes for quick lookup
              const existingVotesMap = new Map(
                state.userVotes.map(vote => [
                  `${vote.userId}-${vote.nominationType}-${vote.day}-${vote.timestamp}`,
                  vote
                ])
              );
              
              // Add new votes from the result
              result.votes.forEach(vote => {
                existingVotesMap.set(
                  `${vote.userId}-${vote.nominationType}-${vote.day}-${vote.timestamp}`,
                  vote
                );
              });
              
              return {
                userVotes: Array.from(existingVotesMap.values()),
                isLoading: false
              };
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
          try {
            const result = await trpcClient.nominations.addNomination.mutate({
              camperId: nomination.camperId,
              reason: nomination.reason,
              day: nomination.day,
              type: nomination.type,
            });
            
            // Update the local nomination with the server-generated one
            if (result && result.nomination) {
              set((state) => ({
                nominations: state.nominations.map(nom => 
                  nom.id === newId ? result.nomination : nom
                ),
                isLoading: false
              }));
            } else {
              set({ isLoading: false });
            }
          } catch (serverError) {
            console.error("Server error adding nomination:", serverError);
            // Keep the local changes even if server fails
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error adding nomination:", error);
          set({ isLoading: false });
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
          
          // Then update on the server
          try {
            await trpcClient.nominations.voteForNomination.mutate({
              nominationId,
              userId,
              nominationType,
              day,
            });
            
            set({ isLoading: false });
          } catch (serverError) {
            console.error("Server error voting for nomination:", serverError);
            // Keep the local changes even if server fails
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error voting for nomination:", error);
          set({ isLoading: false });
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
            // Also filter out user votes for this day and type
            userVotes: state.userVotes.filter(
              vote => !(vote.day === day && vote.nominationType === type)
            )
          }));
          
          // Then update on the server
          try {
            await trpcClient.nominations.resetVotes.mutate({
              day,
              type,
            });
            
            set({ isLoading: false });
          } catch (serverError) {
            console.error("Server error resetting votes:", serverError);
            // Keep the local changes even if server fails
            set({ isLoading: false });
          }
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
      partialize: (state) => ({
        // Persist both nominations and user votes
        nominations: state.nominations,
        userVotes: state.userVotes,
        lastUpdated: state.lastUpdated
      }),
    }
  )
);