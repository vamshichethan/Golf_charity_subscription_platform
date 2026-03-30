import { createClient } from '@supabase/supabase-js';

// Setup Supabase instance using environment variables.
// In the absence of real keys, this allows the app to compile but throws an error if queries are attempted.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
