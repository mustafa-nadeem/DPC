import AdminHeader from '../components/AdminHeader';

const payments = [
  { id: 'REQ-1042', patient: 'Sarah Bennett', amount: 'GBP 95.00', status: 'Payment Pending', method: 'Stripe link', updated: 'Today 09:08' },
  { id: 'REQ-1041', patient: 'Michael Khan', amount: 'GBP 120.00', status: 'Confirmed', method: 'Stripe paid', updated: 'Today 08:02' },
  { id: 'REQ-1040', patient: 'Olivia Shaw', amount: 'GBP 95.00', status: 'Payment Pending', method: 'Stripe link', updated: 'Yesterday' },
  { id: 'REQ-1037', patient: 'Anya Patel', amount: 'GBP 200.00', status: 'Declined', method: 'N/A', updated: 'Yesterday' },
];

export default function AdminPayments() {
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
            <p className="admin-kpi-card__value">GBP 120</p>
            <p className="admin-kpi-card__meta">1 confirmed payment</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Pending amount</p>
            <p className="admin-kpi-card__value">GBP 190</p>
            <p className="admin-kpi-card__meta">2 links awaiting payment</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Overdue links</p>
            <p className="admin-kpi-card__value">1</p>
            <p className="admin-kpi-card__meta">Needs follow-up</p>
          </article>
        </section>

        <div className="admin-surface">
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
                <span>{payment.id}</span>
                <span>{payment.patient}</span>
                <span>{payment.amount}</span>
                <span><em className="admin-status-tag">{payment.status}</em></span>
                <span>{payment.method}</span>
                <span>{payment.updated}</span>
                <div className="consultation-form__actions admin-table__actions">
                  <button type="button" className="consultation-page__secondary">Open case</button>
                  <button type="button" className="consultation-page__primary">Send link</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
