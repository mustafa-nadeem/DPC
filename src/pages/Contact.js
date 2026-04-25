import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';

export default function Contact() {
  return (
    <>
      <section className="consultation-page">
        <div className="container consultation-page__layout">
          <div className="consultation-page__hero">
            <p className="consultation-page__eyebrow">Public booking flow</p>
            <h1 className="consultation-page__title">Book a consultation request</h1>
            <p className="consultation-page__subtitle">
              This home page introduces the clinic, explains how review-first booking works,
              and gives patients a clear path to submit their request.
            </p>
            <div className="consultation-page__actions">
              <Link className="consultation-page__primary" to="/booking/request">
                Start booking request
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
