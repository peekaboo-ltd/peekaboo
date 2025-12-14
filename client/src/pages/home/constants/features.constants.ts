import { faGlobe, faShieldAlt, faUsers, faBolt, faClock, faAward } from '@fortawesome/free-solid-svg-icons';

export const features = [
  {
    icon: faGlobe,
    title: 'Nationwide Coverage',
    description: 'Deliver anywhere in Rwanda with our extensive network of verified riders',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: faShieldAlt,
    title: 'Secure Payment',
    description: 'Multiple payment options with bank-grade security and encryption',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: faUsers,
    title: 'Verified Riders',
    description: 'All riders are background-checked and professionally trained',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: faBolt,
    title: 'Fast Delivery',
    description: 'Average delivery time of 30 minutes within the city',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: faClock,
    title: 'Real-Time Tracking',
    description: 'Track your order from pickup to delivery with live updates',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: faAward,
    title: '24/7 Support',
    description: 'Our support team is always ready to help you',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export const featuresContent = {
  title: 'Why Choose Peekaboo?',
  subtitle: 'We combine speed, security, and reliability to give you the best delivery experience',
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};