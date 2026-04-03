import SiteFooter from '../components/SiteFooter';

const dermatologyServices = [
  { title: 'Moles', description: 'Expert mole assessment, monitoring, and removal with fast onward referral when needed.' },
  { title: 'Vitiligo', description: 'Specialist diagnosis and personalised treatment plans for skin depigmentation.' },
  { title: 'Urticaria', description: 'Allergy-led assessment and management for chronic or acute hives and skin reactions.' },
  { title: 'Excessive Sweating', description: 'Clinical treatments for hyperhidrosis including topical and injectable options.' },
  { title: 'Psoriasis', description: 'Long-term skin condition management with personalised care plans and follow-up.' },
  { title: 'Benign Skin Lesion', description: 'Safe removal of cysts, lipomas, skin tags, and other benign lesions by our clinicians.' },
  { title: 'Infantile Acne', description: 'Gentle, clinician-led care for acne in infants with tailored treatment guidance for parents.' },
  { title: 'Skin Cancer', description: 'Rapid skin cancer screening, diagnosis, and referral pathways with specialist oversight.' },
  { title: 'Skin Itching & its causes', description: 'Comprehensive assessment to identify and treat the root causes of persistent skin itching.' },
  { title: 'Male Genital Skin Disorders', description: 'Discreet, specialist consultation and treatment for dermatological conditions in men.' },
  { title: 'Hair Loss', description: 'Diagnosis and treatment of alopecia and other hair loss conditions with ongoing support.' },
];

export default function Services() {
  return (
    <>
      <section className="page-hero page-hero--navy">
        <div className="container page-hero__inner">
          <h1 className="page-hero__title">Our Services</h1>
          <p className="page-hero__subtitle">
            Explore our specialist services, from dermatology and diagnostics to personalised treatment pathways.
          </p>
        </div>
      </section>

      <section className="service-listing">
        <div className="container service-listing__grid">
          {dermatologyServices.map((service) => (
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
