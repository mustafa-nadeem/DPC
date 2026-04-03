import { useState } from 'react';
import { Link } from 'react-router-dom';
import placeholderImg from '../assets/landing-page/pexels-cedric-fauntleroy-4266942.jpg';
import SiteFooter from '../components/SiteFooter';
import useScrollReveal from '../hooks/useScrollReveal';

const services = [
  { title: 'Private GP Birmingham', summary: 'Same-week appointments with experienced GPs for consultations, referrals, and ongoing care.', theme: 'service-card--women', size: 'service-card--short' },
  { title: 'Hay Fever Treatment', summary: 'Fast-access allergy assessment and targeted treatment to manage seasonal symptoms.', theme: 'service-card--respiratory', size: 'service-card--tall' },
  { title: 'Immunisations', summary: 'Travel and routine vaccinations administered by our clinical team at your convenience.', theme: 'service-card--neuro', size: 'service-card--medium' },
  { title: 'Travel Clinic', summary: 'Pre-travel health advice, vaccinations, and medication to keep you safe abroad.', theme: 'service-card--ortho', size: 'service-card--short' },
  { title: 'Weight Loss Clinic', summary: 'Personalised weight management plans with clinical oversight and ongoing support.', theme: 'service-card--maternity', size: 'service-card--tall' },
  { title: 'Longevity & Lifestyle Clinic', summary: 'Evidence-based health optimisation to help you live longer and feel your best.', theme: 'service-card--cardiac', size: 'service-card--medium' },
  { title: 'Menopause & Female Health', summary: 'Specialist support for hormonal health, menopause, and wellbeing at every stage.', theme: 'service-card--fertility', size: 'service-card--tall' },
  { title: 'IV Iron & Wellness Drips', summary: 'Clinician-administered IV therapies tailored to boost energy, immunity, and recovery.', theme: 'service-card--cancer', size: 'service-card--short' },
];

const dermatologyServices = [
  { title: 'Moles', summary: 'Expert mole assessment, monitoring, and removal with fast onward referral when needed.', theme: 'service-card--derm-mole', size: 'service-card--short' },
  { title: 'Vitiligo', summary: 'Specialist diagnosis and personalised treatment plans for skin depigmentation.', theme: 'service-card--derm-pigment', size: 'service-card--tall' },
  { title: 'Urticaria', summary: 'Allergy-led assessment and management for chronic or acute hives and skin reactions.', theme: 'service-card--derm-rosacea', size: 'service-card--medium' },
  { title: 'Excessive Sweating', summary: 'Clinical treatments for hyperhidrosis including topical and injectable options.', theme: 'service-card--derm-eczema', size: 'service-card--short' },
  { title: 'Psoriasis', summary: 'Long-term skin condition management with personalised care plans and follow-up.', theme: 'service-card--derm-acne', size: 'service-card--tall' },
  { title: 'Benign Skin Lesion', summary: 'Safe removal of cysts, lipomas, skin tags, and other benign lesions by our clinicians.', theme: 'service-card--derm-scalp', size: 'service-card--medium' },
  { title: 'Infantile Acne', summary: 'Gentle, clinician-led care for acne in infants with tailored treatment guidance for parents.', theme: 'service-card--derm-acne', size: 'service-card--tall' },
  { title: 'Skin Cancer', summary: 'Rapid skin cancer screening, diagnosis, and referral pathways with specialist oversight.', theme: 'service-card--cancer', size: 'service-card--short' },
  { title: 'Skin Itching & its causes', summary: 'Comprehensive assessment to identify and treat the root causes of persistent skin itching.', theme: 'service-card--derm-eczema', size: 'service-card--medium' },
  { title: 'Male Genital Skin Disorders', summary: 'Discreet, specialist consultation and treatment for dermatological conditions in men.', theme: 'service-card--derm-mole', size: 'service-card--tall' },
  { title: 'Hair Loss', summary: 'Diagnosis and treatment of alopecia and other hair loss conditions with ongoing support.', theme: 'service-card--derm-scalp', size: 'service-card--short' },
];

