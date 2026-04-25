export const ADMIN_EMAIL = 'admin@daventryclinic.local';
export const ADMIN_PASSWORD = 'TempPass#2026';

const ADMIN_AUTH_STORAGE_KEY = 'dpc_admin_authenticated';

export const isAdminAuthenticated = () => {
  return window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === 'true';
};

export const setAdminAuthenticated = (value) => {
  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, value ? 'true' : 'false');
};
