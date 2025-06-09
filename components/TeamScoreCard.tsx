import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Team } from "@/types";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

type TeamScoreCardProps = {
  team: Team;
  onPress?: () => void;
};

export const TeamScoreCard = ({ team, onPress }: TeamScoreCardProps) => {
  const router = useRouter();
  
  const handleViewDetails = () => {
    router.push(`/team-details/${team.id}`);
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
      <View style={styles.detailsButton}>
        <ChevronRight size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
};

export const TeamScoreList = () => {
  const teams = []; // This is just a placeholder, the actual implementation is in the teams.tsx file
  return null;
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  colorBar: {
    width: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  pointsContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pointsLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  detailsButton: {
    width: 40,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}10`,
  },
});