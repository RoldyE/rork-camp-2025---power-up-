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
    
    // Filter votes based on input parameters
    if (userId && nominationType && day) {
      // Filter by all three parameters
      filteredVotes = userVotes.filter((vote: UserVote) => 
        vote.userId === userId && 
        vote.nominationType === nominationType && 
        vote.day === day
      );
    } else if (userId && nominationType) {
      // Filter by userId and nominationType
      filteredVotes = userVotes.filter((vote: UserVote) => 
        vote.userId === userId && 
        vote.nominationType === nominationType
      );
    } else if (userId && day) {
      // Filter by userId and day
      filteredVotes = userVotes.filter((vote: UserVote) => 
        vote.userId === userId && 
        vote.day === day
      );
    } else if (userId) {
      // Filter by userId only
      filteredVotes = userVotes.filter((vote: UserVote) => vote.userId === userId);
    }
    
    return {
      success: true,
      votes: filteredVotes,
      timestamp: new Date(),
    };
  });