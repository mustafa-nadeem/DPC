import { useCallback, useEffect, useState } from 'react';
import { fetchClinicAvailabilityFromServer, saveClinicAvailabilityToServer } from '../api/clinicSettings';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { defaultAvailability, loadAvailability, saveAvailability, isValidAvailability } from '../utils/availabilityStore';

const normalize = (value) => (isValidAvailability(value) ? value : defaultAvailability);

export function useClinicAvailability() {
  const [availability, setAvailability] = useState(() => loadAvailability());
  const [loading, setLoading] = useState(!!isSupabaseConfigured);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setAvailability(loadAvailability());
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const remote = await fetchClinicAvailabilityFromServer();
      if (Array.isArray(remote) && isValidAvailability(remote)) {
        setAvailability(normalize(remote));
      } else {
        setAvailability(defaultAvailability);
      }
    } catch (e) {
      setError(e);
      setAvailability(defaultAvailability);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persist = useCallback(
    async (next) => {
      const safe = normalize(next);
      setAvailability(safe);
      if (isSupabaseConfigured) {
        try {
          await saveClinicAvailabilityToServer(safe);
        } catch (e) {
          setError(e);
          throw e;
        }
      } else {
        saveAvailability(safe);
      }
    },
    [],
  );

  return { availability, loading, error, setAvailability, persist, refresh };
}
