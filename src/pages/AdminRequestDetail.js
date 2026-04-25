import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';

const requestHistory = [
  { time: '09:14', label: 'Request submitted by patient', by: 'Portal' },
  { time: '09:22', label: 'Status moved to Under Review', by: 'Secretary' },
  { time: '09:31', label: 'Internal note added', by: 'Secretary' },
];

export default function AdminRequestDetail() {
  const { requestId } = useParams();
  const [status, setStatus] = useState('Under Review');
  const [category, setCategory] = useState('Routine');
  const [action, setAction] = useState('Book appointment');
  const [notes, setNotes] = useState('');

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title={`Request detail: ${requestId}`}
          subtitle="Review patient details, categorise the case, update status, and record decisions."
        />

        <div className="admin-request-layout">
          <section className="admin-surface">
            <article className="admin-section">
              <h2 className="admin-section__title">Patient request</h2>
              <div className="admin-request-grid">
                <p><strong>Name:</strong> Sarah Bennett</p>
                <p><strong>DOB:</strong> 08/09/2002</p>
                <p><strong>Contact:</strong> +44 7000 000000</p>
                <p><strong>Email:</strong> sarah@example.com</p>
                <p className="admin-request-grid__full"><strong>Reason:</strong> Persistent skin irritation and follow-up consultation.</p>
                <p className="admin-request-grid__full"><strong>Preferred date/time:</strong> 05/05/2026 at 09:30</p>
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
              <ul className="admin-history">
                {requestHistory.map((item) => (
                  <li key={`${item.time}-${item.label}`} className="admin-history__item">
                    <span className="admin-history__time">{item.time}</span>
                    <div>
                      <p className="admin-history__label">{item.label}</p>
                      <p className="admin-history__meta">By {item.by}</p>
                    </div>
                  </li>
                ))}
              </ul>
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
                <button type="button" className="consultation-page__secondary">Save draft</button>
                <button type="button" className="consultation-page__primary">Save and continue</button>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
