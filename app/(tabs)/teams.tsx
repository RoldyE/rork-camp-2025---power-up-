import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, Alert, ActivityIndicator, Text } from "react-native";
import { Header } from "@/components/Header";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTeamStore } from "@/store/teamStore";
import { RotateCcw } from "lucide-react-native";
import { TeamScoreCard } from "@/components/TeamScoreCard";
import { TeamPodium } from "@/components/TeamPodium";

export default function TeamsScreen() {
  const { teams, resetPoints, isLoading, error } = useTeamStore();
  const [showPodium, setShowPodium] = useState(true);

  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  const handleResetPoints = () => {
    Alert.alert(
      "Reset Team Points",
      "Are you sure you want to reset all team points to zero?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: async () => {
            try {
              await resetPoints();
              Alert.alert("Success", "All team points have been reset to zero.");
            } catch (error) {
              Alert.alert("Error", "Failed to reset points. Please try again.");
            }
          },
          style: "destructive" 
        }
      ]
    );
  };

  const toggleView = () => {
    setShowPodium(!showPodium);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Header 
          title="Team Standings" 
          subtitle="Current points for each team"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading team data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Header 
          title="Team Standings" 
          subtitle="Current points for each team"
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading teams: {error}</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={() => window.location.reload()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header 
        title="Team Standings" 
        subtitle="Current points for each team"
      />
      
      <View style={styles.viewToggleContainer}>
        <Pressable 
          style={[
            styles.viewToggleButton, 
            showPodium && styles.activeViewToggleButton
          ]}
          onPress={() => setShowPodium(true)}
        >
          <Text 
            style={[
              styles.viewToggleText,
              showPodium && styles.activeViewToggleText
            ]}
          >
            Podium View
          </Text>
        </Pressable>
        <Pressable 
          style={[
            styles.viewToggleButton, 
            !showPodium && styles.activeViewToggleButton
          ]}
          onPress={() => setShowPodium(false)}
        >
          <Text 
            style={[
              styles.viewToggleText,
              !showPodium && styles.activeViewToggleText
            ]}
          >
            List View
          </Text>
        </Pressable>
      </View>
      
      {showPodium ? (
        <TeamPodium />
      ) : (
        <FlatList
          data={sortedTeams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TeamScoreCard team={item} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}
      
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
  viewToggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeViewToggleButton: {
    backgroundColor: colors.primary,
  },
  viewToggleText: {
    color: colors.primary,
    fontWeight: "500",
  },
  activeViewToggleText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});