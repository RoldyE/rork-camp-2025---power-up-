import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Nomination, NominationType } from "@/types";
import { nominations as initialNominations } from "@/mocks/nominations";

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
  voteForNomination: (nominationId: string) => void;
  deleteNomination: (nominationId: string) => void;
  resetVotes: (day: string, type: NominationType) => void;
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
      
      addNomination: (nomination) =>
        set((state) => {
          const newNomination = {
            ...nomination,
            id: Date.now().toString(),
            votes: 0,
          };
          
          return {
            nominations: [
              ...state.nominations,
              newNomination,
            ],
          };
        }),
        
      voteForNomination: (nominationId) =>
        set((state) => ({
          nominations: state.nominations.map((nom) =>
            nom.id === nominationId
              ? { ...nom, votes: nom.votes + 1 }
              : nom
          ),
        })),
        
      deleteNomination: (nominationId) =>
        set((state) => ({
          nominations: state.nominations.filter((nom) => nom.id !== nominationId),
        })),
        
      resetVotes: (day, type) =>
        set((state) => ({
          nominations: state.nominations.map((nom) =>
            nom.day === day && nom.type === type ? { ...nom, votes: 0 } : nom
          ),
        })),
        
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
      
      recordUserVote: (userId, nominationType, day) =>
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
        })),
        
      resetUserVotes: () =>
        set({
          userVotes: [],
        }),
    }),
    {
      name: "nomination-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);