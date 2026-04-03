import placeholderImg from '../assets/landing-page/pexels-cedric-fauntleroy-4266942.jpg';
import SiteFooter from '../components/SiteFooter';

export default function ForPatient() {
  return (
    <>
      <main className="placeholder-page" style={{ backgroundImage: `url(${placeholderImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="placeholder-page__overlay" />
        <div className="container placeholder-page__inner">
          <span className="placeholder-page__eyebrow">For Patient</span>
          <h1 className="placeholder-page__title">Patient Information</h1>
          <p className="placeholder-page__body">This page is coming soon. Everything you need to know before, during, and after your appointment at Daventry Private Clinic.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
