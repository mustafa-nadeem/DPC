import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import { useClinicAvailability } from '../hooks/useClinicAvailability';
import { getReviewModeFallbackAvailability } from '../utils/availabilityStore';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { CLINIC_ADDRESS_FOR_BOOKING } from '../config/clinicAddress';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildScheduleByMonth = (availability) => {
  const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });
  const dayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
  return availability.reduce((acc, day) => {
    const dateObj = new Date(`${day.date}T00:00:00`);
    if (Number.isNaN(dateObj.getTime())) return acc;
    const monthKey = day.date.slice(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthFormatter.format(dateObj), dates: [] };
    }
    const availableSlots = day.slots
      .filter((slot) => slot.enabled && Number(slot.capacity) > 0)
      .map((slot) => `${slot.time} (${slot.capacity} left)`);
    acc[monthKey].dates.push({
      value: day.date,
      day: dayFormatter.format(dateObj),
      dateNumber: dateObj.getDate(),
      times: availableSlots,
    });
    return acc;
  }, {});
};

const buildCalendarDays = (monthKey, availableDateValues) => {
  if (!monthKey) return [];
  const [year, month] = monthKey.split('-').map(Number);
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarDays = [];

  for (let i = 0; i < firstDayIndex; i += 1) {
    calendarDays.push({ key: `empty-start-${i}`, isEmpty: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = `${monthKey}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      key: isoDate,
      value: isoDate,
      day,
      isAvailable: availableDateValues.has(isoDate),
      isEmpty: false,
    });
  }

  const trailingSlots = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 0; i < trailingSlots; i += 1) {
    calendarDays.push({ key: `empty-end-${i}`, isEmpty: true });
  }

  return calendarDays;
};

export default function BookingRequestForm() {
  const navigate = useNavigate();
  const { availability, loading: loadingAvailability, error: availabilityError } = useClinicAvailability();
  const reviewModeSlots = useMemo(() => getReviewModeFallbackAvailability(), []);
  const usingLiveSchedule = availability.length > 0;
  const effectiveAvailability = useMemo(
    () => (usingLiveSchedule ? availability : reviewModeSlots),
    [availability, reviewModeSlots, usingLiveSchedule],
  );
  const scheduleByMonth = useMemo(() => buildScheduleByMonth(effectiveAvailability), [effectiveAvailability]);
  const monthKeys = Object.keys(scheduleByMonth);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selection, setSelection] = useState({
    preferredDate: '',
    preferredTime: '',
  });

  useEffect(() => {
    if (monthKeys.length === 0) {
      if (selectedMonth) setSelectedMonth('');
      return;
    }
    if (!monthKeys.includes(selectedMonth)) {
      setSelectedMonth(monthKeys[0]);
      setSelection((prev) => ({ ...prev, preferredDate: '', preferredTime: '' }));
    }
  }, [monthKeys, selectedMonth]);

  const selectedMonthData = scheduleByMonth[selectedMonth] || { label: '', dates: [] };
  const availableDateValues = new Set(selectedMonthData.dates.map((date) => date.value));
  const calendarDays = buildCalendarDays(selectedMonth, availableDateValues);
  const selectedDateData = selectedMonthData.dates.find((date) => date.value === selection.preferredDate) || null;
  const availableTimes = selectedDateData?.times || [];

  const handleMonthChange = (event) => {
    const nextMonth = event.target.value;
    setSelectedMonth(nextMonth);
    setSelection({ preferredDate: '', preferredTime: '' });
  };

  const handleDateSelect = (dateValue) => {
    setSelection({ preferredDate: dateValue, preferredTime: '' });
  };

  const handleContinue = () => {
    if (!selection.preferredDate || !selection.preferredTime) return;
    navigate('/booking/details', {
      state: {
        preferredDate: selection.preferredDate,
        preferredTime: selection.preferredTime,
      },
    });
  };

  return (
    <>
      <section className="consultation-page">
        <div className="container consultation-page__layout">
          <div className="consultation-page__hero">
            <p className="consultation-page__eyebrow">Public booking flow</p>
            <h1 className="consultation-page__title">Booking request form</h1>
            <p className="consultation-page__subtitle">
              Base form structure for patient details, care needs, preferred timing,
              consent capture, and submit action.
            </p>
          </div>

          <div className="consultation-form consultation-form--compact">
            <section className="appointment-picker consultation-form__field--full">
              <div className="appointment-picker__header">
                <h2 className="appointment-picker__title">When would you like an appointment?</h2>
                <p className="appointment-picker__subtitle">
                  Please choose a date and time to be reviewed by the clinic.
                </p>
                {loadingAvailability && isSupabaseConfigured && (
                  <p className="appointment-picker__subtitle" style={{ fontStyle: 'italic' }}>
                    Loading clinic schedule…
                  </p>
                )}
                {!usingLiveSchedule && (
                  <p className="appointment-picker__subtitle" style={{ maxWidth: '32rem' }}>
                    The online calendar is open for your request. Our team is still finalising the live
                    schedule — you can pick any of the times below; we will confirm or adjust after review.
                  </p>
                )}
                {availabilityError && (
                  <p className="appointment-picker__empty" role="alert">
                    {usingLiveSchedule
                      ? 'Could not load the latest schedule. Try again, or use another time.'
                      : 'We could not reach the live server; you can still choose a time from the list below for now.'}
                  </p>
                )}
              </div>

              <div className="appointment-picker__card">
                <div className="appointment-picker__month-row">
                  <label className="appointment-picker__month-select">
                    <span className="appointment-picker__month-label">Month</span>
                    <select value={selectedMonth} onChange={handleMonthChange} disabled={monthKeys.length === 0}>
                      {monthKeys.map((monthKey) => (
                        <option key={monthKey} value={monthKey}>
                          {scheduleByMonth[monthKey].label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="appointment-picker__month">{selectedMonthData.label}</p>
                </div>

                <div className="appointment-picker__days">
                  {weekdayLabels.map((label) => (
                    <span key={label} className="appointment-picker__weekday">{label}</span>
                  ))}
                  {calendarDays.map((day) => {
                    if (day.isEmpty) {
                      return <span key={day.key} className="appointment-picker__day appointment-picker__day--empty" aria-hidden="true" />;
                    }

                    const isSelected = selection.preferredDate === day.value;
                    const classes = [
                      'appointment-picker__day',
                      day.isAvailable ? '' : 'is-disabled',
                      isSelected ? 'is-selected' : ''
                    ].join(' ').trim();

                    return (
                      <button
                        key={day.key}
                        type="button"
                        className={classes}
                        onClick={() => day.isAvailable && handleDateSelect(day.value)}
                        disabled={!day.isAvailable}
                      >
                        <strong>{day.day}</strong>
                      </button>
                    );
                  })}
                </div>

                <div className="appointment-picker__times">
                  {monthKeys.length === 0 ? (
                    <p className="appointment-picker__empty">
                      No availability configured yet. Please set slots in admin availability.
                    </p>
                  ) : availableTimes.length > 0 ? (
                    availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`appointment-picker__time ${selection.preferredTime === time ? 'is-selected' : ''}`}
                        onClick={() => setSelection((prev) => ({ ...prev, preferredTime: time }))}
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <p className="appointment-picker__empty">
                      Select a date first to view available times.
                    </p>
                  )}
                </div>

                <div className="appointment-picker__location-note">
                  <strong>Location:</strong> {CLINIC_ADDRESS_FOR_BOOKING}
                </div>
              </div>
            </section>
            <div className="consultation-form__field--full consultation-form__actions consultation-form__actions--end">
              <button
                type="button"
                className="consultation-page__primary"
                onClick={handleContinue}
                disabled={!selection.preferredDate || !selection.preferredTime}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
