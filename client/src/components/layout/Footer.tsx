import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faPhone,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import {
  faInstagram,
  faTiktok,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core';

interface QuickLink {
  to: string;
  label: string;
}

interface Service {
  to: string;
  label: string;
}

interface ContactInfo {
  icon: IconDefinition;
  text: string;
}

interface SocialMedia {
  icon: IconProp | IconDefinition;
  url: string;
  label: string;
}

const Footer = () => {
  // Memoized arrays
  const quickLinks = useMemo<QuickLink[]>(
    () => [
      { to: '/about', label: 'About Us' },
      { to: '/auth/login', label: 'Sign In' },
      { to: '/auth/register', label: 'Register' },
    ],
    []
  );

  const services = useMemo<Service[]>(
    () => [
      { to: '#', label: 'Same-Day Delivery' },
      { to: '#', label: 'Express Delivery' },
      { to: '#', label: 'Business Solutions' },
      { to: '#', label: 'Courier Services' },
    ],
    []
  );

  const contactInfo = useMemo<ContactInfo[]>(
    () => [
      { icon: faLocationDot, text: 'Niboye, Kicukiro, Kigali, Rwanda' },
      { icon: faPhone, text: '(+250) 788 478 652' },
      { icon: faEnvelope, text: 'info@peekaboo.co.rw' },
    ],
    []
  );

  const socialMedia = useMemo<SocialMedia[]>(
    () => [
      { icon: faInstagram as IconProp | IconDefinition, url: 'https://www.instagram.com/peekaboo.delivery/', label: 'Instagram' },
      { icon: faWhatsapp as IconProp | IconDefinition, url: 'https://wa.me/250788478652?text=Hello, I have a question about Peekaboo', label: 'WhatsApp' },
      { icon: faTiktok as IconProp | IconDefinition, url: 'https://www.tiktok.com/@peekaboo.delivery', label: 'TikTok' },
    ],
    []
  );

  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-12">
      <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <article>
            <h3 className="text-xl font-bold text-white mb-4">Peekaboo</h3>
            <p className="text-sm leading-relaxed mb-4">
              Fast and reliable package delivery services in Kigali. Connecting
              senders with trusted riders.
            </p>
            <nav className="flex items-center gap-4">
              {socialMedia?.length > 0 && socialMedia?.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <FontAwesomeIcon icon={social.icon} className="w-5 h-5" />
                </a>
              ))}
            </nav>
          </article>

          <nav>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.label}>
                  <Link
                    to={service.to}
                    className="hover:text-white transition-colors"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic">
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              {contactInfo.map((contact, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={contact.icon}
                    className="text-primary-400"
                  />
                  {contact.text}
                </li>
              ))}
            </ul>
          </address>
        </section>

        <hr className="border-gray-700 mb-6" />

        <section className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Peekaboo Ltd. All rights reserved.</p>
        </section>
      </article>
    </footer>
  );
};

export default Footer;
