import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabaseServerClient = createClient(
  env.supabaseUrl || 'http://localhost:54321',
  env.supabaseServiceRoleKey || env.supabaseAnonKey || 'public-anon-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
