import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert, FlatList, ActivityIndicator, AppState } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useTeamStore } from "@/store/teamStore";
import { campers } from "@/mocks/campers";
import { CamperCard } from "@/components/CamperCard";
import { PointHistoryCard } from "@/components/PointHistoryCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { RotateCcw } from "lucide-react-native";
import { usePolling } from "@/hooks/usePolling";

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { teams, addPoints, getPointHistory, resetTeamPoints, fetchTeams, isLoading } = useTeamStore();
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "history">("members");
  
  // Initial fetch
  useEffect(() => {
    fetchTeams();
  }, []);
  
  // Set up polling to keep team data fresh
  const { poll } = usePolling(fetchTeams, { 
    interval: 60000, // Poll every 60 seconds
    immediate: false // Don't poll immediately on mount (we already fetch in useEffect)
  });
  
  // Manual poll when screen becomes active
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
  
  const team = teams.find((t) => t.id === id);
  const pointHistory = getPointHistory(id || "");
  const teamCampers = campers.filter((c) => c.teamId === id);
  
  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Team not found</Text>
      </SafeAreaView>
    );
  }
  
  const handleAddPoints = async () => {
    const points = parseInt(pointsToAdd);
    if (isNaN(points)) {
      Alert.alert("Invalid Input", "Please enter a valid number");
      return;
    }
    
    if (!reason.trim()) {
      Alert.alert("Missing Reason", "Please enter a reason for adding points");
      return;
    }
    
    // Add points
    await addPoints(team.id, points, reason.trim());
    
    setPointsToAdd("");
    setReason("");
    Alert.alert("Points Added", `${points} points added to ${team.name}`);
    
    // Refresh data after adding points
    await fetchTeams();
  };

  const handleQuickAddPoints = async (points: number) => {
    const defaultReason = `Quick add ${points} points`;
    
    // Add points
    await addPoints(team.id, points, defaultReason);
    
    Alert.alert("Success", `${points} points added to ${team.name}`);
    
    // Refresh data after adding points
    await fetchTeams();
  };

  const handleResetPoints = () => {
    Alert.alert(
      "Reset Team Points",
      `Are you sure you want to reset ${team.name}'s points to zero?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: async () => {
            // Reset points for this team only
            await resetTeamPoints(team.id);
            Alert.alert("Success", `${team.name}'s points have been reset to zero.`);
            
            // Refresh data after reset
            await fetchTeams();
          },
          style: "destructive" 
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen 
        options={{ 
          title: team.name,
          headerStyle: {
            backgroundColor: team.color + "20",
          },
        }} 
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      <View style={[styles.header, { backgroundColor: team.color + "20" }]}>
        <Text style={styles.teamName}>{team.name}</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Total Points</Text>
          <Text style={styles.pointsValue}>{team.points}</Text>
        </View>
      </View>
      
      <View style={styles.quickPointsContainer}>
        <Text style={styles.quickPointsLabel}>Quick Add Points:</Text>
        <View style={styles.quickButtonsRow}>
          <Pressable 
            style={[styles.quickButton, { backgroundColor: team.color + "80" }]} 
            onPress={() => handleQuickAddPoints(1)}
          >
            <Text style={styles.quickButtonText}>+1</Text>
          </Pressable>
          <Pressable 
            style={[styles.quickButton, { backgroundColor: team.color + "80" }]} 
            onPress={() => handleQuickAddPoints(2)}
          >
            <Text style={styles.quickButtonText}>+2</Text>
          </Pressable>
          <Pressable 
            style={[styles.quickButton, { backgroundColor: team.color + "80" }]} 
            onPress={() => handleQuickAddPoints(5)}
          >
            <Text style={styles.quickButtonText}>+5</Text>
          </Pressable>
          <Pressable 
            style={[styles.quickButton, { backgroundColor: team.color + "80" }]} 
            onPress={() => handleQuickAddPoints(10)}
          >
            <Text style={styles.quickButtonText}>+10</Text>
          </Pressable>
        </View>
      </View>
      
      <View style={styles.addPointsContainer}>
        <Text style={styles.sectionTitle}>Custom Points</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.pointsInput}
            value={pointsToAdd}
            onChangeText={setPointsToAdd}
            placeholder="Points"
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for points"
          />
        </View>
        <Pressable 
          style={[styles.addButton, { backgroundColor: team.color }]}
          onPress={handleAddPoints}
        >
          <Text style={styles.addButtonText}>Add Points</Text>
        </Pressable>
      </View>
      
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "members" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("members")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "members" && styles.activeTabText,
            ]}
          >
            Team Members
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "history" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            Point History
          </Text>
        </Pressable>
      </View>
      
      {activeTab === "members" ? (
        <FlatList
          data={teamCampers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CamperCard camper={item} />}
          contentContainerStyle={styles.contentContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No team members found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={pointHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PointHistoryCard entry={item} />}
          contentContainerStyle={styles.contentContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No point history yet</Text>
              <Text style={styles.emptySubtext}>
                Points added to this team will appear here
              </Text>
            </View>
          }
        />
      )}

      {/* Reset button for this team only */}
      <Pressable 
        style={styles.resetButton}
        onPress={handleResetPoints}
      >
        <RotateCcw size={16} color="white" />
      </Pressable>
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
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  pointsContainer: {
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
  },
  quickPointsContainer: {
    padding: 16,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  quickPointsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  quickButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  quickButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  addPointsContainer: {
    padding: 16,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  pointsInput: {
    width: 80,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  reasonInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  addButton: {
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
  },
  contentContainer: {
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
  resetButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
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