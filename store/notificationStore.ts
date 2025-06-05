import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Notification } from "@/types";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface NotificationState {
  notifications: Notification[];
  hasUnreadNotifications: boolean;
  isLoading: boolean;
  error: string | null;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  syncNotifications: () => void;
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
      isLoading: false,
      error: null,
      
      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('timestamp', { ascending: false });
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            set({ 
              notifications: data as Notification[],
              hasUnreadNotifications: data.some(n => !n.read)
            });
          } else {
            // Initialize with mock data if no data exists
            for (const notification of initialNotifications) {
              await supabase.from('notifications').upsert(notification);
            }
            set({ 
              notifications: initialNotifications,
              hasUnreadNotifications: initialNotifications.some(n => !n.read)
            });
          }
        } catch (error: any) {
          console.error('Error fetching notifications:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      syncNotifications: () => {
        const subscription = supabase
          .channel('notifications-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'notifications' }, 
            async () => {
              // Refresh notifications when there's a change
              await get().fetchNotifications();
            }
          )
          .subscribe();

        // Return unsubscribe function
        return () => {
          subscription.unsubscribe();
        };
      },
      
      addNotification: async (notification) => {
        try {
          const newNotification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          // Update local state
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            hasUnreadNotifications: true,
          }));
          
          // Update in Supabase
          const { error } = await supabase
            .from('notifications')
            .insert(newNotification);
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error adding notification:', error.message);
          set({ error: error.message });
        }
      },
        
      markAsRead: async (id) => {
        try {
          // Update local state
          set((state) => {
            const updatedNotifications = state.notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            );
            
            return {
              notifications: updatedNotifications,
              hasUnreadNotifications: updatedNotifications.some(n => !n.read),
            };
          });
          
          // Update in Supabase
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error marking notification as read:', error.message);
          set({ error: error.message });
        }
      },
        
      markAllAsRead: async () => {
        try {
          // Update local state
          set((state) => ({
            notifications: state.notifications.map((notification) => ({
              ...notification,
              read: true,
            })),
            hasUnreadNotifications: false,
          }));
          
          // Update in Supabase
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', get().notifications.map(n => n.id));
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error marking all notifications as read:', error.message);
          set({ error: error.message });
        }
      },
        
      deleteNotification: async (id) => {
        try {
          // Update local state
          set((state) => {
            const filteredNotifications = state.notifications.filter(
              (notification) => notification.id !== id
            );
            
            return {
              notifications: filteredNotifications,
              hasUnreadNotifications: filteredNotifications.some(n => !n.read),
            };
          });
          
          // Delete from Supabase
          const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error deleting notification:', error.message);
          set({ error: error.message });
        }
      },
        
      clearAllNotifications: async () => {
        try {
          // Update local state
          set({
            notifications: [],
            hasUnreadNotifications: false,
          });
          
          // Delete all from Supabase
          const { error } = await supabase
            .from('notifications')
            .delete()
            .neq('id', '0'); // Delete all rows
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error clearing all notifications:', error.message);
          set({ error: error.message });
        }
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook to initialize and sync with Supabase
export const useNotificationSync = () => {
  const { fetchNotifications, syncNotifications } = useNotificationStore();

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up real-time sync
    const unsubscribe = syncNotifications();

    // Cleanup subscription on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchNotifications, syncNotifications]);
};