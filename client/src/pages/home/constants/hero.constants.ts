import { faMapMarkerAlt, faClock, faShieldAlt, faBox } from '@fortawesome/free-solid-svg-icons';

export const stats = [
  {
    icon: faMapMarkerAlt,
    label: 'Active Riders',
    value: '200+',
    color: 'text-blue-600',
  },
  {
    icon: faClock,
    label: 'Avg Delivery',
    value: '30 min',
    color: 'text-green-600',
  },
  {
    icon: faShieldAlt,
    label: 'Secure Payment',
    value: '100%',
    color: 'text-purple-600',
  },
  {
    icon: faBox,
    label: 'Orders Daily',
    value: '500+',
    color: 'text-orange-600',
  },
];

export const heroContent = {
  badge: "Rwanda's #1 Delivery Service",
  title: 'Send Anything, Anywhere in',
  highlightedTitle: 'Rwanda',
  subtitle:
    'Book your delivery in under 30 seconds. Our verified riders will pick up and deliver your items safely across all of Rwanda.',
  primaryButtonText: 'Book Delivery Now',
  secondaryButtonText: 'See How It Works',
  urgencyText: 'Average pickup time: 15 minutes',
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};
