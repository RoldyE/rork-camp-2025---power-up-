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
    
    // If both type and day are provided, use the map for faster lookup
    if (type && day) {
      const key = `${type}-${day}`;
      return {
        nominations: nominationsByTypeAndDay[key] || [],
        timestamp: new Date(),
      };
    }
    
    // If only type is provided, filter by type
    if (type) {
      return {
        nominations: nominations.filter(nom => nom.type === type),
        timestamp: new Date(),
      };
    }
    
    // If only day is provided, filter by day
    if (day) {
      return {
        nominations: nominations.filter(nom => nom.day === day),
        timestamp: new Date(),
      };
    }
    
    // If neither is provided, return all nominations
    return {
      nominations,
      timestamp: new Date(),
    };
  });