import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalPayments, saveLocalPayments, newLocalId } from '../utils/paymentsStore';

const STATUSES = ['Payment Pending', 'Confirmed', 'Declined'];
const LS_KEY = 'dpc_payments_use_local_only';

export function isUsingLocalPaymentsFallback() {
  try {
    return typeof window !== 'undefined' && window.sessionStorage.getItem(LS_KEY) === '1';
  } catch {
    return false;
  }
}

function setLocalPaymentsFallback() {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(LS_KEY, '1');
  } catch {
    /* sessionStorage blocked */
  }
}

/** After you create `clinic_payments` in Supabase, call this and reload data so the app uses the database again. */
export function clearLocalPaymentsFallbackFlag() {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

function isMissingClinicPaymentsTableError(e) {
  if (!e) return false;
  const msg = String(e.message || e.details || e.hint || e.error_description || '');
  if (e.code === '42P01') return true;
  return /clinic_payments|schema cache|Could not find the table|relation .+ does not exist/i.test(msg);
}

function shouldUseSupabaseForPayments() {
  return isSupabaseConfigured && supabase && !isUsingLocalPaymentsFallback();
}

const mapRow = (r) => ({
  id: r.id,
  requestRef: r.request_ref == null || r.request_ref === '' ? '—' : r.request_ref,
  patientName: r.patient_name,
  amountGbp: Number(r.amount_gbp),
  status: r.status,
  method: r.method,
  notes: r.notes || '',
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const formatWhen = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return `Today ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const formatPaymentForTable = (p) => ({
  id: p.id,
  requestLabel: p.requestRef && p.requestRef !== '—' ? p.requestRef : '—',
  patient: p.patientName,
  amount: `GBP ${Number(p.amountGbp).toFixed(2)}`,
  status: p.status,
  method: p.method,
  updated: formatWhen(p.updatedAt || p.createdAt),
  _raw: p,
});

export function computePaymentKpis(payments) {
  const list = Array.isArray(payments) ? payments : [];
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  let paidTodayGbp = 0;
  let paidTodayCount = 0;
  let pendingGbp = 0;
  let pendingCount = 0;

  list.forEach((p) => {
    const amt = Number(p.amountGbp) || 0;
    const u = new Date(p.updatedAt || p.createdAt);
    if (p.status === 'Confirmed') {
      if (!Number.isNaN(u.getTime()) && u >= startOfDay && u < endOfDay) {
        paidTodayGbp += amt;
        paidTodayCount += 1;
      }
    } else if (p.status === 'Payment Pending') {
      pendingGbp += amt;
      pendingCount += 1;
    }
  });

  return {
    paidTodayGbp: Math.round(paidTodayGbp * 100) / 100,
    paidTodayMeta: paidTodayCount ? `${paidTodayCount} payment${paidTodayCount === 1 ? '' : 's'} today` : 'No payments confirmed today',
    pendingGbp: Math.round(pendingGbp * 100) / 100,
    pendingMeta: pendingCount ? `${pendingCount} open` : 'No pending',
    followUpCount: pendingCount,
    followUpMeta: 'Awaiting payment or follow-up',
  };
}

export function isValidStatus(s) {
  return STATUSES.includes(s);
}

export const PAYMENT_STATUS_OPTIONS = STATUSES;

const mapFromLocal = (p) => ({
  id: p.id,
  requestRef: p.request_ref == null || p.request_ref === '' ? '—' : p.request_ref,
  patientName: p.patient_name,
  amountGbp: Number(p.amount_gbp),
  status: p.status,
  method: p.method,
  notes: p.notes || '',
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

export async function fetchPayments() {
  if (shouldUseSupabaseForPayments()) {
    const { data, error } = await supabase
      .from('clinic_payments')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      if (isMissingClinicPaymentsTableError(error)) {
        setLocalPaymentsFallback();
        return loadLocalPayments().map(mapFromLocal);
      }
      throw error;
    }
    return (data || []).map(mapRow);
  }
  return loadLocalPayments().map(mapFromLocal);
}

function insertPaymentLocal({ requestRef, patientName, amountGbp, status, method, notes, st, now, amt }) {
  const row = {
    id: newLocalId(),
    request_ref: requestRef?.trim() || '',
    patient_name: patientName.trim(),
    amount_gbp: amt,
    status: st,
    method: (method && String(method).trim()) || 'Manual',
    notes: notes?.trim() || '',
    created_at: now,
    updated_at: now,
  };
  const all = loadLocalPayments();
  all.unshift(row);
  saveLocalPayments(all);
  return mapRow({
    id: row.id,
    request_ref: row.request_ref,
    patient_name: row.patient_name,
    amount_gbp: row.amount_gbp,
    status: row.status,
    method: row.method,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
}

export async function addPayment({ requestRef, patientName, amountGbp, status, method, notes }) {
  const amt = Number(amountGbp);
  if (Number.isNaN(amt) || amt < 0) {
    throw new Error('Amount must be a valid number (0 or more).');
  }
  if (!patientName || !String(patientName).trim()) {
    throw new Error('Patient name is required.');
  }
  const st = isValidStatus(status) ? status : 'Payment Pending';
  const now = new Date().toISOString();

  if (shouldUseSupabaseForPayments()) {
    const { data, error } = await supabase
      .from('clinic_payments')
      .insert({
        request_ref: requestRef?.trim() || null,
        patient_name: patientName.trim(),
        amount_gbp: amt,
        status: st,
        method: (method && String(method).trim()) || 'Manual',
        notes: notes?.trim() || null,
      })
      .select('*')
      .single();
    if (error) {
      if (isMissingClinicPaymentsTableError(error)) {
        setLocalPaymentsFallback();
        return insertPaymentLocal({ requestRef, patientName, amountGbp, status, method, notes, st, now, amt });
      }
      throw error;
    }
    return mapRow(data);
  }
  return insertPaymentLocal({ requestRef, patientName, amountGbp, status, method, notes, st, now, amt });
}

export async function updatePayment(id, { requestRef, patientName, amountGbp, status, method, notes }) {
  if (!id) throw new Error('Missing id');
  const amt = amountGbp !== undefined ? Number(amountGbp) : undefined;
  if (amt !== undefined && (Number.isNaN(amt) || amt < 0)) {
    throw new Error('Amount must be a valid number (0 or more).');
  }

  if (shouldUseSupabaseForPayments()) {
    const patch = {
      request_ref: requestRef === undefined ? undefined : requestRef?.trim() || null,
      patient_name: patientName === undefined ? undefined : String(patientName).trim(),
      amount_gbp: amt,
      status: status === undefined ? undefined : (isValidStatus(status) ? status : 'Payment Pending'),
      method: method === undefined ? undefined : (String(method).trim() || 'Manual'),
      notes: notes === undefined ? undefined : (notes?.trim() || null),
    };
    Object.keys(patch).forEach((k) => {
      if (patch[k] === undefined) delete patch[k];
    });
    const { data, error } = await supabase
      .from('clinic_payments')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      if (isMissingClinicPaymentsTableError(error)) {
        setLocalPaymentsFallback();
        // fall through to local update below
      } else {
        throw error;
      }
    } else {
      return mapRow(data);
    }
  }

  const all = loadLocalPayments();
  const i = all.findIndex((p) => p.id === id);
  if (i < 0) throw new Error('Record not found');
  const cur = all[i];
  const next = {
    ...cur,
    request_ref: requestRef !== undefined ? String(requestRef).trim() : cur.request_ref,
    patient_name: patientName !== undefined ? String(patientName).trim() : cur.patient_name,
    amount_gbp: amt !== undefined ? amt : cur.amount_gbp,
    status: status !== undefined ? (isValidStatus(status) ? status : cur.status) : cur.status,
    method: method !== undefined ? String(method).trim() : cur.method,
    notes: notes !== undefined ? String(notes).trim() : cur.notes,
    updated_at: new Date().toISOString(),
  };
  all[i] = next;
  saveLocalPayments(all);
  return mapRow({
    id: next.id,
    request_ref: next.request_ref,
    patient_name: next.patient_name,
    amount_gbp: next.amount_gbp,
    status: next.status,
    method: next.method,
    notes: next.notes,
    created_at: next.created_at,
    updated_at: next.updated_at,
  });
}

export async function removePayment(id) {
  if (shouldUseSupabaseForPayments()) {
    const { error } = await supabase.from('clinic_payments').delete().eq('id', id);
    if (error) {
      if (isMissingClinicPaymentsTableError(error)) {
        setLocalPaymentsFallback();
      } else {
        throw error;
      }
    } else {
      return;
    }
  }
  const all = loadLocalPayments().filter((p) => p.id !== id);
  saveLocalPayments(all);
}
