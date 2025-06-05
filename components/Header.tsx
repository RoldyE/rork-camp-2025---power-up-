import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/constants/colors";
import { User, Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";
import { SafeAreaView } from "react-native-safe-area-context";

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export const Header = ({ title, subtitle }: HeaderProps) => {
  const router = useRouter();
  const { hasUnreadNotifications } = useNotificationStore();
  
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.buttonsContainer}>
          <Pressable 
            style={styles.notificationButton}
            onPress={() => router.push("/notifications")}
          >
            <Bell size={20} color={colors.primary} />
            {hasUnreadNotifications && <View style={styles.notificationBadge} />}
          </Pressable>
          <Pressable 
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <User size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: "white",
  },
});