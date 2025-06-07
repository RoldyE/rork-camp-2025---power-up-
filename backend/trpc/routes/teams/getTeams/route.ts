import { publicProcedure } from "../../../create-context";
import { teams, pointHistory } from "../updatePoints/route";

export default publicProcedure
  .query(() => {
    return {
      teams,
      pointHistory,
      timestamp: new Date(),
    };
  });