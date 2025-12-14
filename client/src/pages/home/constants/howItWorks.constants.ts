import { faMapMarkerAlt, faDollarSign, faTruck, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export const steps = [
  {
    icon: faMapMarkerAlt,
    title: 'Enter Locations',
    description: 'Provide pickup and drop-off addresses with contact numbers',
    color: 'bg-blue-500',
    delay: 0,
  },
  {
    icon: faDollarSign,
    title: 'Choose Rider',
    description: 'Select from available riders based on ETA and ratings',
    color: 'bg-green-500',
    delay: 0.1,
  },
  {
    icon: faTruck,
    title: 'Pay Securely',
    description: 'Complete payment before rider starts delivery',
    color: 'bg-purple-500',
    delay: 0.2,
  },
  {
    icon: faCheckCircle,
    title: 'Track Delivery',
    description: 'Follow your order in real-time until delivery',
    color: 'bg-orange-500',
    delay: 0.3,
  },
];

export const howItWorksContent = {
  title: 'How It Works',
  subtitle: 'Simple, secure, and fast — four easy steps to send anything across Rwanda',
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as unknown as any },
  },
};