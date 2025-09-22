import { useCreateOrderAssignmentMutation } from '@/api/mutations/orderAssignments.mutations';
import { useEffect } from 'react';

export const useCreateOrderAssignment = () => {
  const [createOrderAssignment, { data, error, isLoading, isSuccess, reset }] =
    useCreateOrderAssignmentMutation();

  useEffect(() => {
    if (isSuccess) {
      reset();
    }
  }, [isSuccess, reset]);

  return { createOrderAssignment, data, error, isLoading, isSuccess, reset };
};
