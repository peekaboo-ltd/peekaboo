import { motion } from 'framer-motion';
import type { StepProps } from './types';

export const Step4RiderSelection = ({ formData }: StepProps) => {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">Choose a Rider</h3>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Available riders near your pickup location:</p>
        {/* TODO: Fetch and display available riders */}
        
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">Loading available riders...</p>
        </div>
      </div>
    </motion.div>
  );
};
