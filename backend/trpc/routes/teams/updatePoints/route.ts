import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";
import { Team, PointEntry } from "@/types";

export default publicProcedure
  .input(
    z.object({
      teamId: z.string(),
      points: z.number(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { teamId, points, reason } = input;
      
      // Add points to Supabase
      const { data, error } = await supabase
        .from('points')
        .insert([{ team_id: teamId, points, reason, updated_at: new Date().toISOString() }])
        .select();
      
      if (error) {
        console.error("Error updating points in Supabase:", error);
        throw new Error("Failed to update points in Supabase");
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
      
      // Fetch updated point history
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('points, reason, updated_at')
        .eq('team_id', teamId);
      
      if (pointsError) {
        console.error("Error fetching point history from Supabase:", pointsError);
        throw new Error("Failed to fetch point history");
      }
      
      const pointHistory = pointsData?.map(entry => ({
        id: entry.updated_at,
        points: entry.points,
        reason: entry.reason || "No reason provided",
        date: entry.updated_at
      })) || [];
      
      const totalPoints = pointsData?.reduce((sum, entry) => sum + entry.points, 0) || 0;
      
      const updatedTeam = {
        ...teamData,
        points: totalPoints,
        pointHistory
      };
      
      return {
        success: true,
        team: updatedTeam,
        pointHistory,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error in updatePoints procedure:", error);
      throw new Error("Failed to update points");
    }
  });