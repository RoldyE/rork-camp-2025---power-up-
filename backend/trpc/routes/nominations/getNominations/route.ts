import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations, nominationsByTypeAndDay } from "../addNomination/route";
import { Nomination } from "@/types";

export default publicProcedure
  .input(
    z.object({
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]).optional(),
      day: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => {
    if (!input) {
      // Return all nominations
      return {
        success: true,
        nominations,
        timestamp: new Date(),
      };
    }
    
    const { type, day } = input;
    
    if (type && day) {
      // Return nominations of the specified type and day
      const key = `${type}-${day}`;
      return {
        success: true,
        nominations: nominationsByTypeAndDay[key] || [],
        timestamp: new Date(),
      };
    } else if (type) {
      // Return nominations of the specified type
      const filteredNominations = nominations.filter((nom: Nomination) => nom.type === type);
      return {
        success: true,
        nominations: filteredNominations,
        timestamp: new Date(),
      };
    } else if (day) {
      // Return nominations of the specified day
      const filteredNominations = nominations.filter((nom: Nomination) => nom.day === day);
      return {
        success: true,
        nominations: filteredNominations,
        timestamp: new Date(),
      };
    }
    
    // Return all nominations if no filters are specified
    return {
      success: true,
      nominations,
      timestamp: new Date(),
    };
  });