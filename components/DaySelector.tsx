import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { colors } from "@/constants/colors";

const days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type DaySelectorProps = {
  selectedDay: string;
  onSelectDay: (day: string) => void;
};

export const DaySelector = ({ selectedDay, onSelectDay }: DaySelectorProps) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {days.map((day) => (
          <Pressable
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.selectedDayButton,
            ]}
            onPress={() => onSelectDay(day)}
          >
            <Text
              style={[
                styles.typeText,
                selectedDay === day && styles.selectedTypeText,
              ]}
            >
              {day}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
    alignItems: "center",
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    textAlign: "center",
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedTypeText: {
    color: "white",
  },
});