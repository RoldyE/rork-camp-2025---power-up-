import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useNominationStore } from "@/store/nominationStore";
import { useAuthStore } from "@/store/authStore";
import { NominationCard } from "@/components/NominationCard";
import { DaySelector } from "@/components/DaySelector";
import { NominationTypeSelector } from "@/components/NominationTypeSelector";
import { colors } from "@/constants/colors";
import { NominationType } from "@/types";
import { Plus, RefreshCw } from "lucide-react-native";
import { usePolling } from "@/hooks/usePolling";

export default function NominationsScreen() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const { 
    nominations, 
    isLoading, 
    fetchNominations, 
    voteForNomination,
    getCurrentDayNominations,
    hasUserVoted,
    getUserVoteCount,
    lastUpdated
  } = useNominationStore();
  
  const [selectedDay, setSelectedDay] = useState("today");
  const [selectedType, setSelectedType] = useState<NominationType>("daily");
  
  // Initial fetch
  useEffect(() => {
    fetchNominations(selectedType, selectedDay);
  }, []);
  
  // Fetch when type or day changes
  useEffect(() => {
    fetchNominations(selectedType, selectedDay);
  }, [selectedType, selectedDay]);
  
  // Set up polling to keep data fresh
  usePolling(() => fetchNominations(selectedType, selectedDay), { 
    enabled: true,
    interval: 10000, // Poll every 10 seconds
    onError: (error) => console.error("Polling error:", error)
  });
  
  // Get nominations for the selected day and type
  const currentNominations = getCurrentDayNominations(selectedDay, selectedType);
  
  // Handle vote
  const handleVote = async (nominationId: string) => {
    if (!userProfile) return;
    
    // Check if user has already voted
    if (hasUserVoted(userProfile.id, selectedType)) {
      alert("You've already used all your votes for this category");
      return;
    }
    
    await voteForNomination(nominationId, userProfile.id, selectedType, selectedDay);
  };
  
  // Navigate to add nomination
  const handleAddNomination = () => {
    router.push({
      pathname: "/add-nomination",
      params: { type: selectedType, day: selectedDay }
    });
  };
  
  // Manual refresh
  const handleRefresh = () => {
    fetchNominations(selectedType, selectedDay);
  };
  
  // Get remaining votes
  const getRemainingVotes = () => {
    if (!userProfile) return 0;
    const usedVotes = getUserVoteCount(userProfile.id, selectedType, selectedDay === "today" ? "today" : selectedDay);
    return Math.max(0, 2 - usedVotes); // 2 votes per type
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nominations</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw 
            size={20} 
            color={colors.primary} 
            style={isLoading ? styles.rotating : undefined} 
          />
        </TouchableOpacity>
      </View>
      
      <NominationTypeSelector
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />
      
      <DaySelector
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
      
      {userProfile && (
        <View style={styles.votesContainer}>
          <Text style={styles.votesText}>
            You have {getRemainingVotes()} votes remaining for this category
          </Text>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {currentNominations.length > 0 ? (
            currentNominations.map((nomination) => (
              <NominationCard
                key={nomination.id}
                nomination={nomination}
                onVote={() => handleVote(nomination.id)}
                disabled={!userProfile || hasUserVoted(userProfile.id, selectedType)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No nominations found</Text>
              <Text style={styles.emptySubtext}>Be the first to nominate someone!</Text>
            </View>
          )}
          
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </Text>
          )}
        </ScrollView>
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddNomination}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  rotating: {
    transform: [{ rotate: "45deg" }],
  },
  votesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  votesText: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lastUpdated: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: colors.textLight,
  },
});