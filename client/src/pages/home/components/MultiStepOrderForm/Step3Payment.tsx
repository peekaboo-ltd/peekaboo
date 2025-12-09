import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import type { StepProps } from './types';

export const Step3Payment = ({ formData, paymentPhone, setPaymentPhone }: StepProps) => {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h3>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Initial Fee:</span>
          <span className="font-semibold">{formData.initialFee} RWF</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Distance ({formData.distance.toFixed(2)} km × 500 RWF):</span>
          <span className="font-semibold">{formData.distanceFee} RWF</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg">
          <span className="font-bold">Total:</span>
          <span className="font-bold text-blue-600">{formData.finalFee} RWF</span>
        </div>
      </div>

      {/* Payment Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          <Phone className="inline w-4 h-4 mr-2" />
          Payment Phone Number (Mobile Money)
        </label>
        <input
          type="tel"
          placeholder={formData.senderPhone || "+250 78 123 4567"}
          value={paymentPhone || ''}
          onChange={(e) => setPaymentPhone?.(e.target.value)}
          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to use sender's phone: {formData.senderPhone}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-xs text-blue-800">
          You'll receive a prompt on your phone to authorize the payment with your Mobile Money PIN.
        </p>
      </div>
    </motion.div>
  );
};
