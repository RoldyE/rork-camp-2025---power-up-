import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pbbrqkfcfxzbvgyxzbiz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiYnJxa2ZjZnh6YnZneXh6Yml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDAyMTEsImV4cCI6MjA2NDY3NjIxMX0.hHmXyMPJEIMU87oc2YTf9XogcnvBGCtuyVHI_M_VyaY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});