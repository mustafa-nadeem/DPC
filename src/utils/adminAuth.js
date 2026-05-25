import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Default test account (no Supabase, or the same user you create in Supabase Auth for sign-in)
export const TEST_ADMIN_EMAIL = process.env.REACT_APP_TEST_ADMIN_EMAIL || 'staff.test@dpc.local';
export const TEST_ADMIN_PASSWORD = process.env.REACT_APP_TEST_ADMIN_PASSWORD || 'DpcTest#2026!';

export const ADMIN_EMAIL = TEST_ADMIN_EMAIL;
export const ADMIN_PASSWORD = TEST_ADMIN_PASSWORD;

const ADMIN_AUTH_STORAGE_KEY = 'dpc_admin_authenticated';

export const isAdminAuthenticated = () => {
  return window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === 'true';
};

export const setAdminAuthenticated = (value) => {
  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, value ? 'true' : 'false');
};

export const signOutAdmin = async () => {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  setAdminAuthenticated(false);
};
