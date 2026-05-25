import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export async function fetchClinicAvailabilityFromServer() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('clinic_settings')
    .select('availability')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data?.availability ?? null;
}

export async function saveClinicAvailabilityToServer(availability) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }
  const { error } = await supabase
    .from('clinic_settings')
    .update({
      availability,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) throw error;
}
