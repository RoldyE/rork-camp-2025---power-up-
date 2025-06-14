import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { DaySelector } from "@/components/DaySelector";
import { CamperCard } from "@/components/CamperCard";
import { campers } from "@/mocks/campers";
import { useNominationStore } from "@/store/nominationStore";
import { NominationTypeSelector } from "@/components/NominationTypeSelector";
import { NominationType } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddNominationScreen() {
  const router = useRouter();
  const { addNomination } = useNominationStore();
  
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  const [selectedCamperId, setSelectedCamperId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [nominationType, setNominationType] = useState<NominationType>("daily");
  
  const handleSubmit = () => {
    if (!selectedCamperId) {
      Alert.alert("Error", "Please select a camper");
      return;
    }
    
    if (!reason.trim()) {
      Alert.alert("Error", "Please enter a nomination reason");
      return;
    }
    
    addNomination({
      camperId: selectedCamperId,
      reason: reason.trim(),
      day: selectedDay,
      type: nominationType,
    });
    
    Alert.alert(
      "Nomination Added",
      "Your nomination has been submitted successfully",
      [{ text: "OK", onPress: () => router.back() }]
    );
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
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Nomination Type</Text>
        <NominationTypeSelector
          selectedType={nominationType}
          onSelectType={setNominationType}
        />
        
        {nominationType === "daily" && (
          <>
            <Text style={styles.sectionTitle}>Select Day</Text>
            <DaySelector 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </>
        )}
        
        <Text style={styles.sectionTitle}>Select Camper</Text>
        <View style={styles.campersContainer}>
          {campers.map((camper) => (
            <CamperCard 
              key={camper.id} 
              camper={camper}
              selected={selectedCamperId === camper.id}
              onPress={() => setSelectedCamperId(camper.id)}
            />
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Nomination Reason</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="Why does this camper deserve recognition?"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <Pressable 
          style={[
            styles.submitButton,
            { backgroundColor: getNominationTypeColor(nominationType) }
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Nomination</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const getNominationTypeColor = (type: NominationType): string => {
  switch (type) {
    case "sportsmanship": return colors.sportsmanship;
    case "bravery": return colors.bravery;
    case "service": return colors.service;
    case "scholar": return colors.scholar;
    case "other": return colors.accent;
    default: return colors.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  campersContainer: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    backgroundColor: colors.card,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40, // Extra margin at bottom
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});