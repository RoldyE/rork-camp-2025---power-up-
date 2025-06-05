import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams as initialTeams } from "@/mocks/teams";
import { PointEntry } from "@/types";

// In-memory database for teams and point history
let teams = [...initialTeams.map(team => ({
  ...team,
  pointHistory: [] as PointEntry[]
}))];

export default publicProcedure
  .input(
    z.object({
      teamId: z.string(),
      points: z.number(),
      reason: z.string(),
    })
  )
  .mutation(({ input }) => {
    const { teamId, points, reason } = input;
    
    // Find the team and update its points
    const teamIndex = teams.findIndex(team => team.id === teamId);
    
    if (teamIndex === -1) {
      throw new Error(`Team with ID ${teamId} not found`);
    }
    
    // Create a new point history entry
    const pointEntry: PointEntry = {
      id: Date.now().toString(),
      points,
      reason,
      date: new Date().toISOString()
    };
    
    // Update the team
    teams[teamIndex] = {
      ...teams[teamIndex],
      points: teams[teamIndex].points + points,
      pointHistory: [
        ...(teams[teamIndex].pointHistory || []),
        pointEntry
      ]
    };
    
    return {
      success: true,
      team: teams[teamIndex],
      timestamp: new Date(),
    };
  });