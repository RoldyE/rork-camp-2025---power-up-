import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { campers } from "@/mocks/campers";
import { NominationType } from "@/types";
import { useNominationStore } from "@/store/nominationStore";
import { NominationTypeSelector, getNominationTypeLabel } from "@/components/NominationTypeSelector";
import { DaySelector } from "@/components/DaySelector";

export default function AddNominationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string, day?: string }>();
  
  const [selectedType, setSelectedType] = useState<NominationType>(
    params.type && ["daily", "sportsmanship", "bravery", "service", "scholar", "other"].includes(params.type)
      ? params.type as NominationType
      : "daily"
  );
  
  const [selectedDay, setSelectedDay] = useState(params.day || "Tuesday");
  const [selectedCamperId, setSelectedCamperId] = useState("");
  const [reason, setReason] = useState("");
  
  const { addNomination, isLoading } = useNominationStore();
  
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
            }
          }
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
          title: `Add ${getNominationTypeLabel(selectedType)} Nomination`,
          headerStyle: {
            backgroundColor: colors.background,
          },
        }} 
      />
      
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
            <Text style={styles.sectionTitle}>Day</Text>
            <DaySelector
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Camper</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.camperList}
          >
            {campers.map((camper) => (
              <Pressable
                key={camper.id}
                style={[
                  styles.camperCard,
                  selectedCamperId === camper.id && styles.selectedCamperCard,
                ]}
                onPress={() => setSelectedCamperId(camper.id)}
              >
                <Text style={styles.camperName}>{camper.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Nomination</Text>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Why does this camper deserve recognition?"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <Pressable 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Nomination</Text>
          )}
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
  camperList: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 8,
  },
  camperCard: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCamperCard: {
    borderColor: colors.primary,
  },
  camperName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  reasonInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});