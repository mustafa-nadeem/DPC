import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import {
  addPayment,
  computePaymentKpis,
  fetchPayments,
  formatPaymentForTable,
  isUsingLocalPaymentsFallback,
  clearLocalPaymentsFallbackFlag,
  PAYMENT_STATUS_OPTIONS,
  removePayment,
  updatePayment,
} from '../api/payments';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const emptyForm = () => ({
  requestRef: '',
  patientName: '',
  amount: '',
  status: 'Payment Pending',
  method: 'Manual / in-clinic',
  notes: '',
});

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchPayments();
      setRows(data);
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const kpis = useMemo(() => computePaymentKpis(rows), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      const ref = (p.requestRef && p.requestRef !== '—' ? p.requestRef : '').toLowerCase();
      const name = (p.patientName || '').toLowerCase();
      return ref.includes(q) || name.includes(q);
    });
  }, [rows, search, statusFilter]);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (raw) => {
    setEditingId(raw.id);
    setForm({
      requestRef: raw.requestRef && raw.requestRef !== '—' ? raw.requestRef : '',
      patientName: raw.patientName,
      amount: String(raw.amountGbp),
      status: raw.status,
      method: raw.method,
      notes: raw.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updatePayment(editingId, {
          requestRef: form.requestRef,
          patientName: form.patientName,
          amountGbp: form.amount,
          status: form.status,
          method: form.method,
          notes: form.notes,
        });
      } else {
        await addPayment({
          requestRef: form.requestRef,
          patientName: form.patientName,
          amountGbp: form.amount,
          status: form.status,
          method: form.method,
          notes: form.notes,
        });
      }
      cancelEdit();
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Remove this payment record? This cannot be undone.')) return;
    setError(null);
    try {
      await removePayment(id);
      if (editingId === id) cancelEdit();
      await load();
    } catch (e) {
      setError(e);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title="Payments"
          subtitle="Log and update payments manually — no card links required. Add a row for each amount you receive or are waiting on."
        />

        {isSupabaseConfigured && isUsingLocalPaymentsFallback() && (
          <div className="admin-surface" style={{ padding: '1rem 1.25rem', maxWidth: '48rem' }}>
            <p style={{ margin: '0 0 0.75rem' }}>
              The <code>clinic_payments</code> table is not in your Supabase project yet, so this page is using
              <strong> browser storage only</strong> for this session. Run the SQL in{' '}
              <code>supabase/migrations/20260127000000_clinic_payments.sql</code> (or the end of{' '}
              <code>20260126000000_init.sql</code>) in the Supabase SQL editor, then use the button below to connect to the
              database again.
            </p>
            <button
              type="button"
              className="consultation-page__secondary"
              onClick={() => {
                clearLocalPaymentsFallbackFlag();
                void load();
              }}
            >
              I’ve created the table — try Supabase again
            </button>
          </div>
        )}
        {!isSupabaseConfigured && (
          <p style={{ opacity: 0.8, maxWidth: '40rem' }}>
            Supabase is not configured in the build; payments are kept in this browser only.
          </p>
        )}

        {error && (
          <p className="admin-login__error" role="alert">
            {String(error?.message || error)}
          </p>
        )}

        <div className="admin-surface" style={{ marginBottom: '0.5rem' }}>
          <h2 className="admin-surface__title" style={{ marginTop: 0 }}>
            {editingId ? 'Edit payment' : 'Add payment'}
          </h2>
          <form className="consultation-form" onSubmit={onSubmit} style={{ gap: '1rem' }}>
            <div
              className="admin-page__stack"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
                gap: '0.75rem 1.25rem',
                alignItems: 'end',
              }}
            >
              <label className="consultation-form__field">
                <span>Request / ref (optional)</span>
                <input
                  name="requestRef"
                  value={form.requestRef}
                  onChange={onFormChange}
                  placeholder="e.g. DPC-ABC123 or REQ-…"
                />
              </label>
              <label className="consultation-form__field">
                <span>Patient name</span>
                <input name="patientName" value={form.patientName} onChange={onFormChange} required />
              </label>
              <label className="consultation-form__field">
                <span>Amount (GBP)</span>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={onFormChange}
                  required
                />
              </label>
              <label className="consultation-form__field">
                <span>Status</span>
                <select name="status" value={form.status} onChange={onFormChange}>
                  {PAYMENT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="consultation-form__field" style={{ gridColumn: 'span 2' }}>
                <span>Method (how paid or how you are tracking it)</span>
                <input
                  name="method"
                  value={form.method}
                  onChange={onFormChange}
                  placeholder="e.g. cash, bank transfer, card terminal, invoice sent, waived"
                />
              </label>
              <label className="consultation-form__field consultation-form__field--full" style={{ gridColumn: '1 / -1' }}>
                <span>Internal notes (optional)</span>
                <input
                  name="notes"
                  value={form.notes}
                  onChange={onFormChange}
                  placeholder="What the patient was told, receipt ref, etc."
                />
              </label>
            </div>
            <div className="consultation-form__actions" style={{ justifyContent: 'flex-end' }}>
              {editingId && (
                <button type="button" className="consultation-page__secondary" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
              )}
              <button type="submit" className="consultation-page__primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update payment' : 'Add payment'}
              </button>
            </div>
          </form>
        </div>

        <section className="admin-kpis">
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Paid today</p>
            <p className="admin-kpi-card__value">GBP {kpis.paidTodayGbp}</p>
            <p className="admin-kpi-card__meta">{kpis.paidTodayMeta}</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Pending amount</p>
            <p className="admin-kpi-card__value">GBP {kpis.pendingGbp}</p>
            <p className="admin-kpi-card__meta">{kpis.pendingMeta}</p>
          </article>
          <article className="admin-kpi-card">
            <p className="admin-kpi-card__label">Open pending</p>
            <p className="admin-kpi-card__value">{kpis.followUpCount}</p>
            <p className="admin-kpi-card__meta">{kpis.followUpMeta}</p>
          </article>
        </section>

        <div className="admin-surface">
          <div className="admin-toolbar">
            <input
              className="admin-toolbar__search"
              placeholder="Search by request ref or patient…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="admin-toolbar__chips">
              {['all', 'Payment Pending', 'Confirmed', 'Declined'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`admin-chip ${statusFilter === chip ? 'is-active' : ''}`}
                  onClick={() => setStatusFilter(chip)}
                >
                  {chip === 'all' ? 'All' : chip}
                </button>
              ))}
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
              <span>Actions</span>
            </div>
            {loading ? (
              <p style={{ padding: '1.5rem 1rem', margin: 0, opacity: 0.7 }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <p style={{ padding: '1.5rem 1rem', margin: 0, opacity: 0.8 }}>
                No payment rows match. Add one with the form above, or change search / filter.
              </p>
            ) : (
              filtered.map((p) => {
                const t = formatPaymentForTable(p);
                return (
                  <div key={p.id} className="admin-table__row admin-table__row--static">
                    <span>{t.requestLabel}</span>
                    <span>{t.patient}</span>
                    <span>{t.amount}</span>
                    <span>
                      <em className="admin-status-tag">{t.status}</em>
                    </span>
                    <span>{t.method}</span>
                    <span>{t.updated}</span>
                    <div className="consultation-form__actions admin-table__actions">
                      <button type="button" className="consultation-page__secondary" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="consultation-page__primary" onClick={() => onDelete(p.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
