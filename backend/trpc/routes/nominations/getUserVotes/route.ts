import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Reference the same in-memory database
declare const userVotes: any[];

export default publicProcedure
  .input(
    z.object({
      userId: z.string(),
      nominationType: z.string().optional(),
      day: z.string().optional(),
    })
  )
  .query(({ input }) => {
    const { userId, nominationType, day } = input;
    
    let filteredVotes = userVotes.filter(vote => vote.userId === userId);
    
    if (nominationType) {
      filteredVotes = filteredVotes.filter(vote => vote.nominationType === nominationType);
    }
    
    if (day) {
      if (day === "today") {
        const today = new Date().toLocaleDateString();
        filteredVotes = filteredVotes.filter(
          vote => new Date(vote.timestamp).toLocaleDateString() === today
        );
      } else if (day !== "all") {
        filteredVotes = filteredVotes.filter(vote => vote.day === day);
      }
    }
    
    return {
      votes: filteredVotes,
      count: filteredVotes.length,
      timestamp: new Date(),
    };
  });