import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import { CLINIC_ADDRESS_FOR_BOOKING } from '../config/clinicAddress';
import { createBookingRequest } from '../api/bookingRequests';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const formatUkDateInput = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export default function BookingPatientDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const preferredDate = state?.preferredDate || '';
  const preferredTime = state?.preferredTime || '';
  const [form, setForm] = useState({
    title: '',
    firstName: '',
    surname: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    mobile: '',
    reason: '',
    consent: false,
  });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const normalizedValue = name === 'dateOfBirth' ? formatUkDateInput(value) : value;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : normalizedValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!preferredDate || !preferredTime) {
      navigate('/booking/request');
      return;
    }
    if (!isSupabaseConfigured) {
      setSubmitError(
        'Booking is temporarily unavailable on this deployment. Supabase is not configured correctly. Please contact the clinic.',
      );
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    const { data, error } = await createBookingRequest({
      ...form,
      preferredDate,
      preferredTime,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message || 'Could not submit. Please check your connection and try again.');
      return;
    }
    if (data?.id) {
      navigate('/booking/confirmation', { state: { referenceId: data.id } });
      return;
    }
    setSubmitError('Could not create a booking reference. Please try again.');
  };

  if (!preferredDate || !preferredTime) {
    return (
      <section className="consultation-page">
        <div className="container consultation-page__layout">
          <div className="consultation-panel consultation-panel--single">
            <h1 className="consultation-page__title">Please choose a date and time first</h1>
            <p className="consultation-page__subtitle">
              You need to complete the appointment selection before filling patient details.
            </p>
            <div className="consultation-page__actions">
              <Link className="consultation-page__primary" to="/booking/request">Back to selection</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="consultation-page">
        <div className="container consultation-page__layout">
          <div className="booking-details">
            <form className="booking-details__form" onSubmit={handleSubmit}>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Title</span>
                <select name="title" value={form.title} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Miss</option>
                  <option>Ms</option>
                  <option>Dr</option>
                </select>
              </label>

              <label className="consultation-form__field">
                <span>First name</span>
                <input name="firstName" value={form.firstName} onChange={handleChange} required />
              </label>
              <label className="consultation-form__field">
                <span>Surname</span>
                <input name="surname" value={form.surname} onChange={handleChange} required />
              </label>
              <label className="consultation-form__field">
                <span>Patient date of birth</span>
                <input
                  name="dateOfBirth"
                  placeholder="DD/MM/YYYY"
                  inputMode="numeric"
                  autoComplete="bday"
                  pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/(19|20)[0-9]{2}$"
                  title="Please use UK format DD/MM/YYYY"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="consultation-form__field">
                <span>Gender</span>
                <select name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </label>
              <label className="consultation-form__field">
                <span>Email address</span>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>
              <label className="consultation-form__field">
                <span>Mobile number</span>
                <input name="mobile" value={form.mobile} onChange={handleChange} required />
              </label>

              <label className="consultation-form__field consultation-form__field--full">
                <span>Reason for your booking</span>
                <textarea
                  name="reason"
                  rows={3}
                  maxLength={200}
                  placeholder="Tell us briefly why you're booking this appointment (up to 200 characters)."
                  value={form.reason}
                  onChange={handleChange}
                  required
                />
                <small className="booking-details__counter">{form.reason.length}/200</small>
              </label>

              <label className="consultation-form__checkbox consultation-form__field--full">
                <input name="consent" type="checkbox" checked={form.consent} onChange={handleChange} required />
                <span>I consent to the clinic processing this information for my booking request.</span>
              </label>

              {submitError && <p className="admin-login__error consultation-form__field--full" role="alert">{submitError}</p>}
              <div className="consultation-form__actions consultation-form__field--full consultation-form__actions--end">
                <button type="submit" className="consultation-page__primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Book my appointment'}
                </button>
              </div>
            </form>

            <aside className="booking-details__summary">
              <div className="booking-details__summary-card">
                <h3>Dr Kazeem Salako</h3>
                <p>Consultant Dermatologist</p>
                <p><strong>{preferredDate}</strong> at <strong>{preferredTime}</strong></p>
                <p>{CLINIC_ADDRESS_FOR_BOOKING}</p>
              </div>
              <p className="booking-details__privacy-note">
                All your information is securely stored and protected.
              </p>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
