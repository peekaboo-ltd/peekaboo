export const orderFormContent = {
  badge: 'Start Your Delivery Now',
  title: 'Book Your Delivery',
  subtitle: 'Enter your contact details below to get started. We\'ll guide you through the rest via WhatsApp.',
  senderLabel: 'Your Phone Number',
  receiverLabel: 'Recipient Phone Number',
  senderPlaceholder: '+250 78 123 4567',
  receiverPlaceholder: '+250 78 765 4321',
  submitText: 'Create Order',
  loadingText: 'Creating Your Order...',
  infoTitle: 'What happens next?',
  infoDescription: 'We\'ll send you a WhatsApp message to collect pickup and delivery details. You can track everything in real-time and pay securely.',
  legalText: 'By placing an order, you agree to our',
  termsText: 'Terms of Service',
  privacyText: 'Privacy Policy',
  trustBadges: [
    { text: 'Secure & Encrypted' },
    { text: 'Instant Booking' },
    { text: 'WhatsApp Integration' },
    { text: 'Real-time Tracking' },
  ],
};

export const formValidation = {
  phoneRegex: /^(\+?250|0)?[7][0-9]{8}$/,
  errorMessages: {
    senderRequired: 'Sender phone is required',
    receiverRequired: 'Receiver phone is required',
    invalidFormat: 'Invalid phone number format',
  },
};

export const cssClasses = {
  input: 'w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  errorInput: 'border-red-500',
};

export const phoneFormatter = {
  formatPhoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('+250')) return cleaned;
    if (cleaned.startsWith('250')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+25${cleaned}`;
    return `+250${cleaned}`;
  },
  validatePhone: (phone: string): boolean => {
    return formValidation.phoneRegex.test(phone.replace(/\s/g, ''));
  },
};