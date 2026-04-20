import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo/transparent-logo-navbar.svg';
import { gpServices, skinServices, getServicePath } from '../data/services';

const splitMenuItems = (items, columnCount = 2) => {
  const columns = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => columns[index % columnCount].push(item));
  return columns;
};

const gpMenuItems = gpServices.map((service) => ({
  title: service.title,
  href: getServicePath(service.slug),
}));

const serviceMenuItems = skinServices.map((service) => ({
  title: service.title,
  href: getServicePath(service.slug),
}));

const gpColumns = splitMenuItems(gpMenuItems, 2);
const serviceColumns = splitMenuItems(serviceMenuItems, 2);

const megaMenus = {
  'gp-services': {
    headline: 'GP Services',
    featured: { ctaLabel: 'Book a GP appointment', href: '/gp-services' },
    columns: [
      { heading: 'GP Services', items: gpColumns[0] },
      { heading: 'Specialist Clinics', items: gpColumns[1] },
    ],
  },
  services: {
    headline: 'Our Services',
    featured: { ctaLabel: 'View all services', href: '/services' },
    columns: [
      { heading: 'Dermatology', items: serviceColumns[0] },
      { heading: 'Treatments', items: serviceColumns[1] },
    ],
  },
};

const navLinks = [
  { id: 'gp-services', label: 'GP Services', href: '/gp-services', hasDropdown: true },
  { id: 'services', label: 'Services', href: '/services', hasDropdown: true },
  { id: 'our-team', label: 'Our Team', href: '/our-team', hasDropdown: false },
];

const dropdownOrder = ['gp-services', 'services'];

