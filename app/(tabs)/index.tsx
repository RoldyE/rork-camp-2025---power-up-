import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { ScheduleCard } from "@/components/ScheduleCard";
import { DaySelector } from "@/components/DaySelector";
import { Header } from "@/components/Header";
import { schedule } from "@/mocks/schedule";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  
  const filteredSchedule = schedule.filter(item => item.day === selectedDay);
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header 
        title="Camp 2025 - Power Up!" 
        subtitle="View all activities for the day"
      />
      <DaySelector 
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
      <FlatList
        data={filteredSchedule}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ScheduleCard item={item} />}
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
    paddingBottom: 80, // Extra padding at bottom to prevent content being hidden by tab bar
  },
});