import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { userVotes } from "../voteForNomination/route";
import { UserVote } from "@/types";

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
    
    let filteredVotes: UserVote[] = [];
    
    if (nominationType && day) {
      // Filter by user ID, nomination type, and day
      filteredVotes = userVotes.filter((vote: UserVote) => 
        vote.userId === userId && 
        vote.nominationType === nominationType && 
        vote.day === day
      );
    } else if (nominationType) {
      // Filter by user ID and nomination type
      filteredVotes = userVotes.filter((vote: UserVote) => 
        vote.userId === userId && 
        vote.nominationType === nominationType
      );
    } else if (day) {
      // Filter by user ID and day
      filteredVotes = userVotes.filter((vote: UserVote) => 
        vote.userId === userId && 
        vote.day === day
      );
    } else {
      // Filter by user ID only
      filteredVotes = userVotes.filter((vote: UserVote) => vote.userId === userId);
    }
    
    return {
      success: true,
      votes: filteredVotes,
      timestamp: new Date(),
    };
  });