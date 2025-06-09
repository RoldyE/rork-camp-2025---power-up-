import React, { useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Text, ActivityIndicator, AppState } from "react-native";
import { Header } from "@/components/Header";
import { colors } from "@/constants/colors";
import { useTeamStore } from "@/store/teamStore";
import { SimpleTeamCard } from "@/components/SimpleTeamCard";
import { usePolling } from "@/hooks/usePolling";

export default function TeamsScreen() {
  const { teams, fetchTeams, isLoading } = useTeamStore();

  // Initial fetch
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Set up polling to keep teams data fresh - reduced frequency
  const { poll } = usePolling(fetchTeams, { 
    interval: 300000, // Poll every 5 minutes
    immediate: false, // Don't poll immediately on mount (we already fetch in useEffect)
    enabled: false // Disable automatic polling
  });
  
  // Manual poll when tab becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
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
    <View style={styles.container}>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No teams found</Text>
            <Text style={styles.emptySubtext}>Team data could not be loaded. Please try again later.</Text>
          </View>
        }
      />
    </View>
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
});