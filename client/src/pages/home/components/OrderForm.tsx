import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Loader2, ArrowRight } from 'lucide-react';
import { useCreatePublicOrderMutation } from '@/api/mutations/orders.mutations';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { orderFormContent, formValidation, cssClasses, phoneFormatter } from '../constants/orderForm.constants';

export const OrderForm = () => {
  const navigate = useNavigate();
  const [createPublicOrder, { isLoading }] = useCreatePublicOrderMutation();

  const [formData, setFormData] = useState({
    senderPhone: '',
    receiverPhone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.senderPhone) {
      newErrors.senderPhone = formValidation.errorMessages.senderRequired;
    } else if (!phoneFormatter.validatePhone(formData.senderPhone)) {
      newErrors.senderPhone = formValidation.errorMessages.invalidFormat;
    }

    if (!formData.receiverPhone) {
      newErrors.receiverPhone = formValidation.errorMessages.receiverRequired;
    } else if (!phoneFormatter.validatePhone(formData.receiverPhone)) {
      newErrors.receiverPhone = formValidation.errorMessages.invalidFormat;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const result = await createPublicOrder({
        senderPhoneNumber: phoneFormatter.formatPhoneNumber(formData.senderPhone),
        recipientPhoneNumber: phoneFormatter.formatPhoneNumber(formData.receiverPhone),
      }).unwrap();

      toast.success('Order created successfully! Redirecting to tracking...');

      // Redirect to public order tracking page
      setTimeout(() => {
        navigate(`/p/orders/${result.data.id}`);
      }, 1500);
    } catch (error: unknown) {
      console.error('Order creation error:', error);
      toast.error((error as Error).message || 'Failed to create order. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <section id="order-form" className="py-20 bg-gray-50">
      {/* Simplified background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Professional Badge */}
        <div className="text-center mb-8">
          <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full font-medium text-sm">
            {orderFormContent.badge}
          </span>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {orderFormContent.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {orderFormContent.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {orderFormContent.trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center justify-center bg-gray-50 rounded-lg p-3 text-sm font-medium text-gray-700"
              >
                <span className="text-center">{badge.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Phone */}
            <div>
              <label htmlFor="senderPhone" className={cssClasses.label}>
                <Phone className="inline w-4 h-4 mr-2" />
                {orderFormContent.senderLabel}
              </label>
              <input
                id="senderPhone"
                type="tel"
                placeholder={orderFormContent.senderPlaceholder}
                value={formData.senderPhone}
                onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                className={`${cssClasses.input} ${errors.senderPhone ? cssClasses.errorInput : ''}`}
                disabled={isLoading}
              />
              <AnimatePresence>
                {errors.senderPhone && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.senderPhone}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Receiver Phone */}
            <div>
              <label htmlFor="receiverPhone" className={cssClasses.label}>
                <Phone className="inline w-4 h-4 mr-2" />
                {orderFormContent.receiverLabel}
              </label>
              <input
                id="receiverPhone"
                type="tel"
                placeholder={orderFormContent.receiverPlaceholder}
                value={formData.receiverPhone}
                onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                className={`${cssClasses.input} ${errors.receiverPhone ? cssClasses.errorInput : ''}`}
                disabled={isLoading}
              />
              <AnimatePresence>
                {errors.receiverPhone && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.receiverPhone}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Professional Info Box */}
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="text-blue-800">
                  <p className="font-semibold mb-2">{orderFormContent.infoTitle}</p>
                  <p className="text-sm">
                    {orderFormContent.infoDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {orderFormContent.loadingText}
                </>
              ) : (
                <>
                  {orderFormContent.submitText}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Professional Legal Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 bg-white rounded-lg p-4 shadow-sm">
            {orderFormContent.legalText}{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              {orderFormContent.termsText}
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              {orderFormContent.privacyText}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
