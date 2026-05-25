import AdminHeader from '../components/AdminHeader';
import { useMemo, useState } from 'react';
import { useClinicAvailability } from '../hooks/useClinicAvailability';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const formatDateLabel = (date) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: '2-digit', month: 'short' })
    .format(new Date(`${date}T00:00:00`));

export default function AdminAvailability() {
  const { availability, loading, error: persistError, persist } = useClinicAvailability();
  const [newDate, setNewDate] = useState('');
  const [newSlotByDate, setNewSlotByDate] = useState({});
  const [viewMode, setViewMode] = useState('week');

  const totals = useMemo(() => {
    const enabledSlots = availability.flatMap((day) => day.slots).filter((slot) => slot.enabled);
    const openSlots = enabledSlots.length;
    const totalCapacity = enabledSlots.reduce((sum, slot) => sum + Number(slot.capacity || 0), 0);
    return { openSlots, totalCapacity, dayCount: availability.length };
  }, [availability]);

  const doPersist = (next) => {
    void persist(next);
  };

  const updateSlot = (date, time, updater) => {
    const next = availability.map((day) => {
      if (day.date !== date) return day;
      return {
        ...day,
        slots: day.slots.map((slot) => {
          if (slot.time !== time) return slot;
          return { ...slot, ...updater(slot) };
        }),
      };
    });
    doPersist(next);
  };

  const addDate = () => {
    if (!newDate || availability.some((day) => day.date === newDate)) return;
    const next = [...availability, { date: newDate, slots: [] }].sort((a, b) => a.date.localeCompare(b.date));
    doPersist(next);
    setNewDate('');
  };

  const addSlot = (date) => {
    const slotTime = (newSlotByDate[date] || '').trim();
    if (!slotTime) return;
    const next = availability.map((day) => {
      if (day.date !== date || day.slots.some((slot) => slot.time === slotTime)) return day;
      return { ...day, slots: [...day.slots, { time: slotTime, capacity: 1, enabled: true }] };
    });
    doPersist(next);
    setNewSlotByDate((prev) => ({ ...prev, [date]: '' }));
  };

  const removeSlot = (date, time) => {
    const next = availability.map((day) => {
      if (day.date !== date) return day;
      return { ...day, slots: day.slots.filter((slot) => slot.time !== time) };
    });
    doPersist(next);
  };

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title="Availability and calendar"
          subtitle="Configure offerable slots by day and week, including capacity per time slot."
        />

        {isSupabaseConfigured && (
          <p style={{ opacity: 0.75, maxWidth: '40rem' }}>
            Changes are saved to Supabase so the public booking form uses the same schedule.
          </p>
        )}
        {loading && <p style={{ opacity: 0.7 }}>Loading schedule from the server…</p>}
        {persistError && (
          <p className="admin-login__error" role="alert">
            {String(persistError?.message || persistError)}
          </p>
        )}

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
              />
              <button type="button" className="consultation-page__primary" onClick={addDate}>
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
                            updateSlot(day.date, slot.time, () => ({
                              capacity: Math.max(0, Number(event.target.value) || 0),
                            }))
                          }
                        />
                      </label>
                      <label className="admin-slot-editor__toggle">
                        <input
                          type="checkbox"
                          checked={slot.enabled}
                          onChange={(event) =>
                            updateSlot(day.date, slot.time, () => ({ enabled: event.target.checked }))
                          }
                        />
                        Enabled
                      </label>
                      <button
                        type="button"
                        className="consultation-page__secondary"
                        onClick={() => removeSlot(day.date, slot.time)}
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
                  />
                  <button type="button" className="consultation-page__primary" onClick={() => addSlot(day.date)}>
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
                  <p>Current bookings: —</p>
                </article>
                <article className="admin-clinician-card">
                  <h3>Dr Amelia Carter</h3>
                  <p>Tue/Thu clinic</p>
                  <p>Current bookings: —</p>
                </article>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
