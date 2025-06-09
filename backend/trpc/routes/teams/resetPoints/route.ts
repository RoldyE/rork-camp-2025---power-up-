import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export default publicProcedure
  .input(
    z.object({
      teamId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { teamId } = input;
    
    try {
      if (teamId) {
        // Reset points for a specific team in Supabase
        const { error } = await supabase
          .from('points')
          .delete()
          .eq('team_id', teamId);
        
        if (error) {
          console.error("Error resetting team points in Supabase:", error);
          throw new Error("Failed to reset team points in Supabase");
        }
        
        // Fetch updated team data
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();
        
        if (teamError) {
          console.error("Error fetching team data from Supabase:", teamError);
          throw new Error("Failed to fetch team data");
        }
        
        return {
          success: true,
          team: {
            ...teamData,
            points: 0,
            pointHistory: []
          },
          timestamp: new Date(),
        };
      } else {
        // Reset points for all teams in Supabase
        const { error } = await supabase
          .from('points')
          .delete()
          .neq('team_id', '');
        
        if (error) {
          console.error("Error resetting all points in Supabase:", error);
          throw new Error("Failed to reset all points in Supabase");
        }
        
        // Fetch all teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*');
        
        if (teamsError) {
          console.error("Error fetching teams from Supabase:", teamsError);
          throw new Error("Failed to fetch teams");
        }
        
        const teamsWithZeroPoints = teamsData.map(team => ({
          ...team,
          points: 0,
          pointHistory: []
        }));
        
        return {
          success: true,
          teams: teamsWithZeroPoints,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error("Error in resetPoints procedure:", error);
      throw new Error("Failed to reset points");
    }
  });