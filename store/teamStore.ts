import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Team, PointEntry } from "@/types";
import { teams as initialTeams } from "@/mocks/teams";
import { supabase } from "@/lib/supabase";

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
          
          // Fetch teams from Supabase
          const { data, error } = await supabase
            .from('teams')
            .select('*');
          
          if (error) {
            console.error("Error fetching teams from Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          if (data) {
            // Fetch points for each team
            const teamsWithPoints = await Promise.all(data.map(async (team) => {
              const { data: pointsData, error: pointsError } = await supabase
                .from('points')
                .select('points, reason, updated_at')
                .eq('team_id', team.id);
              
              if (pointsError) {
                console.error(`Error fetching points for team ${team.id}:`, pointsError);
                return { ...team, points: 0, pointHistory: [] };
              }
              
              const totalPoints = pointsData?.reduce((sum, entry) => sum + entry.points, 0) || 0;
              const pointHistory = pointsData?.map(entry => ({
                id: entry.updated_at,
                points: entry.points,
                reason: entry.reason || "No reason provided",
                date: entry.updated_at
              })) || [];
              
              return { ...team, points: totalPoints, pointHistory };
            }));
            
            set({
              teams: teamsWithPoints,
              lastUpdated: new Date(),
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
          
          // Add points to Supabase
          const { data, error } = await supabase
            .from('points')
            .insert([{ team_id: teamId, points, reason, updated_at: new Date().toISOString() }]);
          
          if (error) {
            console.error("Error adding points to Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          // Update local state
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
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error adding points:", error);
          set({ isLoading: false });
        }
      },
        
      resetPoints: async () => {
        try {
          set({ isLoading: true });
          
          // Delete all points from Supabase
          const { error } = await supabase
            .from('points')
            .delete()
            .neq('team_id', ''); // This ensures all records are deleted
          
          if (error) {
            console.error("Error resetting points in Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          // Update local state
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
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error resetting points:", error);
          set({ isLoading: false });
        }
      },
        
      resetTeamPoints: async (teamId) => {
        try {
          set({ isLoading: true });
          
          // Delete points for specific team from Supabase
          const { error } = await supabase
            .from('points')
            .delete()
            .eq('team_id', teamId);
          
          if (error) {
            console.error("Error resetting team points in Supabase:", error);
            set({ isLoading: false });
            return;
          }
          
          // Update local state
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