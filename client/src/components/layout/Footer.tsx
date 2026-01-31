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

interface Service {
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
    <footer className="relative w-full overflow-hidden">
      {/* Sophisticated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#061e29] via-[#0a2a38] to-[#061e29]" />
      
      {/* Subtle geometric pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235f9598' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Accent glow effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />

        <motion.article 
          className="max-w-[1330px] mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {/* Main footer grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            {/* Brand column - wider */}
            <motion.article variants={itemVariants as unknown as Variants} className="lg:col-span-4">
              <div className="mb-6">
                <h3 className="text-2xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
                    Peekaboo
                  </span>
                </h3>
                <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-primary-400 to-transparent rounded-full" />
              </div>
              <p className="text-[15px] leading-relaxed text-primary-100/70 mb-8 max-w-xs">
                {t('footer.description')}
              </p>
              
              {/* Social links with refined styling */}
              <nav className="flex items-center gap-3">
                {socialMedia?.length > 0 && socialMedia?.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-primary-200/80 hover:text-white hover:border-primary-400/50 hover:bg-primary-500/20 transition-all duration-300"
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <FontAwesomeIcon icon={social.icon} className="w-[18px] h-[18px]" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.a>
                ))}
              </nav>
            </motion.article>

            {/* Quick Links */}
            <motion.nav variants={itemVariants as unknown as Variants} className="lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300/80 mb-5">
                {t('footer.quickLinks')}
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-block text-[15px] text-primary-100/60 hover:text-white transition-colors duration-300"
                    >
                      <span className="relative">
                        {t(link.labelKey)}
                        <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-primary-400 group-hover:w-full transition-all duration-300" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>

            {/* Services */}
            <motion.nav variants={itemVariants as unknown as Variants} className="lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300/80 mb-5">
                {t('footer.services')}
              </h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.labelKey}>
                    <Link
                      to={service.to}
                      className="group inline-block text-[15px] text-primary-100/60 hover:text-white transition-colors duration-300"
                    >
                      <span className="relative">
                        {t(service.labelKey)}
                        <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-primary-400 group-hover:w-full transition-all duration-300" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>

            {/* Contact */}
            <motion.address variants={itemVariants as unknown as Variants} className="not-italic lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300/80 mb-5">
                {t('footer.contactUs')}
              </h4>
              <ul className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <li key={index}>
                    {contact.href ? (
                      <a 
                        href={contact.href}
                        className="group flex items-start gap-3 text-[15px] text-primary-100/60 hover:text-white transition-colors duration-300"
                      >
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/20 transition-colors duration-300">
                          <FontAwesomeIcon icon={contact.icon} className="w-3.5 h-3.5" />
                        </span>
                        <span className="pt-1.5">{contact.text}</span>
                      </a>
                    ) : (
                      <div className="flex items-start gap-3 text-[15px] text-primary-100/60">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-400">
                          <FontAwesomeIcon icon={contact.icon} className="w-3.5 h-3.5" />
                        </span>
                        <span className="pt-1.5">{contact.text}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </motion.address>
          </section>

          {/* Bottom bar with refined separator */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <motion.section 
              variants={itemVariants as unknown as Variants}
              className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
            >
              <p className="text-[13px] text-primary-200/50 tracking-wide">
                &copy; {new Date().getFullYear()} Peekaboo. {t('footer.copyright')}
              </p>

              <DropdownMenu>
                <DropdownMenuTrigger className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-200/70 hover:text-white hover:border-primary-400/40 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-primary-400" />
                  <span className="text-[13px] font-medium tracking-wide">{t(currentLanguageLabel)}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-primary-400/60 group-hover:rotate-180 transition-transform duration-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-[#0a2a38]/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden"
                >
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`cursor-pointer text-[13px] tracking-wide px-4 py-2.5 text-primary-100/70 hover:text-white hover:bg-primary-500/20 transition-all duration-200 ${
                        language === lang.code ? 'bg-primary-500/15 text-white' : ''
                      }`}
                    >
                      {t(lang.labelKey)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.section>
          </div>
        </motion.article>
      </div>
    </footer>
  );
};

export default Footer;
