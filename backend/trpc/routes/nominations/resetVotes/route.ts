import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations } from "../addNomination/route";
import { userVotes } from "../voteForNomination/route";
import { NominationType } from "@/types";

export default publicProcedure
  .input(
    z.object({
      day: z.string(),
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]),
    })
  )
  .mutation(({ input }) => {
    const { day, type } = input;
    
    // Reset votes for nominations of the specified day and type
    nominations.forEach((nom, index) => {
      if (nom.day === day && nom.type === type) {
        nominations[index] = {
          ...nom,
          votes: 0
        };
      }
    });
    
    // Remove user votes for the specified day and type
    const userVotesIndex = userVotes.findIndex(
      vote => vote.day === day && vote.nominationType === type
    );
    
    if (userVotesIndex !== -1) {
      userVotes.splice(userVotesIndex, 1);
    }
    
    return {
      success: true,
      timestamp: new Date(),
    };
  });