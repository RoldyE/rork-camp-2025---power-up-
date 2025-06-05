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
}

export const useNominationStore = create<NominationState>()(
  persist(
    (set, get) => ({
      nominations: initialNominations,
      userVotes: [],
      
      addNomination: (nomination) => {
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
      },
        
      voteForNomination: (nominationId, userId) => {
        // Update locally
        set((state) => ({
          nominations: state.nominations.map((nom) =>
            nom.id === nominationId
              ? { ...nom, votes: nom.votes + 1 }
              : nom
          ),
        }));
      },
        
      deleteNomination: (nominationId) => {
        set((state) => ({
          nominations: state.nominations.filter((nom) => nom.id !== nominationId),
        }));
      },
        
      resetVotes: (day, type) => {
        set((state) => ({
          nominations: state.nominations.map((nom) =>
            nom.day === day && nom.type === type ? { ...nom, votes: 0 } : nom
          ),
        }));
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