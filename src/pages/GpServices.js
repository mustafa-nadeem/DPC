import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import { gpServices, getServicePath } from '../data/services';

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
            <Link
              key={service.slug}
              className="service-listing__card"
              to={getServicePath(service.slug)}
              aria-label={`View ${service.title} service page`}
            >
              <div className="service-listing__body">
                <h3 className="service-listing__title">{service.title}</h3>
                <p className="service-listing__description">{service.description}</p>
                <span className="service-listing__link">View service</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
