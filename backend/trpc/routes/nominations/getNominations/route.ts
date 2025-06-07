import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations, nominationsByTypeAndDay } from "../addNomination/route";
import { NominationType } from "@/types";

export default publicProcedure
  .input(
    z.object({
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]).optional(),
      day: z.string().optional(),
    })
  )
  .query(({ input }) => {
    const { type, day } = input;
    
    if (type && day) {
      // Return nominations of the specified type and day
      const key = `${type}-${day}`;
      return {
        nominations: nominationsByTypeAndDay[key] || [],
        timestamp: new Date(),
      };
    } else if (type) {
      // Return all nominations of the specified type
      return {
        nominations: nominations.filter(nom => nom.type === type),
        timestamp: new Date(),
      };
    } else if (day) {
      // Return all nominations for the specified day
      return {
        nominations: nominations.filter(nom => nom.day === day),
        timestamp: new Date(),
      };
    } else {
      // Return all nominations
      return {
        nominations,
        timestamp: new Date(),
      };
    }
  });