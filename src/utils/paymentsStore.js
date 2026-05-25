const KEY = 'dpc_clinic_payments_v1';

const isValid = (v) =>
  Array.isArray(v) && v.every((p) => p && typeof p.id === 'string' && typeof p.patient_name === 'string' && p.amount_gbp != null);

export const loadLocalPayments = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveLocalPayments = (rows) => {
  window.localStorage.setItem(KEY, JSON.stringify(rows));
};

export const newLocalId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`);
