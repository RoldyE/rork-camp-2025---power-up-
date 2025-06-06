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
    let filteredVotes = [...userVotes];
    
    // Filter by user ID
    filteredVotes = filteredVotes.filter(vote => vote.userId === input.userId);
    
    // Filter by nomination type if provided
    if (input.nominationType) {
      filteredVotes = filteredVotes.filter(vote => vote.nominationType === input.nominationType);
    }
    
    // Filter by day if provided
    if (input.day) {
      filteredVotes = filteredVotes.filter(vote => vote.day === input.day);
    }
    
    return {
      votes: filteredVotes,
      timestamp: new Date(),
    };
  });