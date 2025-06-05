import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations } from "../addNomination/route";
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
    
    let filteredNominations = [...nominations];
    
    if (type) {
      filteredNominations = filteredNominations.filter(nom => nom.type === type);
    }
    
    if (day) {
      filteredNominations = filteredNominations.filter(nom => nom.day === day);
    }
    
    return {
      nominations: filteredNominations,
      timestamp: new Date(),
    };
  });