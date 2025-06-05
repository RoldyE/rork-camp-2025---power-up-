import React from "react";
import { View, Text, StyleSheet, Pressable, Image, Alert, ScrollView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { LogOut, Share2, Settings, User } from "lucide-react-native";
import { Platform } from "react-native";
import * as Sharing from "expo-sharing";

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, logout } = useAuthStore();
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: () => {
            logout();
            router.replace("/login");
          }
        }
      ]
    );
  };
  
  const handleShare = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Sharing not available", "This feature is not available on web");
      return;
    }
    
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync("https://yourchurchcamp.com", {
          dialogTitle: "Share Church Camp App",
          mimeType: "text/plain",
          UTI: "public.plain-text",
        });
      } else {
        Alert.alert("Sharing not available", "Sharing is not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Could not share the app");
    }
  };
  
  if (!userProfile) {
    router.replace("/login");
    return null;
  }
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Profile" }} />
      
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {userProfile.picture ? (
            <Image 
              source={{ uri: userProfile.picture }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <User size={40} color={colors.primary} />
            </View>
          )}
        </View>
        <Text style={styles.name}>{userProfile.name}</Text>
        {userProfile.facebookId && (
          <View style={styles.facebookBadge}>
            <Text style={styles.facebookBadgeText}>Facebook</Text>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <Pressable style={styles.menuItem}>
          <Settings size={20} color={colors.text} />
          <Text style={styles.menuItemText}>Settings</Text>
        </Pressable>
        
        <Pressable style={styles.menuItem} onPress={handleShare}>
          <Share2 size={20} color={colors.text} />
          <Text style={styles.menuItemText}>Share App</Text>
        </Pressable>
        
        <Pressable style={styles.menuItem} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.menuItemText, { color: colors.error }]}>Logout</Text>
        </Pressable>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>App Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Camp Year</Text>
          <Text style={styles.aboutValue}>2025</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Church Camp</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  facebookBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#1877F2",
    borderRadius: 16,
  },
  facebookBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  aboutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  aboutValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
  },
});