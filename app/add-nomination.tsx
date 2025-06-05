import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/colors";
import { campers } from "@/mocks/campers";
import { CamperCard } from "@/components/CamperCard";
import { useNominationStore } from "@/store/nominationStore";
import { NominationType } from "@/types";
import { DaySelector } from "@/components/DaySelector";
import { NominationTypeSelector, getNominationTypeLabel } from "@/components/NominationTypeSelector";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddNominationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: NominationType, day?: string }>();
  
  // Use params if provided, otherwise default values
  const [selectedType, setSelectedType] = useState<NominationType>(
    params.type && ["daily", "sportsmanship", "bravery", "service", "scholar", "other"].includes(params.type as string)
      ? params.type as NominationType
      : "daily"
  );
  
  const [selectedDay, setSelectedDay] = useState(params.day || "Tuesday");
  const [selectedCamperId, setSelectedCamperId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { addNomination, isLoading } = useNominationStore();
  
  // Filter campers based on search query
  const filteredCampers = campers.filter(
    (camper) =>
      camper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camper.teamId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectCamper = (camperId: string) => {
    setSelectedCamperId(camperId);
  };
  
  const handleSubmit = async () => {
    if (!selectedCamperId) {
      Alert.alert("Error", "Please select a camper");
      return;
    }
    
    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason for the nomination");
      return;
    }
    
    try {
      await addNomination({
        camperId: selectedCamperId,
        reason: reason.trim(),
        day: selectedDay,
        type: selectedType,
      });
      
      Alert.alert(
        "Success",
        "Nomination added successfully",
        [
          {
            text: "OK",
            onPress: () => {
              if (selectedType === "daily") {
                router.push({
                  pathname: "/(tabs)/nominations",
                  params: { type: selectedType, day: selectedDay }
                });
              } else {
                router.push({
                  pathname: "/special-nominations",
                  params: { type: selectedType }
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error adding nomination:", error);
      Alert.alert("Error", "Failed to add nomination. Please try again.");
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen 
        options={{ 
          title: "Add Nomination",
          headerStyle: {
            backgroundColor: colors.background,
          },
        }} 
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nomination Type</Text>
          <NominationTypeSelector
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        </View>
        
        {selectedType === "daily" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Day</Text>
            <DaySelector
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Camper</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search campers by name or team"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View style={styles.campersContainer}>
            {filteredCampers.map((camper) => (
              <Pressable
                key={camper.id}
                onPress={() => handleSelectCamper(camper.id)}
                style={[
                  styles.camperCardContainer,
                  selectedCamperId === camper.id && styles.selectedCamperCard,
                ]}
              >
                <CamperCard camper={camper} />
              </Pressable>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Nomination</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder={`Why does this camper deserve the ${getNominationTypeLabel(selectedType)} nomination?`}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Nomination</Text>
        </Pressable>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: colors.card,
  },
  campersContainer: {
    gap: 8,
  },
  camperCardContainer: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCamperCard: {
    borderColor: colors.primary,
  },
  reasonInput: {
    height: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: colors.card,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});