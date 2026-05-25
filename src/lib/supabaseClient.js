import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../config/defaultSupabasePublic';

const trim = (v) => (typeof v === 'string' ? v.trim() : '');

const off =
  String(process.env.REACT_APP_DISABLE_SUPABASE || process.env.REACT_APP_OFFLINE_ADMIN || '').toLowerCase() ===
  'true';

// CRA only inlines `REACT_APP_*` into the browser bundle. `NEXT_PUBLIC_*` is NOT included unless you
// customize webpack — on Netlify use `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY`
// (or `REACT_APP_SUPABASE_ANON_KEY` for the legacy JWT).
const fromEnv = {
  url: trim(
    process.env.REACT_APP_SUPABASE_URL
      || process.env.NEXT_PUBLIC_SUPABASE_URL
      || '',
  ),
  key: trim(
    process.env.REACT_APP_SUPABASE_ANON_KEY
      || process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || '',
  ),
};

const supabaseUrl = off ? '' : (fromEnv.url || DEFAULT_SUPABASE_URL);
const supabaseAnonKey = off ? '' : (fromEnv.key || DEFAULT_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
