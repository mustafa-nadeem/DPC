import { Link } from 'react-router-dom';
import footerBackground from '../assets/landing-page/footer-background.mov';

export default function SiteFooter() {
  return (
    <footer className="footer">
      <video className="footer__bg-video" src={footerBackground} autoPlay muted loop playsInline />
      <div className="footer__bg-overlay" aria-hidden="true" />

      <div className="container footer__surface">
        <section className="footer__cta">
          <h2 className="footer__cta-title">Private care, delivered<br />quickly and personally.</h2>
          <Link className="footer__cta-button" to="/contact">Book consultation</Link>
        </section>

        <div className="footer__divider" />

        <div className="footer__inner">
          <div className="footer__column footer__column--brand">
            <p className="footer__text">Private GP and specialist care in one trusted place.</p>
            <a className="footer__contact-link" href="mailto:info@daventryclinic.co.uk">info@daventryclinic.co.uk</a>
            <a className="footer__contact-link" href="tel:+447463090692">+44 7463 090692</a>
          </div>

          <div className="footer__column">
            <h3 className="footer__title">Clinic</h3>
            <ul className="footer__list">
              <li><a href="/gp-services">GP Services</a></li>
              <li><a href="/services">Our Services</a></li>
              <li><a href="/#about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer__column">
            <h3 className="footer__title">Address</h3>
            <ul className="footer__list">
              <li>Three Shires Hospital</li>
              <li>90 Pope Street</li>
              <li>Daventry, United Kingdom</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>Copyright © 2026 Daventry Private Clinic. All Rights Reserved.</span>
          <div className="footer__legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
