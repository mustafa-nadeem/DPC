import { apiFetch } from './apiClient';

export async function loadAvailability() {
  const payload = await apiFetch('/public/availability');
  return payload.availability || [];
}

export async function loadAdminAvailability() {
  const payload = await apiFetch('/admin/availability');
  return payload.availability || [];
}

export async function saveAvailabilityDay(date, slots) {
  const payload = await apiFetch(`/admin/availability/${date}`, {
    method: 'PUT',
    body: JSON.stringify({
      slots: slots.map((slot) => ({
        time: slot.time,
        capacity: Number(slot.capacity) || 0,
        enabled: Boolean(slot.enabled),
      })),
    }),
  });
  return payload.day;
}

export async function addAvailabilitySlot(date, slot) {
  const payload = await apiFetch(`/admin/availability/${date}/slots`, {
    method: 'POST',
    body: JSON.stringify(slot),
  });
  return payload.slot;
}

export async function updateAvailabilitySlot(slotId, patch) {
  const payload = await apiFetch(`/admin/availability/slots/${slotId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return payload.slot;
}

export async function deleteAvailabilitySlot(slotId) {
  await apiFetch(`/admin/availability/slots/${slotId}`, {
    method: 'DELETE',
  });
}
