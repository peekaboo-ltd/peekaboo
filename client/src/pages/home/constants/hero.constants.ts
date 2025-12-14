import { MapPin, Clock, Shield, Package } from 'lucide-react';

export const stats = [
  {
    icon: MapPin,
    label: 'Active Riders',
    value: '200+',
    color: 'text-blue-600',
  },
  {
    icon: Clock,
    label: 'Avg Delivery',
    value: '30 min',
    color: 'text-green-600',
  },
  {
    icon: Shield,
    label: 'Secure Payment',
    value: '100%',
    color: 'text-purple-600',
  },
  {
    icon: Package,
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
