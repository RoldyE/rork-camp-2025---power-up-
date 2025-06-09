import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTeamStore } from "@/store/teamStore";
import { TeamScoreCard } from "@/components/TeamScoreCard";
import { TeamPodium } from "@/components/TeamPodium";
import { colors } from "@/constants/colors";
import { usePolling } from "@/hooks/usePolling";
import { RefreshCw } from "lucide-react-native";

export default function TeamsScreen() {
  const router = useRouter();
  const { teams, isLoading, fetchTeams, lastUpdated } = useTeamStore();
  
  // Initial fetch
  useEffect(() => {
    fetchTeams();
  }, []);
  
  // Set up polling to keep data fresh
  usePolling(fetchTeams, { 
    enabled: true,
    interval: 10000, // Poll every 10 seconds
    onError: (error) => console.error("Polling error:", error)
  });
  
  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  
  // Navigate to team details
  const handleTeamPress = (teamId: string) => {
    router.push(`/team-details/${teamId}`);
  };
  
  // Manual refresh
  const handleRefresh = () => {
    fetchTeams();
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Leaderboard</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw 
            size={20} 
            color={colors.primary} 
            style={isLoading ? styles.rotating : undefined} 
          />
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      {!isLoading && teams.length > 0 && (
        <>
          {/* Podium View */}
          <TeamPodium />
          
          <View style={styles.divider} />
          
          {/* List View */}
          <Text style={styles.sectionTitle}>All Teams</Text>
          {sortedTeams.map((team, index) => (
            <TeamScoreCard
              key={team.id}
              team={team}
              position={index + 1}
              onPress={() => handleTeamPress(team.id)}
            />
          ))}
          
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </Text>
          )}
        </>
      )}
      
      {!isLoading && teams.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No teams found</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  rotating: {
    transform: [{ rotate: "45deg" }],
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
  },
  lastUpdated: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: colors.textLight,
  },
});