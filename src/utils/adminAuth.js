import { apiFetch } from './apiClient';
import { supabase } from './supabaseClient';

const ADMIN_USER_STORAGE_KEY = 'dpc_admin_user';

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message || 'Unable to sign in');
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error('Supabase access token missing');

  const payload = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  });
  window.localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(payload.user || null));
  return payload.user;
}

export async function logoutAdmin() {
  try {
    await supabase.auth.signOut();
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    window.localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  }
}

export async function getAdminSession() {
  try {
    const payload = await apiFetch('/auth/me');
    window.localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(payload.user || null));
    return payload.user;
  } catch (error) {
    window.localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
    return null;
  }
}

export function getCachedAdminUser() {
  try {
    return JSON.parse(window.localStorage.getItem(ADMIN_USER_STORAGE_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

export function isAdminAuthenticated() {
  return Boolean(getCachedAdminUser());
}

export function hasRole(user, allowedRoles) {
  if (!user?.role) return false;
  return allowedRoles.includes(user.role);
}
