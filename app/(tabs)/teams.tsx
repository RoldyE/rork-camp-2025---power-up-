import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from "react-native";
import { Stack } from "expo-router";
import { useTeamStore } from "@/store/teamStore";
import { TeamScoreCard } from "@/components/TeamScoreCard";
import { TeamPodium } from "@/components/TeamPodium";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { usePolling } from "@/hooks/usePolling";
import { RefreshCw } from "lucide-react-native";

export default function TeamsScreen() {
  const router = useRouter();
  const { teams, fetchTeams, isLoading, lastUpdated } = useTeamStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch teams on initial load
  useEffect(() => {
    fetchTeams();
  }, []);
  
  // Set up polling for team data
  usePolling(fetchTeams, 10000); // Poll every 10 seconds
  
  // Handle manual refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams();
    setRefreshing(false);
  };
  
  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  
  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    
    // If less than a minute ago
    if (diff < 60000) {
      return "Just now";
    }
    
    // If less than an hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }
    
    // Otherwise show the time
    return lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  
  const handleTeamPress = (teamId: string) => {
    router.push(`/team-details/${teamId}`);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Team Standings",
          headerRight: () => (
            <Pressable 
              onPress={onRefresh}
              style={({ pressed }) => [
                styles.refreshButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <RefreshCw size={20} color={colors.primary} />
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Last updated indicator */}
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {formatLastUpdated()}
          </Text>
        </View>
        
        {/* Team Podium */}
        <TeamPodium teams={teams} />
        
        {/* Team List */}
        <View style={styles.teamListContainer}>
          <Text style={styles.sectionTitle}>All Teams</Text>
          
          {sortedTeams.map((team, index) => (
            <TeamScoreCard
              key={team.id}
              team={team}
              rank={index + 1}
              onPress={() => handleTeamPress(team.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  lastUpdatedContainer: {
    padding: 12,
    alignItems: "center",
  },
  lastUpdatedText: {
    fontSize: 12,
    color: colors.textLight,
  },
  teamListContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
});