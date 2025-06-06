import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Team, PointEntry } from "@/types";
import { teams as initialTeams } from "@/mocks/teams";
import { trpcClient } from "@/lib/trpc";

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
      teams: initialTeams.map(team => ({
        ...team,
        pointHistory: []
      })),
      isLoading: false,
      lastUpdated: null,
      
      fetchTeams: async () => {
        try {
          set({ isLoading: true });
          const result = await trpcClient.teams.getTeams.query();
          
          // Only update if we have data from the server
          if (result && result.teams && result.teams.length > 0) {
            // Merge server data with local data to preserve point history
            const updatedTeams = result.teams.map(serverTeam => {
              const localTeam = get().teams.find(t => t.id === serverTeam.id);
              return {
                ...serverTeam,
                // Keep local point history if it exists
                pointHistory: localTeam?.pointHistory || []
              };
            });
            
            set({ 
              teams: updatedTeams,
              lastUpdated: new Date(result.timestamp),
              isLoading: false
            });
          } else {
            // If no server data, just stop loading
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
          
          // First update locally for immediate feedback
          set((state) => {
            const updatedTeams = state.teams.map((team) =>
              team.id === teamId
                ? { 
                    ...team, 
                    points: team.points + points,
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
            };
          });
          
          // Then update on the server
          try {
            const result = await trpcClient.teams.updatePoints.mutate({
              teamId,
              points,
              reason
            });
            
            // Update the local team with the server data
            if (result && result.team) {
              set((state) => {
                const updatedTeams = state.teams.map((team) =>
                  team.id === teamId
                    ? { 
                        ...team,
                        points: result.team.points,
                        pointHistory: result.pointHistory || team.pointHistory
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
            // Keep the local changes even if server fails
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
          
          // First update locally for immediate feedback
          set((state) => {
            const resetTeams = state.teams.map((team) => ({ 
              ...team, 
              points: 0,
              pointHistory: [] 
            }));
            
            return {
              teams: resetTeams,
            };
          });
          
          // Then update on the server
          try {
            await trpcClient.teams.resetPoints.mutate({});
            
            // No need to refresh teams here, we've already reset locally
            set({ isLoading: false });
          } catch (serverError) {
            console.error("Server error resetting points:", serverError);
            // Keep the local changes even if server fails
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
          
          // First update locally for immediate feedback
          set((state) => {
            const updatedTeams = state.teams.map((team) => 
              team.id === teamId 
                ? { ...team, points: 0, pointHistory: [] } 
                : team
            );
            
            return {
              teams: updatedTeams,
            };
          });
          
          // Then update on the server
          try {
            await trpcClient.teams.resetPoints.mutate({ teamId });
            
            // No need to refresh teams here, we've already reset locally
            set({ isLoading: false });
          } catch (serverError) {
            console.error("Server error resetting team points:", serverError);
            // Keep the local changes even if server fails
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