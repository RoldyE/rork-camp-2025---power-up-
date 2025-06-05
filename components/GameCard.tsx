import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { GameScheduleItem } from "@/types";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { Info } from "lucide-react-native";

type GameCardProps = {
  item: GameScheduleItem;
};

export const GameCard = ({ item }: GameCardProps) => {
  const router = useRouter();

  // Convert 24-hour format to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hoursNum = parseInt(hours, 10);
    const period = hoursNum >= 12 ? "PM" : "AM";
    const hours12 = hoursNum % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  };

  const handleViewInstructions = () => {
    router.push(`/game-details/${item.id}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(item.startTime)}</Text>
        <Text style={styles.timeSeparator}>-</Text>
        <Text style={styles.time}>{formatTime(item.endTime)}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.locationContainer}>
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
      <Pressable 
        style={styles.instructionsButton}
        onPress={handleViewInstructions}
      >
        <Info size={20} color={colors.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80, // Increased width for AM/PM format
  },
  time: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  timeSeparator: {
    fontSize: 14,
    color: colors.textLight,
    marginVertical: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: colors.textLight,
  },
  instructionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginLeft: 8,
  },
});