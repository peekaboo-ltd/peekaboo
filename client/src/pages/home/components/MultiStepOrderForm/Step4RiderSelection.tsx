import { motion } from 'framer-motion';
import { useFetchAvailableRidersQuery, type AvailableRider } from '@/api/queries/orderAssignments.queries';
import { useCreateOrderAssignmentMutation } from '@/api/mutations/orderAssignments.mutations';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { StepProps } from './types';
import { calculateDistance } from '@/utils/distance.util';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export const Step4RiderSelection = ({ formData, setFormData, createdOrderId }: StepProps) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [createOrderAssignment] = useCreateOrderAssignmentMutation();

  const { data, isLoading, error } = useFetchAvailableRidersQuery(
    {
      latitude: formData.pickupLocation?.lat || 0,
      longitude: formData.pickupLocation?.lng || 0,
      limit: 5,
    },
    {
      skip: !formData.pickupLocation,
    }
  );

  const availableRiders = data?.data || [];

  const getDistanceLabel = (rider: AvailableRider) => {
    const backendDistance = typeof rider.distance === 'number' ? rider.distance : null;
    const fallbackDistance =
      rider.location && formData.pickupLocation
        ? calculateDistance(
            formData.pickupLocation.lat,
            formData.pickupLocation.lng,
            rider.location.latitude,
            rider.location.longitude
          )
        : null;

    const distance = backendDistance ?? fallbackDistance;

    if (distance !== null && !Number.isNaN(distance)) {
      return `${distance.toFixed(2)} km away`;
    }

    if (rider.location) {
      return rider.isOnline ? 'Online, distance pending' : 'Location pending';
    }

    return 'Location unknown';
  };

  const handleSelectRider = async (riderId: string) => {
    if (!createdOrderId) {
      toast.error('Order ID not found. Please go back and try again.');
      return;
    }

    setIsAssigning(true);
    try {
      await createOrderAssignment({
        orderId: createdOrderId,
        assignedToId: riderId,
      }).unwrap();

      setFormData((prev) => ({ ...prev, selectedRider: riderId }));
      toast.success('Rider assigned successfully!');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to assign rider. Please try again.';
      toast.error(errorMessage);
      console.error('Rider assignment error:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">Choose a Rider</h3>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 text-sm">Failed to load available riders. Please try again.</p>
        </div>
      ) : availableRiders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600 text-sm">No riders available at this time. We'll auto-assign one for you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {availableRiders.length} rider{availableRiders.length > 1 ? 's' : ''} available near your pickup location:
          </p>
          {availableRiders.map((rider) => (
            <div
              key={rider.id}
              onClick={() => !isAssigning && handleSelectRider(rider.id)}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${isAssigning ? 'opacity-50 cursor-not-allowed' : ''}
                ${
                  formData.selectedRider === rider.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{rider.name || 'Rider'}</h4>
                  <p className="text-xs text-gray-600">{rider.phoneNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">
                    {getDistanceLabel(rider)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {rider.activeOrderCount > 0
                      ? `${rider.activeOrderCount} active order${rider.activeOrderCount > 1 ? 's' : ''}`
                      : 'No active orders'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        {formData.selectedRider
          ? 'Your selected rider will be notified once payment is confirmed.'
          : 'Skip this step to auto-assign the nearest available rider.'}
      </p>
    </motion.div>
  );
};
