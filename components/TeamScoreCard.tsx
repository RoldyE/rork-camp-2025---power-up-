import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Team } from "@/types";
import { colors } from "@/constants/colors";

type TeamScoreCardProps = {
  team: Team;
  position?: number;
  onPress?: () => void;
};

export const TeamScoreCard = ({ team, position, onPress }: TeamScoreCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      {position && (
        <View style={[
          styles.rankBadge,
          position === 1 ? styles.firstPlace : 
          position === 2 ? styles.secondPlace : 
          position === 3 ? styles.thirdPlace : 
          styles.otherPlace
        ]}>
          <Text style={styles.rankText}>{position}</Text>
        </View>
      )}
      
      <View style={styles.teamInfo}>
        <View style={[styles.teamDot, { backgroundColor: team.color }]} />
        <Text style={styles.teamName}>{team.name}</Text>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{team.points}</Text>
        <Text style={styles.pointsLabel}>points</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  firstPlace: {
    backgroundColor: "#FFD700",
  },
  secondPlace: {
    backgroundColor: "#C0C0C0",
  },
  thirdPlace: {
    backgroundColor: "#CD7F32",
  },
  otherPlace: {
    backgroundColor: colors.border,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  teamInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  teamDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  pointsLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
});