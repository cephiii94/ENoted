import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase URL atau Anon Key tidak ditemukan di variabel lingkungan!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
