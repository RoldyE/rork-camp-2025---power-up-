import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { colors } from "@/constants/colors";
import { NominationType } from "@/types";

const nominationTypes: { id: NominationType; label: string; color: string }[] = [
  { id: "daily", label: "Camper of the Day", color: colors.primary },
  { id: "sportsmanship", label: "Sportsmanship", color: colors.sportsmanship },
  { id: "bravery", label: "Bravery", color: colors.bravery },
  { id: "service", label: "Service", color: colors.service },
  { id: "scholar", label: "Biblical Scholar", color: colors.scholar },
  { id: "other", label: "Other", color: colors.accent },
];

type NominationTypeSelectorProps = {
  selectedType: NominationType;
  onSelectType: (type: NominationType) => void;
};

export const NominationTypeSelector = ({
  selectedType,
  onSelectType,
}: NominationTypeSelectorProps) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {nominationTypes.map((type) => (
          <Pressable
            key={type.id}
            style={[
              styles.typeButton,
              { backgroundColor: selectedType === type.id ? type.color : colors.card }
            ]}
            onPress={() => onSelectType(type.id)}
          >
            <Text
              style={[
                styles.typeText,
                { color: selectedType === type.id ? "white" : colors.text }
              ]}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export const getNominationTypeColor = (type: NominationType): string => {
  const nominationType = nominationTypes.find(t => t.id === type);
  return nominationType?.color || colors.primary;
};

export const getNominationTypeLabel = (type: NominationType): string => {
  const nominationType = nominationTypes.find(t => t.id === type);
  return nominationType?.label || "Nomination";
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});