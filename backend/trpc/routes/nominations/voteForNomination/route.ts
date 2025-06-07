import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations, nominationsByTypeAndDay } from "../addNomination/route";
import { NominationType, UserVote, Nomination } from "@/types";

// Define types for global storage
interface GlobalStorage {
  userVotes?: UserVote[];
}

// In-memory database for user votes - make it global for persistence
let globalUserVotes = ((global as unknown as GlobalStorage).userVotes || []) as UserVote[];
(global as unknown as GlobalStorage).userVotes = globalUserVotes;

export const userVotes = globalUserVotes;

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
    
    // Also update the nomination in the type-day map
    const key = `${nominationType}-${day}`;
    if (nominationsByTypeAndDay[key]) {
      const mapIndex = nominationsByTypeAndDay[key].findIndex((nom: Nomination) => nom.id === nominationId);
      if (mapIndex !== -1) {
        nominationsByTypeAndDay[key][mapIndex] = {
          ...nominationsByTypeAndDay[key][mapIndex],
          votes: nominationsByTypeAndDay[key][mapIndex].votes + 1
        };
      }
    }
    
    // Record the user vote
    userVotes.push({
      userId,
      nominationType,
      day,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`Vote recorded for nomination ${nominationId}. New vote count: ${nominations[nominationIndex].votes}`);
    
    return {
      success: true,
      nomination: nominations[nominationIndex],
      timestamp: new Date(),
    };
  });