export default function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownMotion, setDropdownMotion] = useState('fade');
  const [mobileExpanded, setMobileExpanded] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const menuCloseTimerRef = useRef(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearMenuCloseTimer();
    };
  }, []);

  // Reset scroll state when navigating away from home
  useEffect(() => {
    if (!isHome) setIsScrolled(true);
  }, [isHome]);

  const clearMenuCloseTimer = () => {
    if (menuCloseTimerRef.current) {
      clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
  };

  // Always collapse open navigation UI after route changes.
  useEffect(() => {
    if (menuCloseTimerRef.current) {
      clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
    setActiveDropdown(null);
    setDropdownMotion('fade');
    setIsNavOpen(false);
    setMobileExpanded({});
  }, [location.pathname]);

  const openDropdown = (menuId) => {
    clearMenuCloseTimer();
    if (activeDropdown && activeDropdown !== menuId) {
      const currentIndex = dropdownOrder.indexOf(activeDropdown);
      const nextIndex = dropdownOrder.indexOf(menuId);
      setDropdownMotion(currentIndex !== -1 && nextIndex !== -1
        ? (nextIndex > currentIndex ? 'slide-right' : 'slide-left')
        : 'fade');
    } else {
      setDropdownMotion('fade');
    }
    setActiveDropdown(menuId);
  };

  const scheduleDropdownClose = () => {
    clearMenuCloseTimer();
    menuCloseTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setDropdownMotion('fade');
    }, 120);
  };

  const closeMobileNav = () => {
    setIsNavOpen(false);
    setMobileExpanded({});
  };

  const handleMobileMenuToggle = () => {
    setIsNavOpen((prev) => {
      if (prev) setMobileExpanded({});
      return !prev;
    });
    setActiveDropdown(null);
  };

  const toggleMobileGroup = (menuId) => {
    setMobileExpanded((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleTriggerKeyDown = (event, menuId) => {
    if (event.key === 'Escape') { setActiveDropdown(null); return; }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openDropdown(menuId);
      setTimeout(() => {
        const el = document.querySelector(`#mega-panel-${menuId} .navbar__mega-item`);
        if (el instanceof HTMLElement) el.focus();
      }, 0);
    }
  };

  const activeMegaMenu = activeDropdown ? megaMenus[activeDropdown] : null;
  const scrolled = !isHome || isScrolled;

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <div className="navbar__left">
          <Link className="navbar__logo" to="/" aria-label="Daventry Private Clinic - Home">
            <img className="logo-image" src={logo} alt="Daventry Private Clinic" />
          </Link>
        </div>

        <nav className="navbar__center" aria-label="Primary">
          {navLinks.map((link) =>
            link.hasDropdown ? (
              <div
                key={link.id}
                className={`navbar__dropdown-trigger ${activeDropdown === link.id ? 'is-active' : ''}`}
                onMouseEnter={() => openDropdown(link.id)}
                onMouseLeave={scheduleDropdownClose}
              >
                <Link
                  className="navbar__link"
                  to={link.href}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === link.id}
                  aria-controls={`mega-panel-${link.id}`}
                  onClick={() => setActiveDropdown(null)}
                  onFocus={() => openDropdown(link.id)}
                  onKeyDown={(e) => handleTriggerKeyDown(e, link.id)}
                >
                  {link.label}
                  <span className="navbar__dropdown-icon" aria-hidden="true">▾</span>
                </Link>
              </div>
            ) : (
              <Link
                key={link.id}
                className="navbar__link"
                to={link.href}
                onFocus={() => setActiveDropdown(null)}
                onClick={closeMobileNav}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="navbar__right">
          <Link className="navbar__cta" to="/contact">
            <span className="navbar__cta-text">Book Consultation</span>
            <span className="navbar__cta-text--short" aria-hidden="true">Book</span>
          </Link>
          <button
            className={`navbar__menu-toggle ${isNavOpen ? 'is-open' : ''}`}
            type="button"
            aria-label={isNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isNavOpen}
            aria-controls="mobile-nav-panel"
            onClick={handleMobileMenuToggle}
          >
            <span className="navbar__menu-toggle-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`navbar__mega-shell ${activeMegaMenu ? 'is-open' : ''}`}
        onMouseEnter={clearMenuCloseTimer}
        onMouseLeave={scheduleDropdownClose}
      >
        {activeMegaMenu && (
          <div
            key={`${activeDropdown}-${dropdownMotion}`}
            id={`mega-panel-${activeDropdown}`}
            className={`navbar__mega-panel container ${dropdownMotion}`}
            role="region"
            aria-label={`${activeMegaMenu.headline} submenu`}
          >
            <Link className="navbar__mega-featured" to={activeMegaMenu.featured.href} aria-label={activeMegaMenu.featured.ctaLabel} onClick={() => setActiveDropdown(null)}>
              <div className="navbar__mega-featured-body">
                <h3 className="navbar__mega-featured-title">{activeMegaMenu.headline}</h3>
                <span className="navbar__mega-featured-arrow" aria-hidden="true">→</span>
              </div>
            </Link>

            <div className="navbar__mega-columns">
              {activeMegaMenu.columns.map((column) => (
                <div key={column.heading} className="navbar__mega-section">
                  <div className="navbar__mega-items">
                    {column.items.map((item) => (
                      <Link key={item.title} className="navbar__mega-item" to={item.href} onClick={() => setActiveDropdown(null)}>
                        <span className="navbar__mega-item-title">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div id="mobile-nav-panel" className={`navbar__mobile-panel container ${isNavOpen ? 'is-open' : ''}`}>
        <nav className="navbar__mobile-links" aria-label="Mobile primary">
          {navLinks.map((link) =>
            link.hasDropdown ? (
              <div key={`mobile-group-${link.id}`} className={`navbar__mobile-group ${mobileExpanded[link.id] ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="navbar__mobile-summary"
                  onClick={() => toggleMobileGroup(link.id)}
                  aria-expanded={Boolean(mobileExpanded[link.id])}
                  aria-controls={`mobile-submenu-${link.id}`}
                >
                  <span>{link.label}</span>
                  <svg className="navbar__mobile-summary-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div id={`mobile-submenu-${link.id}`} className="navbar__mobile-submenu">
                  {megaMenus[link.id].columns.map((column) => (
                    <div key={`mobile-col-${link.id}-${column.heading}`} className="navbar__mobile-submenu-group">
                      <span className="navbar__mobile-submenu-heading">{column.heading}</span>
                      {column.items.map((item) => (
                        <Link key={`mobile-${link.id}-${item.title}`} className="navbar__mobile-submenu-link" to={item.href} onClick={closeMobileNav}>
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={`mobile-${link.id}`} className="navbar__mobile-link" to={link.href} onClick={closeMobileNav}>
                <span>{link.label}</span>
                <svg className="navbar__mobile-link-arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )
          )}
          <Link className="navbar__cta navbar__cta--mobile" to="/contact" onClick={closeMobileNav}>
            Book Consultation
          </Link>
        </nav>
      </div>
    </header>
  );
}
