import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations, nominationsByTypeAndDay } from "../addNomination/route";
import { NominationType } from "@/types";

export default publicProcedure
  .input(
    z.object({
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]).optional(),
      day: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => {
    // Log for debugging
    console.log(`Getting nominations. Total in memory: ${nominations.length}`);
    if (input?.type) console.log(`Filtering by type: ${input.type}`);
    if (input?.day) console.log(`Filtering by day: ${input.day}`);
    
    // If both type and day are specified, use the optimized lookup
    if (input?.type && input?.day) {
      const key = `${input.type}-${input.day}`;
      const result = nominationsByTypeAndDay[key] || [];
      console.log(`Found ${result.length} nominations for ${key}`);
      return {
        nominations: result,
        timestamp: new Date(),
      };
    }
    
    // Otherwise filter the nominations array
    let filteredNominations = [...nominations];
    
    if (input?.type) {
      filteredNominations = filteredNominations.filter(
        nom => nom.type === input.type
      );
    }
    
    if (input?.day) {
      filteredNominations = filteredNominations.filter(
        nom => nom.day === input.day
      );
    }
    
    console.log(`Returning ${filteredNominations.length} nominations after filtering`);
    
    return {
      nominations: filteredNominations,
      timestamp: new Date(),
    };
  });