import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faPhone,
  faEnvelope,
  faGlobe,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import {
  faInstagram,
  faTiktok,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core';
import { useI18n, type Language } from '@/i18n/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuickLink {
  to: string;
  labelKey: string;
}

interface Service {
  to: string;
  labelKey: string;
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

const LANGUAGES: { code: Language; labelKey: string }[] = [
  { code: 'en', labelKey: 'home.language.en' },
  { code: 'fr', labelKey: 'home.language.fr' },
  { code: 'rw', labelKey: 'home.language.rw' },
];

const Footer = () => {
  const { t, language, setLanguage } = useI18n();

  const quickLinks = useMemo<QuickLink[]>(
    () => [
      { to: '/about', labelKey: 'footer.aboutUs' },
      { to: '/auth/login', labelKey: 'footer.signIn' },
      { to: '/track', labelKey: 'footer.trackOrder' },
    ],
    []
  );

  const services = useMemo<Service[]>(
    () => [
      { to: '#', labelKey: 'footer.sameDayDelivery' },
      { to: '#', labelKey: 'footer.expressDelivery' },
      { to: '#', labelKey: 'footer.businessSolutions' },
      { to: '#', labelKey: 'footer.courierServices' },
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

  const currentLanguageLabel = LANGUAGES.find((l) => l.code === language)?.labelKey || 'home.language.en';

  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-12">
      <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <article>
            <h3 className="text-xl font-bold text-white mb-4">Peekaboo</h3>
            <p className="text-sm leading-relaxed mb-4">
              {t('footer.description')}
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
            <h4 className="font-semibold text-white mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-white transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h4 className="font-semibold text-white mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.labelKey}>
                  <Link
                    to={service.to}
                    className="hover:text-white transition-colors"
                  >
                    {t(service.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic">
            <h4 className="font-semibold text-white mb-4">{t('footer.contactUs')}</h4>
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
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
              <span>{t(currentLanguageLabel)}</span>
              <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`cursor-pointer text-gray-300 hover:text-white hover:bg-gray-700 ${
                    language === lang.code ? 'bg-gray-700 text-white' : ''
                  }`}
                >
                  {t(lang.labelKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      </article>
    </footer>
  );
};

export default Footer;
