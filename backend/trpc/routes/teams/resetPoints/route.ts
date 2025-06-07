import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams, pointHistory } from "../updatePoints/route";
import { Team } from "@/types";

export default publicProcedure
  .input(
    z.object({
      teamId: z.string().optional(),
    }).optional()
  )
  .mutation(({ input }) => {
    const { teamId } = input || {};
    
    if (teamId) {
      // Reset points for a specific team
      const teamIndex = teams.findIndex(team => team.id === teamId);
      
      if (teamIndex !== -1) {
        teams[teamIndex] = {
          ...teams[teamIndex],
          points: 0
        };
        
        // Clear point history for this team
        pointHistory[teamId] = [];
        
        console.log(`Reset points for team ${teamId}`);
      }
    } else {
      // Reset points for all teams
      teams.forEach((team: Team, index: number) => {
        teams[index] = {
          ...team,
          points: 0
        };
        
        // Clear point history for all teams
        pointHistory[team.id] = [];
      });
      
      console.log("Reset points for all teams");
    }
    
    return {
      success: true,
      timestamp: new Date(),
    };
  });