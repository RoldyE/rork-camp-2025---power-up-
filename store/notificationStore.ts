import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Notification } from "@/types";

interface NotificationState {
  notifications: Notification[];
  hasUnreadNotifications: boolean;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Initial notifications for demo purposes
const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Welcome to Camp 2025 - Power Up!",
    message: "We're excited to have you join us for an amazing week of fun, fellowship, and spiritual growth!",
    timestamp: new Date().toISOString(),
    read: false,
    type: "general",
  },
  {
    id: "2",
    title: "Morning Devotion Starting Soon",
    message: "Don't forget, morning devotion starts at 7:30 AM in the Main Hall.",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false,
    type: "schedule",
    link: "/(tabs)",
  },
  {
    id: "3",
    title: "Team Challenge This Afternoon",
    message: "Get ready for the team challenge at 2:00 PM on the Recreation Field!",
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    read: true,
    type: "game",
    link: "/(tabs)/games",
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,
      hasUnreadNotifications: initialNotifications.some(n => !n.read),
      
      addNotification: (notification) =>
        set((state) => {
          const newNotification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          return {
            notifications: [newNotification, ...state.notifications],
            hasUnreadNotifications: true,
          };
        }),
        
      markAsRead: (id) =>
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          );
          
          return {
            notifications: updatedNotifications,
            hasUnreadNotifications: updatedNotifications.some(n => !n.read),
          };
        }),
        
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
          hasUnreadNotifications: false,
        })),
        
      deleteNotification: (id) =>
        set((state) => {
          const filteredNotifications = state.notifications.filter(
            (notification) => notification.id !== id
          );
          
          return {
            notifications: filteredNotifications,
            hasUnreadNotifications: filteredNotifications.some(n => !n.read),
          };
        }),
        
      clearAllNotifications: () =>
        set({
          notifications: [],
          hasUnreadNotifications: false,
        }),
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);