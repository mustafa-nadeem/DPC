const AVAILABILITY_STORAGE_KEY = 'dpc_availability_v1';

const defaultAvailability = [
  {
    date: '2026-05-04',
    slots: [
      { time: '09:00', capacity: 4, enabled: true },
      { time: '09:30', capacity: 3, enabled: true },
      { time: '10:30', capacity: 2, enabled: true },
      { time: '13:30', capacity: 2, enabled: true },
    ],
  },
  {
    date: '2026-05-05',
    slots: [
      { time: '09:00', capacity: 2, enabled: true },
      { time: '11:00', capacity: 3, enabled: true },
      { time: '12:30', capacity: 1, enabled: true },
    ],
  },
  {
    date: '2026-05-06',
    slots: [
      { time: '10:00', capacity: 2, enabled: true },
      { time: '11:30', capacity: 2, enabled: true },
      { time: '14:00', capacity: 2, enabled: false },
    ],
  },
  {
    date: '2026-06-03',
    slots: [
      { time: '09:00', capacity: 3, enabled: true },
      { time: '09:30', capacity: 2, enabled: true },
      { time: '11:00', capacity: 2, enabled: true },
    ],
  },
];

const isValidAvailability = (value) => {
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
