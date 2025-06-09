import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";
import { NominationType, Nomination } from "@/types";

export default publicProcedure
  .input(
    z.object({
      camperId: z.string(),
      reason: z.string(),
      day: z.string(),
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"])
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { camperId, reason, day, type } = input;
      
      // Add nomination to Supabase
      const { data, error } = await supabase
        .from('nominations')
        .insert([{
          camper_id: camperId,
          reason: reason,
          day: day,
          category: type,
          votes: 0
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Error adding nomination to Supabase:", error);
        throw new Error("Failed to add nomination to Supabase");
      }
      
      if (data) {
        const newNomination: Nomination = {
          id: data.nomination_id,
          camperId: data.camper_id,
          reason: data.reason || "",
          day: data.day,
          type: data.category as NominationType,
          votes: data.votes || 0,
        };
        
        return {
          success: true,
          nomination: newNomination,
          timestamp: new Date(),
        };
      } else {
        throw new Error("No data returned from Supabase after adding nomination");
      }
    } catch (error) {
      console.error("Error in addNomination procedure:", error);
      throw new Error("Failed to add nomination");
    }
  });