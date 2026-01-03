import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faPhone,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-12">
      <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <article>
            <h3 className="text-xl font-bold text-white mb-4">Peekaboo</h3>
            <p className="text-sm leading-relaxed">
              Fast and reliable package delivery services in Kigali. Connecting
              senders with trusted riders.
            </p>
          </article>

          <nav>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/auth/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="hover:text-white transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </nav>

          <nav>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Same-Day Delivery</li>
              <li>Express Delivery</li>
              <li>Business Solutions</li>
              <li>Courier Services</li>
            </ul>
          </nav>

          <address className="not-italic">
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-primary-400" />
                Niboye, Kicukiro, Kigali, Rwanda
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="text-primary-400" />
                +250 788 XXX XXX
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-primary-400" />
                info@peekaboo.co.rw
              </li>
            </ul>
          </address>
        </section>

        <hr className="border-gray-700 mb-8" />

        <section className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Peekaboo Ltd. All rights reserved.</p>
          <p>Registered in Rwanda</p>
        </section>
      </article>
    </footer>
  );
};

export default Footer;

