import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations as initialNominations } from "@/mocks/nominations";
import { NominationType, Nomination } from "@/types";

// In-memory database for nominations
// Export this so other routes can access the same reference
export let nominations: Nomination[] = [...initialNominations];

export default publicProcedure
  .input(
    z.object({
      camperId: z.string(),
      reason: z.string(),
      day: z.string(),
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"])
    })
  )
  .mutation(({ input }) => {
    const { camperId, reason, day, type } = input;
    
    // Create a new nomination with the correct type
    const newNomination: Nomination = {
      id: Date.now().toString(),
      camperId,
      reason,
      day,
      type: type as NominationType,
      votes: 0,
    };
    
    // Add the nomination to the database
    nominations.push(newNomination);
    
    return {
      success: true,
      nomination: newNomination,
      timestamp: new Date(),
    };
  });