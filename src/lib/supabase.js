import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-url'));

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase URL atau Anon Key belum dikonfigurasi di file .env. Menggunakan data demo/mock lokal.'
  );
}

// Inisialisasi Supabase Client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
