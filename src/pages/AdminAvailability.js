import AdminHeader from '../components/AdminHeader';
import { useEffect, useMemo, useState } from 'react';
import {
  addAvailabilitySlot,
  deleteAvailabilitySlot,
  loadAdminAvailability,
  saveAvailabilityDay,
  updateAvailabilitySlot,
} from '../utils/availabilityStore';

const formatDateLabel = (date) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: '2-digit', month: 'short' })
    .format(new Date(`${date}T00:00:00`));

export default function AdminAvailability({ user }) {
  const [availability, setAvailability] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newSlotByDate, setNewSlotByDate] = useState({});
  const [viewMode, setViewMode] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SECRETARY';

  const totals = useMemo(() => {
    const enabledSlots = availability.flatMap((day) => day.slots).filter((slot) => slot.enabled);
    const openSlots = enabledSlots.length;
    const totalCapacity = enabledSlots.reduce((sum, slot) => sum + Number(slot.capacity || 0), 0);
    return { openSlots, totalCapacity, dayCount: availability.length };
  }, [availability]);

  const refreshAvailability = async () => {
    setLoading(true);
    try {
      const data = await loadAdminAvailability();
      setAvailability(data);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAvailability();
  }, []);

  const updateSlot = async (slotId, patch) => {
    if (!canEdit) return;
    try {
      await updateAvailabilitySlot(slotId, patch);
      await refreshAvailability();
    } catch (updateError) {
      setError(updateError.message || 'Failed to update slot');
    }
  };

  const addDate = async () => {
    if (!canEdit) return;
    if (!newDate || availability.some((day) => day.date === newDate)) return;
    try {
      await saveAvailabilityDay(newDate, []);
      setNewDate('');
      await refreshAvailability();
    } catch (saveError) {
      setError(saveError.message || 'Failed to add date');
    }
  };

  const addSlot = async (date) => {
    if (!canEdit) return;
    const slotTime = (newSlotByDate[date] || '').trim();
    if (!slotTime) return;
    try {
      await addAvailabilitySlot(date, { time: slotTime, capacity: 1, enabled: true });
      setNewSlotByDate((prev) => ({ ...prev, [date]: '' }));
      await refreshAvailability();
    } catch (slotError) {
      setError(slotError.message || 'Failed to add slot');
    }
  };

  const removeSlot = async (slotId) => {
    if (!canEdit) return;
    try {
      await deleteAvailabilitySlot(slotId);
      await refreshAvailability();
    } catch (removeError) {
      setError(removeError.message || 'Failed to remove slot');
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title="Availability and calendar"
          subtitle="Configure offerable slots by day and week, including capacity per time slot."
        />

        <section className="admin-kpis">
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Open slots</p>
            <p className="admin-kpi-card__value">{totals.openSlots}</p>
            <p className="admin-kpi-card__meta">Enabled slot times</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Total offers</p>
            <p className="admin-kpi-card__value">{totals.totalCapacity}</p>
            <p className="admin-kpi-card__meta">Slots that can be offered</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Configured days</p>
            <p className="admin-kpi-card__value">{totals.dayCount}</p>
            <p className="admin-kpi-card__meta">Dates in the system</p>
          </article>
        </section>

        <div className="admin-surface">
          {loading && <p className="consultation-page__subtitle">Loading availability...</p>}
          {error && <p className="admin-login__error">{error}</p>}
          <div className="admin-toolbar">
            <div className="admin-segment">
              <button
                type="button"
                className={`admin-segment__item ${viewMode === 'day' ? 'is-active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
              <button
                type="button"
                className={`admin-segment__item ${viewMode === 'week' ? 'is-active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
            </div>
            <div className="admin-availability-add-date">
              <input
                className="admin-toolbar__search"
                type="date"
                value={newDate}
                onChange={(event) => setNewDate(event.target.value)}
                disabled={!canEdit}
              />
              <button type="button" className="consultation-page__primary" onClick={addDate} disabled={!canEdit}>
                Add date
              </button>
            </div>
          </div>

          <div className="admin-grid admin-grid--availability">
            <section className="admin-grid-cards">
            {availability.map((day) => (
              <article key={day.date} className="admin-calendar-card">
                <p className="admin-calendar-card__meta">{formatDateLabel(day.date)}</p>
                <h2>{day.date}</h2>
                <div className="admin-slot-editor">
                  {day.slots.map((slot) => (
                    <div key={`${day.date}-${slot.time}`} className="admin-slot-editor__row">
                      <span className="admin-slot-chip">{slot.time}</span>
                      <label className="admin-slot-editor__capacity">
                        Capacity
                        <input
                          type="number"
                          min="0"
                          value={slot.capacity}
                          onChange={(event) =>
                            updateSlot(slot.id, {
                              capacity: Math.max(0, Number(event.target.value) || 0),
                            })
                          }
                          disabled={!canEdit}
                        />
                      </label>
                      <label className="admin-slot-editor__toggle">
                        <input
                          type="checkbox"
                          checked={slot.enabled}
                          onChange={(event) =>
                            updateSlot(slot.id, { enabled: event.target.checked })
                          }
                          disabled={!canEdit}
                        />
                        Enabled
                      </label>
                      <button
                        type="button"
                        className="consultation-page__secondary"
                        onClick={() => removeSlot(slot.id)}
                        disabled={!canEdit}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="admin-slot-add">
                  <input
                    type="time"
                    value={newSlotByDate[day.date] || ''}
                    onChange={(event) =>
                      setNewSlotByDate((prev) => ({ ...prev, [day.date]: event.target.value }))
                    }
                    disabled={!canEdit}
                  />
                  <button type="button" className="consultation-page__primary" onClick={() => addSlot(day.date)} disabled={!canEdit}>
                    Add slot
                  </button>
                </div>
              </article>
            ))}
            </section>
            <aside className="admin-surface admin-surface--sticky">
              <div className="admin-surface__head">
                <h2 className="admin-surface__title">Clinician assignment ({viewMode})</h2>
              </div>
              <div className="admin-clinician-list">
                <article className="admin-clinician-card">
                  <h3>Dr Kazeem Salako</h3>
                  <p>Mon/Wed clinic</p>
                  <p>Current bookings: 8</p>
                </article>
                <article className="admin-clinician-card">
                  <h3>Dr Amelia Carter</h3>
                  <p>Tue/Thu clinic</p>
                  <p>Current bookings: 6</p>
                </article>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
