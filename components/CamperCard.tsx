import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Camper } from "@/types";
import { colors } from "@/constants/colors";
import { teams } from "@/mocks/teams";
import { Image } from "expo-image";

type CamperCardProps = {
  camper: Camper;
  onPress?: () => void;
  selected?: boolean;
};

export const CamperCard = ({ camper, onPress, selected }: CamperCardProps) => {
  const team = teams.find((t) => t.id === camper.teamId);
  
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <View style={styles.imageContainer}>
        {camper.image ? (
          <Image 
            source={{ uri: camper.image }} 
            style={styles.image} 
            contentFit="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: team?.color + "40" || colors.primary + "40" }]}>
            <Text style={styles.placeholderText}>{camper.name.charAt(0)}</Text>
          </View>
        )}
        <View 
          style={[
            styles.teamIndicator, 
            { backgroundColor: team?.color || colors.primary }
          ]} 
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{camper.name}</Text>
        <Text style={styles.team}>{team?.name}</Text>
      </View>
      {selected && (
        <View style={styles.selectedIndicator} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  teamIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  team: {
    fontSize: 14,
    color: colors.textLight,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});