const testimonials = [
  {
    name: 'H. Ahmad',
    role: 'Patient at Daventry Private Clinic',
    quote: 'From my first enquiry to treatment follow-up, every step felt coordinated and calm. I never had to chase for updates, and the team always explained what was happening in plain language. That level of communication made me feel genuinely supported, not rushed through a process.'
  },
  {
    name: 'B. Harrison',
    role: 'Patient at Daventry Private Clinic',
    quote: 'I booked on short notice and still felt like I had proper time with the doctor. The consultation was thorough, practical, and focused on outcomes I could actually measure. I left with a clear plan, clear timelines, and confidence that I was in the right place.'
  },
  {
    name: 'M. Shah',
    role: 'Patient at Daventry Private Clinic',
    quote: 'Private care can sometimes feel fragmented, but this clinic is different. Appointments, diagnostics, and next steps were connected in a way that reduced stress immediately. I felt listened to throughout, and the care felt personal rather than transactional.'
  },
  {
    name: 'P. Byrne',
    role: 'Family Patient',
    quote: 'As a family, we needed clarity before making decisions. The clinicians took time to explain options, risks, and expected outcomes without jargon. That transparency helped us choose the right route quickly, and we felt reassured at every stage.'
  },
  {
    name: 'J. Williams',
    role: 'Repeat Patient',
    quote: 'Continuity has been the biggest difference for me. I see familiar clinicians who already understand my history, so each appointment builds on the last one instead of starting from zero. It saves time, improves decisions, and makes the whole experience far more effective.'
  },
  {
    name: 'A. Barzante',
    role: 'New Patient',
    quote: 'The clinic environment is modern and professional, but what stood out was the warmth of the team. I felt heard from day one, and treatment began quickly without unnecessary delays. The process was efficient, but never at the expense of quality or care.'
  }
];

const testimonialColumns = [0, 1, 2].map((offset) => (
  testimonials.filter((_, index) => index % 3 === offset)
));

