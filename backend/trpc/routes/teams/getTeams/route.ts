import { publicProcedure } from "../../../create-context";
import { teams } from "../updatePoints/route";

export default publicProcedure.query(() => {
  try {
    return {
      teams,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error in getTeams procedure:", error);
    throw new Error("Failed to get teams");
  }
});