import React, { useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { Header } from "@/components/Header";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTeamStore } from "@/store/teamStore";
import { RotateCcw } from "lucide-react-native";
import { TeamScoreCard } from "@/components/TeamScoreCard";
import { TeamPodium } from "@/components/TeamPodium";

export default function TeamsScreen() {
  const { teams, resetPoints, fetchTeams, syncTeams } = useTeamStore();

  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  useEffect(() => {
    // Initialize Supabase data
    syncTeams();
    // Fetch teams from Supabase
    fetchTeams();
  }, []);

  const handleResetPoints = () => {
    Alert.alert(
      "Reset Team Points",
      "Are you sure you want to reset all team points to zero?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: () => {
            resetPoints();
            Alert.alert("Success", "All team points have been reset to zero.");
          },
          style: "destructive" 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header 
        title="Team Standings" 
        subtitle="Current points for each team"
      />
      
      <FlatList
        data={sortedTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TeamScoreCard team={item} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<TeamPodium />}
      />
      
      <Pressable style={styles.resetButton} onPress={handleResetPoints}>
        <RotateCcw size={16} color={colors.error} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  resetButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.error}15`,
    alignItems: "center",
    justifyContent: "center",
  },
});