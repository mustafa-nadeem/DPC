import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { apiFetch } from '../utils/apiClient';

const actionOptionMap = {
  'Ask for more information': 'ASK_FOR_MORE_INFORMATION',
  'Call patient': 'CALL_PATIENT',
  'Book appointment': 'BOOK_APPOINTMENT',
  'Decline or refer elsewhere': 'DECLINE_OR_REFER',
};

const actionOptionReverseMap = {
  ASK_FOR_MORE_INFORMATION: 'Ask for more information',
  CALL_PATIENT: 'Call patient',
  BOOK_APPOINTMENT: 'Book appointment',
  DECLINE_OR_REFER: 'Decline or refer elsewhere',
};

export default function AdminRequestDetail({ user }) {
  const { requestId } = useParams();
  const [requestData, setRequestData] = useState(null);
  const [status, setStatus] = useState('UNDER_REVIEW');
  const [category, setCategory] = useState('ROUTINE');
  const [action, setAction] = useState('Book appointment');
  const [actionNotes, setActionNotes] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const [actions, setActions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingControls, setSavingControls] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState('');
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SECRETARY';

  const combinedHistory = useMemo(() => {
    const statusItems = statusHistory.map((item) => ({
      id: `status-${item.id}`,
      createdAt: item.createdAt,
      label: `Status changed to ${item.toStatus.replaceAll('_', ' ')}`,
      by: item.changedBy?.email || 'Portal',
    }));
    const actionItems = actions.map((item) => ({
      id: `action-${item.id}`,
      createdAt: item.createdAt,
      label: `Action set to ${item.actionType.replaceAll('_', ' ')}`,
      by: item.actor?.email || 'Portal',
    }));
    const noteItems = notes.map((item) => ({
      id: `note-${item.id}`,
      createdAt: item.createdAt,
      label: 'Internal note added',
      by: item.author?.email || 'Portal',
    }));
    return [...statusItems, ...actionItems, ...noteItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);
  }, [statusHistory, actions, notes]);

  const loadRequest = async (mounted = true) => {
    const payload = await apiFetch(`/admin/requests/${requestId}`);
    if (!mounted) return;
    setRequestData(payload.request);
    setStatus(payload.request.status);
    setCategory(payload.request.category);
    setStatusHistory(payload.statusHistory || []);
    setActions(payload.actions || []);
    setNotes(payload.notes || []);

    const latestAction = (payload.actions || [])[0];
    if (latestAction?.actionType && actionOptionReverseMap[latestAction.actionType]) {
      setAction(actionOptionReverseMap[latestAction.actionType]);
      setActionNotes(latestAction.notes || '');
    } else {
      setAction('Book appointment');
      setActionNotes('');
    }
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        await loadRequest(mounted);
        setError('');
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError.message || 'Failed to load request');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [requestId]);

  const saveCase = async () => {
    if (!requestData || !canEdit) return;
    try {
      setSavingControls(true);
      await apiFetch(`/admin/requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          category,
          actionType: actionOptionMap[action],
          actionNotes: actionNotes.trim() || null,
        }),
      });
      await loadRequest(true);
      setError('');
    } catch (saveError) {
      setError(saveError.message || 'Failed to save request');
    } finally {
      setSavingControls(false);
    }
  };

  const saveNote = async () => {
    if (!canEdit || !noteDraft.trim()) return;
    try {
      setSavingNote(true);
      await apiFetch(`/admin/requests/${requestId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body: noteDraft.trim() }),
      });
      setNoteDraft('');
      await loadRequest(true);
      setError('');
    } catch (noteError) {
      setError(noteError.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__stack">
        <AdminHeader
          title={`Request detail: ${requestData?.publicId || requestId}`}
          subtitle="Review patient details, categorise the case, update status, and record decisions."
        />
        {loading && <p className="consultation-page__subtitle">Loading request...</p>}
        {error && <p className="admin-login__error">{error}</p>}

        <div className="admin-request-layout">
          <section className="admin-surface">
            <article className="admin-section">
              <h2 className="admin-section__title">Patient request</h2>
              <div className="admin-request-grid">
                <p><strong>Name:</strong> {requestData ? `${requestData.firstName} ${requestData.surname}` : '-'}</p>
                <p><strong>DOB:</strong> {requestData?.dateOfBirth || '-'}</p>
                <p><strong>Contact:</strong> {requestData?.mobile || '-'}</p>
                <p><strong>Email:</strong> {requestData?.email || '-'}</p>
                <p className="admin-request-grid__full"><strong>Reason:</strong> {requestData?.reason || '-'}</p>
                <p className="admin-request-grid__full"><strong>Preferred date/time:</strong> {requestData?.preferredDate || '-'} {requestData?.preferredTime ? `at ${requestData.preferredTime}` : ''}</p>
              </div>
            </article>

            <article className="admin-section">
              <h2 className="admin-section__title">Internal notes</h2>
              <textarea
                rows={6}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Record triage notes, call outcomes, and rationale for decisions..."
                disabled={!canEdit}
              />
              <small className="booking-details__counter">{noteDraft.length} characters</small>
              <div className="consultation-form__actions consultation-form__actions--end">
                <button type="button" className="consultation-page__primary" onClick={saveNote} disabled={!canEdit || savingNote || !noteDraft.trim()}>
                  {savingNote ? 'Saving note...' : 'Add note'}
                </button>
              </div>
              <ul className="admin-history">
                {notes.map((item) => (
                  <li key={item.id} className="admin-history__item">
                    <span className="admin-history__time">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div>
                      <p className="admin-history__label">{item.body}</p>
                      <p className="admin-history__meta">By {item.author?.email || 'Portal'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="admin-section">
              <h2 className="admin-section__title">Activity history</h2>
              <ul className="admin-history">
                {combinedHistory.map((item) => (
                  <li key={item.id} className="admin-history__item">
                    <span className="admin-history__time">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
                <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={!canEdit}>
                  <option value="NEW_ENQUIRY">New Enquiry</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="URGENT">Urgent</option>
                  <option value="ROUTINE">Routine</option>
                  <option value="NOT_SUITABLE">Not Suitable</option>
                </select>
              </label>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={!canEdit}>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="AWAITING_MORE_INFORMATION">Awaiting More Information</option>
                  <option value="AWAITING_CALL_BACK">Awaiting Call Back</option>
                  <option value="APPOINTMENT_PROPOSED">Appointment Proposed</option>
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="DECLINED">Declined</option>
                  <option value="REFERRED_ELSEWHERE">Referred Elsewhere</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </label>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Next action</span>
                <select value={action} onChange={(event) => setAction(event.target.value)} disabled={!canEdit}>
                  <option>Ask for more information</option>
                  <option>Call patient</option>
                  <option>Book appointment</option>
                  <option>Decline or refer elsewhere</option>
                </select>
              </label>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Action notes</span>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(event) => setActionNotes(event.target.value)}
                  placeholder="Optional notes for the selected action"
                  disabled={!canEdit}
                />
              </label>
              <div className="consultation-form__actions consultation-form__actions--end">
                <button type="button" className="consultation-page__secondary" onClick={saveCase} disabled={savingControls || !canEdit}>Save draft</button>
                <button type="button" className="consultation-page__primary" onClick={saveCase} disabled={savingControls || !canEdit}>
                  {savingControls ? 'Saving...' : 'Save and continue'}
                </button>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
