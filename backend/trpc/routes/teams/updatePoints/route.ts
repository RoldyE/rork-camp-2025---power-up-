import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams as initialTeams } from "@/mocks/teams";
import { PointEntry, Team } from "@/types";

// Initialize teams with zero points instead of default values
// This ensures all clients start with the same base state
const zeroPointTeams = initialTeams.map(team => ({
  ...team,
  points: 0,
}));

// In-memory database for teams and point history - make it global for persistence
let globalTeams = ((global as any).teams || [...zeroPointTeams]) as Team[];
(global as any).teams = globalTeams;

// Export the global reference
export let teams = globalTeams;

// Separate storage for point history - also make it global
let globalPointHistory = ((global as any).pointHistory || {}) as Record<string, PointEntry[]>;
(global as any).pointHistory = globalPointHistory;

export let pointHistory = globalPointHistory;

// Initialize point history for each team if not already done
if (Object.keys(pointHistory).length === 0) {
  initialTeams.forEach((team: Team) => {
    pointHistory[team.id] = [];
  });
}

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
    
    // Update the team points
    teams[teamIndex] = {
      ...teams[teamIndex],
      points: teams[teamIndex].points + points
    };
    
    // Add to point history
    if (!pointHistory[teamId]) {
      pointHistory[teamId] = [];
    }
    
    pointHistory[teamId].push(pointEntry);
    
    console.log(`Updated points for team ${teamId}. New total: ${teams[teamIndex].points}`);
    
    return {
      success: true,
      team: teams[teamIndex],
      pointHistory: pointHistory[teamId],
      timestamp: new Date(),
    };
  });