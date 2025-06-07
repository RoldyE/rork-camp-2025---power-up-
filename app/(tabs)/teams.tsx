import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, Pressable, Alert, ActivityIndicator, AppState } from "react-native";
import { Header } from "@/components/Header";
import { TeamScoreCard } from "@/components/TeamScoreCard";
import { TeamPodium } from "@/components/TeamPodium";
import { useTeamStore } from "@/store/teamStore";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { RefreshCw, RotateCcw } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePolling } from "@/hooks/usePolling";

export default function TeamsScreen() {
  const router = useRouter();
  const { teams, fetchTeams, resetPoints, isLoading } = useTeamStore();
  
  // Initial fetch when component mounts
  useEffect(() => {
    fetchTeams();
  }, []);
  
  // Set up polling to keep team data fresh
  const { poll } = usePolling(
    () => fetchTeams(),
    { 
      interval: 30000, // Poll every 30 seconds
      immediate: false, // Don't poll immediately on mount (we already fetch in useEffect)
      enabled: true // Enable automatic polling
    }
  );
  
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
  
  const handleResetPoints = () => {
    Alert.alert(
      "Reset All Points",
      "Are you sure you want to reset all team points to zero?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: async () => {
            await resetPoints();
            Alert.alert("Success", "All team points have been reset to zero.");
          },
          style: "destructive" 
        }
      ]
    );
  };
  
  const handleManualRefresh = async () => {
    try {
      await fetchTeams();
      Alert.alert("Refreshed", "Team points have been updated.");
    } catch (error) {
      console.error("Error refreshing teams:", error);
      Alert.alert("Error", "Failed to refresh team points. Please try again.");
    }
  };
  
  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  
  // Get top 3 teams for podium
  const topTeams = sortedTeams.slice(0, 3);
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header 
        title="Team Standings" 
        subtitle="Current team points and rankings"
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      <View style={styles.podiumContainer}>
        <TeamPodium teams={topTeams} />
      </View>
      
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderText}>All Teams</Text>
        <Text style={styles.lastUpdatedText}>
          {teams.length > 0 && "Updated: " + new Date().toLocaleTimeString()}
        </Text>
      </View>
      
      <FlatList
        data={sortedTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TeamScoreCard 
            team={item} 
            rank={index + 1}
            onPress={() => router.push(`/team-details/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.buttonContainer}>
        <Pressable 
          style={styles.refreshButton}
          onPress={handleManualRefresh}
        >
          <RefreshCw size={18} color="white" />
        </Pressable>
        
        <Pressable 
          style={styles.resetButton}
          onPress={handleResetPoints}
        >
          <RotateCcw size={18} color="white" />
        </Pressable>
      </View>
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
  podiumContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  listHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: colors.textLight,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom to prevent content being hidden by tab bar
  },
  buttonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "column",
    gap: 16,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});