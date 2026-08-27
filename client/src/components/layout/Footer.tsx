import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTiktok, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core';
import { useI18n } from '@/i18n/i18n';
import LanguageSelector from '@/components/inputs/LanguageSelector';

interface QuickLink {
  to: string;
  labelKey: string;
}

interface ContactInfo {
  icon: IconDefinition;
  text: string;
  href?: string;
}

interface SocialMedia {
  icon: IconProp | IconDefinition;
  url: string;
  label: string;
}

const Footer = () => {
  const { t } = useI18n();
  const quickLinks = useMemo<QuickLink[]>(
    () => [
      { to: '/about', labelKey: 'footer.aboutUs' },
      { to: '/track', labelKey: 'footer.trackOrder' },
      { to: '/contact', labelKey: 'footer.contactUs' },
      { to: '/services', labelKey: 'footer.services' },
    ],
    [],
  );
  const legalLinks = useMemo<QuickLink[]>(
    () => [
      { to: '/legal', labelKey: 'footer.legalOverview' },
      { to: '/legal/terms-and-conditions', labelKey: 'footer.termsAndConditions' },
      { to: '/legal/refund-policy', labelKey: 'footer.refundPolicy' },
      { to: '/legal/cancellation-policy', labelKey: 'footer.cancellationPolicy' },
    ],
    [],
  );
  const contactInfo = useMemo<ContactInfo[]>(
    () => [
      { icon: faLocationDot, text: 'Niboye, Kicukiro, Kigali, Rwanda' },
      { icon: faPhone, text: '(+250) 794 892 784', href: 'tel:+250794892784' },
      { icon: faEnvelope, text: 'info@peekaboo.co.rw', href: 'mailto:info@peekaboo.co.rw' },
    ],
    [],
  );
  const socialMedia = useMemo<SocialMedia[]>(
    () => [
      { icon: faInstagram, url: 'https://www.instagram.com/peekaboo.delivery/', label: 'Instagram' },
      { icon: faWhatsapp, url: 'https://wa.me/250794892784?text=Hello, I have a question about Peekaboo', label: 'WhatsApp' },
      { icon: faTiktok, url: 'https://www.tiktok.com/@peekaboo.delivery', label: 'TikTok' },
    ],
    [],
  );

  const renderLinks = (links: QuickLink[]) => (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className="link-sweep text-sm text-(--muted) hover:text-(--ink)">
            {t(link.labelKey)}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="invert-surface border-t border-(--line)">
      <div className="app-container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <section className="lg:col-span-5">
            <h2 className="text-2xl font-medium">Peekaboo</h2>
            <p className="mt-4 max-w-[46ch] text-sm leading-[1.6] text-(--muted)">
              {t('footer.description')}
            </p>
            <nav className="mt-6 flex items-center gap-2" aria-label="Social media links">
              {socialMedia.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-(--radius-control) border border-(--line) transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:border-(--ink) active:shadow-[var(--press-on-ink)_999px_999px_0_inset]"
                >
                  <FontAwesomeIcon icon={social.icon} className="size-4" />
                </a>
              ))}
            </nav>
          </section>

          <nav className="lg:col-span-3" aria-label="Footer links">
            <h3 className="mb-4 text-xs font-medium text-(--muted)">{t('footer.quickLinks')}</h3>
            {renderLinks(quickLinks)}
            <h3 className="mb-4 mt-8 text-xs font-medium text-(--muted)">{t('footer.legal')}</h3>
            {renderLinks(legalLinks)}
          </nav>

          <address className="not-italic lg:col-span-4">
            <h3 className="mb-4 text-xs font-medium text-(--muted)">{t('footer.contactUs')}</h3>
            <ul className="space-y-4">
              {contactInfo.map((contact) => (
                <li key={contact.text}>
                  {contact.href ? (
                    <a href={contact.href} className="link-sweep flex items-center gap-3 text-sm text-(--muted) hover:text-(--ink)">
                      <FontAwesomeIcon icon={contact.icon} className="size-4" />
                      {contact.text}
                    </a>
                  ) : (
                    <p className="flex items-center gap-3 text-sm text-(--muted)">
                      <FontAwesomeIcon icon={contact.icon} className="size-4" />
                      {contact.text}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </address>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-(--line) pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-(--muted)">
            &copy; {new Date().getFullYear()} Peekaboo. {t('footer.copyright')}
          </p>
          <LanguageSelector dropdownDirection="up" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
