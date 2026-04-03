import { useState } from 'react';
import SiteFooter from '../components/SiteFooter';

const floatingCards = [
  { stat: '15+', label: 'specialist clinicians', sub: 'Across GP, dermatology, and allied health', color: '#F9D6E4' },
  { stat: '98%', label: 'patient satisfaction', sub: 'Based on post-consultation feedback', color: '#FFF3C4' },
  { stat: '5k+', label: 'patients treated', sub: 'Private and insured patients since opening', color: '#C4F0F0' },
  { stat: '10+', label: 'years experience', sub: 'Average clinical experience per clinician', color: '#D4EDDA' },
  { stat: '48hr', label: 'average wait time', sub: 'From booking to your first appointment', color: '#DDD6F3' },
];

const founders = [
  {
    name: 'Dr Kazeem Babatunde Salako',
    role: 'CO-FOUNDER',
    bio: [
      'Dr Kazeem Babatunde Salako brings years of clinical leadership across NHS and private settings to Daventry Private Clinic. His background spans general practice, specialist referrals, and healthcare operations — giving him a comprehensive view of what patients need at every stage of their care journey.',
      'As co-founder, Dr Salako has been instrumental in developing the clinic\'s specialist service offering and clinical governance framework. He is passionate about raising healthcare standards and ensuring that private care is delivered with the same evidence-based rigour expected in the best NHS institutions.'
    ],
  },
  {
    name: 'Dr Ahmad Kusimo',
    role: 'CO-FOUNDER',
    bio: [
      'Dr Ahmad Kusimo co-founded Daventry Private Clinic with a vision to deliver high-quality, patient-centred healthcare outside the constraints of the traditional NHS pathway. With extensive experience across general practice and urgent care, he brings a hands-on clinical approach rooted in accessibility and trust.',
      'His focus on building long-term patient relationships and ensuring continuity of care has shaped the clinic\'s philosophy from day one. Dr Kusimo is committed to combining clinical rigour with a personal touch — ensuring every patient feels heard, informed, and confident in their care.'
    ],
  },
];

export default function OurTeam() {
  const [activeProfile, setActiveProfile] = useState(null);

  const openProfile = (index) => {
    setActiveProfile(index);
    document.body.style.overflow = 'hidden';
  };

  const closeProfile = () => {
    setActiveProfile(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <section className="team-hero">
        <div className="team-hero__cards">
          {floatingCards.map((card, i) => (
            <div
              key={card.stat}
              className={`team-hero__float team-hero__float--${i}`}
              style={{ background: card.color }}
            >
              <span className="team-hero__float-stat">{card.stat}</span>
              <span className="team-hero__float-label">{card.label}</span>
              <span className="team-hero__float-sub">{card.sub}</span>
            </div>
          ))}
        </div>

        <div className="team-hero__center">
          <h1 className="team-hero__title">
            Experienced care,<br />delivered personally
          </h1>
          <p className="team-hero__subtitle">
            Our clinicians bring decades of NHS and private practice expertise to every consultation at Daventry Private Clinic.
          </p>
        </div>
      </section>

      <section className="founders">
        <div className="container founders__inner">
          <div className="founders__intro">
            <h2 className="founders__heading">Our Founders</h2>
            <p className="founders__description">
              Our founding team brings together years of NHS and private practice leadership, united by a commitment to raising the standard of accessible, patient-centred healthcare.
            </p>
          </div>

          <div className="founders__cards">
            {founders.map((founder, index) => (
              <article key={founder.name} className="founder-card">
                <div className="founder-card__image" aria-label={founder.name} />
                <div className="founder-card__body">
                  <h3 className="founder-card__name">{founder.name}</h3>
                  <span className="founder-card__role">{founder.role}</span>
                </div>
                <button
                  type="button"
                  className="founder-card__footer"
                  onClick={() => openProfile(index)}
                >
                  <span className="founder-card__link">VIEW PROFILE</span>
                  <span className="founder-card__arrow" aria-hidden="true">&#x2192;</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Profile sidebar overlay */}
      <div
        className={`profile-overlay ${activeProfile !== null ? 'is-open' : ''}`}
        onClick={closeProfile}
        aria-hidden="true"
      />
      <button
        type="button"
        className={`profile-sidebar__close ${activeProfile !== null ? 'is-open' : ''}`}
        onClick={closeProfile}
        aria-label="Close profile"
      >
        &#x2715;
      </button>
      <aside
        className={`profile-sidebar ${activeProfile !== null ? 'is-open' : ''}`}
        aria-label="Founder profile"
      >
        {activeProfile !== null && (
          <>
            <div className="profile-sidebar__image" aria-label={founders[activeProfile].name} />
            <div className="profile-sidebar__content">
              <h3 className="profile-sidebar__name">{founders[activeProfile].name}</h3>
              <span className="profile-sidebar__role">{founders[activeProfile].role}</span>
              {founders[activeProfile].bio.map((paragraph, i) => (
                <p key={i} className="profile-sidebar__bio">{paragraph}</p>
              ))}
            </div>
          </>
        )}
      </aside>

      <SiteFooter />
    </>
  );
}
