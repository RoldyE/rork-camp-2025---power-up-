import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import { useTeamStore } from "@/store/teamStore";
import { Trophy } from "lucide-react-native";
import { Team } from "@/types";

interface TeamPodiumProps {
  teams?: Team[]; // Make teams optional, will use store if not provided
}

export const TeamPodium: React.FC<TeamPodiumProps> = ({ teams: propTeams }) => {
  const { teams: storeTeams } = useTeamStore();
  
  // Use provided teams or fall back to store teams
  const teams = propTeams || storeTeams;
  
  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  
  // Get top 3 teams
  const firstPlace = sortedTeams[0];
  const secondPlace = sortedTeams[1];
  const thirdPlace = sortedTeams[2];
  
  return (
    <View style={styles.container}>
      <View style={styles.trophyContainer}>
        <Trophy size={40} color="#FFD700" />
        <Text style={styles.trophyText}>Team Standings</Text>
      </View>
      
      <View style={styles.podiumContainer}>
        {/* Second Place */}
        <View style={styles.podiumColumn}>
          {secondPlace && (
            <>
              <View style={[styles.teamCircle, { backgroundColor: secondPlace.color }]}>
                <Text style={styles.teamInitial}>{secondPlace.name.charAt(0)}</Text>
              </View>
              <Text style={styles.teamName}>{secondPlace.name}</Text>
              <Text style={styles.teamPoints}>{secondPlace.points} pts</Text>
              <View style={[styles.podiumBlock, styles.secondPlace]}>
                <Text style={styles.podiumPosition}>2</Text>
              </View>
            </>
          )}
        </View>
        
        {/* First Place */}
        <View style={styles.podiumColumn}>
          {firstPlace && (
            <>
              <View style={styles.crownContainer}>
                <Text style={styles.crown}>👑</Text>
              </View>
              <View style={[styles.teamCircle, { backgroundColor: firstPlace.color }]}>
                <Text style={styles.teamInitial}>{firstPlace.name.charAt(0)}</Text>
              </View>
              <Text style={styles.teamName}>{firstPlace.name}</Text>
              <Text style={styles.teamPoints}>{firstPlace.points} pts</Text>
              <View style={[styles.podiumBlock, styles.firstPlace]}>
                <Text style={styles.podiumPosition}>1</Text>
              </View>
            </>
          )}
        </View>
        
        {/* Third Place */}
        <View style={styles.podiumColumn}>
          {thirdPlace && (
            <>
              <View style={[styles.teamCircle, { backgroundColor: thirdPlace.color }]}>
                <Text style={styles.teamInitial}>{thirdPlace.name.charAt(0)}</Text>
              </View>
              <Text style={styles.teamName}>{thirdPlace.name}</Text>
              <Text style={styles.teamPoints}>{thirdPlace.points} pts</Text>
              <View style={[styles.podiumBlock, styles.thirdPlace]}>
                <Text style={styles.podiumPosition}>3</Text>
              </View>
            </>
          )}
        </View>
      </View>
      
      {/* Other Teams */}
      <View style={styles.otherTeamsContainer}>
        <Text style={styles.otherTeamsTitle}>Other Teams</Text>
        {sortedTeams.slice(3).map((team, index) => (
          <View key={team.id} style={styles.otherTeamRow}>
            <Text style={styles.otherTeamPosition}>{index + 4}</Text>
            <View style={[styles.otherTeamColor, { backgroundColor: team.color }]} />
            <Text style={styles.otherTeamName}>{team.name}</Text>
            <Text style={styles.otherTeamPoints}>{team.points} pts</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  trophyContainer: {
    alignItems: "center",
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  trophyText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 32,
    height: 280,
  },
  podiumColumn: {
    alignItems: "center",
    width: 100,
  },
  teamCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  teamInitial: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  teamPoints: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  podiumBlock: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  firstPlace: {
    backgroundColor: "#FFD700", // Gold
    height: 120,
  },
  secondPlace: {
    backgroundColor: "#C0C0C0", // Silver
    height: 90,
  },
  thirdPlace: {
    backgroundColor: "#CD7F32", // Bronze
    height: 60,
  },
  podiumPosition: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  crownContainer: {
    marginBottom: 8,
  },
  crown: {
    fontSize: 24,
  },
  otherTeamsContainer: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  otherTeamsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  otherTeamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  otherTeamPosition: {
    width: 30,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
  otherTeamColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  otherTeamName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  otherTeamPoints: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
});