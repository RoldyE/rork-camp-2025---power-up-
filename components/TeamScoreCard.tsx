import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/constants/colors";
import { Team } from "@/types";

export interface TeamScoreCardProps {
  team: Team;
  rank: number;
  onPress?: () => void;
}

export const TeamScoreCard = ({ team, rank, onPress }: TeamScoreCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.9 : 1 }
      ]}
      onPress={onPress}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      
      <View style={[styles.colorIndicator, { backgroundColor: team.color }]} />
      
      <View style={styles.infoContainer}>
        <Text style={styles.teamName}>{team.name}</Text>
      </View>
      
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>{team.points}</Text>
        <Text style={styles.pointsLabel}>points</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textLight,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  pointsContainer: {
    alignItems: "flex-end",
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  pointsLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
});