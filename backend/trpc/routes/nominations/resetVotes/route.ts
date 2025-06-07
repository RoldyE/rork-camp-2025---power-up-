import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations, nominationsByTypeAndDay } from "../addNomination/route";
import { userVotes } from "../voteForNomination/route";
import { NominationType, Nomination, UserVote } from "@/types";

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
    nominations.forEach((nom: Nomination, index: number) => {
      if (nom.day === day && nom.type === type) {
        nominations[index] = {
          ...nom,
          votes: 0
        };
      }
    });
    
    // Also reset votes in the type-day map
    const key = `${type}-${day}`;
    if (nominationsByTypeAndDay[key]) {
      nominationsByTypeAndDay[key] = nominationsByTypeAndDay[key].map((nom: Nomination) => ({
        ...nom,
        votes: 0
      }));
    }
    
    // Remove user votes for the specified day and type
    const newUserVotes = userVotes.filter(
      (vote: UserVote) => !(vote.day === day && vote.nominationType === type)
    );
    
    // Clear the array and push new items to maintain the reference
    userVotes.length = 0;
    newUserVotes.forEach((vote: UserVote) => userVotes.push(vote));
    
    console.log(`Reset votes for ${type} nominations on ${day}`);
    
    return {
      success: true,
      timestamp: new Date(),
    };
  });