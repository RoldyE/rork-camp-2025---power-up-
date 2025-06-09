import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export default publicProcedure
  .input(
    z.object({
      day: z.string().optional(),
      type: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { day, type } = input;
    
    try {
      // Build the query to reset votes in Supabase
      let nominationQuery = supabase.from('nominations').update({ votes: 0 });
      
      if (day) {
        nominationQuery = nominationQuery.eq('day', day);
      }
      
      if (type) {
        nominationQuery = nominationQuery.eq('category', type);
      }
      
      const { error: nominationError } = await nominationQuery;
      
      if (nominationError) {
        console.error("Error resetting votes in Supabase:", nominationError);
        throw new Error("Failed to reset votes in Supabase");
      }
      
      // Build the query to delete user votes
      let voteQuery = supabase.from('user_votes').delete();
      
      if (day) {
        voteQuery = voteQuery.eq('day', day);
      }
      
      if (type) {
        voteQuery = voteQuery.eq('nomination_type', type);
      }
      
      const { error: voteError } = await voteQuery;
      
      if (voteError) {
        console.error("Error resetting user votes in Supabase:", voteError);
        throw new Error("Failed to reset user votes in Supabase");
      }
      
      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error in resetVotes procedure:", error);
      throw new Error("Failed to reset votes");
    }
  });