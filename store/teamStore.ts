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
              const localTeam = get().teams.find(t => t.id === serverTeam.id);
              return {
                ...serverTeam,
                // Keep local point history if it exists and merge with any new entries
                pointHistory: localTeam?.pointHistory || []
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
            
            // Only update local state if server update was successful
            if (result && result.team) {
              set((state) => {
                const updatedTeams = state.teams.map((team) =>
                  team.id === teamId
                    ? { 
                        ...team,
                        points: result.team.points, // Use server points
                        pointHistory: [
                          ...(team.pointHistory || []),
                          {
                            id: Date.now().toString(),
                            points,
                            reason,
                            date: new Date().toISOString()
                          }
                        ]
                      }
                    : team
                );
                
                return {
                  teams: updatedTeams,
                  isLoading: false
                };
              });
            } else {
              set({ isLoading: false });
            }
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
            
            // Update local state after server update
            set((state) => {
              const resetTeams = state.teams.map((team) => ({ 
                ...team, 
                points: 0,
                pointHistory: [] 
              }));
              
              return {
                teams: resetTeams,
                isLoading: false
              };
            });
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
            
            // Update local state after server update
            set((state) => {
              const updatedTeams = state.teams.map((team) => 
                team.id === teamId 
                  ? { ...team, points: 0, pointHistory: [] } 
                  : team
              );
              
              return {
                teams: updatedTeams,
                isLoading: false
              };
            });
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
        // Persist teams to prevent resetting to default values
        teams: state.teams,
        lastUpdated: state.lastUpdated
      }),
    }
  )
);