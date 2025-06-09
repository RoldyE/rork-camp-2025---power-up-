import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useTeamStore } from '@/store/teamStore';
import { useNominationStore } from '@/store/nominationStore';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const { fetchTeams } = useTeamStore();
  const { fetchNominations, fetchUserVotes } = useNominationStore();
  const { userProfile } = useAuthStore();

  // Set up real-time updates for Supabase data
  useRealtimeUpdates();

  // Fetch initial data on app load
  useEffect(() => {
    fetchTeams();
    fetchNominations();
    if (userProfile) {
      fetchUserVotes(userProfile.id);
    }
  }, [userProfile, fetchTeams, fetchNominations, fetchUserVotes]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="team-details/[id]" options={{ title: 'Team Details' }} />
      <Stack.Screen name="game-details/[id]" options={{ title: 'Game Details' }} />
      <Stack.Screen name="add-nomination" options={{ title: 'Add Nomination' }} />
      <Stack.Screen name="special-nominations" options={{ title: 'Special Nominations' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}