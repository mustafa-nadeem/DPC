export function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function formatRequest(request) {
  return {
    id: request.id,
    publicId: request.publicId,
    firstName: request.firstName,
    surname: request.surname,
    dateOfBirth: request.dateOfBirth ? request.dateOfBirth.toISOString().slice(0, 10) : null,
    email: request.email,
    mobile: request.mobile,
    status: request.status,
    category: request.category,
    preferredDate: request.preferredDate ? request.preferredDate.toISOString().slice(0, 10) : null,
    preferredTime: request.preferredTimeText,
    reservedSlotId: request.reservedSlotId || null,
    reason: request.reason,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export function formatAvailability(days) {
  return days.map((day) => ({
    id: day.id,
    date: day.date.toISOString().slice(0, 10),
    slots: day.slots
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((slot) => ({
        id: slot.id,
        time: slot.time,
        capacity: slot.capacity,
        enabled: slot.enabled,
        reservedCount: slot.reservedCount,
        appointmentCount: slot.appointmentCount,
      })),
  }));
}
