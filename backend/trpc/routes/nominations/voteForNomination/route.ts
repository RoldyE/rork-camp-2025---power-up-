import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations } from "../addNomination/route";
import { NominationType } from "@/types";

// In-memory database for user votes
export const userVotes: Array<{
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
}> = [];

export default publicProcedure
  .input(
    z.object({
      nominationId: z.string(),
      userId: z.string(),
      nominationType: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]),
      day: z.string(),
    })
  )
  .mutation(({ input }) => {
    const { nominationId, userId, nominationType, day } = input;
    
    // Find the nomination and update its votes
    const nominationIndex = nominations.findIndex(nom => nom.id === nominationId);
    
    if (nominationIndex === -1) {
      throw new Error(`Nomination with ID ${nominationId} not found`);
    }
    
    // Increment the votes
    nominations[nominationIndex] = {
      ...nominations[nominationIndex],
      votes: nominations[nominationIndex].votes + 1
    };
    
    // Record the user vote
    userVotes.push({
      userId,
      nominationType,
      day,
      timestamp: new Date().toISOString(),
    });
    
    return {
      success: true,
      nomination: nominations[nominationIndex],
      timestamp: new Date(),
    };
  });