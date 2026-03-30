import './App.css';
import heroImage from './assets/landing-page/pexels-cedric-fauntleroy-4266942.jpg';

function App() {
  const services = [
    {
      title: 'Women\'s health',
      summary: 'Specialist support for hormonal health, menopause, and wellbeing at every stage.',
      theme: 'service-card--women',
      size: 'service-card--short'
    },
    {
      title: 'Orthopaedics and spinal care',
      summary: 'Rapid access to diagnostics, pain management, and tailored recovery pathways.',
      theme: 'service-card--ortho',
      size: 'service-card--tall'
    },
    {
      title: 'Cardiac care',
      summary: 'Comprehensive heart checks and consultant-led treatment for ongoing confidence.',
      theme: 'service-card--cardiac',
      size: 'service-card--medium'
    },
    {
      title: 'Maternity care',
      summary: 'Consultant-led pregnancy care with personalised plans for mother and baby.',
      theme: 'service-card--maternity',
      size: 'service-card--short'
    },
    {
      title: 'Cancer care',
      summary: 'Fast diagnostics, multidisciplinary treatment, and compassionate follow-up care.',
      theme: 'service-card--cancer',
      size: 'service-card--tall'
    },
    {
      title: 'Neurology and neurosurgery',
      summary: 'Advanced imaging and expert neurological care for complex conditions.',
      theme: 'service-card--neuro',
      size: 'service-card--medium'
    },
    {
      title: 'Fertility and reproductive medicine',
      summary: 'Evidence-based fertility support, testing, and consultant guidance at each step.',
      theme: 'service-card--fertility',
      size: 'service-card--tall'
    },
    {
      title: 'Respiratory medicine',
      summary: 'Breathing assessments, long-term condition support, and specialist treatment.',
      theme: 'service-card--respiratory',
      size: 'service-card--short'
    }
  ];

  return (
    <div className="App">
      <header className="navbar">
        <div className="navbar__inner container">
          <div className="navbar__logo" aria-label="Logo">
            <span className="logo-mark" aria-hidden="true" />
            <span className="logo-text">Logo</span>
          </div>
          <nav className="navbar__links" aria-label="Primary">
            <a className="navbar__link" href="#home">Home</a>
            <a className="navbar__link" href="#services">Our Services</a>
            <a className="navbar__link" href="#about">About Us</a>
            <button className="navbar__cta" type="button">Book Now</button>
          </nav>
        </div>
      </header>
      <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero__overlay" aria-hidden="true" />
        <div className="hero__content container">
          <p className="hero__eyebrow">For expert treatment, focused on you.</p>
          <h1 className="hero__title">Choose HCA Healthcare UK</h1>
          <p className="hero__subtitle">How can we help get you started?</p>
          <button className="hero__cta" type="button">Book an appointment</button>
        </div>
      </section>
      <section className="intro">
        <div className="container intro__grid">
          <div className="intro__image intro__image--large" role="img" aria-label="Clinician with patient" />
          <div className="intro__content">
            <span className="intro__eyebrow">WELCOME TO DAVENTRY PRIVATE CLINIC</span>
            <h2 className="intro__title">Where you’re treated is your choice, a big one.</h2>
            <p className="intro__text">
              You might be one of the many people in the UK covered by private medical insurance, but do you
              know where you’re treated is your choice?
            </p>
            <p className="intro__text">
              With a trusted network of specialists across our clinics and medical centres, we deliver the gold
              standard in care from consultation through to treatment.
            </p>
          </div>
        </div>
      </section>
      <section className="intro intro--alt">
        <div className="container intro__grid">
          <div className="intro__content">
            <h2 className="intro__title">Leading care, recommended by patients</h2>
            <p className="intro__text">
              We’re constantly evolving our services to ensure every patient gets the high-quality, personalised
              care you value. We’re proud to have exceptional CQC ratings across our network and an
              unrivalled reputation for results.
            </p>
            <p className="intro__text intro__text--strong">
              98% of patients recommend Daventry Private Clinic.
            </p>
            <button className="intro__cta" type="button">Learn more about Daventry Private Clinic</button>
          </div>
          <div className="intro__image intro__image--card" role="img" aria-label="Patient consultation" />
        </div>
      </section>
      <section id="services" className="services">
        <div className="container services__layout">
          <div className="services__panel">
            <span className="services__eyebrow">OUR SERVICE LINES</span>
            <h2 className="services__title">Access specialised care</h2>
            <p className="services__subtitle">
              We offer specialised care across all areas of medicine to treat a broad range of conditions,
              including those that are very rare. Our experts collaborate on multidisciplinary teams to share
              knowledge and offer holistic and tailored treatment plans.
            </p>
            <button className="services__cta" type="button">Search all departments</button>
          </div>
          <div className="services__rail">
            {services.map((service) => (
              <article
                key={service.title}
                className={`service-card ${service.theme} ${service.size}`}
                aria-label={service.title}
              >
                <div className="service-card__scrim" aria-hidden="true" />
                <div className="service-card__content">
                  <h3 className="service-card__title">{service.title}</h3>
                  <p className="service-card__summary">{service.summary}</p>
                  <a className="service-card__link" href="#services">Learn more</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="location">
        <div className="container location__inner">
          <div className="location__card">
            <span className="location__eyebrow">OUR CLINIC</span>
            <h2 className="location__title">Come and visit Daventry Private Clinic</h2>
            <p className="location__text">
              We’re here to welcome you in person for consultations, follow-ups, and personalised care. Use the
              directions below to plan your visit.
            </p>
            <button className="location__cta" type="button">Find Us</button>
          </div>
          <div className="location__details">
            <div className="location__chip">Daventry</div>
            <p className="location__subtext">
              Conveniently located with easy access and parking nearby. If you’d like exact directions or public
              transport guidance, we’re happy to help.
            </p>
          </div>
        </div>
      </section>
      <section className="testimonials">
        <div className="container testimonials__inner">
          <div className="testimonials__header">
            <span className="testimonials__eyebrow">TESTIMONIALS</span>
            <h2 className="testimonials__title">Feedback from our happy patients</h2>
          </div>
          <div className="testimonials__grid">
            <article className="testimonial-card">
              <div className="testimonial-card__avatar" aria-hidden="true" />
              <p className="testimonial-card__quote">
                The team were attentive and reassuring from start to finish. I felt listened to and well cared for.
              </p>
              <span className="testimonial-card__name">HA</span>
            </article>
            <article className="testimonial-card">
              <div className="testimonial-card__avatar" aria-hidden="true" />
              <p className="testimonial-card__quote">
                Booking was easy, the appointment started on time, and I left with a clear plan for next steps.
              </p>
              <span className="testimonial-card__name">BH</span>
            </article>
            <article className="testimonial-card">
              <div className="testimonial-card__avatar" aria-hidden="true" />
              <p className="testimonial-card__quote">
                Professional, warm, and thorough. Exactly the kind of care I was hoping to find locally.
              </p>
              <span className="testimonial-card__name">MS</span>
            </article>
          </div>
        </div>
      </section>
      <section className="affiliations">
        <div className="container affiliations__inner">
          <h3 className="affiliations__title">Affiliations</h3>
          <div className="affiliations__logos">
            <div className="affiliations__logo">BSGAR</div>
            <div className="affiliations__logo">Top Doctors</div>
            <div className="affiliations__logo">CQC</div>
            <div className="affiliations__logo">Royal College of Physicians</div>
            <div className="affiliations__logo">NMC</div>
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__column">
            <h3 className="footer__title">Get In Touch</h3>
            <p className="footer__text">
              Feel free to reach out to us for any inquiries or to schedule an appointment.
            </p>
            <ul className="footer__list">
              <li>info@daventryprivateclinic.co.uk</li>
              <li>+44 1327 737888</li>
              <li>90 Pope Street, Daventry, United Kingdom</li>
            </ul>
            <div className="footer__socials">
              <span>f</span>
              <span>x</span>
              <span>in</span>
              <span>ig</span>
            </div>
          </div>
          <div className="footer__column">
            <h3 className="footer__title">Company</h3>
            <ul className="footer__list">
              <li>About Us</li>
              <li>Meet the Team</li>
              <li>Privacy Policy</li>
              <li>Terms &amp; Conditions</li>
              <li>Blog</li>
            </ul>
          </div>
          <div className="footer__column">
            <h3 className="footer__title">Services</h3>
            <ul className="footer__list">
              <li>Health Checks</li>
              <li>Blood Tests</li>
              <li>Paediatric Services</li>
              <li>Hair Loss</li>
              <li>Psychiatric Services</li>
              <li>Imaging &amp; Diagnostics</li>
              <li>Pump Clinic</li>
            </ul>
          </div>
          <div className="footer__column">
            <h3 className="footer__title">Specialist Care</h3>
            <ul className="footer__list">
              <li>Child ADHD &amp; ASD</li>
              <li>Adult ADHD</li>
              <li>Endocrinology</li>
              <li>Gastroenterology</li>
              <li>Urology</li>
              <li>Breast Clinic</li>
              <li>ENT</li>
              <li>Skin Lump Removal Clinic</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
