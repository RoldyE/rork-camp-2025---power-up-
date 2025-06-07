import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text, Pressable, Alert, ActivityIndicator, AppState } from "react-native";
import { DaySelector } from "@/components/DaySelector";
import { Header } from "@/components/Header";
import { NominationCard } from "@/components/NominationCard";
import { useNominationStore } from "@/store/nominationStore";
import { colors } from "@/constants/colors";
import { Link, useRouter } from "expo-router";
import { Plus, Award, RotateCcw, RefreshCw } from "lucide-react-native";
import { NominationTypeSelector } from "@/components/NominationTypeSelector";
import { NominationType } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { usePolling } from "@/hooks/usePolling";

export default function NominationsScreen() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  const [selectedType, setSelectedType] = useState<NominationType>("daily");
  const { 
    nominations,
    getCurrentDayNominations, 
    getWeeklyNominations, 
    resetVotes, 
    resetUserVotes, 
    getUserVoteCount,
    fetchNominations,
    isLoading
  } = useNominationStore();
  const { userProfile } = useAuthStore();
  
  // Initial fetch when component mounts
  useEffect(() => {
    fetchNominations();
  }, []);
  
  // Fetch when type or day changes
  useEffect(() => {
    if (selectedType === "daily") {
      fetchNominations(selectedType, selectedDay);
    } else {
      fetchNominations(selectedType);
    }
  }, [selectedType, selectedDay]);
  
  // Set up polling to keep nominations data fresh - DISABLED automatic polling
  const { poll } = usePolling(
    () => fetchNominations(selectedType, selectedType === "daily" ? selectedDay : undefined),
    { 
      interval: 30000, // Poll every 30 seconds
      immediate: false, // Don't poll immediately on mount (we already fetch in useEffect)
      enabled: true // Enable automatic polling
    }
  );
  
  // Manual poll when tab becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // Only poll when app becomes active
        poll();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [poll, selectedType, selectedDay]);
  
  // Get nominations based on type - daily uses the selected day, others show all days
  const displayNominations = selectedType === "daily" 
    ? getCurrentDayNominations(selectedDay, selectedType)
    : getWeeklyNominations(selectedType);
  
  // Get user vote count for the selected day and type
  const voteCount = userProfile 
    ? getUserVoteCount(userProfile.id, selectedType, selectedType === "daily" ? selectedDay : "all")
    : 0;
  
  const handleResetVotes = () => {
    Alert.alert(
      "Reset Votes",
      `Are you sure you want to reset all votes for ${selectedType} nominations${selectedType === "daily" ? ` on ${selectedDay}` : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: async () => {
            if (selectedType === "daily") {
              await resetVotes(selectedDay, selectedType);
            } else {
              // For special nominations, reset votes for all days of this type
              ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach(async (day) => {
                await resetVotes(day, selectedType);
              });
            }
            resetUserVotes(); // Reset user votes when resetting nomination votes
            Alert.alert("Success", "Votes have been reset.");
            
            // Refresh data after reset
            if (selectedType === "daily") {
              await fetchNominations(selectedType, selectedDay);
            } else {
              await fetchNominations(selectedType);
            }
          },
          style: "destructive" 
        }
      ]
    );
  };
  
  const handleAddNomination = () => {
    router.push({
      pathname: "/add-nomination",
      params: { type: selectedType, day: selectedDay }
    });
  };
  
  const handleViewSpecialNominations = () => {
    router.push({
      pathname: "/special-nominations",
      params: { type: selectedType !== "daily" ? selectedType : "sportsmanship" }
    });
  };
  
  const handleManualRefresh = async () => {
    try {
      if (selectedType === "daily") {
        await fetchNominations(selectedType, selectedDay);
      } else {
        await fetchNominations(selectedType);
      }
      Alert.alert("Refreshed", "Nominations have been updated.");
    } catch (error) {
      console.error("Error refreshing nominations:", error);
      Alert.alert("Error", "Failed to refresh nominations. Please try again.");
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header 
        title="Nominations" 
        subtitle="Vote for outstanding campers"
      />
      
      <View style={styles.selectorContainer}>
        <NominationTypeSelector
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />
        
        {selectedType === "daily" && (
          <DaySelector 
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        )}
      </View>
      
      {userProfile && (
        <View style={styles.voteCountContainer}>
          <Text style={styles.voteCountText}>
            You have used {voteCount}/2 votes for {selectedType === "daily" ? selectedDay : "this category"}
          </Text>
        </View>
      )}
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      <FlatList
        data={displayNominations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NominationCard 
            nomination={item} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No nominations for this category yet.</Text>
            <Text style={styles.emptySubtext}>Nominate a camper who did something special!</Text>
          </View>
        }
      />
      
      <View style={styles.buttonContainer}>
        <Pressable 
          style={styles.addButton}
          onPress={handleAddNomination}
        >
          <Plus size={20} color="white" />
        </Pressable>
        
        <Pressable 
          style={styles.specialButton}
          onPress={handleViewSpecialNominations}
        >
          <Award size={18} color="white" />
        </Pressable>
        
        <Pressable 
          style={styles.refreshButton}
          onPress={handleManualRefresh}
        >
          <RefreshCw size={18} color="white" />
        </Pressable>
        
        {displayNominations.length > 0 && (
          <Pressable style={styles.resetButton} onPress={handleResetVotes}>
            <RotateCcw size={18} color="white" />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  selectorContainer: {
    backgroundColor: colors.background,
  },
  voteCountContainer: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  voteCountText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom to prevent content being hidden by tab bar
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "column",
    gap: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  specialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});