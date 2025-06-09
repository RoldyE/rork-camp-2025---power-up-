import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useTeamStore } from "@/store/teamStore";
import { useNominationStore } from "@/store/nominationStore";

export default function RootLayout() {
  const { fetchTeams } = useTeamStore();
  const { fetchNominations } = useNominationStore();
  
  // Use real-time updates for Supabase data
  useRealtimeUpdates();
  
  // Fetch initial data on app load
  useEffect(() => {
    fetchTeams();
    fetchNominations();
  }, [fetchTeams, fetchNominations]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Slot />
    </SafeAreaView>
  );
}