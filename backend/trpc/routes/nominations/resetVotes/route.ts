import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Reference the same in-memory database
declare const nominations: any[];
declare const userVotes: any[];

export default publicProcedure
  .input(
    z.object({
      day: z.string().optional(),
      type: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const { day, type } = input;
    
    // Reset votes for nominations matching the criteria
    nominations.forEach((nom, index) => {
      if ((!day || nom.day === day) && (!type || nom.type === type)) {
        nominations[index] = {
          ...nom,
          votes: 0,
        };
      }
    });
    
    // Reset user votes if requested
    if (day || type) {
      // Filter out votes that match the criteria
      const filteredVotes = userVotes.filter(vote => {
        if (day && vote.day === day) return false;
        if (type && vote.nominationType === type) return false;
        return true;
      });
      
      // Clear the array without reassigning
      userVotes.length = 0;
      // Add back the filtered votes
      filteredVotes.forEach(vote => userVotes.push(vote));
    }
    
    return {
      success: true,
      timestamp: new Date(),
    };
  });