import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';

export default function BookingConfirmation() {
  return (
    <>
      <section className="consultation-page">
        <div className="container consultation-page__layout">
          <div className="booking-confirmation">
            <p className="booking-confirmation__eyebrow">Submission confirmation</p>
            <h1 className="booking-confirmation__title">Request received</h1>
            <p className="booking-confirmation__text">
              Thank you. Your consultation request has been submitted successfully.
              The clinic team will review your details and come back with next steps.
            </p>
            <div className="booking-confirmation__actions">
              <Link className="booking-confirmation__button" to="/contact">
                Back to booking home
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
