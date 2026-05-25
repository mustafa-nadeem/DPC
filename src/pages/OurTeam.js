import SiteFooter from '../components/SiteFooter';
import kazeemImage from '../assets/kazeem.png';
import ahmadImage from '../assets/ahmad-avatar.png';

const floatingCards = [
  { stat: '2', label: 'clinicians', sub: 'Experienced GPs and specialists you can see quickly', color: '#F9D6E4' },
  { stat: '98%', label: 'patient satisfaction', sub: 'From verified post-appointment feedback', color: '#FFF3C4' },
  { stat: '2k+', label: 'patients seen', sub: 'Across private, insured, and self-pay consultations', color: '#C4F0F0' },
  { stat: '12+', label: 'years average experience', sub: 'Clinical experience across our core team', color: '#D4EDDA' },
  { stat: '48hrs', label: 'typical first appointment', sub: 'From initial enquiry to being seen', color: '#DDD6F3' },
];

const clinicians = [
  {
    name: 'Dr Kazeem Babatunde Salako',
    role: 'CLINICIAN',
    image: kazeemImage,
  },
  {
    name: 'Dr Ahmad Kusimo',
    role: 'CLINICIAN',
    image: ahmadImage,
  },
];

export default function OurTeam() {
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
              You will be seen by doctors who are used to working in busy NHS and private settings and who prioritise clear explanations, sensible follow-up, and care that fits your life. 
              The team supports both same-week private GP care and our specialist skin and dermatology services, with one consistent focus: getting the right plan in place, without unnecessary delay.
            </p>
          </div>

          <div className="founders__cards">
            {clinicians.map((clinician) => (
              <article key={clinician.name} className="founder-card">
                <div
                  className="founder-card__image"
                  style={{ backgroundImage: `url(${clinician.image})` }}
                  aria-label={clinician.name}
                />
                <div className="founder-card__body">
                  <h3 className="founder-card__name">{clinician.name}</h3>
                  <span className="founder-card__role">{clinician.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
