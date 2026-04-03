import { useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import useScrollReveal from '../hooks/useScrollReveal';

const treatmentOptions = [
  'Private GP Consultation',
  'Hay Fever Treatment',
  'Immunisations',
  'Travel Clinic',
  'Weight Loss Clinic',
  'Longevity & Lifestyle Clinic',
  'Menopause & Female Health',
  'IV Iron & Wellness Drips',
  'Moles',
  'Vitiligo',
  'Urticaria',
  'Excessive Sweating',
  'Psoriasis',
  'Benign Skin Lesion',
  'Skin Cancer',
  'Hair Loss',
  'Other',
];

export default function Contact() {
  useScrollReveal();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    treatment: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <section className="booking-hero">
        <div className="container booking-hero__inner">
          <div className="booking-hero__text" data-reveal="right">
            <h1 className="booking-hero__title">
              Book a consultation<br />
              with our <span className="booking-hero__accent">specialist team</span>
            </h1>
            <p className="booking-hero__subtitle">
              Same-week private appointments with experienced clinicians. Tell us what you need and we'll get back to you within 24 hours.
            </p>
            <div className="booking-hero__contact">
              <a className="booking-hero__contact-link" href="mailto:info@daventryprivateclinic.co.uk">info@daventryprivateclinic.co.uk</a>
              <a className="booking-hero__contact-link" href="tel:+441327737888">+44 1327 737888</a>
            </div>
          </div>

          {submitted ? (
            <div className="booking-form booking-form--success">
              <div className="booking-form__success-icon">&#x2713;</div>
              <h2 className="booking-form__success-title">Thank you for your enquiry</h2>
              <p className="booking-form__success-text">
                We've received your details and a member of our team will be in touch within 24 hours to arrange your consultation.
              </p>
            </div>
          ) : (
          <form className="booking-form" onSubmit={handleSubmit} data-reveal="up">
            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="name">
                Full Name <span className="booking-form__required">*</span>
              </label>
              <input
                className="booking-form__input"
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="phone">
                Phone <span className="booking-form__required">*</span>
              </label>
              <input
                className="booking-form__input"
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                required
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="email">
                Email <span className="booking-form__required">*</span>
              </label>
              <input
                className="booking-form__input"
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="treatment">
                What are you interested in?
              </label>
              <select
                className="booking-form__select"
                id="treatment"
                name="treatment"
                value={form.treatment}
                onChange={handleChange}
              >
                <option value="" disabled>Select a treatment</option>
                {treatmentOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="message">
                Message
              </label>
              <textarea
                className="booking-form__textarea"
                id="message"
                name="message"
                placeholder="Tell us a bit about what you need..."
                rows={4}
                value={form.message}
                onChange={handleChange}
              />
            </div>

            <button className="booking-form__submit" type="submit">
              Book Consultation
            </button>

            <p className="booking-form__disclaimer">
              By submitting this form, you agree to our <a href="#privacy">Privacy Policy</a> and consent to being contacted regarding your enquiry.
            </p>
          </form>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
