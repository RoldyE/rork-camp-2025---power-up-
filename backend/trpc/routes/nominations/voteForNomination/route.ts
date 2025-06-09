import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations, nominationsMap } from "../addNomination/route";
import { NominationType } from "@/types";

// In-memory database for user votes
// Export this so other routes can access the same reference
export let userVotes: {
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
}[] = [];

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
    
    // Find the nomination using the map for faster lookup
    const nomination = nominationsMap.get(nominationId);
    
    if (!nomination) {
      throw new Error(`Nomination with ID ${nominationId} not found`);
    }
    
    // Record the user vote
    userVotes.push({
      userId,
      nominationType,
      day,
      timestamp: new Date().toISOString(),
    });
    
    // Update the nomination votes
    nomination.votes += 1;
    
    // Also update the nomination in the array to keep both in sync
    const nominationIndex = nominations.findIndex(nom => nom.id === nominationId);
    if (nominationIndex !== -1) {
      nominations[nominationIndex] = nomination;
    }
    
    return {
      success: true,
      nomination,
      timestamp: new Date(),
    };
  });