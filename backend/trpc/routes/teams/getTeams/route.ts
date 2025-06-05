import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { teams as initialTeams } from "@/mocks/teams";
import { PointEntry } from "@/types";

// In-memory database for teams
// This should reference the same teams array from updatePoints
let teams = [...initialTeams.map(team => ({
  ...team,
  pointHistory: [] as PointEntry[]
}))];

export default publicProcedure
  .query(() => {
    return {
      teams,
      timestamp: new Date(),
    };
  });