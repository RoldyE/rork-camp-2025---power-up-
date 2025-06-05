import React, { useState } from "react";
import { View, StyleSheet, FlatList, Text, Pressable, Alert } from "react-native";
import { DaySelector } from "@/components/DaySelector";
import { Header } from "@/components/Header";
import { NominationCard } from "@/components/NominationCard";
import { useNominationStore } from "@/store/nominationStore";
import { colors } from "@/constants/colors";
import { Link } from "expo-router";
import { Plus, Award, RotateCcw } from "lucide-react-native";
import { NominationTypeSelector } from "@/components/NominationTypeSelector";
import { NominationType } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

export default function NominationsScreen() {
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  const [selectedType, setSelectedType] = useState<NominationType>("daily");
  const { getCurrentDayNominations, getWeeklyNominations, resetVotes, resetUserVotes, getUserVoteCount } = useNominationStore();
  const { userProfile } = useAuthStore();
  
  // Get nominations based on type - daily uses the selected day, others show all days
  const nominations = selectedType === "daily" 
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
          onPress: () => {
            if (selectedType === "daily") {
              resetVotes(selectedDay, selectedType);
            } else {
              // For special nominations, reset votes for all days of this type
              ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach(day => {
                resetVotes(day, selectedType);
              });
            }
            resetUserVotes(); // Reset user votes when resetting nomination votes
            Alert.alert("Success", "Votes have been reset.");
          },
          style: "destructive" 
        }
      ]
    );
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
      
      <FlatList
        data={nominations}
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
        <Link href="/add-nomination" asChild>
          <Pressable style={styles.addButton}>
            <Plus size={20} color="white" />
          </Pressable>
        </Link>
        
        <Link href="/special-nominations" asChild>
          <Pressable style={styles.specialButton}>
            <Award size={18} color="white" />
          </Pressable>
        </Link>
        
        {nominations.length > 0 && (
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