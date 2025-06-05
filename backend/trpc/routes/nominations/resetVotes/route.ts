import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations } from "../addNomination/route";
import { userVotes } from "../voteForNomination/route";

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
        if (day && type) {
          return !(vote.day === day && vote.nominationType === type);
        }
        if (day) {
          return vote.day !== day;
        }
        if (type) {
          return vote.nominationType !== type;
        }
        return true;
      });
      
      // Clear the array and add back the filtered votes
      userVotes.splice(0, userVotes.length);
      filteredVotes.forEach(vote => userVotes.push(vote));
    }
    
    return {
      success: true,
      timestamp: new Date(),
    };
  });