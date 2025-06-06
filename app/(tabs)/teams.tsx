import React, { useEffect } from "react";
import { View, StyleSheet, FlatList, Text, ActivityIndicator, AppState } from "react-native";
import { Header } from "@/components/Header";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTeamStore } from "@/store/teamStore";
import { SimpleTeamCard } from "@/components/SimpleTeamCard";
import { usePolling } from "@/hooks/usePolling";

export default function TeamsScreen() {
  const { teams, fetchTeams, isLoading } = useTeamStore();

  // Initial fetch on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Set up polling to keep teams data fresh - DISABLED automatic polling
  const { poll } = usePolling(fetchTeams, { 
    interval: 300000, // Poll every 5 minutes
    immediate: false, // Don't poll immediately on mount (we already fetch in useEffect)
    enabled: false // Disable automatic polling completely
  });
  
  // Manual poll when tab becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // Only poll when app becomes active
        poll();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [poll]);

  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header 
        title="Team Standings" 
        subtitle="Current points for each team"
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      <FlatList
        data={sortedTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SimpleTeamCard team={item} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 10,
  },
  content: {
    paddingBottom: 100,
    padding: 16,
  },
});