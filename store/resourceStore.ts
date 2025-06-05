import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Resource } from "@/types";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface ResourceState {
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  addResource: (resource: Omit<Resource, "id" | "dateAdded">) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  getResourcesByCategory: (category: Resource["category"]) => Resource[];
  fetchResources: () => Promise<void>;
  syncResources: () => void;
}

const initialResources: Resource[] = [
  {
    id: "1",
    name: "Small Group Leader Guide",
    description: "Complete guide for small group leaders with discussion questions and activities",
    type: "pdf",
    uri: "https://example.com/small-group-guide.pdf",
    size: 2500000,
    dateAdded: new Date().toISOString(),
    category: "activity",
  },
  {
    id: "2",
    name: "Camp Photos",
    description: "Link to Google Photos album with camp pictures",
    type: "link",
    uri: "https://photos.app.goo.gl/VS9U2QYpH8LajXpj6",
    size: 0,
    dateAdded: new Date().toISOString(),
    category: "general",
  },
  {
    id: "3",
    name: "Parent Communication",
    description: "Facebook group for parent updates and communication",
    type: "link",
    uri: "https://www.facebook.com/share/g/18iEFxESNt/",
    size: 0,
    dateAdded: new Date().toISOString(),
    category: "communication",
  },
  {
    id: "4",
    name: "GroupMe Chat",
    description: "Link to GroupMe chat for camp communication",
    type: "link",
    uri: "https://groupme.com/join_group/107824904/NcJ6RyHB",
    size: 0,
    dateAdded: new Date().toISOString(),
    category: "communication",
  },
  {
    id: "5",
    name: "Team Scoring Rubric",
    description: "Detailed guide on how team points are awarded",
    type: "pdf",
    uri: "https://example.com/scoring-guide.pdf",
    size: 1200000,
    dateAdded: new Date().toISOString(),
    category: "scoring",
  },
  {
    id: "6",
    name: "Morning Devotionals",
    description: "Daily devotional materials for morning sessions",
    type: "pdf",
    uri: "https://example.com/devotionals.pdf",
    size: 1800000,
    dateAdded: new Date().toISOString(),
    category: "devotional",
  },
  {
    id: "7",
    name: "Level Up Point System",
    description: "Detailed scoring rubric for all camp activities",
    type: "pdf",
    uri: "https://example.com/level-up-points.pdf",
    size: 1500000,
    dateAdded: new Date().toISOString(),
    category: "scoring",
  },
];

export const useResourceStore = create<ResourceState>()(
  persist(
    (set, get) => ({
      resources: initialResources,
      isLoading: false,
      error: null,
      
      fetchResources: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('resources')
            .select('*');
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            set({ resources: data as Resource[] });
          } else {
            // Initialize with mock data if no data exists
            for (const resource of initialResources) {
              await supabase.from('resources').upsert(resource);
            }
            set({ resources: initialResources });
          }
        } catch (error: any) {
          console.error('Error fetching resources:', error.message);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      syncResources: () => {
        const subscription = supabase
          .channel('resources-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'resources' }, 
            async () => {
              // Refresh resources when there's a change
              await get().fetchResources();
            }
          )
          .subscribe();

        // Return unsubscribe function
        return () => {
          subscription.unsubscribe();
        };
      },
      
      addResource: async (resource) => {
        try {
          const newResource = {
            ...resource,
            id: Date.now().toString(),
            dateAdded: new Date().toISOString(),
          };
          
          // Update local state
          set((state) => ({
            resources: [
              ...state.resources,
              newResource,
            ],
          }));
          
          // Update in Supabase
          const { error } = await supabase
            .from('resources')
            .insert(newResource);
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error adding resource:', error.message);
          set({ error: error.message });
        }
      },
      
      deleteResource: async (id) => {
        try {
          // Update local state
          set((state) => ({
            resources: state.resources.filter((resource) => resource.id !== id),
          }));
          
          // Delete from Supabase
          const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error deleting resource:', error.message);
          set({ error: error.message });
        }
      },
      
      getResourcesByCategory: (category) => {
        return get().resources.filter((resource) => resource.category === category);
      },
    }),
    {
      name: "resource-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook to initialize and sync with Supabase
export const useResourceSync = () => {
  const { fetchResources, syncResources } = useResourceStore();

  useEffect(() => {
    // Initial fetch
    fetchResources();

    // Set up real-time sync
    const unsubscribe = syncResources();

    // Cleanup subscription on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchResources, syncResources]);
};