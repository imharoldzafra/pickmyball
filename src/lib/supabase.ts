import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing in .env!');
}

export const supabase = createClient(
  supabaseUrl || 'https://wuewvkstwjljvbgiogez.supabase.co',
  supabaseAnonKey || 'sb_publishable_2MaEQ1X7aAzhDFz1z6wcQA_wYuRq4Iv'
);

