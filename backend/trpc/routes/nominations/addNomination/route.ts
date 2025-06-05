import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations as initialNominations } from "@/mocks/nominations";
import { NominationType } from "@/types";

// In-memory database for nominations
let nominations = [...initialNominations];

export default publicProcedure
  .input(
    z.object({
      camperId: z.string(),
      reason: z.string(),
      day: z.string(),
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]),
    })
  )
  .mutation(({ input }) => {
    const { camperId, reason, day, type } = input;
    
    // Create a new nomination
    const newNomination = {
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