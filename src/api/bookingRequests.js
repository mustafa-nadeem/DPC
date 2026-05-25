import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

export function formatRequestReferenceId(id) {
  if (!id) return '—';
  return `DPC-${String(id).replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

export function formatSubmittedAt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return `Today, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
  const yday = new Date(now);
  yday.setDate(yday.getDate() - 1);
  if (
    d.getDate() === yday.getDate() &&
    d.getMonth() === yday.getMonth() &&
    d.getFullYear() === yday.getFullYear()
  ) {
    return `Yesterday, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function mapRequestToDashboard(row) {
  if (!row) return null;
  return {
    id: row.id,
    patient: `${row.first_name || ''} ${row.surname || ''}`.trim() || 'Unknown',
    status: row.status,
    category: row.category,
    submitted: formatSubmittedAt(row.created_at),
    action: row.next_action,
  };
}

export function extractScheduleTimeLabel(preferredTime) {
  if (!preferredTime) return '—';
  const m = String(preferredTime).match(/^([0-9]{1,2}:[0-9]{2})/);
  return m ? m[1] : String(preferredTime).slice(0, 5);
}

/**
 * @param {object} row — Supabase row
 */
export function mapEventRow(row) {
  return {
    id: row.id,
    time: new Date(row.event_time).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    label: row.label,
    by: row.actor,
  };
}

export async function createBookingRequest(payload) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: null,
      usedSupabase: false,
      error: new Error('Supabase is not configured in this build.'),
    };
  }

  // RPC-only path: avoids public insert failures from direct table RLS differences.
  const rpcResult = await supabase
    .rpc('create_booking_request_public', {
      p_title: payload.title || null,
      p_first_name: payload.firstName,
      p_surname: payload.surname,
      p_date_of_birth: payload.dateOfBirth || null,
      p_gender: payload.gender || null,
      p_email: payload.email,
      p_mobile: payload.mobile,
      p_address_line: payload.addressLookup || null,
      p_gp_practice: payload.gpPractice || null,
      p_no_gp: Boolean(payload.noGp),
      p_reason: payload.reason,
      p_consent: Boolean(payload.consent),
      p_preferred_date: payload.preferredDate || null,
      p_preferred_time: payload.preferredTime,
    })
    .single();

  if (!rpcResult.error) {
    return { data: rpcResult.data, usedSupabase: true, error: null };
  }

  const msg = String(rpcResult.error.message || '');
  const fnMissing =
    msg.toLowerCase().includes('create_booking_request_public') &&
    msg.toLowerCase().includes('function');
  return {
    data: null,
    usedSupabase: true,
    error: new Error(
      fnMissing
        ? 'Booking function is missing on the live database. Run migration 20260505124000_public_booking_rpc.sql, then deploy again.'
        : msg || 'Could not submit booking request.',
    ),
  };
}

export async function listBookingRequests() {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from('booking_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getBookingRequest(id) {
  if (!isSupabaseConfigured || !supabase || !isUuid(id)) {
    return null;
  }
  const { data, error } = await supabase.from('booking_requests').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getRequestEvents(requestId) {
  if (!isSupabaseConfigured || !supabase || !isUuid(requestId)) {
    return [];
  }
  const { data, error } = await supabase
    .from('request_events')
    .select('id, event_time, label, actor')
    .eq('request_id', requestId)
    .order('event_time', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapEventRow);
}

export async function updateBookingRequest(id, fields) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }
  const { error } = await supabase
    .from('booking_requests')
    .update({
      status: fields.status,
      category: fields.category,
      next_action: fields.nextAction,
      internal_notes: fields.internalNotes,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function addStaffEvent(requestId, label, actor) {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }
  const { error } = await supabase.from('request_events').insert({
    request_id: requestId,
    label,
    actor: actor || 'Staff',
  });
  if (error) throw error;
}
