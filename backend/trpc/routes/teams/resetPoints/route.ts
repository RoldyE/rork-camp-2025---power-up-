import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams, pointHistory } from "../updatePoints/route";

export default publicProcedure
  .input(
    z.object({
      teamId: z.string().optional(),
    }).optional()
  )
  .mutation(({ input }) => {
    if (input?.teamId) {
      // Reset points for a specific team
      const teamIndex = teams.findIndex(team => team.id === input.teamId);
      
      if (teamIndex === -1) {
        throw new Error(`Team with ID ${input.teamId} not found`);
      }
      
      teams[teamIndex] = {
        ...teams[teamIndex],
        points: 0
      };
      
      // Clear point history for this team
      pointHistory[input.teamId] = [];
    } else {
      // Reset points for all teams
      teams.forEach((team, index) => {
        teams[index] = {
          ...team,
          points: 0
        };
        
        // Clear point history for all teams
        pointHistory[team.id] = [];
      });
    }
    
    return {
      success: true,
      timestamp: new Date(),
    };
  });