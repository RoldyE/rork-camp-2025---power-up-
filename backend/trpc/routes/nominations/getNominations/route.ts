import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";
import { NominationType, Nomination } from "@/types";

export default publicProcedure
  .input(
    z.object({
      type: z.string().optional(),
      day: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    try {
      // Build the query to fetch nominations from Supabase
      let query = supabase.from('nominations').select('*');
      
      if (input.type) {
        query = query.eq('category', input.type);
      }
      
      if (input.day) {
        query = query.eq('day', input.day);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching nominations from Supabase:", error);
        throw new Error("Failed to get nominations from Supabase");
      }
      
      const nominations: Nomination[] = data.map(nom => ({
        id: nom.nomination_id,
        camperId: nom.camper_id,
        reason: nom.reason || "",
        day: nom.day,
        type: nom.category as NominationType,
        votes: nom.votes || 0
      }));
      
      return {
        nominations,
        timestamp: new Date().toISOString(), // Ensure serializable format
      };
    } catch (error) {
      console.error("Error in getNominations procedure:", error);
      throw new Error("Failed to get nominations");
    }
  });