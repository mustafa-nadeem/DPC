import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { apiFetch } from '../utils/apiClient';

const scheduleItems = [
  { time: '09:00', patient: 'Richard Hartley', clinician: 'Dr Kazeem Salako', type: 'Follow-up', location: 'Three Shires Hospital' },
  { time: '09:30', patient: 'Melanie Brentnall', clinician: 'Dr Kazeem Salako', type: 'New', location: 'Three Shires Hospital' },
  { time: '11:00', patient: 'Deborah Graham', clinician: 'Dr Amelia Carter', type: 'Routine', location: 'Tele-consult' },
  { time: '14:30', patient: 'Mykola Derevinskyy', clinician: 'Dr Amelia Carter', type: 'Follow-up', location: 'Three Shires Hospital' },
];

export default function AdminDashboard() {
  const [viewMode, setViewMode] = useState('day');
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const submittedCount = requests.filter((request) => request.status === 'SUBMITTED').length;
  const reviewCount = requests.filter((request) => request.status === 'UNDER REVIEW').length;
  const paymentPendingCount = requests.filter((request) => request.status === 'PAYMENT PENDING').length;
  const scheduleTitle = useMemo(() => (viewMode === 'day' ? 'Today schedule' : 'Week schedule'), [viewMode]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        setLoading(true);
        const payload = await apiFetch('/admin/requests');
        if (!mounted) return;
        setRequests(
          (payload.requests || []).map((request) => ({
            id: request.id,
            publicId: request.publicId,
            patient: `${request.firstName} ${request.surname}`.trim(),
            status: request.status.replaceAll('_', ' '),
            category: request.category.replaceAll('_', ' '),
            submitted: new Date(request.createdAt).toLocaleString(),
            action: 'Review and categorise',
          }))
        );
        setError('');
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError.message || 'Failed to load requests');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(
      (request) =>
        request.patient.toLowerCase().includes(q) ||
        request.publicId.toLowerCase().includes(q)
    );
  }, [requests, search]);

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title="Request dashboard"
          subtitle="See requests, clinician workload, and appointment flow across day and week views."
        />

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
              {scheduleItems.map((item) => (
                <article key={`${item.time}-${item.patient}`} className="admin-schedule-item">
                  <p className="admin-schedule-item__time">{item.time}</p>
                  <div>
                    <p className="admin-schedule-item__title">{item.patient}</p>
                    <p className="admin-schedule-item__meta">{item.clinician} - {item.location}</p>
                  </div>
                  <span className="admin-status-tag">{item.type}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-surface">
            <div className="admin-surface__head">
              <h2 className="admin-surface__title">Clinician workload</h2>
            </div>
            <div className="admin-clinician-list">
              <article className="admin-clinician-card">
                <h3>Dr Kazeem Salako</h3>
                <p>6 patients today</p>
                <p>2 follow-up / 4 new</p>
              </article>
              <article className="admin-clinician-card">
                <h3>Dr Amelia Carter</h3>
                <p>4 patients today</p>
                <p>1 urgent / 3 routine</p>
              </article>
            </div>
          </section>
        </div>

        <div className="admin-surface">
          {loading && <p className="consultation-page__subtitle">Loading requests...</p>}
          {error && <p className="admin-login__error">{error}</p>}
          <div className="admin-toolbar">
            <input
              className="admin-toolbar__search"
              placeholder="Search by patient, request ID, or contact..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
            {filteredRequests.map((request) => (
              <Link key={request.id} to={`/admin/requests/${request.id}`} className="admin-table__row">
                <span>{request.publicId}</span>
                <span>{request.patient}</span>
                <span><em className="admin-status-tag">{request.status}</em></span>
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
