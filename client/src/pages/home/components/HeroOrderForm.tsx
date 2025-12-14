import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Phone, Loader2, ArrowRight, MapPin } from 'lucide-react';
import { useCreatePublicOrderMutation } from '@/api/mutations/orders.mutations';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { orderFormContent, formValidation, phoneFormatter } from '../constants/orderForm.constants';

export const HeroOrderForm = () => {
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
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error(error?.data?.message || 'Failed to create order. Please try again.');
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
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 max-w-md w-full">
      {/* Form Header */}
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full font-medium text-sm mb-3">
          {orderFormContent.badge}
        </span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {orderFormContent.title}
        </h3>
        <p className="text-sm text-gray-600">
          Quick booking in 30 seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sender Phone */}
        <div>
          <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-900 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            {orderFormContent.senderLabel}
          </label>
          <input
            id="senderPhone"
            type="tel"
            placeholder={orderFormContent.senderPlaceholder}
            value={formData.senderPhone}
            onChange={(e) => handleInputChange('senderPhone', e.target.value)}
            className={`w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${errors.senderPhone ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          <AnimatePresence>
            {errors.senderPhone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.senderPhone}
              </p>
            )}
          </AnimatePresence>
        </div>

        {/* Receiver Phone */}
        <div>
          <label htmlFor="receiverPhone" className="block text-sm font-medium text-gray-900 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            {orderFormContent.receiverLabel}
          </label>
          <input
            id="receiverPhone"
            type="tel"
            placeholder={orderFormContent.receiverPlaceholder}
            value={formData.receiverPhone}
            onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
            className={`w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${errors.receiverPhone ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          <AnimatePresence>
            {errors.receiverPhone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.receiverPhone}
              </p>
            )}
          </AnimatePresence>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="text-blue-800">
              <p className="font-semibold text-sm mb-1">{orderFormContent.infoTitle}</p>
              <p className="text-xs">
                We'll send you a WhatsApp message with next steps.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {orderFormContent.loadingText}
            </>
          ) : (
            <>
              {orderFormContent.submitText}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {orderFormContent.trustBadges.slice(0, 4).map((badge, index) => (
          <div
            key={index}
            className="text-center bg-gray-50 rounded-lg p-2 text-xs font-medium text-gray-600"
          >
            {badge.text}
          </div>
        ))}
      </div>
    </div>
  );
};