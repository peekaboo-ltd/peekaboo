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
import { useI18n } from '@/i18n/i18n';
import LanguageSelector from '@/components/inputs/LanguageSelector';
import { motion, Variants } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const Footer = () => {
  const { t } = useI18n();

  const quickLinks = useMemo<QuickLink[]>(
    () => [
      { to: '/about', labelKey: 'footer.aboutUs' },
      { to: '/track', labelKey: 'footer.trackOrder' },
      { to: '/contact', labelKey: 'footer.contactUs' },
      { to: '/services', labelKey: 'footer.services' },
    ],
    []
  );

  const contactInfo = useMemo<ContactInfo[]>(
    () => [
      { icon: faLocationDot, text: 'Niboye, Kicukiro, Kigali, Rwanda' },
      { icon: faPhone, text: '(+250) 794 892 784', href: 'tel:+250794892784' },
      { icon: faEnvelope, text: 'info@peekaboo.co.rw', href: 'mailto:info@peekaboo.co.rw' },
    ],
    []
  );

  const socialMedia = useMemo<SocialMedia[]>(
    () => [
      { icon: faInstagram as IconProp | IconDefinition, url: 'https://www.instagram.com/peekaboo.delivery/', label: 'Instagram' },
      { icon: faWhatsapp as IconProp | IconDefinition, url: 'https://wa.me/250794892784?text=Hello, I have a question about Peekaboo', label: 'WhatsApp' },
      { icon: faTiktok as IconProp | IconDefinition, url: 'https://www.tiktok.com/@peekaboo.delivery', label: 'TikTok' },
    ],
    []
  );

  return (
    <footer className="relative w-full border-t border-primary-100 bg-white">
      <motion.article
        className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-8 pt-14 pb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          <motion.article variants={itemVariants as unknown as Variants} className="lg:col-span-5">
            <header className="mb-5">
              <h3 className="text-2xl font-semibold tracking-tight text-primary-900">
                Peekaboo
              </h3>
              <hr className="mt-2 h-[2px] w-10 bg-secondary-500/60 rounded-full border-0" />
            </header>
            <p className="text-[13px] leading-relaxed text-primary-600 mb-6 max-w-sm">
              {t('footer.description')}
            </p>

            <nav className="flex items-center gap-2.5" aria-label="Social media links">
              {socialMedia?.length > 0 && socialMedia?.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-primary-100 text-primary-500 hover:text-primary-900 hover:border-primary-300 transition-colors"
                >
                  <FontAwesomeIcon icon={social.icon} className="w-[16px] h-[16px]" />
                </a>
              ))}
            </nav>
          </motion.article>

          <motion.nav variants={itemVariants as unknown as Variants} className="lg:col-span-3" aria-label="Quick links">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400 mb-5">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-block text-[13px] text-primary-600 hover:text-primary-900 transition-colors duration-300"
                  >
                    <span className="relative text-[13px]">
                      {t(link.labelKey)}
                      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-secondary-600/70 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.address variants={itemVariants as unknown as Variants} className="not-italic lg:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400 mb-5">
              {t('footer.contactUs')}
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((contact, index) => (
                <li key={index}>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      className="group flex items-start gap-3 text-[13px] text-primary-600 hover:text-primary-900 transition-colors duration-300"
                    >
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 text-primary-500 group-hover:text-primary-700 transition-colors duration-300">
                        <FontAwesomeIcon icon={contact.icon} className="w-3.5 h-3.5" />
                      </span>
                      <span className="pt-1.5 text-[13px]">{contact.text}</span>
                    </a>
                  ) : (
                    <p className="flex items-start gap-3 text-[13px] text-primary-600">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                        <FontAwesomeIcon icon={contact.icon} className="w-3.5 h-3.5" />
                      </span>
                      <span className="pt-1.5 text-[13px]">{contact.text}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </motion.address>
        </section>

        <section className="border-t border-primary-100">
          <motion.section
            variants={itemVariants as unknown as Variants}
            className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6"
          >
            <p className="text-[13px] text-primary-500 tracking-wide">
              &copy; {new Date().getFullYear()} Peekaboo. {t('footer.copyright')}
            </p>

            <LanguageSelector dropdownDirection="up" />
          </motion.section>
        </section>
      </motion.article>
    </footer>
  );
};

export default Footer;
