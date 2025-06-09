import React from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { Header } from "@/components/Header";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTeamStore } from "@/store/teamStore";
import { SimpleTeamCard } from "@/components/SimpleTeamCard";

export default function TeamsScreen() {
  const { teams } = useTeamStore();

  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

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
          renderItem={({ item }) => <SimpleTeamCard team={item} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
    marginTop: 8,
  },
  content: {
    paddingBottom: 100,
  },
});