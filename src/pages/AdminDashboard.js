import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import {
  listBookingRequests,
  mapRequestToDashboard,
  formatRequestReferenceId,
  extractScheduleTimeLabel,
} from '../api/bookingRequests';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const todayYmd = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

export default function AdminDashboard() {
  const [viewMode, setViewMode] = useState('day');
  const [rawRequests, setRawRequests] = useState([]);
  const [loading, setLoading] = useState(!!isSupabaseConfigured);
  const [loadError, setLoadError] = useState(null);
  const [tableSearch, setTableSearch] = useState('');

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRawRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await listBookingRequests();
      setRawRequests(rows);
    } catch (e) {
      setLoadError(e);
      setRawRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const requests = useMemo(() => rawRequests.map(mapRequestToDashboard).filter(Boolean), [rawRequests]);
  const filteredRequests = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => {
      const idFrag = String(r.id || '').toLowerCase();
      const ref = formatRequestReferenceId(r.id).toLowerCase();
      const hay = `${r.patient} ${r.status} ${r.category} ${r.submitted} ${r.action} ${idFrag} ${ref}`.toLowerCase();
      return hay.includes(q);
    });
  }, [requests, tableSearch]);
  const submittedCount = useMemo(
    () => rawRequests.filter((r) => r.status === 'Submitted').length,
    [rawRequests],
  );
  const reviewCount = useMemo(
    () => rawRequests.filter((r) => r.status === 'Under Review').length,
    [rawRequests],
  );
  const paymentPendingCount = useMemo(
    () => rawRequests.filter((r) => r.status === 'Payment Pending').length,
    [rawRequests],
  );
  const scheduleTitle = useMemo(
    () => (viewMode === 'day' ? "Today's schedule (from requests)" : 'Upcoming in selected view'),
    [viewMode],
  );
  const today = todayYmd();
  const scheduleItems = useMemo(() => {
    return rawRequests
      .filter((r) => r.preferred_date === today)
      .map((r) => ({
        key: r.id,
        time: extractScheduleTimeLabel(r.preferred_time),
        patient: `${r.first_name || ''} ${r.surname || ''}`.trim() || '—',
        clinician: 'TBD',
        type: r.category || '—',
        location: "8 St John's Square, Daventry",
      }));
  }, [rawRequests, today]);

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title="Request dashboard"
          subtitle="See requests, clinician workload, and appointment flow across day and week views."
        />

        {isSupabaseConfigured && loadError && (
          <p className="admin-login__error" role="alert">
            {String(loadError?.message || loadError)}
          </p>
        )}
        {isSupabaseConfigured && loading && <p style={{ opacity: 0.7 }}>Loading requests…</p>}

        <section className="admin-kpis">
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Submitted</p>
            <p className="admin-kpi-card__value">{submittedCount}</p>
            <p className="admin-kpi-card__meta">Needs first review</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Under review</p>
            <p className="admin-kpi-card__value">{reviewCount}</p>
            <p className="admin-kpi-card__meta">Secretary in progress</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Payment pending</p>
            <p className="admin-kpi-card__value">{paymentPendingCount}</p>
            <p className="admin-kpi-card__meta">Awaiting checkout completion</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Total open</p>
            <p className="admin-kpi-card__value">{requests.length}</p>
            <p className="admin-kpi-card__meta">Across all categories</p>
          </article>
        </section>

        <div className="admin-grid admin-grid--dashboard">
          <section className="admin-surface">
            <div className="admin-surface__head">
              <h2 className="admin-surface__title">{scheduleTitle}</h2>
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
            </div>

            <div className="admin-schedule-list">
              {viewMode === 'day' && scheduleItems.length > 0 ? (
                scheduleItems.map((item) => (
                  <article key={item.key} className="admin-schedule-item">
                    <p className="admin-schedule-item__time">{item.time}</p>
                    <div>
                      <p className="admin-schedule-item__title">{item.patient}</p>
                      <p className="admin-schedule-item__meta">
                        {item.clinician} — {item.location}
                      </p>
                    </div>
                    <span className="admin-status-tag">{item.type}</span>
                  </article>
                ))
              ) : (
                <p style={{ padding: '1rem', opacity: 0.75 }}>
                  {viewMode === 'week'
                    ? 'Use the list below for the full week; the day view shows only requests on today’s date with a preferred time.'
                    : isSupabaseConfigured
                      ? 'No requests for today with a stored preferred date yet, or all preferred dates are on other days.'
                      : 'Connect Supabase to load live requests.'}
                </p>
              )}
            </div>
          </section>

          <section className="admin-surface">
            <div className="admin-surface__head">
              <h2 className="admin-surface__title">Clinician workload</h2>
            </div>
            <div className="admin-clinician-list">
              <article className="admin-clinician-card">
                <h3>Dr Kazeem Salako</h3>
                <p>Mon/Wed clinic</p>
                <p>—</p>
              </article>
              <article className="admin-clinician-card">
                <h3>Dr Ahmad Kusimo</h3>
                <p>GP sessions</p>
                <p>—</p>
              </article>
            </div>
          </section>
        </div>

        <div className="admin-surface">
          <div className="admin-toolbar">
            <input
              className="admin-toolbar__search"
              placeholder="Search by patient, request ID, or contact..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              aria-label="Filter booking requests"
            />
            <div className="admin-toolbar__chips">
              <button type="button" className="admin-chip is-active">All</button>
              <button type="button" className="admin-chip">Urgent</button>
              <button type="button" className="admin-chip">Payment Pending</button>
              <button type="button" className="admin-chip">Awaiting Call Back</button>
            </div>
          </div>

          <div className="admin-table">
            <div className="admin-table__head">
              <span>Request</span>
              <span>Patient</span>
              <span>Status</span>
              <span>Category</span>
              <span>Submitted</span>
              <span>Next action</span>
            </div>
            {isSupabaseConfigured && requests.length === 0 && !loading && !loadError && (
              <div className="admin-table__row" style={{ gridTemplateColumns: '1fr' }}>
                <span style={{ padding: '1rem', opacity: 0.8 }}>No booking requests yet. Patients appear here when they complete the public form.</span>
              </div>
            )}
            {isSupabaseConfigured &&
              requests.length > 0 &&
              filteredRequests.length === 0 &&
              !loading &&
              !loadError && (
                <div className="admin-table__row" style={{ gridTemplateColumns: '1fr' }}>
                  <span style={{ padding: '1rem', opacity: 0.8 }}>No requests match your search.</span>
                </div>
              )}
            {filteredRequests.map((request) => (
              <Link key={request.id} to={`/admin/requests/${request.id}`} className="admin-table__row">
                <span>{formatRequestReferenceId(request.id)}</span>
                <span>{request.patient}</span>
                <span>
                  <em className="admin-status-tag">{request.status}</em>
                </span>
                <span>{request.category}</span>
                <span>{request.submitted}</span>
                <span>{request.action}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
