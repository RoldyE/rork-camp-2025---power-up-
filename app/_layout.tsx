import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTeamStore } from "@/store/teamStore";
import { useNominationStore } from "@/store/nominationStore";
import { trpc, trpcClient } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { syncWithSupabase: syncTeams } = useTeamStore();
  const { syncWithSupabase: syncNominations } = useNominationStore();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Sync with Supabase when app loads
      syncTeams();
      syncNominations();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <RootLayoutNav />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const inAuthGroup = segments[0] === "(tabs)";
    
    if (!isAuthenticated && inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace("/login");
    } else if (isAuthenticated && segments[0] === "login") {
      // Redirect to the home page if already authenticated
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: "600",
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="team-details/[id]" 
          options={{ 
            title: "Team Details",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="add-nomination" 
          options={{ 
            title: "Add Nomination",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            presentation: "fullScreenModal",
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: "Profile",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="special-nominations" 
          options={{ 
            title: "Special Nominations",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="notifications" 
          options={{ 
            title: "Notifications",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="game-details/[id]" 
          options={{ 
            title: "Activity Details",
            presentation: "card",
          }} 
        />
      </Stack>
    </>
  );
}