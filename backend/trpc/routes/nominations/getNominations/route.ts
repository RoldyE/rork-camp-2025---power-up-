import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations, nominationsByTypeAndDay } from "../addNomination/route";
import { Nomination } from "@/types";

export default publicProcedure
  .input(
    z.object({
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]).optional(),
      day: z.string().optional(),
    })
  )
  .query(({ input }) => {
    const { type, day } = input;
    
    let filteredNominations: Nomination[] = [];
    
    if (type && day) {
      // Use the type-day map for faster lookups
      const key = `${type}-${day}`;
      filteredNominations = nominationsByTypeAndDay[key] || [];
    } else if (type) {
      // Filter by type only
      filteredNominations = nominations.filter(nom => nom.type === type);
    } else if (day) {
      // Filter by day only
      filteredNominations = nominations.filter(nom => nom.day === day);
    } else {
      // Return all nominations
      filteredNominations = [...nominations];
    }
    
    return {
      success: true,
      nominations: filteredNominations,
      timestamp: new Date(),
    };
  });