import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert, ActivityIndicator, AppState } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/colors";
import { NominationTypeSelector, getNominationTypeLabel } from "@/components/NominationTypeSelector";
import { NominationType } from "@/types";
import { useNominationStore } from "@/store/nominationStore";
import { NominationCard } from "@/components/NominationCard";
import { Plus, RotateCcw } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { usePolling } from "@/hooks/usePolling";

export default function SpecialNominationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: NominationType, day?: string }>();
  const [selectedType, setSelectedType] = useState<NominationType>(
    params.type && ["sportsmanship", "bravery", "service", "scholar", "other"].includes(params.type as string) 
      ? params.type as NominationType 
      : "sportsmanship"
  );
  
  const { 
    getWeeklyNominations, 
    getTopNominationsByType, 
    resetVotes, 
    resetUserVotes, 
    getUserVoteCount,
    fetchNominations,
    isLoading
  } = useNominationStore();
  const { userProfile } = useAuthStore();
  
  // Initial fetch
  useEffect(() => {
    fetchNominations(selectedType);
  }, [selectedType]);
  
  // Set up polling to keep nominations data fresh - REDUCED FREQUENCY
  const { poll } = usePolling(
    () => fetchNominations(selectedType), 
    { 
      interval: 300000, // Poll every 5 minutes instead of every minute
      immediate: false, // Don't poll immediately on mount (we already fetch in useEffect)
      enabled: false // Disable automatic polling
    }
  );
  
  // Manual poll when screen becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        poll();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [poll, selectedType]);
  
  // Get all nominations of the selected type (not just daily ones)
  const nominations = getWeeklyNominations(selectedType);
  const topNominations = getTopNominationsByType(selectedType, 3);
  
  // Get user vote count for the selected type
  const voteCount = userProfile 
    ? getUserVoteCount(userProfile.id, selectedType, "all")
    : 0;
  
  const handleResetVotes = () => {
    Alert.alert(
      "Reset Votes",
      `Are you sure you want to reset all votes for ${getNominationTypeLabel(selectedType)} nominations?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: async () => {
            // Reset votes for all days of this type
            ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach(async (day) => {
              await resetVotes(day, selectedType);
            });
            resetUserVotes(); // Reset user votes when resetting nomination votes
            Alert.alert("Success", "Votes have been reset.");
            
            // Refresh data after reset
            await fetchNominations(selectedType);
          },
          style: "destructive" 
        }
      ]
    );
  };
  
  const handleAddNomination = () => {
    router.push({
      pathname: "/add-nomination",
      params: { 
        type: selectedType,
        day: params.day || "Tuesday" // Pass the day if it was provided
      }
    });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen 
        options={{ 
          title: "Special Nominations",
          headerStyle: {
            backgroundColor: colors.background,
          },
        }} 
      />
      
      <NominationTypeSelector
        selectedType={selectedType}
        onSelectType={(type) => {
          setSelectedType(type);
          // Update the URL params when changing type
          router.setParams({ type });
        }}
      />
      
      {userProfile && (
        <View style={styles.voteCountContainer}>
          <Text style={styles.voteCountText}>
            You have used {voteCount}/2 votes for {getNominationTypeLabel(selectedType)}
          </Text>
        </View>
      )}
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      {topNominations.length > 0 && (
        <View style={styles.topNomineesSection}>
          <Text style={styles.sectionTitle}>Top {getNominationTypeLabel(selectedType)} Nominees</Text>
          <View style={styles.topNomineesContainer}>
            {topNominations.map((nomination, index) => (
              <View key={nomination.id} style={styles.topNomineeCard}>
                <Text style={styles.topNomineeRank}>#{index + 1}</Text>
                <NominationCard nomination={nomination} />
              </View>
            ))}
          </View>
        </View>
      )}
      
      <Text style={[styles.sectionTitle, { marginHorizontal: 16 }]}>All Nominations</Text>
      
      <FlatList
        data={nominations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NominationCard nomination={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No nominations for this category yet.</Text>
            <Text style={styles.emptySubtext}>Nominate a camper who deserves recognition!</Text>
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
        
        {nominations.length > 0 && (
          <Pressable 
            style={styles.resetButton}
            onPress={handleResetVotes}
          >
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
  topNomineesSection: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  topNomineesContainer: {
    gap: 12,
  },
  topNomineeCard: {
    position: "relative",
  },
  topNomineeRank: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: "center",
    lineHeight: 32,
    zIndex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
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