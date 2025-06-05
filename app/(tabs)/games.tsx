import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { GameCard } from "@/components/GameCard";
import { DaySelector } from "@/components/DaySelector";
import { Header } from "@/components/Header";
import { games } from "@/mocks/games";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GamesScreen() {
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  
  const filteredGames = games.filter(item => item.day === selectedDay);
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header 
        title="Activities Schedule" 
        subtitle="View all camp activities"
      />
      <DaySelector 
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom to prevent content being hidden by tab bar
  },
});