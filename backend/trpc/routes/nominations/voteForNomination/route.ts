import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";
import { NominationType, Nomination } from "@/types";

export default publicProcedure
  .input(
    z.object({
      nominationId: z.string(),
      userId: z.string(),
      nominationType: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]),
      day: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { nominationId, userId, nominationType, day } = input;
    
    try {
      // Fetch current votes for the nomination
      const { data: nominationData, error } = await supabase
        .from('nominations')
        .select('votes, nomination_id, camper_id, reason, day, category')
        .eq('nomination_id', nominationId)
        .single();
      
      if (error) {
        console.error("Error fetching nomination from Supabase:", error);
        throw new Error("Nomination not found in Supabase");
      }
      
      if (!nominationData) {
        throw new Error(`Nomination with ID ${nominationId} not found`);
      }
      
      const newVotes = (nominationData.votes || 0) + 1;
      
      // Update votes in Supabase
      const { error: updateError } = await supabase
        .from('nominations')
        .update({ votes: newVotes })
        .eq('nomination_id', nominationId);
      
      if (updateError) {
        console.error("Error updating votes in Supabase:", updateError);
        throw new Error("Failed to update votes in Supabase");
      }
      
      // Record user vote in Supabase
      const { error: voteError } = await supabase
        .from('user_votes')
        .insert([{
          user_id: userId,
          nomination_id: nominationId,
          nomination_type: nominationType,
          day: day,
          timestamp: new Date().toISOString()
        }]);
      
      if (voteError) {
        console.error("Error recording user vote in Supabase:", voteError);
        throw new Error("Failed to record user vote in Supabase");
      }
      
      const updatedNomination: Nomination = {
        id: nominationData.nomination_id,
        camperId: nominationData.camper_id,
        reason: nominationData.reason || "",
        day: nominationData.day,
        type: nominationData.category as NominationType,
        votes: newVotes
      };
      
      return {
        success: true,
        nomination: updatedNomination,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error in voteForNomination procedure:", error);
      throw new Error("Failed to vote for nomination");
    }
  });