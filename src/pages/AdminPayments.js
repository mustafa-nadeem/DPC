import AdminHeader from '../components/AdminHeader';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient';

const formatMoney = (minor, currency = 'GBP') => `${currency.toUpperCase()} ${(Number(minor || 0) / 100).toFixed(2)}`;

export default function AdminPayments({ user }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ paidMinor: 0, pendingMinor: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canManage = user?.role === 'ADMIN' || user?.role === 'SECRETARY';

  const paidToday = useMemo(() => formatMoney(summary.paidMinor), [summary.paidMinor]);
  const pendingAmount = useMemo(() => formatMoney(summary.pendingMinor), [summary.pendingMinor]);
  const overdue = useMemo(
    () => payments.filter((payment) => payment.status === 'PENDING').length,
    [payments]
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const payload = await apiFetch('/admin/payments');
        if (!mounted) return;
        setPayments(payload.payments || []);
        setSummary(payload.summary || { paidMinor: 0, pendingMinor: 0 });
        setError('');
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError.message || 'Failed to load payments');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSendPaymentLink = async (requestId) => {
    try {
      const payload = await apiFetch(`/admin/requests/${requestId}/payment-link`, {
        method: 'POST',
        body: JSON.stringify({
          amountMinor: 20000,
          currency: 'gbp',
        }),
      });
      if (payload.paymentLinkUrl) {
        setSuccess(`Payment link created: ${payload.paymentLinkUrl}`);
        window.open(payload.paymentLinkUrl, '_blank', 'noopener,noreferrer');
      } else {
        setSuccess('Payment link created successfully.');
      }
      const refreshed = await apiFetch('/admin/payments');
      setPayments(refreshed.payments || []);
      setSummary(refreshed.summary || { paidMinor: 0, pendingMinor: 0 });
      setError('');
    } catch (sendError) {
      setError(sendError.message || 'Failed to send payment link');
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title="Payments"
          subtitle="Track payment status, send payment links, and monitor confirmed bookings."
        />

        <section className="admin-kpis">
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Paid today</p>
            <p className="admin-kpi-card__value">{paidToday}</p>
            <p className="admin-kpi-card__meta">Confirmed payments total</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Pending amount</p>
            <p className="admin-kpi-card__value">{pendingAmount}</p>
            <p className="admin-kpi-card__meta">Links awaiting payment</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Overdue links</p>
            <p className="admin-kpi-card__value">{overdue}</p>
            <p className="admin-kpi-card__meta">Needs follow-up</p>
          </article>
        </section>

        <div className="admin-surface">
          {loading && <p className="consultation-page__subtitle">Loading payments...</p>}
          {error && <p className="admin-login__error">{error}</p>}
          {success && <p className="consultation-page__subtitle">{success}</p>}
          <div className="admin-toolbar">
            <input className="admin-toolbar__search" placeholder="Search payment by request or patient..." />
            <div className="admin-toolbar__chips">
              <button type="button" className="admin-chip is-active">All</button>
              <button type="button" className="admin-chip">Payment Pending</button>
              <button type="button" className="admin-chip">Confirmed</button>
              <button type="button" className="admin-chip">Declined</button>
            </div>
          </div>

          <div className="admin-table admin-table--payments">
            <div className="admin-table__head">
              <span>Request</span>
              <span>Patient</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Method</span>
              <span>Updated</span>
            </div>
            {payments.map((payment) => (
              <div key={payment.id} className="admin-table__row admin-table__row--static">
                <span>{payment.request?.publicId || '-'}</span>
                <span>{payment.request ? `${payment.request.firstName} ${payment.request.surname}` : '-'}</span>
                <span>{formatMoney(payment.amountMinor, payment.currency)}</span>
                <span><em className="admin-status-tag">{payment.status.replaceAll('_', ' ')}</em></span>
                <span>{payment.provider}</span>
                <span>{new Date(payment.updatedAt).toLocaleString()}</span>
                <div className="consultation-form__actions admin-table__actions">
                  <Link className="consultation-page__secondary" to={`/admin/requests/${payment.requestId}`}>Open case</Link>
                  {canManage && (
                    <button type="button" className="consultation-page__primary" onClick={() => handleSendPaymentLink(payment.requestId)}>
                      Send link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
