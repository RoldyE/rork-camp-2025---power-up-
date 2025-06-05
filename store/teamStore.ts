import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Team, PointEntry } from "@/types";
import { teams as initialTeams } from "@/mocks/teams";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  addPoints: (teamId: string, points: number, reason: string) => Promise<void>;
  resetPoints: () => Promise<void>;
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
          const { data, error } = await supabase
            .from('teams')
            .select('*');
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            // If we have data in Supabase, use it
            set({ teams: data as Team[] });
          } else {
            // If no data in Supabase, initialize with our local data
            const initialTeamsWithHistory = initialTeams.map(team => ({
              ...team,
              pointHistory: []
            }));
            
            // Insert initial teams into Supabase
            for (const team of initialTeamsWithHistory) {
              await supabase.from('teams').upsert(team);
            }
            
            set({ teams: initialTeamsWithHistory });
          }
        } catch (error: any) {
          console.error('Error fetching teams:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      syncTeams: () => {
        const subscription = supabase
          .channel('teams-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'teams' }, 
            async (payload) => {
              // Refresh the teams when there's a change
              await get().fetchTeams();
            }
          )
          .subscribe();

        // Return unsubscribe function
        return () => {
          subscription.unsubscribe();
        };
      },

      addPoints: async (teamId, points, reason) => {
        try {
          // First update local state for immediate feedback
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

          // Then update in Supabase
          const team = get().teams.find(t => t.id === teamId);
          if (team) {
            const { error } = await supabase
              .from('teams')
              .update({ 
                points: team.points,
                pointHistory: team.pointHistory
              })
              .eq('id', teamId);
            
            if (error) throw error;
          }
        } catch (error: any) {
          console.error('Error adding points:', error.message);
          set({ error: error.message });
        }
      },

      resetPoints: async () => {
        try {
          // Update local state
          set((state) => ({
            teams: state.teams.map((team) => ({ 
              ...team, 
              points: 0,
              pointHistory: [] 
            })),
          }));

          // Update in Supabase
          const { error } = await supabase
            .from('teams')
            .update({ points: 0, pointHistory: [] })
            .in('id', get().teams.map(team => team.id));
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error resetting points:', error.message);
          set({ error: error.message });
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

// Hook to initialize and sync with Supabase
export const useTeamSync = () => {
  const { fetchTeams, syncTeams } = useTeamStore();

  useEffect(() => {
    // Initial fetch
    fetchTeams();

    // Set up real-time sync
    const unsubscribe = syncTeams();

    // Cleanup subscription on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchTeams, syncTeams]);
};