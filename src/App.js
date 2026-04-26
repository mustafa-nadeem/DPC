import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import AdminShell from './components/AdminShell';
import Home from './pages/Home';
import GpServices from './pages/GpServices';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import OurTeam from './pages/OurTeam';
import ForPatient from './pages/ForPatient';
import Contact from './pages/Contact';
import BookingRequestForm from './pages/BookingRequestForm';
import BookingPatientDetails from './pages/BookingPatientDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequestDetail from './pages/AdminRequestDetail';
import AdminAvailability from './pages/AdminAvailability';
import AdminPayments from './pages/AdminPayments';
import { getAdminSession, hasRole, isAdminAuthenticated } from './utils/adminAuth';

function RequireAdminAuth({ children }) {
  const [state, setState] = useState({
    loading: true,
    allowed: isAdminAuthenticated(),
    user: null,
  });

  useEffect(() => {
    let mounted = true;
    getAdminSession()
      .then((user) => {
        if (!mounted) return;
        setState({ loading: false, allowed: Boolean(user), user });
      })
      .catch(() => {
        if (!mounted) return;
        setState({ loading: false, allowed: false, user: null });
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) {
    return <div className="admin-auth-loading">Checking admin session...</div>;
  }

  if (!state.allowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return children(state.user);
}

function AccessDenied() {
  return <div className="admin-auth-loading">Access denied for this role.</div>;
}

function RequireRole({ user, allowedRoles, children }) {
  if (!hasRole(user, allowedRoles)) {
    return <AccessDenied />;
  }
  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gp-services" element={<GpServices />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/for-patient" element={<ForPatient />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/booking/request" element={<BookingRequestForm />} />
        <Route path="/booking/details" element={<BookingPatientDetails />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={<RequireAdminAuth>{(user) => <AdminShell user={user} />}</RequireAdminAuth>}
        >
          <Route path="dashboard" element={<RequireAdminAuth>{(user) => <AdminDashboard user={user} />}</RequireAdminAuth>} />
          <Route
            path="requests/:requestId"
            element={<RequireAdminAuth>{(user) => <AdminRequestDetail user={user} />}</RequireAdminAuth>}
          />
          <Route
            path="availability"
            element={
              <RequireAdminAuth>
                {(user) => (
                  <RequireRole user={user} allowedRoles={['ADMIN', 'SECRETARY']}>
                    <AdminAvailability user={user} />
                  </RequireRole>
                )}
              </RequireAdminAuth>
            }
          />
          <Route
            path="payments"
            element={
              <RequireAdminAuth>
                {(user) => (
                  <RequireRole user={user} allowedRoles={['ADMIN', 'SECRETARY', 'CLINICIAN']}>
                    <AdminPayments user={user} />
                  </RequireRole>
                )}
              </RequireAdminAuth>
            }
          />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
