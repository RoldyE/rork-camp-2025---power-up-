import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTeamStore } from '@/store/teamStore';
import { useNominationStore } from '@/store/nominationStore';

export const useRealtimeUpdates = () => {
  const { fetchTeams } = useTeamStore();
  const { fetchNominations } = useNominationStore();

  useEffect(() => {
    // Subscribe to changes in the 'points' table for team updates
    const pointsSubscription = supabase
      .channel('public:points')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'points'
      }, () => {
        console.log('Points updated, refreshing teams');
        fetchTeams();
      })
      .subscribe();

    // Subscribe to changes in the 'nominations' table for nomination updates
    const nominationsSubscription = supabase
      .channel('public:nominations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nominations'
      }, () => {
        console.log('Nominations updated, refreshing nominations');
        fetchNominations();
      })
      .subscribe();

    // Clean up subscriptions on component unmount
    return () => {
      supabase.removeChannel(pointsSubscription);
      supabase.removeChannel(nominationsSubscription);
    };
  }, [fetchTeams, fetchNominations]);

  return null;
};