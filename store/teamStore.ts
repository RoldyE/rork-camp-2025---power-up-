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
          
          // Update teams with server data
          set({ 
            teams: result.teams,
            lastUpdated: new Date(result.timestamp),
            isLoading: false
          });
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
          const result = await trpcClient.teams.updatePoints.mutate({
            teamId,
            points,
            reason
          });
          
          // Update the local team with the server data
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
          await trpcClient.teams.resetPoints.mutate({});
          
          // Refresh teams to ensure consistency
          await get().fetchTeams();
          
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
            };
          });
          
          // Then update on the server
          await trpcClient.teams.resetPoints.mutate({ teamId });
          
          // Refresh teams to ensure consistency
          await get().fetchTeams();
          
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