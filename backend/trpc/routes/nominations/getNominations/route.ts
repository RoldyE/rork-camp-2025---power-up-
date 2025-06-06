import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations } from "../addNomination/route";
import { NominationType } from "@/types";

export default publicProcedure
  .input(
    z.object({
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]).optional(),
      day: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => {
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
    
    return {
      nominations: filteredNominations,
      timestamp: new Date(),
    };
  });