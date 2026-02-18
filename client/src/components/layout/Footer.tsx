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

const LANGUAGES: { code: Language; labelKey: string }[] = [
  { code: 'en', labelKey: 'home.language.en' },
  { code: 'fr', labelKey: 'home.language.fr' },
  { code: 'rw', labelKey: 'home.language.rw' },
];

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
  const { t, language, setLanguage } = useI18n();

  const quickLinks = useMemo<QuickLink[]>(
    () => [
      { to: '/about', labelKey: 'footer.aboutUs' },
      { to: '/auth/login', labelKey: 'footer.signIn' },
      { to: '/track', labelKey: 'footer.trackOrder' },
      { to: '/contact', labelKey: 'footer.contactUs' },
    ],
    []
  );

  const contactInfo = useMemo<ContactInfo[]>(
    () => [
      { icon: faLocationDot, text: 'Niboye, Kicukiro, Kigali, Rwanda' },
      { icon: faPhone, text: '(+250) 788 478 652', href: 'tel:+250788478652' },
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

  const currentLanguageLabel = LANGUAGES.find((l) => l.code === language)?.labelKey || 'home.language.en';

  return (
    <footer className="relative w-full border-t border-slate-200 bg-white">
      <motion.article
        className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 pt-14 pb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
            <motion.article variants={itemVariants as unknown as Variants} className="lg:col-span-5">
              <header className="mb-5">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Peekaboo
                </h3>
                <hr className="mt-2 h-[2px] w-10 bg-primary-500/60 rounded-full" />
              </header>
              <p className="text-[14px] leading-relaxed text-slate-600 mb-6 max-w-sm">
                {t('footer.description')}
              </p>

              <nav className="flex items-center gap-2.5">
                {socialMedia?.length > 0 && socialMedia?.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
                  >
                    <FontAwesomeIcon icon={social.icon} className="w-[16px] h-[16px]" />
                  </a>
                ))}
              </nav>
            </motion.article>

            {/* Quick Links */}
            <motion.nav variants={itemVariants as unknown as Variants} className="lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-5">
                {t('footer.quickLinks')}
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-block text-[13px] text-slate-600 hover:text-slate-900 transition-colors duration-300"
                    >
                      <span className="relative text-[13px]">
                        {t(link.labelKey)}
                        <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-slate-900/70 group-hover:w-full transition-all duration-300" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>

            {/* Contact */}
            <motion.address variants={itemVariants as unknown as Variants} className="not-italic lg:col-span-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-5">
                {t('footer.contactUs')}
              </h4>
              <ul className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <li key={index}>
                    {contact.href ? (
                      <a 
                        href={contact.href}
                        className="group flex items-start gap-3 text-[13px] text-slate-600 hover:text-slate-900 transition-colors duration-300"
                      >
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:text-slate-700 transition-colors duration-300">
                          <FontAwesomeIcon icon={contact.icon} className="w-3.5 h-3.5" />
                        </span>
                        <span className="pt-1.5 text-[13px]">{contact.text}</span>
                      </a>
                    ) : (
                      <p className="flex items-start gap-3 text-[13px] text-slate-600">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500">
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

          <section className="border-t border-slate-200">
            <motion.section
              variants={itemVariants as unknown as Variants}
              className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6"
            >
              <p className="text-[13px] text-slate-500 tracking-wide">
                &copy; {new Date().getFullYear()} Peekaboo. {t('footer.copyright')}
              </p>

              <DropdownMenu>
                <DropdownMenuTrigger className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-slate-400" />
                  <span className="text-[12px] font-medium tracking-wide">{t(currentLanguageLabel)}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-slate-400/80 group-hover:rotate-180 transition-transform duration-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                >
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`cursor-pointer !text-[12px] ring-0 hover:ring-0 tracking-wide px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 ${
                        language === lang.code ? 'bg-slate-100 text-slate-900' : ''
                      }`}
                    >
                      {t(lang.labelKey)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.section>
          </section>
        </motion.article>
    </footer>
  );
};

export default Footer;
