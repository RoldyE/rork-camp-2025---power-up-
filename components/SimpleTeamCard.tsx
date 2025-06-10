import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Team } from "@/types";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ChevronRight, RotateCcw } from "lucide-react-native";
import { useTeamStore } from "@/store/teamStore";
import { Alert } from "react-native";

type SimpleTeamCardProps = {
  team: Team;
};

export const SimpleTeamCard = ({ team }: SimpleTeamCardProps) => {
  const router = useRouter();
  const { resetTeamPoints } = useTeamStore();
  
  const handleViewDetails = () => {
    router.push(`/team-details/${team.id}`);
  };
  
  const handleResetTeam = (e: any) => {
    e.stopPropagation(); // Prevent navigation when reset is pressed
    
    Alert.alert(
      "Reset Team Points",
      `Are you sure you want to reset ${team.name}'s points to zero?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: () => {
            resetTeamPoints(team.id);
            Alert.alert("Success", `${team.name}'s points have been reset to zero.`);
          },
          style: "destructive" 
        }
      ]
    );
  };
  
  return (
    <Pressable 
      onPress={handleViewDetails} 
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <View style={[styles.colorBar, { backgroundColor: team.color }]} />
      <View style={styles.contentContainer}>
        <Text style={styles.teamName}>{team.name}</Text>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsLabel}>Points</Text>
        <Text style={styles.pointsValue}>{team.points}</Text>
      </View>
      <Pressable 
        style={styles.resetButton}
        onPress={handleResetTeam}
      >
        <RotateCcw size={12} color={colors.error} />
      </Pressable>
      <View style={styles.detailsButton}>
        <ChevronRight size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
    height: 60,
  },
  colorBar: {
    width: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  pointsContainer: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 70,
  },
  pointsLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  resetButton: {
    width: 24,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.error}08`,
  },
  detailsButton: {
    width: 32,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}08`,
  },
});