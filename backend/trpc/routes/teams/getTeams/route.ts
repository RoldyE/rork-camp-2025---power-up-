import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams as initialTeams } from "@/mocks/teams";

// Reference the same in-memory database
// In a real app, you'd use a proper database
declare const teams: any[];

export default publicProcedure
  .query(() => {
    return {
      teams,
      timestamp: new Date(),
    };
  });