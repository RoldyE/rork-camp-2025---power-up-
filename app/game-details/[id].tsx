import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors } from "@/constants/colors";
import { games } from "@/mocks/games";
import { teams } from "@/mocks/teams";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = games.find((g) => g.id === id);
  
  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Activity not found</Text>
      </SafeAreaView>
    );
  }
  
  // Convert 24-hour format to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hoursNum = parseInt(hours, 10);
    const period = hoursNum >= 12 ? "PM" : "AM";
    const hours12 = hoursNum % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen 
        options={{ 
          title: game.title,
          headerStyle: {
            backgroundColor: colors.background,
          },
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{game.title}</Text>
          <Text style={styles.day}>{game.day}</Text>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>
              {formatTime(game.startTime)} - {formatTime(game.endTime)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{game.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.infoValue}>{game.description}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Instructions</Text>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>{game.instructions}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  day: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  instructionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  instructions: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginTop: 24,
  },
});