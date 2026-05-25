import { useState } from 'react';
import { Link } from 'react-router-dom';
import placeholderImg from '../assets/landing-page/pexels-cedric-fauntleroy-4266942.jpg';
import heroVideo from '../assets/landing-page/hero.mp4';
import introImage from '../assets/landing-page/3c677590e3b04eb08ff5c40875e2aaa9.webp';
import SiteFooter from '../components/SiteFooter';
import useScrollReveal from '../hooks/useScrollReveal';
import { getServicePath, gpServices, skinServices } from '../data/services';

const gpCardThemes = [
  'service-card--respiratory',
  'service-card--neuro',
  'service-card--ortho',
  'service-card--maternity',
  'service-card--cardiac',
  'service-card--fertility',
];
const skinCardThemes = [
  'service-card--derm-mole',
  'service-card--derm-pigment',
  'service-card--derm-rosacea',
  'service-card--derm-eczema',
  'service-card--derm-acne',
  'service-card--derm-scalp',
  'service-card--cancer',
];
const cardSizes = ['service-card--short', 'service-card--tall', 'service-card--medium'];

const buildRailServices = (services, themes) =>
  services.map((service, index) => ({
    slug: service.slug,
    title: service.title,
    summary: service.description,
    href: getServicePath(service.slug),
    theme: themes[index % themes.length],
    size: cardSizes[index % cardSizes.length],
  }));

const services = buildRailServices(gpServices, gpCardThemes);
const dermatologyServices = buildRailServices(skinServices, skinCardThemes);

const testimonials = [
  {
    name: 'Verified Patient A',
    role: 'Aged and Sun Damaged Skin',
    quote: 'Dr Salako is a good listener and explains in great detail.'
  },
  {
    name: 'Verified Patient B',
    role: 'General Dermatology · Minor Skin Surgery · Skin Cancer',
    quote: 'Absolutely fantastic service. Dr Salako went out of his way to help my husband.'
  },
  {
    name: 'Verified Patient C',
    role: 'Aged and Sun Damaged Skin',
    quote: '10/10 stars if possible. Very good.'
  },
  {
    name: 'Verified Patient D',
    role: 'Cysts · Cyst Removal',
    quote: 'Doctor Kazeem is very careful. He listens when you talk to him and takes concerns seriously.'
  },
  {
    name: 'Verified Patient E',
    role: 'Minor Skin Surgery · Aged and Sun Damaged Skin',
    quote: 'Positive experience.'
  },
  {
    name: 'Verified Patient F',
    role: 'Minor Skin Surgery',
    quote: 'This doctor gives amazing care - he makes procedures comfortable.'
  },
  {
    name: 'Verified Patient G',
    role: 'Cysts',
    quote: 'Dr. Kazeem is highly professional and polite.'
  },
  {
    name: 'Verified Patient H',
    role: 'General Dermatology',
    quote: 'Successful consultation.'
  },
  {
    name: 'Verified Patient I',
    role: 'General Dermatology · Aged and Sun Damaged Skin',
    quote: 'Helpful and friendly.'
  },
];

const testimonialColumns = [0, 1, 2].map((offset) => (
  testimonials.filter((_, index) => index % 3 === offset)
));

export default function Home() {
  const [videoFailed, setVideoFailed] = useState(false);
  useScrollReveal();

  return (
    <>
      <section id="home" className="hero" style={{ backgroundImage: `url(${placeholderImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {!videoFailed && (
          <video
            className="hero__video"
            aria-hidden="true"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={placeholderImg}
            onError={() => setVideoFailed(true)}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        )}
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
          <div className="intro__image intro__image--large" data-reveal="left" role="img" aria-label="Clinician with patient" style={{ backgroundImage: `url(${introImage})` }} />
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
            <Link className="services__cta" to="/gp-services">View all GP services</Link>
          </div>
          <div className="services__rail" data-reveal="up">
            <div className="services__track">
              {services.map((service) => (
                <article key={service.slug} className={`service-card ${service.theme} ${service.size}`} aria-label={service.title}>
                  <div className="service-card__scrim" aria-hidden="true" />
                  <div className="service-card__content">
                    <h3 className="service-card__title">{service.title}</h3>
                    <p className="service-card__summary">{service.summary}</p>
                    <Link className="service-card__link" to={service.href}>Learn more</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-fade section-fade--to-derm" aria-hidden="true" />

      <section id="dermatology-services" className="services services--reverse services--dermatology">
        <div className="container services__layout">
          <div className="services__rail" data-reveal="up">
            <div className="services__track">
              {dermatologyServices.map((service) => (
                <article key={service.slug} className={`service-card ${service.theme} ${service.size}`} aria-label={service.title}>
                  <div className="service-card__scrim" aria-hidden="true" />
                  <div className="service-card__content">
                    <h3 className="service-card__title">{service.title}</h3>
                    <p className="service-card__summary">{service.summary}</p>
                    <Link className="service-card__link" to={service.href}>Learn more</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="services__panel" data-reveal="left">
            <span className="services__eyebrow">SKIN & DERMATOLOGY</span>
            <h2 className="services__title">Specialist skin care, tailored to you</h2>
            <p className="services__subtitle">From mole checks to complex skin conditions, our dermatology team provides expert diagnosis and personalised treatment plans.</p>
            <Link className="services__cta" to="/services">Explore skin services</Link>
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
          title="8 St John's Square, Daventry map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2442.118433525238!2d-1.1632248874769!3d52.25939435537425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4877161ad72eabad%3A0x990fe464d6fd8d1!2s8%20St%20John%27s%20Square%2C%20Daventry%20NN11%204FG!5e0!3m2!1sen!2suk!4v1776669390220!5m2!1sen!2suk"
          width="600"
          height="450"
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
