import { useState } from 'react';
import SiteFooter from '../components/SiteFooter';

const floatingCards = [
  { stat: '3+', label: 'clinicians', sub: 'Experienced GPs and specialists you can see quickly', color: '#F9D6E4' },
  { stat: '98%', label: 'patient satisfaction', sub: 'From verified post-appointment feedback', color: '#FFF3C4' },
  { stat: '2k+', label: 'patients seen', sub: 'Across private, insured, and self-pay consultations', color: '#C4F0F0' },
  { stat: '12+', label: 'years average experience', sub: 'Clinical experience across our core team', color: '#D4EDDA' },
  { stat: '48hrs', label: 'typical first appointment', sub: 'From initial enquiry to being seen', color: '#DDD6F3' },
];

const clinicians = [
  {
    name: 'Dr Amelia Carter',
    role: 'CLINICIAN',
    bio: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    ],
  },
  {
    name: 'Dr Noah Bennett',
    role: 'CLINICIAN',
    bio: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    ],
  },
  {
    name: 'Dr Sophia Reid',
    role: 'CLINICIAN',
    bio: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    ],
  },
  {
    name: 'Dr Lucas Hayes',
    role: 'CLINICIAN',
    bio: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    ],
  },
  {
    name: 'Dr Emily Brooks',
    role: 'CLINICIAN',
    bio: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    ],
  },
  {
    name: 'Dr Ethan Moore',
    role: 'CLINICIAN',
    bio: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
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
            <h2 className="founders__heading">Our Clinicians</h2>
            <p className="founders__description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          <div className="founders__cards">
            {clinicians.map((clinician, index) => (
              <article key={clinician.name} className="founder-card">
                <div className="founder-card__image" aria-label={clinician.name} />
                <div className="founder-card__body">
                  <h3 className="founder-card__name">{clinician.name}</h3>
                  <span className="founder-card__role">{clinician.role}</span>
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
        aria-label="Clinician profile"
      >
        {activeProfile !== null && (
          <>
            <div className="profile-sidebar__image" aria-label={clinicians[activeProfile].name} />
            <div className="profile-sidebar__content">
              <h3 className="profile-sidebar__name">{clinicians[activeProfile].name}</h3>
              <span className="profile-sidebar__role">{clinicians[activeProfile].role}</span>
              {clinicians[activeProfile].bio.map((paragraph, i) => (
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
