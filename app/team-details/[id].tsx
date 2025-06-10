import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert, FlatList, ScrollView } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useTeamStore } from "@/store/teamStore";
import { campers } from "@/mocks/campers";
import { CamperCard } from "@/components/CamperCard";
import { PointHistoryCard } from "@/components/PointHistoryCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabaseClient";
import { RotateCcw } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { teams, addPoints, getPointHistory, resetTeamPoints } = useTeamStore();
  const { userProfile } = useAuthStore();
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "history">("members");
  const [teamCampers, setTeamCampers] = useState<any[]>([]);
  
  const team = teams.find((t) => t.id === id);
  const pointHistory = getPointHistory(id || "");
  
  // Check if user is admin
  const isAdmin = userProfile?.isAdmin || false;
  
  useEffect(() => {
    // Get team members from local data first
    const localCampers = campers.filter((c) => c.teamId === id);
    setTeamCampers(localCampers);
    
    // Then try to fetch from Supabase if available
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('campers')
          .select('*')
          .eq('teamid', id);
          
        if (error) {
          console.error('Error fetching team members:', error);
        } else if (data && data.length > 0) {
          setTeamCampers(data);
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      }
    };
    
    fetchTeamMembers();
  }, [id]);
  
  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Team not found</Text>
      </SafeAreaView>
    );
  }
  
  const handleAddPoints = async () => {
    if (!isAdmin) {
      Alert.alert("Access Denied", "Only admins can add points");
      return;
    }
    
    const points = parseInt(pointsToAdd);
    if (isNaN(points)) {
      Alert.alert("Invalid Input", "Please enter a valid number");
      return;
    }
    
    if (!reason.trim()) {
      Alert.alert("Missing Reason", "Please enter a reason for adding points");
      return;
    }
    
    // Add points locally
    addPoints(team.id, points, reason.trim());
    
    setPointsToAdd("");
    setReason("");
    Alert.alert("Points Added", `${points} points added to ${team.name}`);
  };

  const handleQuickAddPoints = async (points: number) => {
    if (!isAdmin) {
      Alert.alert("Access Denied", "Only admins can add points");
      return;
    }
    
    const defaultReason = `Quick add ${points} points`;
    
    // Add points locally
    addPoints(team.id, points, defaultReason);
    
    Alert.alert("Success", `${points} points added to ${team.name}`);
  };

  const handleResetPoints = () => {
    if (!isAdmin) {
      Alert.alert("Access Denied", "Only admins can reset points");
      return;
    }
    
    Alert.alert(
      "Reset Team Points",
      `Are you sure you want to reset ${team.name}'s points to zero? This will only reset this team's points, not all teams.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: () => {
            // Reset points for this team only
            resetTeamPoints(team.id);
            Alert.alert("Success", `${team.name}'s points have been reset to zero.`);
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
      
      <View style={[styles.header, { backgroundColor: team.color + "20" }]}>
        <Text style={styles.teamName}>{team.name}</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Total Points</Text>
          <Text style={styles.pointsValue}>{team.points}</Text>
        </View>
      </View>
      
      {isAdmin && (
        <>
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
        </>
      )}
      
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

      {/* Reset button for this team only - only show for admins */}
      {isAdmin && (
        <Pressable 
          style={styles.resetButton}
          onPress={handleResetPoints}
        >
          <RotateCcw size={16} color="white" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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