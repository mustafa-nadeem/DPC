import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from '../utils/adminAuth';

const mayShowTestCredentials =
  process.env.REACT_APP_SHOW_TEST_AUTH_HINT !== 'false' &&
  process.env.REACT_APP_SHOW_ADMIN_HINT !== 'false';
const showLocalTestHint = !isSupabaseConfigured && mayShowTestCredentials;
// Supabase: show test email/password in dev so you can match them when creating a user in the dashboard
const showSupabaseTestHint =
  isSupabaseConfigured && mayShowTestCredentials && process.env.NODE_ENV === 'development';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate('/admin/dashboard', { replace: true });
        }
      });
      return;
    }
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;
    setBusy(true);
    setError('');

    if (isSupabaseConfigured && supabase) {
      // Staff reads booking_requests as `authenticated`; anon cannot SELECT. Supabase Auth session is required.
      let { error: signError } = await supabase.auth.signInWithPassword({ email, password });

      // One-time bootstrap: if default staff credentials are used and the user does not exist yet, sign up then sign in.
      const isDefaultStaff =
        email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
      if (signError && isDefaultStaff) {
        const { error: upErr } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });
        const duplicateAccount =
          upErr &&
          String(upErr.message || '')
            .toLowerCase()
            .match(/already|registered|exists/);
        if (!upErr || duplicateAccount) {
          ({ error: signError } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          }));
        } else {
          signError = upErr;
        }
      }

      setBusy(false);
      if (signError) {
        setError(
          signError.message ||
            'Sign-in failed. In Supabase → Authentication, turn off “Confirm email” for testing, or confirm the staff email.',
        );
        return;
      }
      setAdminAuthenticated(true);
      navigate('/admin/dashboard');
      return;
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setBusy(false);
      navigate('/admin/dashboard');
      return;
    }
    setBusy(false);
    setError('Invalid email or password.');
  };

  return (
    <section className="consultation-page consultation-page--admin">
      <div className="container consultation-page__layout">
        <div className="admin-login-layout">
          <aside className="admin-login-panel admin-login-panel--info">
            <p className="admin-header__eyebrow">Secretary admin portal</p>
            <h1 className="admin-header__title">Manage patient requests safely</h1>
            <p className="admin-header__subtitle">
              Review cases, categorise requests, assign appointment slots, and track payment before confirmation.
            </p>
            <ul className="admin-login-checklist">
              <li>Review-first workflow controls</li>
              <li>Status and action history tracking</li>
              <li>Payment pending vs confirmed visibility</li>
            </ul>
          </aside>

          <div className="admin-login-panel">
            <p className="consultation-page__eyebrow">Admin access</p>
            <h2 className="consultation-page__title">Staff login</h2>
            <p className="consultation-page__subtitle">
              {isSupabaseConfigured
                ? 'Use your staff account (Supabase Auth) to sign in.'
                : 'Local mode: use the test credentials or configure Supabase (see .env.example).'}
            </p>

            <form className="consultation-form consultation-form--stacked" onSubmit={onSubmit}>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Email</span>
                <input name="email" type="email" value={credentials.email} onChange={onChange} required />
              </label>
              <label className="consultation-form__field consultation-form--full">
                <span>Password</span>
                <input name="password" type="password" value={credentials.password} onChange={onChange} required />
              </label>
              {error && <p className="admin-login__error">{error}</p>}
              <div className="consultation-form__field--full consultation-form__actions consultation-form__actions--end">
                <button type="submit" className="consultation-page__primary" disabled={busy}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </form>

            {showLocalTestHint && (
              <div className="admin-login__hint">
                Local test login: <strong>{ADMIN_EMAIL}</strong> / <strong>{ADMIN_PASSWORD}</strong>
              </div>
            )}
            {showSupabaseTestHint && (
              <div className="admin-login__hint">
                Dev only — In Supabase → Authentication → Users, create a user with:{' '}
                <strong>{ADMIN_EMAIL}</strong> / <strong>{ADMIN_PASSWORD}</strong>
                {' '}(or sign in if that user already exists).
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
