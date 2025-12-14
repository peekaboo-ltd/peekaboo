import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

export const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press Kit', href: '/press' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Safety', href: '/safety' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

export const socialLinks = [
  { icon: faFacebookF, href: 'https://facebook.com', label: 'Facebook' },
  { icon: faTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: faInstagram, href: 'https://instagram.com', label: 'Instagram' },
];

export const contactInfo = {
  email: 'support@peekaboo.rw',
  phone: '+250 788 123 456',
  location: 'Kigali, Rwanda',
};

export const companyInfo = {
  name: 'Peekaboo',
  tagline: 'Fast, reliable delivery across Rwanda. Send anything, anywhere, anytime with our trusted network of riders.',
};