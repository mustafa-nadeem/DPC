import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import {
  getBookingRequest,
  getRequestEvents,
  updateBookingRequest,
  addStaffEvent,
  isUuid,
  formatRequestReferenceId,
} from '../api/bookingRequests';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const formatDob = (dob) => (dob ? String(dob) : '—');

export default function AdminRequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('Under Review');
  const [category, setCategory] = useState('Routine');
  const [action, setAction] = useState('Book appointment');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !isUuid(requestId)) {
      setRow(null);
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const r = await getBookingRequest(requestId);
      if (!r) {
        setRow(null);
        setHistory([]);
        return;
      }
      setRow(r);
      setStatus(r.status);
      setCategory(r.category);
      setAction(r.next_action);
      setNotes(r.internal_notes || '');
      const ev = await getRequestEvents(requestId);
      setHistory(ev);
    } catch (e) {
      setLoadError(e);
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const getActor = async () => {
    if (!isSupabaseConfigured || !supabase) return 'Staff';
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email || 'Staff';
  };

  const save = async (draft) => {
    if (!isSupabaseConfigured || !isUuid(requestId) || !row) return;
    setSaving(true);
    setSaveError(null);
    try {
      const actor = await getActor();
      await updateBookingRequest(requestId, {
        status,
        category,
        nextAction: action,
        internalNotes: notes,
      });
      if (!draft) {
        await addStaffEvent(requestId, 'Case details updated', actor);
        const ev = await getRequestEvents(requestId);
        setHistory(ev);
        const updated = await getBookingRequest(requestId);
        if (updated) setRow(updated);
        navigate('/admin/dashboard', { replace: true });
      } else {
        const updated = await getBookingRequest(requestId);
        if (updated) setRow(updated);
      }
    } catch (e) {
      setSaveError(e);
    } finally {
      setSaving(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <section className="admin-page">
        <div className="admin-page__stack">
          <AdminHeader
            title="Request detail"
            subtitle="Connect Supabase to load live request data."
          />
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="admin-page">
        <div className="admin-page__stack" style={{ padding: '2rem' }}>
          <p style={{ opacity: 0.7 }}>Loading request…</p>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="admin-page">
        <div className="admin-page__stack" style={{ padding: '2rem' }}>
          <p className="admin-login__error" role="alert">
            {String(loadError?.message || loadError)}
          </p>
        </div>
      </section>
    );
  }

  if (!isUuid(requestId) || !row) {
    return (
      <section className="admin-page">
        <div className="admin-page__stack" style={{ padding: '2rem' }}>
          <h1 className="admin-header__title">Request not found</h1>
          <p>Check the link, or open the request from the dashboard list.</p>
        </div>
      </section>
    );
  }

  const name = `${row.first_name || ''} ${row.surname || ''}`.trim() || '—';
  const prefDate = row.preferred_date
    ? new Date(`${row.preferred_date}T00:00:00`).toLocaleDateString('en-GB')
    : '—';

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title={`Request ${formatRequestReferenceId(requestId)}`}
          subtitle="Review patient details, categorise the case, update status, and record decisions."
        />
        {saveError && (
          <p className="admin-login__error" role="alert">
            {String(saveError?.message || saveError)}
          </p>
        )}

        <div className="admin-request-layout">
          <section className="admin-surface">
            <article className="admin-section">
              <h2 className="admin-section__title">Patient request</h2>
              <div className="admin-request-grid">
                <p>
                  <strong>Title:</strong> {row.title || '—'}
                </p>
                <p>
                  <strong>Name:</strong> {name}
                </p>
                <p>
                  <strong>Gender:</strong> {row.gender || '—'}
                </p>
                <p>
                  <strong>DOB:</strong> {formatDob(row.date_of_birth)}
                </p>
                <p>
                  <strong>Contact:</strong> {row.mobile || '—'}
                </p>
                <p>
                  <strong>Email:</strong> {row.email || '—'}
                </p>
                <p>
                  <strong>Consent recorded:</strong> {row.consent ? 'Yes' : 'No'}
                </p>
                <p className="admin-request-grid__full">
                  <strong>Reason:</strong> {row.reason || '—'}
                </p>
                <p className="admin-request-grid__full">
                  <strong>Preferred date / time:</strong> {prefDate} at {row.preferred_time || '—'}
                </p>
              </div>
            </article>

            <article className="admin-section">
              <h2 className="admin-section__title">Internal notes</h2>
              <textarea
                rows={6}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Record triage notes, call outcomes, and rationale for decisions..."
              />
              <small className="booking-details__counter">{notes.length} characters</small>
            </article>

            <article className="admin-section">
              <h2 className="admin-section__title">Activity history</h2>
              {history.length > 0 ? (
                <ul className="admin-history">
                  {history.map((item) => (
                    <li key={item.id} className="admin-history__item">
                      <span className="admin-history__time">{item.time}</span>
                      <div>
                        <p className="admin-history__label">{item.label}</p>
                        <p className="admin-history__meta">By {item.by}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ opacity: 0.75 }}>No extra activity yet. Saving updates will be logged here when configured.</p>
              )}
            </article>
          </section>

          <aside className="admin-surface admin-surface--sticky">
            <article className="admin-section">
              <h2 className="admin-section__title">Case controls</h2>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option>New Enquiry</option>
                  <option>Follow-up</option>
                  <option>Urgent</option>
                  <option>Routine</option>
                  <option>Not Suitable</option>
                </select>
              </label>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option>Submitted</option>
                  <option>Under Review</option>
                  <option>Awaiting More Information</option>
                  <option>Awaiting Call Back</option>
                  <option>Appointment Proposed</option>
                  <option>Payment Pending</option>
                  <option>Confirmed</option>
                  <option>Declined</option>
                  <option>Referred Elsewhere</option>
                  <option>Cancelled</option>
                </select>
              </label>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Next action</span>
                <select value={action} onChange={(event) => setAction(event.target.value)}>
                  <option>Ask for more information</option>
                  <option>Call patient</option>
                  <option>Book appointment</option>
                  <option>Decline or refer elsewhere</option>
                </select>
              </label>
              <div className="consultation-form__actions consultation-form__actions--end">
                <button
                  type="button"
                  className="consultation-page__secondary"
                  disabled={saving}
                  onClick={() => void save(true)}
                >
                  {saving ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  type="button"
                  className="consultation-page__primary"
                  disabled={saving}
                  onClick={() => void save(false)}
                >
                  {saving ? 'Saving…' : 'Save and continue'}
                </button>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
