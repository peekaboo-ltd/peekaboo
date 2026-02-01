import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateOrganizationMutation } from '@/api/mutations/organization.mutations';
import { useAppDispatch } from '@/states/hooks';
import { setToken, setUser, setIsAuthenticated } from '@/states/slices/auth.slice';
import { resetOnboarding } from '@/states/slices/onboarding.slice';
import { localStorageUtil } from '@/utils/localStorage.util';
import type { CreateOrganizationPayload } from '@/types/organization.type';

/**
 * Hook for creating an organization (B2B registration)
 * Handles the API call, auth state management, and navigation
 *
 * @returns {Object} - Create organization hook
 * @property {Function} createOrganization - Function to create organization
 * @property {Object} data - Response data
 * @property {Object} error - Error object
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isSuccess - Success state
 * @property {Function} reset - Reset mutation state
 */
export const useCreateOrganization = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [
    createOrganizationMutation,
    { data, error, isLoading, isSuccess, reset, isError },
  ] = useCreateOrganizationMutation();

  useEffect(() => {
    if (isSuccess && data) {
      // Store auth data in localStorage
      localStorageUtil.setItem('token', data.data.auth.token);
      localStorageUtil.setItem('user', data.data.auth.user);

      // Update Redux auth state
      dispatch(setToken(data.data.auth.token));
      dispatch(setUser(data.data.auth.user));
      dispatch(setIsAuthenticated(true));

      // Clear onboarding state
      dispatch(resetOnboarding());

      // Show success toast
      toast.success('Organization created successfully!');

      // Reset mutation state and navigate to dashboard
      reset();
      navigate('/dashboard');
    } else if (isError) {
      // Extract error message from RTK Query error structure
      const errorMessage =
        (error &&
          'data' in error &&
          (error as { data: { message: string } }).data?.message) ||
        (error &&
          'message' in error &&
          (error as { message: string }).message) ||
        'Something went wrong. Please try again.';

      toast.error(errorMessage);
      reset();
    }
  }, [isSuccess, isError, data, error, dispatch, navigate, reset]);

  const createOrganization = (payload: CreateOrganizationPayload) => {
    createOrganizationMutation(payload);
  };

  return {
    createOrganization,
    data,
    error,
    isLoading,
    isSuccess,
    reset,
  };
};
