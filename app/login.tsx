import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, TextInput, Alert, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [name, setName] = useState("");

  const handleGuestLogin = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    try {
      await login({
        id: Date.now().toString(),
        name: name.trim(),
        isAdmin: false,
      });

      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Login Error", "Failed to log in. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" }} 
              style={styles.logoImage}
              resizeMode="cover"
            />
            <Text style={styles.logoText}>Camp 2025 - Power Up!</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome to Camp</Text>
            <Text style={styles.subtitle}>Sign in to access camp resources</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <Pressable 
              style={styles.guestButton}
              onPress={handleGuestLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              )}
            </Pressable>
            
            <Text style={styles.syncText}>
              This app uses real-time synchronization. All changes are shared with other users instantly.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoImage: {
    width: 200,
    height: 120,
    marginBottom: 16,
    borderRadius: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
  },
  guestButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  syncText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
  },
});