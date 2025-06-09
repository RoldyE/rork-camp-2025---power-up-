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

// Initialize teams with zero points to avoid default values
const zeroPointTeams = initialTeams.map(team => ({
  ...team,
  points: 0,
  pointHistory: []
}));

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: zeroPointTeams,
      isLoading: false,
      lastUpdated: null,
      
      fetchTeams: async () => {
        try {
          set({ isLoading: true });
          
          try {
            const result = await trpcClient.teams.getTeams.query();
            
            if (!result || !result.teams) {
              console.error("Invalid response from server:", result);
              set({ isLoading: false });
              return;
            }
            
            // Always merge server data with local data to prevent data loss
            set((state) => {
              // Create a map of existing teams for quick lookup
              const existingTeamsMap = new Map(
                state.teams.map(team => [team.id, team])
              );
              
              // Add or update teams from the result
              result.teams.forEach(team => {
                const existingTeam = existingTeamsMap.get(team.id);
                
                // If the team exists locally and has a higher point count, keep the local data
                // This prevents points from being lost during sync
                if (existingTeam && existingTeam.points > team.points) {
                  existingTeamsMap.set(team.id, {
                    ...team,
                    points: existingTeam.points,
                    pointHistory: existingTeam.pointHistory || []
                  });
                } else {
                  existingTeamsMap.set(team.id, {
                    ...team,
                    pointHistory: team.pointHistory || []
                  });
                }
              });
              
              // Convert map back to array
              const updatedTeams = Array.from(existingTeamsMap.values());
              
              return { 
                teams: updatedTeams,
                lastUpdated: new Date(result.timestamp || Date.now()),
                isLoading: false
              };
            });
          } catch (error) {
            console.error("Error in TRPC call:", error);
            // Don't update state on error, just set loading to false
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
              lastUpdated: new Date(),
            };
          });
          
          // Then update on the server
          try {
            const result = await trpcClient.teams.updatePoints.mutate({
              teamId,
              points,
              reason
            });
            
            // Only update if server response is valid
            if (result && result.team) {
              set((state) => {
                const updatedTeams = state.teams.map((team) =>
                  team.id === teamId
                    ? { 
                        ...team,
                        points: Math.max(team.points, result.team.points), // Keep the higher point count
                        pointHistory: result.pointHistory || team.pointHistory
                      }
                    : team
                );
                
                return {
                  teams: updatedTeams,
                  isLoading: false,
                  lastUpdated: new Date(),
                };
              });
            } else {
              set({ isLoading: false });
            }
          } catch (serverError) {
            console.error("Server error adding points:", serverError);
            // Keep local changes even if server fails
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
              lastUpdated: new Date(),
            };
          });
          
          // Then update on the server
          try {
            await trpcClient.teams.resetPoints.mutate({});
          } catch (serverError) {
            console.error("Server error resetting points:", serverError);
            // Keep local changes even if server fails
          }
          
          set({ isLoading: false });
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
              lastUpdated: new Date(),
            };
          });
          
          // Then update on the server
          try {
            await trpcClient.teams.resetPoints.mutate({ teamId });
          } catch (serverError) {
            console.error("Server error resetting team points:", serverError);
            // Keep local changes even if server fails
          }
          
          set({ isLoading: false });
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