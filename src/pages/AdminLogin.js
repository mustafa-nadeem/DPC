import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_EMAIL, ADMIN_PASSWORD, isAdminAuthenticated, setAdminAuthenticated } from '../utils/adminAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      navigate('/admin/dashboard');
      return;
    }
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
            <p className="consultation-page__subtitle">Use your admin account to continue.</p>

            <form className="consultation-form consultation-form--stacked" onSubmit={onSubmit}>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Email</span>
                <input name="email" type="email" value={credentials.email} onChange={onChange} required />
              </label>
              <label className="consultation-form__field consultation-form__field--full">
                <span>Password</span>
                <input name="password" type="password" value={credentials.password} onChange={onChange} required />
              </label>
              {error && <p className="admin-login__error">{error}</p>}
              <div className="consultation-form__field--full consultation-form__actions consultation-form__actions--end">
                <button type="submit" className="consultation-page__primary">Sign in</button>
              </div>
            </form>

            <div className="admin-login__hint">
              Temp login (for testing): <strong>{ADMIN_EMAIL}</strong> / <strong>{ADMIN_PASSWORD}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
