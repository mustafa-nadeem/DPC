import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../utils/adminAuth';

const navItems = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/admin/availability',
    label: 'Schedule',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M7 2v3M17 2v3M3 7h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/payments',
    label: 'Payments',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M3 7h18v10H3zM3 10h18M7 15h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminShell({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const allowedNavItems = navItems.filter((item) => {
    if (item.to === '/admin/payments' && user?.role === 'CLINICIAN') return false;
    return true;
  });
  const activeItem = allowedNavItems.find((item) => location.pathname.startsWith(item.to));
  const pageTitle = activeItem?.label || 'Admin';
  const pageSubtitle = location.pathname.startsWith('/admin/requests/')
    ? 'Request review'
    : 'Secretary operations';

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="admin-portal">
      <aside className="admin-portal__sidebar">
        <div className="admin-portal__brand">
          <p className="admin-portal__brand-title">Clinic Portal</p>
          <p className="admin-portal__brand-subtitle">Secretary Workspace</p>
        </div>

        <div className="admin-portal__page-context">
          <p className="admin-portal__page-title">{pageTitle}</p>
          <p className="admin-portal__page-subtitle">{pageSubtitle}</p>
        </div>

        <nav className="admin-portal__nav" aria-label="Admin portal navigation">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-portal__nav-link ${isActive ? 'is-active' : ''}`}
            >
              <span className="admin-portal__nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-portal__sidebar-footer">
          <Link className="admin-portal__home-link" to="/">Back to website</Link>
          <button type="button" className="admin-portal__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-portal__content">
        <div className="admin-portal__topbar">
          <div>
            <p className="admin-portal__topbar-label">Daventry Private Clinic</p>
            <p className="admin-portal__topbar-meta">Admin booking and review portal</p>
          </div>
          <div className="admin-portal__topbar-right">
            <span className="admin-portal__badge">{user?.role || 'User'}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
