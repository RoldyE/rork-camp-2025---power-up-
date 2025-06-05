import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Team, PointEntry } from "@/types";
import { teams as initialTeams } from "@/mocks/teams";
import { supabase } from "@/lib/supabaseClient";

interface TeamState {
  teams: Team[];
  addPoints: (teamId: string, points: number, reason: string) => void;
  resetPoints: () => void;
  getPointHistory: (teamId: string) => PointEntry[];
  syncWithSupabase: () => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: initialTeams.map(team => ({
        ...team,
        pointHistory: []
      })),
      
      addPoints: (teamId, points, reason) =>
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
        }),
        
      resetPoints: () =>
        set((state) => {
          const resetTeams = state.teams.map((team) => ({ 
            ...team, 
            points: 0,
            pointHistory: [] 
          }));
          
          // Try to reset points in Supabase
          try {
            // Reset team points
            resetTeams.forEach(async (team) => {
              await supabase
                .from('teams')
                .update({ points: 0 })
                .eq('id', team.id);
            });
            
            // Clear point history
            supabase
              .from('point_history')
              .delete()
              .gte('id', 0);
          } catch (error) {
            console.error('Failed to reset points in Supabase:', error);
          }
          
          return {
            teams: resetTeams,
          };
        }),
        
      getPointHistory: (teamId) => {
        const team = get().teams.find(t => t.id === teamId);
        return team?.pointHistory || [];
      },
      
      syncWithSupabase: async () => {
        try {
          // Fetch teams from Supabase
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*');
            
          if (teamsError) {
            console.error('Error fetching teams from Supabase:', teamsError);
            return;
          }
          
          if (teamsData && teamsData.length > 0) {
            // Fetch point history for each team
            const teamIds = teamsData.map(team => team.id);
            const { data: historyData, error: historyError } = await supabase
              .from('point_history')
              .select('*')
              .in('teamId', teamIds);
              
            if (historyError) {
              console.error('Error fetching point history from Supabase:', historyError);
            }
            
            // Map point history to teams
            const teamsWithHistory = teamsData.map(team => {
              const teamHistory = historyData?.filter(entry => entry.teamId === team.id) || [];
              return {
                ...team,
                pointHistory: teamHistory
              };
            });
            
            set({ teams: teamsWithHistory });
          } else {
            // If no teams in Supabase, initialize with local data
            const { error } = await supabase
              .from('teams')
              .insert(initialTeams.map(team => ({
                id: team.id,
                name: team.name,
                color: team.color,
                points: team.points
              })));
              
            if (error) {
              console.error('Error initializing teams in Supabase:', error);
            }
          }
        } catch (error) {
          console.error('Failed to sync with Supabase:', error);
        }
      }
    }),
    {
      name: "team-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);