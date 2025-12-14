import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { footerLinks, socialLinks, contactInfo, companyInfo } from '../constants/footer.constants';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">{companyInfo.name}</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-sm">
              {companyInfo.tagline}
            </p>
            <address className="space-y-2 sm:space-y-3 not-italic">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-primary-500" aria-hidden="true" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-white transition-colors">
                  {contactInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-primary-500" aria-hidden="true" />
                <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-primary-500" aria-hidden="true" />
                <span>{contactInfo.location}</span>
              </div>
            </address>
          </div>
          <nav>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-gray-400">
            © {new Date().getFullYear()} Peekaboo. All rights reserved.
          </p>
          <nav className="flex gap-3 sm:gap-4" aria-label="Social media">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label={social.label}
              >
                <FontAwesomeIcon icon={social.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};
