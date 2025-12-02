export const testimonials = [
  {
    name: 'Marie Uwase',
    location: 'Kigali',
    rating: 5,
    text: 'Fast delivery and great communication. The rider arrived earlier than expected. Highly recommended!',
    avatar: 'M',
  },
  {
    name: 'Pascal Nkurunziza',
    location: 'Huye',
    rating: 5,
    text: 'Easy to use platform and secure payment. The tracking feature is amazing. Will definitely use again!',
    avatar: 'P',
  },
  {
    name: 'Aline Mugwaneza',
    location: 'Rubavu',
    rating: 5,
    text: 'Riders are friendly and professional. Good service and reasonable pricing. Best delivery service!',
    avatar: 'A',
  },
];

export const testimonialsContent = {
  title: 'What Our Customers Say',
  subtitle: 'Join thousands of satisfied customers across Rwanda',
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
    transition: { duration: 0.6 },
  },
};