export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  useScrollReveal();

  return (
    <>
      <section id="home" className="hero" style={{ backgroundImage: `url(${placeholderImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <iframe
          className="hero__video"
          title="Daventry Private Clinic background video"
          src="https://player.vimeo.com/video/1022115820?background=1&muted=1&api=1&loop=1&autoplay=1"
          aria-hidden="true"
          allow="autoplay"
          seamless
          onLoad={() => setVideoLoaded(true)}
          style={{ opacity: videoLoaded ? 1 : 0, transition: 'opacity 0.8s ease' }}
        />
        <div className="hero__overlay" aria-hidden="true" />
        <div className="hero__content container">
          <h1 className="hero__title" data-reveal="up">Private healthcare,<br />built around you.</h1>
          <p className="hero__subtitle" data-reveal="up" data-reveal-delay="1">Same-week appointments, specialist care, and personalised treatment — all at Daventry Private Clinic.</p>
          <div className="hero__actions" data-reveal="up" data-reveal-delay="2">
            <Link className="hero__cta" to="/contact">Book Consultation</Link>
            <Link className="hero__link" to="/services">Explore services</Link>
          </div>
        </div>
      </section>

      <section id="about" className="intro intro--tall">
        <div className="container intro__grid">
          <div className="intro__image intro__image--large" data-reveal="left" role="img" aria-label="Clinician with patient" style={{ backgroundImage: `url(${placeholderImg})` }} />
          <div className="intro__content" data-reveal="right">
            <span className="intro__eyebrow">WELCOME TO DAVENTRY PRIVATE CLINIC</span>
            <h2 className="intro__title">Where you're treated is your choice, a big one.</h2>
            <p className="intro__text">You might be one of the many people in the UK covered by private medical insurance, but do you know where you're treated is your choice?</p>
            <p className="intro__text">With a trusted network of specialists across our clinics and medical centres, we deliver the gold standard in care from consultation through to treatment.</p>
          </div>
        </div>
      </section>

      <section className="pillars">
        <div className="container pillars__inner">
          <div className="pillars__header" data-reveal="up">
            <h2 className="pillars__title">Healthcare you can trust,<br />built on the right foundations.</h2>
            <p className="pillars__subtitle">Every decision we make is guided by patient safety, clinical excellence, and a commitment to outcomes that last.</p>
          </div>
          <div className="pillars__grid">
            <article className="pillar-card" data-reveal="up" data-reveal-delay="1">
              <div className="pillar-card__visual pillar-card__visual--safety" aria-hidden="true">
                <div className="pillar-card__visual-glow" />
              </div>
              <div className="pillar-card__body">
                <span className="pillar-card__eyebrow">CLINICAL STANDARDS</span>
                <h3 className="pillar-card__title">Safety and hygiene</h3>
                <p className="pillar-card__text">We adhere to the highest grade hygiene standards which minimizes the risk of complications.</p>
              </div>
            </article>
            <article className="pillar-card" data-reveal="up" data-reveal-delay="2">
              <div className="pillar-card__visual pillar-card__visual--devices" aria-hidden="true">
                <div className="pillar-card__visual-glow" />
              </div>
              <div className="pillar-card__body">
                <span className="pillar-card__eyebrow">OUR FACILITIES</span>
                <h3 className="pillar-card__title">Professional devices</h3>
                <p className="pillar-card__text">You will find state-of-the-art and certified appliances with the best technical parameters at our clinic.</p>
              </div>
            </article>
            <article className="pillar-card" data-reveal="up" data-reveal-delay="3">
              <div className="pillar-card__visual pillar-card__visual--quality" aria-hidden="true">
                <div className="pillar-card__visual-glow" />
              </div>
              <div className="pillar-card__body">
                <span className="pillar-card__eyebrow">TREATMENT QUALITY</span>
                <h3 className="pillar-card__title">Top-quality products</h3>
                <p className="pillar-card__text">We only use the evidence-based interventions that guarantee effectiveness and safety.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="section-fade section-fade--to-services" aria-hidden="true" />

      <section id="services" className="services">
        <div className="container services__layout">
          <div className="services__panel" data-reveal="right">
            <span className="services__eyebrow">GP SERVICES</span>
            <h2 className="services__title">Private GP care, on your terms</h2>
            <p className="services__subtitle">Same-week appointments with experienced GPs across a wide range of services — from routine health checks to specialist clinics.</p>
            <button className="services__cta" type="button">View all GP services</button>
          </div>
          <div className="services__rail" data-reveal="up">
            {services.map((service) => (
              <article key={service.title} className={`service-card ${service.theme} ${service.size}`} aria-label={service.title}>
                <div className="service-card__scrim" aria-hidden="true" />
                <div className="service-card__content">
                  <h3 className="service-card__title">{service.title}</h3>
                  <p className="service-card__summary">{service.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-fade section-fade--to-derm" aria-hidden="true" />

      <section id="dermatology-services" className="services services--reverse services--dermatology">
        <div className="container services__layout">
          <div className="services__rail" data-reveal="up">
            {dermatologyServices.map((service) => (
              <article key={service.title} className={`service-card ${service.theme} ${service.size}`} aria-label={service.title}>
                <div className="service-card__scrim" aria-hidden="true" />
                <div className="service-card__content">
                  <h3 className="service-card__title">{service.title}</h3>
                  <p className="service-card__summary">{service.summary}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="services__panel" data-reveal="left">
            <span className="services__eyebrow">SKIN & DERMATOLOGY</span>
            <h2 className="services__title">Specialist skin care, tailored to you</h2>
            <p className="services__subtitle">From mole checks to complex skin conditions, our dermatology team provides expert diagnosis and personalised treatment plans.</p>
            <button className="services__cta" type="button">Explore skin services</button>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container testimonials__inner">
          <h2 className="testimonials__title" data-reveal="up">Some love from our patients</h2>
          <div className="testimonials__wall" data-reveal="scale">
            {testimonialColumns.map((column, columnIndex) => (
              <div
                key={`testimonial-column-${columnIndex}`}
                className={`testimonials__column ${columnIndex === 1 ? 'is-reverse' : ''}`}
              >
                <div className="testimonials__track">
                  {[...column, ...column].map((testimonial, cardIndex) => (
                    <article
                      key={`${testimonial.name}-${cardIndex}`}
                      className="testimonials__card"
                      aria-label={`Feedback from ${testimonial.name}`}
                    >
                      <div className="testimonials__card-head">
                        <div className="testimonials__avatar" aria-hidden="true">
                          {testimonial.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="testimonials__person">
                          <span className="testimonials__name">{testimonial.name}</span>
                          <span className="testimonials__role">{testimonial.role}</span>
                        </div>
                      </div>
                      <p className="testimonials__quote">{testimonial.quote}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="location" data-reveal="up">
        <iframe
          className="location__map"
          title="Three Shires Hospital map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.404843883182!2d-0.8770387874730239!3d52.23602985709786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48770ed378395d35%3A0x6bbb167633f19e83!2sThree%20Shires%20Hospital!5e0!3m2!1sen!2s!4v1775189408691!5m2!1sen!2s"
          width="800"
          height="600"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <SiteFooter />
    </>
  );
}
