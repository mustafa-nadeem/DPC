const AVAILABILITY_STORAGE_KEY = 'dpc_availability_v1';

/** No demo slots: schedule is only what staff (or a successful Supabase load) has configured. */
export const defaultAvailability = [];

const toLocalYmd = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const REVIEW_WEEKDAY_SLOT_TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

/**
 * When the live schedule is still empty, the public booking form can use this
 * so patients can select dates while the portal is under review (does not change admin or DB by itself).
 */
export function getReviewModeFallbackAvailability() {
  const out = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 84; i += 1) {
    if (out.length >= 20) break;
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const wd = d.getDay();
    if (wd === 0 || wd === 6) continue;
    out.push({
      date: toLocalYmd(d),
      slots: REVIEW_WEEKDAY_SLOT_TIMES.map((time) => ({ time, capacity: 5, enabled: true })),
    });
  }
  return out;
}

export const isValidAvailability = (value) => {
  if (!Array.isArray(value)) return false;
  return value.every((day) => typeof day.date === 'string' && Array.isArray(day.slots));
};

export const loadAvailability = () => {
  try {
    const raw = window.localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    if (!raw) return defaultAvailability;
    const parsed = JSON.parse(raw);
    return isValidAvailability(parsed) ? parsed : defaultAvailability;
  } catch (error) {
    return defaultAvailability;
  }
};

export const saveAvailability = (availability) => {
  window.localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(availability));
};
