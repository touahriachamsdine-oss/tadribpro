import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isLiveSupabase = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isLiveSupabase
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (!isLiveSupabase) {
  console.warn(
    'TadribPro Warning: Supabase environment variables are missing. Running in robust offline mockup mode.'
  );
}
