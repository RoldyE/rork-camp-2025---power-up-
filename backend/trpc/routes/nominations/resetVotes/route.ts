import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations } from "../addNomination/route";
import { userVotes } from "../voteForNomination/route";
import { NominationType } from "@/types";

export default publicProcedure
  .input(
    z.object({
      day: z.string().optional(),
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]).optional(),
    })
  )
  .mutation(({ input }) => {
    const { day, type } = input;
    
    // Reset votes for nominations matching the criteria
    nominations.forEach((nomination, index) => {
      if (
        (day === undefined || nomination.day === day) &&
        (type === undefined || nomination.type === type)
      ) {
        nominations[index] = {
          ...nomination,
          votes: 0
        };
      }
    });
    
    // Remove user votes matching the criteria
    if (day !== undefined || type !== undefined) {
      const newUserVotes = userVotes.filter(vote => {
        if (day !== undefined && type !== undefined) {
          return !(vote.day === day && vote.nominationType === type);
        } else if (day !== undefined) {
          return vote.day !== day;
        } else if (type !== undefined) {
          return vote.nominationType !== type;
        }
        return true;
      });
      
      // Clear the array and add the filtered votes back
      userVotes.length = 0;
      userVotes.push(...newUserVotes);
    } else {
      // If no criteria provided, reset all votes
      userVotes.length = 0;
    }
    
    return {
      success: true,
      timestamp: new Date(),
    };
  });