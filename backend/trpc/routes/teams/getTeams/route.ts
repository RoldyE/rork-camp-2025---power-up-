import { publicProcedure } from "../../../create-context";
import { teams, pointHistory } from "../updatePoints/route";

export default publicProcedure
  .query(() => {
    console.log(`Getting teams. Total in memory: ${teams.length}`);
    
    // Return both teams and their point history
    return {
      teams,
      pointHistory,
      timestamp: new Date(),
    };
  });