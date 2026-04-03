import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import GpServices from './pages/GpServices';
import Services from './pages/Services';
import OurTeam from './pages/OurTeam';
import ForPatient from './pages/ForPatient';
import Contact from './pages/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gp-services" element={<GpServices />} />
          <Route path="/services" element={<Services />} />
          <Route path="/our-team" element={<OurTeam />} />
          <Route path="/for-patient" element={<ForPatient />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
