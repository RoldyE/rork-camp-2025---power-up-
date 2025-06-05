import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PointEntry } from "@/types";
import { colors } from "@/constants/colors";

type PointHistoryCardProps = {
  entry: PointEntry;
};

export const PointHistoryCard = ({ entry }: PointHistoryCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.points}>+{entry.points}</Text>
        <Text style={styles.date}>{formatDate(entry.date)}</Text>
      </View>
      <Text style={styles.reason}>{entry.reason}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  points: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.success,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  reason: {
    fontSize: 14,
    color: colors.text,
  },
});