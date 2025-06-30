import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with fallback values for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://shfaxsmyxhlzzdmzmgwo.supabase.co';

// For the anon key, we still need to get it from environment variables for security
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('Supabase Anon Key is missing. Please check your .env.local file.');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
