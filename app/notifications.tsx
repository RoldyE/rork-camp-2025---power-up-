import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useNotificationStore } from "@/store/notificationStore";
import { Bell, Calendar, Award, Users, BarChart, FileText, X } from "lucide-react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications
  } = useNotificationStore();
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "schedule":
        return <Calendar size={20} color={colors.primary} />;
      case "game":
        return <Award size={20} color={colors.primary} />;
      case "team":
        return <Users size={20} color={colors.primary} />;
      case "nomination":
        return <BarChart size={20} color={colors.primary} />;
      default:
        return <Bell size={20} color={colors.primary} />;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  const handleNotificationPress = (notification: any) => {
    markAsRead(notification.id);
    
    if (notification.link) {
      router.push(notification.link);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Notifications",
          headerRight: () => (
            <Pressable 
              style={styles.clearButton}
              onPress={() => markAllAsRead()}
            >
              <Text style={styles.clearButtonText}>Mark all read</Text>
            </Pressable>
          ),
        }} 
      />
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            style={[
              styles.notificationItem,
              !item.read && styles.unreadNotification
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.iconContainer}>
              {getNotificationIcon(item.type)}
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            </View>
            <Pressable 
              style={styles.deleteButton}
              onPress={() => deleteNotification(item.id)}
            >
              <X size={16} color={colors.textLight} />
            </Pressable>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={40} color={colors.textLight} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        }
      />
      
      {notifications.length > 0 && (
        <Pressable 
          style={styles.clearAllButton}
          onPress={() => clearAllNotifications()}
        >
          <Text style={styles.clearAllButtonText}>Clear All Notifications</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  unreadNotification: {
    backgroundColor: `${colors.primary}10`,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textLight,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
  clearAllButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearAllButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});