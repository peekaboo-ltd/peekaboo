import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useCreateOrganizationMutation,
  useUpdateMyOrganizationMutation,
} from '@/api/mutations/organization.mutations';
import { useAppDispatch } from '@/states/hooks';
import { setToken, setUser, setIsAuthenticated } from '@/states/slices/auth.slice';
import { resetOnboarding } from '@/states/slices/onboarding.slice';
import { localStorageUtil } from '@/utils/localStorage.util';
import type { CreateOrganizationPayload, Organization } from '@/types/organization.type';
import { useLazyFetchOrganizationByIdQuery, useLazyFetchOrganizationsQuery } from '@/api/queries/organization.queries';
import { setOrganization, setOrganizationsList } from '@/states/slices/organization.slice';
import { usePagination } from '../common/pagination.hooks';
import { useI18n } from '@/i18n/i18n';

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
  const { t } = useI18n();
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
      toast.success(t('organization.createdSuccess'));

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
        t('organization.genericError');

      toast.error(errorMessage);
      reset();
    }
  }, [isSuccess, isError, data, error, dispatch, navigate, reset, t]);

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

export const useUpdateMyOrganization = () => {
  const { t } = useI18n();
  const [updateMyOrganizationMutation, { data, error, isLoading, isSuccess, reset }] =
    useUpdateMyOrganizationMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success(t('organization.updated'));
      reset();
    }
  }, [isSuccess, reset, t]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        t('organization.updateError');
      toast.error(errorMessage);
    }
  }, [error, t]);

  const updateMyOrganization = (data: Partial<Organization>) => {
    updateMyOrganizationMutation(data);
  };

  return { updateMyOrganization, data, error, isLoading, isSuccess, reset };
};

export const useFetchOrganizations = () => {

  const dispatch = useAppDispatch();

  // PAGINATION
  const {
    page,
    setPage,
    size,
    setSize,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
  } = usePagination();

  const [fetchOrganizations, { data, error, isFetching, isSuccess }] =
    useLazyFetchOrganizationsQuery();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setOrganizationsList(data?.data?.rows));
      setTotalPages(data?.data?.totalPages);
      setTotalCount(data?.data?.totalCount);
    }
  }, [isSuccess, data, dispatch, setTotalPages, setTotalCount]);

  return { fetchOrganizations, data, error, isFetching, isSuccess, page, setPage, size, setSize, totalPages, setTotalPages, totalCount, setTotalCount };
};

export const useFetchOrganizationById = () => {
  const dispatch = useAppDispatch();
  const [fetchOrganizationById, { data, isFetching, isSuccess }] = useLazyFetchOrganizationByIdQuery();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setOrganization(data?.data));
    }
  }, [isSuccess, data, dispatch]);

  return { fetchOrganizationById, data, isFetching, isSuccess };
};
