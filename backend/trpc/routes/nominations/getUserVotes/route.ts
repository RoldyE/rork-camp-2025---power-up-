import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { userVotes } from "../voteForNomination/route";
import { NominationType } from "@/types";

export default publicProcedure
  .input(
    z.object({
      userId: z.string(),
      nominationType: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]).optional(),
      day: z.string().optional(),
    })
  )
  .query(({ input }) => {
    const { userId, nominationType, day } = input;
    
    // Filter votes by user ID
    let filteredVotes = userVotes.filter(vote => vote.userId === userId);
    
    // Further filter by nomination type if provided
    if (nominationType) {
      filteredVotes = filteredVotes.filter(vote => vote.nominationType === nominationType);
    }
    
    // Further filter by day if provided
    if (day) {
      filteredVotes = filteredVotes.filter(vote => vote.day === day);
    }
    
    console.log(`Found ${filteredVotes.length} votes for user ${userId}`);
    
    return {
      votes: filteredVotes,
      timestamp: new Date(),
    };
  });