import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import RequireAdminAuth from './components/RequireAdminAuth';

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
          element={
            <RequireAdminAuth>
              <AdminShell />
            </RequireAdminAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="requests/:requestId" element={<AdminRequestDetail />} />
          <Route path="availability" element={<AdminAvailability />} />
          <Route path="payments" element={<AdminPayments />} />
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
