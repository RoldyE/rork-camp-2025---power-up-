import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Team, PointEntry } from "@/types";
import { teams as initialTeams } from "@/mocks/teams";

interface TeamState {
  teams: Team[];
  addPoints: (teamId: string, points: number, reason: string) => void;
  resetPoints: () => void;
  resetTeamPoints: (teamId: string) => void;
  getPointHistory: (teamId: string) => PointEntry[];
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
          
          return {
            teams: resetTeams,
          };
        }),
        
      resetTeamPoints: (teamId) =>
        set((state) => {
          const updatedTeams = state.teams.map((team) => 
            team.id === teamId 
              ? { ...team, points: 0, pointHistory: [] } 
              : team
          );
          
          return {
            teams: updatedTeams,
          };
        }),
        
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