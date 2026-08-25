import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wuewvkstwjljvbgiogez.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2MaEQ1X7aAzhDFz1z6wcQA_wYuRq4Iv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
