import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import type { StepProps } from './types';

export const Step1PhoneNumbers = ({ formData, setFormData, errors }: StepProps) => {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Details</h3>

      {/* Sender Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          <Phone className="inline w-4 h-4 mr-2" />
          Your Phone Number
        </label>
        <input
          type="tel"
          placeholder="+250 78 123 4567"
          value={formData.senderPhone}
          onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
          className={`w-full px-4 py-3 bg-white text-gray-900 border-2 rounded-lg focus:outline-none focus:border-blue-500 ${
            errors.senderPhone ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.senderPhone && <p className="text-red-500 text-sm mt-1">{errors.senderPhone}</p>}
      </div>

      {/* Recipient Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          <Phone className="inline w-4 h-4 mr-2" />
          Recipient Phone Number
        </label>
        <input
          type="tel"
          placeholder="+250 78 765 4321"
          value={formData.recipientPhone}
          onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
          className={`w-full px-4 py-3 bg-white text-gray-900 border-2 rounded-lg focus:outline-none focus:border-blue-500 ${
            errors.recipientPhone ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.recipientPhone && <p className="text-red-500 text-sm mt-1">{errors.recipientPhone}</p>}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Both you and the recipient will receive login credentials via WhatsApp if you're new users.
        </p>
      </div>
    </motion.div>
  );
};
