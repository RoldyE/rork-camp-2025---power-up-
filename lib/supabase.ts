import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your project URL and Anon Key
// This connects your app to your Supabase database
const supabaseUrl = 'https://pbbrqkfcfxzbvgyxzbiz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiYnJxa2ZjZnh6YnZneXh6Yml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDAyMTEsImV4cCI6MjA2NDY3NjIxMX0.hHmXyMPJEIMU87oc2YTf9XogcnvBGCtuyVHI_M_VyaY';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This file is used to interact with your Supabase database from anywhere in your app