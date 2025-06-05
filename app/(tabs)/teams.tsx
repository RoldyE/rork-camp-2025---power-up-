import React from "react";
import { View, StyleSheet, FlatList, Text, Pressable } from "react-native";
import { Header } from "@/components/Header";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTeamStore } from "@/store/teamStore";
import { TeamScoreCard } from "@/components/TeamScoreCard";
import { RotateCcw } from "lucide-react-native";
import { Alert } from "react-native";

export default function TeamsScreen() {
  const { teams, resetPoints } = useTeamStore();

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
          onPress: () => {
            resetPoints();
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
      
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>All Teams</Text>
        <FlatList
          data={sortedTeams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TeamScoreCard team={item} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Pressable 
        style={styles.resetButton}
        onPress={handleResetPoints}
      >
        <RotateCcw size={16} color={colors.textLight} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  content: {
    paddingBottom: 100,
  },
  resetButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.border}80`,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
});