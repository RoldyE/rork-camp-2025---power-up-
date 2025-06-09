import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations, nominationsByTypeAndDay } from "../addNomination/route";
import { userVotes } from "../voteForNomination/route";
import { Nomination, UserVote } from "@/types";

export default publicProcedure
  .input(
    z.object({
      day: z.string(),
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]),
    })
  )
  .mutation(({ input }) => {
    const { day, type } = input;
    
    // Reset votes for nominations of the specified type and day
    nominations.forEach((nom: Nomination, index: number) => {
      if (nom.type === type && nom.day === day) {
        nominations[index] = {
          ...nom,
          votes: 0
        };
      }
    });
    
    // Reset votes in the type-day map
    const key = `${type}-${day}`;
    if (nominationsByTypeAndDay[key]) {
      nominationsByTypeAndDay[key] = nominationsByTypeAndDay[key].map((nom: Nomination) => ({
        ...nom,
        votes: 0
      }));
    }
    
    // Remove user votes for this type and day
    const filteredVotes = userVotes.filter((vote: UserVote) => 
      !(vote.nominationType === type && vote.day === day)
    );
    
    // Update the userVotes array
    userVotes.length = 0;
    filteredVotes.forEach((vote: UserVote) => userVotes.push(vote));
    
    console.log(`Reset votes for nominations of type ${type} for day ${day}`);
    
    return {
      success: true,
      timestamp: new Date(),
    };
  });