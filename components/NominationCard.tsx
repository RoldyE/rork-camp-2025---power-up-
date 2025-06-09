import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Nomination } from "@/types";
import { colors } from "@/constants/colors";
import { campers } from "@/mocks/campers";
import { teams } from "@/mocks/teams";
import { useNominationStore } from "@/store/nominationStore";
import { Image } from "expo-image";
import { getNominationTypeColor, getNominationTypeLabel } from "./NominationTypeSelector";
import { Trash2 } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";

type NominationCardProps = {
  nomination: Nomination;
  onDelete?: () => void;
  onVote?: () => void;
  disabled?: boolean;
};

export const NominationCard = ({ nomination, onDelete, onVote, disabled = false }: NominationCardProps) => {
  const { voteForNomination, deleteNomination, hasUserVoted, getUserVoteCount } = useNominationStore();
  const { userProfile } = useAuthStore();
  const camper = campers.find((c) => c.id === nomination.camperId);
  const team = camper ? teams.find((t) => t.id === camper.teamId) : null;
  
  if (!camper) return null;
  
  const typeColor = getNominationTypeColor(nomination.type);
  const typeLabel = getNominationTypeLabel(nomination.type);
  
  const handleVote = async () => {
    if (onVote) {
      // Use the provided onVote handler if available
      onVote();
      return;
    }
    
    if (!userProfile) {
      Alert.alert("Login Required", "Please log in to vote");
      return;
    }
    
    // Check if user has already voted for this nomination type
    const hasVoted = hasUserVoted(userProfile.id, nomination.type);
    const voteCount = getUserVoteCount(userProfile.id, nomination.type, nomination.type === "daily" ? nomination.day : "all");
    
    if (hasVoted || voteCount >= 2) {
      Alert.alert("Already Voted", "You have already used your votes for this category");
      return;
    }
    
    try {
      // Record the vote
      await voteForNomination(nomination.id, userProfile.id, nomination.type, nomination.day);
      Alert.alert("Vote Recorded", "Your vote has been counted!");
    } catch (error) {
      console.error("Error voting:", error);
      Alert.alert("Error", "Failed to record your vote. Please try again.");
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Nomination",
      "Are you sure you want to delete this nomination?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            deleteNomination(nomination.id);
            if (onDelete) onDelete();
          },
          style: "destructive" 
        }
      ]
    );
  };
  
  return (
    <Pressable style={styles.card}>
      <View style={styles.header}>
        <View style={styles.camperInfo}>
          <View style={styles.imageContainer}>
            {camper.imageUrl ? (
              <Image 
                source={{ uri: camper.imageUrl }} 
                style={styles.image} 
                contentFit="cover"
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: team?.color + "40" || colors.primary + "40" }]}>
                <Text style={styles.placeholderText}>{camper.name.charAt(0)}</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.name}>{camper.name}</Text>
            <View style={styles.teamContainer}>
              <View 
                style={[
                  styles.teamDot, 
                  { backgroundColor: team?.color || colors.primary }
                ]} 
              />
              <Text style={styles.team}>{team?.name}</Text>
            </View>
          </View>
        </View>
        <View style={styles.voteContainer}>
          <Text style={styles.voteCount}>{nomination.votes}</Text>
          <Text style={styles.voteLabel}>votes</Text>
        </View>
      </View>
      
      <View style={[styles.typeBadge, { backgroundColor: typeColor + "20" }]}>
        <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
      </View>
      
      <View style={styles.dayBadge}>
        <Text style={styles.dayBadgeText}>{nomination.day}</Text>
      </View>
      
      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Nomination Reason:</Text>
        <Text style={styles.reason}>{nomination.reason}</Text>
      </View>
      <View style={styles.footer}>
        <Pressable 
          style={[
            styles.voteButton, 
            { backgroundColor: disabled ? colors.textLight : typeColor }
          ]}
          onPress={handleVote}
          disabled={disabled}
        >
          <Text style={styles.voteButtonText}>Vote</Text>
        </Pressable>
        <Pressable 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Trash2 size={16} color={colors.error} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  camperInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  team: {
    fontSize: 14,
    color: colors.textLight,
  },
  voteContainer: {
    alignItems: "center",
  },
  voteCount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  voteLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dayBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.secondary + "20",
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondary,
  },
  reasonContainer: {
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.error}15`,
    justifyContent: "center",
    alignItems: "center",
  },
});