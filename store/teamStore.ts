import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Team, PointEntry } from "@/types";
import { teams as initialTeams } from "@/mocks/teams";
import { trpcClient } from "@/lib/trpc";

// Initialize teams with zero points instead of default values
const zeroPointTeams = initialTeams.map(team => ({
  ...team,
  points: 0,
  pointHistory: []
}));

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  lastUpdated: Date | null;
  addPoints: (teamId: string, points: number, reason: string) => Promise<void>;
  resetPoints: () => Promise<void>;
  resetTeamPoints: (teamId: string) => Promise<void>;
  getPointHistory: (teamId: string) => PointEntry[];
  fetchTeams: () => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: zeroPointTeams,
      isLoading: false,
      lastUpdated: null,
      
      fetchTeams: async () => {
        try {
          set({ isLoading: true });
          const result = await trpcClient.teams.getTeams.query();
          
          if (result && result.teams) {
            // Always use server data as source of truth for points
            const updatedTeams = result.teams.map(serverTeam => {
              // Find the local team to preserve any local data we want to keep
              const localTeam = get().teams.find(t => t.id === serverTeam.id);
              
              return {
                ...serverTeam,
                // Keep local team data that's not related to points
                name: serverTeam.name || localTeam?.name,
                color: serverTeam.color || localTeam?.color,
                logo: serverTeam.logo || localTeam?.logo,
                // Always use server points
                points: serverTeam.points,
                // Get point history from server if available
                pointHistory: result.pointHistory?.[serverTeam.id] || localTeam?.pointHistory || []
              };
            });
            
            set({ 
              teams: updatedTeams,
              lastUpdated: new Date(result.timestamp),
              isLoading: false
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching teams:", error);
          set({ isLoading: false });
        }
      },
      
      addPoints: async (teamId, points, reason) => {
        try {
          set({ isLoading: true });
          
          // Update on the server first
          try {
            const result = await trpcClient.teams.updatePoints.mutate({
              teamId,
              points,
              reason
            });
            
            // Fetch updated teams from server to ensure consistency
            await get().fetchTeams();
            
            set({ isLoading: false });
          } catch (serverError) {
            console.error("Server error adding points:", serverError);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error adding points:", error);
          set({ isLoading: false });
        }
      },
        
      resetPoints: async () => {
        try {
          set({ isLoading: true });
          
          // Update on the server first
          try {
            await trpcClient.teams.resetPoints.mutate({});
            
            // Fetch updated teams from server
            await get().fetchTeams();
            
            set({ isLoading: false });
          } catch (serverError) {
            console.error("Server error resetting points:", serverError);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error resetting points:", error);
          set({ isLoading: false });
        }
      },
        
      resetTeamPoints: async (teamId) => {
        try {
          set({ isLoading: true });
          
          // Update on the server first
          try {
            await trpcClient.teams.resetPoints.mutate({ teamId });
            
            // Fetch updated teams from server
            await get().fetchTeams();
            
            set({ isLoading: false });
          } catch (serverError) {
            console.error("Server error resetting team points:", serverError);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error resetting team points:", error);
          set({ isLoading: false });
        }
      },
        
      getPointHistory: (teamId) => {
        const team = get().teams.find(t => t.id === teamId);
        return team?.pointHistory || [];
      }
    }),
    {
      name: "team-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Don't persist teams locally - they come from server
        lastUpdated: state.lastUpdated
      }),
    }
  )
);