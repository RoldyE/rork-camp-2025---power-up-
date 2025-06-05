import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams as initialTeams } from "@/mocks/teams";
import { PointEntry, Team } from "@/types";

// Reference the same in-memory database from updatePoints
// This is a simplified approach - in a real app, you'd use a proper database
declare const teams: (Team & { pointHistory: PointEntry[] })[];

export default publicProcedure
  .input(
    z.object({
      teamId: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const { teamId } = input;
    
    if (teamId) {
      // Reset points for a specific team
      const teamIndex = teams.findIndex(team => team.id === teamId);
      
      if (teamIndex === -1) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      teams[teamIndex] = {
        ...teams[teamIndex],
        points: 0,
        pointHistory: []
      };
      
      return {
        success: true,
        team: teams[teamIndex],
        timestamp: new Date(),
      };
    } else {
      // Reset points for all teams
      teams.forEach((team, index) => {
        teams[index] = {
          ...team,
          points: 0,
          pointHistory: []
        };
      });
      
      return {
        success: true,
        teams,
        timestamp: new Date(),
      };
    }
  });