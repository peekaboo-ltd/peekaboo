import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { calculateDistance, calculateDeliveryFee } from '@/utils/distance.util';
import { useCreatePublicOrderMutation } from '@/api/mutations/orders.mutations';
import { useCreatePaymentMutation } from '@/api/mutations/payments.mutations';

import type { OrderFormData } from './types';
import { usePhoneValidation, useFormValidation } from './hooks';
import { Step1PhoneNumbers } from './Step1PhoneNumbers';
import { Step2Locations } from './Step2Locations';
import { Step3Payment } from './Step3Payment';
import { Step4RiderSelection } from './Step4RiderSelection';
import { Step5Confirmation } from './Step5Confirmation';
import { ProgressBar, NavigationButtons } from './FormComponents';

export const MultiStepOrderForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createPublicOrder] = useCreatePublicOrderMutation();
  const [createPayment] = useCreatePaymentMutation();
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const { validatePhone, formatPhoneNumber } = usePhoneValidation();
  const { validateStep1, validateStep2 } = useFormValidation();

  const [formData, setFormData] = useState<OrderFormData>({
    senderPhone: '',
    recipientPhone: '',
    pickupLocation: null,
    deliveryLocation: null,
    distance: 0,
    initialFee: 1500,
    distanceFee: 0,
    finalFee: 1500,
    selectedRider: null,
  });

  const [paymentPhone, setPaymentPhone] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;

  // Calculate distance when both locations are set
  useEffect(() => {
    if (formData.pickupLocation && formData.deliveryLocation) {
      const distance = calculateDistance(
        formData.pickupLocation.lat,
        formData.pickupLocation.lng,
        formData.deliveryLocation.lat,
        formData.deliveryLocation.lng
      );
      const fees = calculateDeliveryFee(distance);
      setFormData(prev => ({
        ...prev,
        distance,
        distanceFee: fees.distanceFee,
        finalFee: fees.finalFee,
      }));
    }
  }, [formData.pickupLocation, formData.deliveryLocation]);

  const createOrderBeforePayment = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const result: any = await createPublicOrder({
        senderPhoneNumber: formatPhoneNumber(formData.senderPhone),
        recipientPhoneNumber: formatPhoneNumber(formData.recipientPhone),
        pickupLocation: formData.pickupLocation!,
        deliveryLocation: formData.deliveryLocation!,
        distance: formData.distance,
        finalFee: formData.finalFee,
      }).unwrap();

      if (result?.data?.id) {
        setCreatedOrderId(result.data.id);
        setCurrentStep(3);
        toast.success('Order details saved! Please proceed with payment.');
      } else {
        toast.error('Failed to create order. Please try again.');
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to save order. Please try again.';

      // Handle specific backend error fields
      if (error?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(error.data.errors).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setErrors(backendErrors);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!createdOrderId) {
      toast.error('Order ID not found. Please go back and try again.');
      return;
    }

    const phoneToUse = paymentPhone || formData.senderPhone;
    if (!validatePhone(phoneToUse)) {
      setErrors({ paymentPhone: 'Please enter a valid phone number for payment.' });
      toast.error('Please enter a valid phone number for payment.');
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const paymentResult: any = await createPayment({
        entityId: createdOrderId,
        amount: formData.finalFee,
        currency: 'RWF',
        customerPhone: formatPhoneNumber(phoneToUse),
        customerName: formData.senderPhone,
        customerEmail: `${formData.senderPhone}@peekaboo.rw`,
        description: `Payment for order - Pickup: ${formData.pickupLocation?.address}`,
        paymentMethod: 'momo',
      }).unwrap();

      console.log('Payment result:', paymentResult);

      if (paymentResult?.data || paymentResult?.paymentUrl || paymentResult?.transactionId || paymentResult) {
        toast.success('Payment initiated! Check your phone for PIN authorization.');
        setCurrentStep(4);
      } else {
        toast.error('Unexpected payment response. Please contact support.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Payment failed. Please try again.';

      // Handle specific backend error fields
      if (error?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(error.data.errors).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setErrors(backendErrors);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const result: any = await createPublicOrder({
        senderPhoneNumber: formatPhoneNumber(formData.senderPhone),
        recipientPhoneNumber: formatPhoneNumber(formData.recipientPhone),
        pickupLocation: formData.pickupLocation!,
        deliveryLocation: formData.deliveryLocation!,
        distance: formData.distance,
        finalFee: formData.finalFee,
        riderId: formData.selectedRider || undefined,
      }).unwrap();

      toast.success('Order placed successfully! Check WhatsApp for confirmation.');

      if (result?.data?.id) {
        navigate(`/p/orders/${result.data.id}`);
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to place order. Please try again.';

      // Handle specific backend error fields
      if (error?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(error.data.errors).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setErrors(backendErrors);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const newErrors = validateStep1(formData);
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    }

    if (currentStep === 2) {
      const newErrors = validateStep2(formData);
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
      await createOrderBeforePayment();
      return;
    }

    if (currentStep === 3) {
      await handlePayment();
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (currentStep === 3 && createdOrderId) {
      toast.warning('Cannot go back after order is created. Please complete payment.');
      return;
    }
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 max-w-lg w-full">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <Step1PhoneNumbers formData={formData} setFormData={setFormData} errors={errors} />
        )}

        {currentStep === 2 && (
          <Step2Locations formData={formData} setFormData={setFormData} errors={errors} />
        )}

        {currentStep === 3 && (
          <Step3Payment
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            paymentPhone={paymentPhone}
            setPaymentPhone={setPaymentPhone}
          />
        )}

        {currentStep === 4 && (
          <Step4RiderSelection formData={formData} setFormData={setFormData} errors={errors} />
        )}

        {currentStep === 5 && (
          <Step5Confirmation formData={formData} setFormData={setFormData} errors={errors} />
        )}
      </AnimatePresence>

      <NavigationButtons
        currentStep={currentStep}
        totalSteps={totalSteps}
        isLoading={isLoading}
        onBack={handleBack}
        onNext={currentStep === totalSteps ? handleSubmit : handleNext}
      />
    </div>
  );
};
