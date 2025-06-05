import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Reference the same in-memory database
declare const nominations: any[];

// In-memory database for user votes
let userVotes: {
  userId: string;
  nominationType: string;
  day: string;
  timestamp: string;
}[] = [];

export default publicProcedure
  .input(
    z.object({
      nominationId: z.string(),
      userId: z.string(),
      nominationType: z.string(),
      day: z.string(),
    })
  )
  .mutation(({ input }) => {
    const { nominationId, userId, nominationType, day } = input;
    
    // Find the nomination
    const nominationIndex = nominations.findIndex(nom => nom.id === nominationId);
    
    if (nominationIndex === -1) {
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
    nominations[nominationIndex] = {
      ...nominations[nominationIndex],
      votes: nominations[nominationIndex].votes + 1,
    };
    
    return {
      success: true,
      nomination: nominations[nominationIndex],
      timestamp: new Date(),
    };
  });