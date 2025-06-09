import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams, pointHistory } from "./updatePoints/route";
import { Team } from "@/types";

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
      const teamIndex = teams.findIndex((team: Team) => team.id === teamId);
      
      if (teamIndex === -1) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      // Reset the team's points
      teams[teamIndex] = {
        ...teams[teamIndex],
        points: 0
      };
      
      // Clear the team's point history
      if (pointHistory[teamId]) {
        pointHistory[teamId] = [];
      }
      
      console.log(`Reset points for team ${teamId}`);
    } else {
      // Reset points for all teams
      teams.forEach((team: Team, index: number) => {
        teams[index] = {
          ...team,
          points: 0
        };
      });
      
      // Clear all point history
      Object.keys(pointHistory).forEach(teamId => {
        pointHistory[teamId] = [];
      });
      
      console.log("Reset points for all teams");
    }
    
    return {
      success: true,
      teams,
      timestamp: new Date(),
    };
  });