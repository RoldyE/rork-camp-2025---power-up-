import { publicProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export default publicProcedure.query(async () => {
  try {
    // Fetch all teams from Supabase
    const { data: teamsData, error } = await supabase
      .from('teams')
      .select('*');
    
    if (error) {
      console.error("Error fetching teams from Supabase:", error);
      throw new Error("Failed to get teams from Supabase");
    }
    
    // Fetch points for each team
    const teamsWithPoints = await Promise.all(teamsData.map(async (team) => {
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('points, reason, updated_at')
        .eq('team_id', team.id);
      
      if (pointsError) {
        console.error(`Error fetching points for team ${team.id}:`, pointsError);
        return { ...team, points: 0, pointHistory: [] };
      }
      
      const totalPoints = pointsData?.reduce((sum, entry) => sum + entry.points, 0) || 0;
      const pointHistory = pointsData?.map(entry => ({
        id: entry.updated_at,
        points: entry.points,
        reason: entry.reason || "No reason provided",
        date: entry.updated_at
      })) || [];
      
      return { ...team, points: totalPoints, pointHistory };
    }));
    
    return {
      teams: teamsWithPoints,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error in getTeams procedure:", error);
    throw new Error("Failed to get teams");
  }
});