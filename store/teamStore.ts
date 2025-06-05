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
  resetTeamPoints: (teamId: string) => void; // New function to reset a single team's points
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
          
          // Try to update in Supabase
          try {
            // Add to point history
            const pointId = Date.now().toString();
            supabase
              .from('point_history')
              .insert([{
                id: pointId,
                teamid: teamId,
                points: points,
                reason: reason,
                date: new Date().toISOString()
              }])
              .then(({ error }) => {
                if (error) console.error('Error adding points to Supabase:', error);
              });
              
            // Update team points
            const team = updatedTeams.find(t => t.id === teamId);
            if (team) {
              supabase
                .from('teams')
                .update({ points: team.points })
                .eq('id', teamId)
                .then(({ error }) => {
                  if (error) console.error('Error updating team points in Supabase:', error);
                });
            }
          } catch (error) {
            console.error('Failed to update points in Supabase:', error);
          }
          
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
              supabase
                .from('teams')
                .update({ points: 0 })
                .eq('id', team.id)
                .then(({ error }) => {
                  if (error) console.error('Error resetting team points in Supabase:', error);
                });
            });
            
            // Clear point history
            supabase
              .from('point_history')
              .delete()
              .gte('id', 0)
              .then(({ error }) => {
                if (error) console.error('Error clearing point history in Supabase:', error);
              });
          } catch (error) {
            console.error('Failed to reset points in Supabase:', error);
          }
          
          return {
            teams: resetTeams,
          };
        }),
        
      // New function to reset a single team's points
      resetTeamPoints: (teamId) =>
        set((state) => {
          const updatedTeams = state.teams.map((team) => 
            team.id === teamId 
              ? { ...team, points: 0, pointHistory: [] } 
              : team
          );
          
          // Try to reset points in Supabase
          try {
            // Reset team points
            supabase
              .from('teams')
              .update({ points: 0 })
              .eq('id', teamId)
              .then(({ error }) => {
                if (error) console.error('Error resetting team points in Supabase:', error);
              });
            
            // Clear point history for this team
            supabase
              .from('point_history')
              .delete()
              .eq('teamid', teamId)
              .then(({ error }) => {
                if (error) console.error('Error clearing team point history in Supabase:', error);
              });
          } catch (error) {
            console.error('Failed to reset team points in Supabase:', error);
          }
          
          return {
            teams: updatedTeams,
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
              .in('teamid', teamIds);
              
            if (historyError) {
              console.error('Error fetching point history from Supabase:', historyError);
            }
            
            // Map point history to teams
            const teamsWithHistory = teamsData.map(team => {
              const teamHistory = historyData?.filter(entry => entry.teamid === team.id) || [];
              return {
                ...team,
                pointHistory: teamHistory.map(entry => ({
                  id: entry.id.toString(),
                  points: entry.points,
                  reason: entry.reason,
                  date: entry.date
                }))
              };
            });
            
            set({ teams: teamsWithHistory });
          } else {
            // If no teams in Supabase, initialize with local data
            initialTeams.forEach(team => {
              supabase
                .from('teams')
                .insert([{
                  id: team.id,
                  name: team.name,
                  color: team.color,
                  points: team.points
                }])
                .then(({ error }) => {
                  if (error) console.error('Error initializing teams in Supabase:', error);
                });
            });
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