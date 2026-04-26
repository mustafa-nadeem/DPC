import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import { loadAvailability } from '../utils/availabilityStore';

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
      .map((slot) => ({
        value: slot.time,
        label: `${slot.time} (${slot.capacity} left)`,
      }));
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
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const scheduleByMonth = useMemo(() => buildScheduleByMonth(availability), [availability]);
  const monthKeys = useMemo(() => Object.keys(scheduleByMonth), [scheduleByMonth]);
  const [selectedMonth, setSelectedMonth] = useState(monthKeys[0] || '');
  const [selection, setSelection] = useState({
    preferredDate: '',
    preferredTime: '',
  });
  const selectedMonthData = scheduleByMonth[selectedMonth] || { label: '', dates: [] };
  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        setLoading(true);
        const data = await loadAvailability();
        if (!mounted) return;
        setAvailability(data);
      } catch (error) {
        if (!mounted) return;
        setLoadError(error.message || 'Unable to load availability');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!monthKeys.length) return;
    if (!selectedMonth || !scheduleByMonth[selectedMonth]) {
      setSelectedMonth(monthKeys[0]);
    }
  }, [monthKeys, scheduleByMonth, selectedMonth]);

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
                        key={time.value}
                        type="button"
                        className={`appointment-picker__time ${selection.preferredTime === time.value ? 'is-selected' : ''}`}
                        onClick={() => setSelection((prev) => ({ ...prev, preferredTime: time.value }))}
                      >
                        {time.label}
                      </button>
                    ))
                  ) : (
                    <p className="appointment-picker__empty">
                      Select a date first to view available times.
                    </p>
                  )}
                </div>

                <div className="appointment-picker__location-note">
                  <strong>Location:</strong> Three Shires Hospital, The Avenue, Cliftonville, Northampton, NN1 5DR
                </div>
              </div>
            </section>
            <div className="consultation-form__field--full consultation-form__actions consultation-form__actions--end">
              {loading && <p className="consultation-page__subtitle">Loading available slots...</p>}
              {loadError && <p className="admin-login__error">{loadError}</p>}
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
