import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { StepProps } from './types';

export const Step5Confirmation = ({ formData }: StepProps) => {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Your Order</h3>
        <p className="text-gray-600 text-sm">Review your order details before confirming</p>
      </div>

      <div className="p-4 text-black rounded-lg space-y-2 text-sm">
        <div><strong>Sender:</strong> {formData.senderPhone}</div>
        <div><strong>Recipient:</strong> {formData.recipientPhone}</div>
        <div><strong>Pickup:</strong> {formData.pickupLocation?.address}</div>
        <div><strong>Delivery:</strong> {formData.deliveryLocation?.address}</div>
        <div><strong>Distance:</strong> {formData.distance.toFixed(2)} km</div>
        <div><strong>Total Fee:</strong> {formData.finalFee} RWF</div>
      </div>
    </motion.div>
  );
};
