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
  syncTeams: () => () => void;
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
          // Skip Supabase fetch to avoid database errors
          // Just use the local teams data
          const teamsWithHistory = get().teams;
          set({ teams: teamsWithHistory });
        } catch (error: any) {
          console.error('Error fetching teams:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      syncTeams: () => {
        // Return a no-op cleanup function since we're not using Supabase real-time
        return () => {};
      },

      addPoints: async (teamId, points, reason) => {
        try {
          // Update local state only
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
        } catch (error: any) {
          console.error('Error adding points:', error.message);
          set({ error: error.message });
        }
      },

      resetPoints: async () => {
        try {
          // Update local state only
          set((state) => ({
            teams: state.teams.map((team) => ({ 
              ...team, 
              points: 0,
              pointHistory: [] 
            })),
          }));
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
  const { fetchTeams } = useTeamStore();

  useEffect(() => {
    // Initial fetch
    fetchTeams();
    
    // No real-time sync needed since we're not using Supabase
    return () => {};
  }, [fetchTeams]);
};