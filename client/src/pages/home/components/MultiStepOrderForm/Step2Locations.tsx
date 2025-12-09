import { motion } from 'framer-motion';
import { GoogleMapsLocationPicker } from '@/components/GoogleMapsLocationPicker';
import type { StepProps } from './types';

export const Step2Locations = ({ formData, setFormData, errors }: StepProps) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">Select Locations</h3>

      {/* Pickup Location */}
      <GoogleMapsLocationPicker
        label="Pickup Location"
        value={formData.pickupLocation}
        onChange={(location) => setFormData({ ...formData, pickupLocation: location })}
        placeholder="Enter pickup address"
        allowCurrentLocation={true}
      />
      {errors.pickupLocation && <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>}

      {/* Delivery Location */}
      <GoogleMapsLocationPicker
        label="Delivery Location"
        value={formData.deliveryLocation}
        onChange={(location) => setFormData({ ...formData, deliveryLocation: location })}
        placeholder="Enter delivery address"
      />
      {errors.deliveryLocation && <p className="text-red-500 text-sm mt-1">{errors.deliveryLocation}</p>}

      {formData.distance > 0 && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Distance:</strong> {formData.distance.toFixed(2)} km
          </p>
          <p className="text-xs text-green-700 mt-1">
            Delivery fee: {formData.initialFee} + ({Math.ceil(formData.distance)} km × 500) = {formData.finalFee} RWF
          </p>
        </div>
      )}
    </motion.div>
  );
};
