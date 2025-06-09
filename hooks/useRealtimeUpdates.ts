import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTeamStore } from '@/store/teamStore';
import { useNominationStore } from '@/store/nominationStore';

// Hook to subscribe to real-time updates from Supabase for teams and nominations
export const useRealtimeUpdates = () => {
  const { fetchTeams } = useTeamStore();
  const { fetchNominations } = useNominationStore();

  useEffect(() => {
    // Subscribe to changes in the 'points' table for team points updates
    const pointsSubscription = supabase
      .channel('public:points')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'points',
      }, () => {
        // When a change is detected, refetch the teams data to update points
        fetchTeams();
      })
      .subscribe();

    // Subscribe to changes in the 'nominations' table for nomination updates
    const nominationsSubscription = supabase
      .channel('public:nominations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nominations',
      }, () => {
        // When a change is detected, refetch the nominations data
        fetchNominations();
      })
      .subscribe();

    // Subscribe to changes in the 'user_votes' table for nomination vote updates
    const votesSubscription = supabase
      .channel('public:user_votes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_votes',
      }, () => {
        // When a change is detected, refetch the nominations data to update votes
        fetchNominations();
      })
      .subscribe();

    // Clean up subscriptions when the component unmounts
    return () => {
      pointsSubscription.unsubscribe();
      nominationsSubscription.unsubscribe();
      votesSubscription.unsubscribe();
    };
  }, [fetchTeams, fetchNominations]);

  // No return value needed, this hook just sets up subscriptions
};