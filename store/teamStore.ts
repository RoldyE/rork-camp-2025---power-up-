import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Team, PointEntry } from "@/types";
import { teams as initialTeams } from "@/mocks/teams";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  addPoints: (teamId: string, points: number, reason: string) => void;
  resetPoints: () => void;
  getPointHistory: (teamId: string) => PointEntry[];
  fetchTeams: () => Promise<void>;
  syncTeams: () => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: initialTeams.map(team => ({
        ...team,
        pointHistory: []
      })),
      isLoading: false,
      error: null,

      fetchTeams: async () => {
        set({ isLoading: true, error: null });
        try {
          // Fetch teams from Supabase
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*');

          if (teamsError) throw teamsError;

          if (teamsData && teamsData.length > 0) {
            // Fetch point history for each team
            const { data: historyData, error: historyError } = await supabase
              .from('point_history')
              .select('*');

            if (historyError) throw historyError;

            // Map point history to teams
            const teamsWithHistory = teamsData.map(team => ({
              ...team,
              pointHistory: historyData ? historyData.filter(entry => entry.teamId === team.id) : []
            }));

            set({ teams: teamsWithHistory });
          } else {
            // If no teams in database, initialize with local data
            await get().syncTeams();
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
          set({ error: 'Failed to fetch teams' });
        } finally {
          set({ isLoading: false });
        }
      },

      syncTeams: async () => {
        try {
          // Initialize teams in Supabase if they don't exist
          const { data, error } = await supabase
            .from('teams')
            .select('id');

          if (error) throw error;

          if (!data || data.length === 0) {
            // Insert initial teams
            const { error: insertError } = await supabase
              .from('teams')
              .insert(initialTeams);

            if (insertError) throw insertError;
          }
        } catch (error) {
          console.error('Error syncing teams:', error);
          Alert.alert('Error', 'Failed to sync teams with the server');
        }
      },

      addPoints: async (teamId, points, reason) => {
        // Update local state first for immediate feedback
        set((state) => ({
          teams: state.teams.map((team) =>
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
          ),
        }));

        // Then update Supabase
        try {
          // Add point entry to history
          const pointEntry = {
            id: Date.now().toString(),
            teamId,
            points,
            reason,
            date: new Date().toISOString()
          };

          const { error: historyError } = await supabase
            .from('point_history')
            .insert(pointEntry);

          if (historyError) throw historyError;

          // Update team points
          const { error: teamError } = await supabase
            .from('teams')
            .update({ points: get().teams.find(t => t.id === teamId)?.points })
            .eq('id', teamId);

          if (teamError) throw teamError;
        } catch (error) {
          console.error('Error adding points:', error);
          Alert.alert('Error', 'Failed to save points to the server');
        }
      },

      resetPoints: async () => {
        // Update local state
        set((state) => ({
          teams: state.teams.map((team) => ({ 
            ...team, 
            points: 0,
            pointHistory: [] 
          })),
        }));

        // Update Supabase
        try {
          // Clear point history
          const { error: historyError } = await supabase
            .from('point_history')
            .delete()
            .neq('id', '0'); // Delete all entries

          if (historyError) throw historyError;

          // Reset team points
          const { error: teamError } = await supabase
            .from('teams')
            .update({ points: 0 })
            .neq('id', '0'); // Update all teams

          if (teamError) throw teamError;
        } catch (error) {
          console.error('Error resetting points:', error);
          Alert.alert('Error', 'Failed to reset points on the server');
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
    }
  )
);