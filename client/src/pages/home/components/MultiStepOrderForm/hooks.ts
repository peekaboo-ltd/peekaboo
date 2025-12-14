import { useCallback } from 'react';
import type { OrderFormData } from './types';

export const usePhoneValidation = () => {
  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^(\+?250|0)?[7][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }, []);

  const formatPhoneNumber = useCallback((phone: string): string => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('+250')) return cleaned;
    if (cleaned.startsWith('250')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+25${cleaned}`;
    return `+250${cleaned}`;
  }, []);

  return { validatePhone, formatPhoneNumber };
};

export const useFormValidation = () => {
  const { validatePhone } = usePhoneValidation();

  const validateStep1 = useCallback(
    (formData: OrderFormData): Record<string, string> => {
      const newErrors: Record<string, string> = {};

      if (!formData.senderPhone) {
        newErrors.senderPhone = 'Your phone number is required';
      } else if (!validatePhone(formData.senderPhone)) {
        newErrors.senderPhone = 'Invalid phone number format';
      }

      if (!formData.recipientPhone) {
        newErrors.recipientPhone = 'Recipient phone number is required';
      } else if (!validatePhone(formData.recipientPhone)) {
        newErrors.recipientPhone = 'Invalid phone number format';
      }

      if (formData.senderPhone === formData.recipientPhone) {
        newErrors.recipientPhone = 'Sender and recipient cannot be the same';
      }

      return newErrors;
    },
    [validatePhone]
  );

  const validateStep2 = useCallback((formData: OrderFormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickupLocation) {
      newErrors.pickupLocation = 'Please select pickup location';
    }

    if (!formData.deliveryLocation) {
      newErrors.deliveryLocation = 'Please select delivery location';
    }

    return newErrors;
  }, []);

  return { validateStep1, validateStep2, validatePhone };
};
