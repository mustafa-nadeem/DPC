import SiteFooter from '../components/SiteFooter';

const gpServices = [
  { title: 'Private GP Birmingham', description: 'Same-week appointments with experienced GPs for consultations, referrals, and ongoing care.' },
  { title: 'Hay Fever Treatment', description: 'Fast-access allergy assessment and targeted treatment to manage seasonal symptoms.' },
  { title: 'Immunisations', description: 'Travel and routine vaccinations administered by our clinical team at your convenience.' },
  { title: 'Travel Clinic', description: 'Pre-travel health advice, vaccinations, and medication to keep you safe abroad.' },
  { title: 'Weight Loss Clinic', description: 'Personalised weight management plans with clinical oversight and ongoing support.' },
  { title: 'Longevity & Lifestyle Clinic', description: 'Evidence-based health optimisation to help you live longer and feel your best.' },
  { title: 'Menopause & Female Health', description: 'Specialist support for hormonal health, menopause, and wellbeing at every stage.' },
  { title: 'IV Iron & Wellness Drips', description: 'Clinician-administered IV therapies tailored to boost energy, immunity, and recovery.' },
];

export default function GpServices() {
  return (
    <>
      <section className="page-hero page-hero--navy">
        <div className="container page-hero__inner">
          <h1 className="page-hero__title">GP Services</h1>
          <p className="page-hero__subtitle">
            Same-week private GP appointments for consultations, health checks, referrals, and ongoing support.
          </p>
        </div>
      </section>

      <section className="service-listing">
        <div className="container service-listing__grid">
          {gpServices.map((service) => (
            <article key={service.title} className="service-listing__card">
              <div className="service-listing__image" aria-hidden="true" />
              <div className="service-listing__body">
                <h3 className="service-listing__title">{service.title}</h3>
                <p className="service-listing__description">{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
