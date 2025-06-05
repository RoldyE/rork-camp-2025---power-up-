import { publicProcedure } from "../../../create-context";
import { teams } from "../updatePoints/route";

export default publicProcedure
  .query(() => {
    return {
      teams,
      timestamp: new Date(),
    };
  });