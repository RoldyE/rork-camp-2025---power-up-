import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams } from "../updatePoints/route";
import { pointHistory } from "../updatePoints/route";

export default publicProcedure
  .query(() => {
    // Combine teams with their point history
    const teamsWithHistory = teams.map(team => ({
      ...team,
      pointHistory: pointHistory[team.id] || []
    }));
    
    return {
      teams: teamsWithHistory,
      timestamp: new Date(),
    };
  });