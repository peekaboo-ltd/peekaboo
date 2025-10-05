import {
  useLoginMutation,
  useRegisterMutation,
} from '@/api/mutations/auth.mutations';
import { localStorageUtil } from '@/utils/localStorage.util';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 *
 * @returns {Object} - Login hook
 * @property {Function} login - Login function
 * @property {Object} data - Login data
 * @property {Object} error - Login error
 * @property {boolean} isLoading - Login loading state
 * @property {boolean} isSuccess - Login success state
 * @property {Function} reset - Reset login state
 */
export const useLogin = () => {
  // NAVIGATION
  const navigate = useNavigate();

  const [login, { data, error, isLoading, isSuccess, reset, isError }] =
    useLoginMutation();

  useEffect(() => {
    if (isSuccess) {
      reset();
      localStorageUtil.setItem('token', data?.data?.token);
      localStorageUtil.setItem('user', data?.data?.user);
      navigate('/dashboard');
    } else if (isError) {
      toast.error(
        (
          error as {
            data: {
              message: string;
            };
          }
        ).data?.message
      );
      reset();
    }
  }, [isSuccess, navigate, reset, data, isError, error]);

  return { login, data, error, isLoading, isSuccess, reset };
};

/**
 *
 * @returns {Object} - Register hook
 * @property {Function} register - Register function
 * @property {Object} data - Register data
 * @property {Object} error - Register error
 * @property {boolean} isLoading - Register loading state
 * @property {boolean} isSuccess - Register success state
 * @property {Function} reset - Reset register state
 */
export const useRegister = () => {
  // NAVIGATION
  const navigate = useNavigate();

  const [register, { data, error, isLoading, isSuccess, reset, isError }] =
    useRegisterMutation();

  useEffect(() => {
    if (isSuccess) {
      localStorageUtil.setItem('token', data?.data?.token);
      localStorageUtil.setItem('user', data?.data?.user);
      reset();
      navigate('/dashboard');
    } else if (isError) {
      // Fix: error may not have a 'data' property, so check type and access safely
      const errorMessage =
        (error &&
          'data' in error &&
          (
            error as {
              data: {
                message: string;
              };
            }
          ).data?.message) ||
        (error &&
          'message' in error &&
          (
            error as {
              message: string;
            }
          ).message) ||
        'An error occurred';
      toast.error(errorMessage);
      reset();
    }
  }, [
    data?.data?.token,
    data?.data?.user,
    isSuccess,
    navigate,
    reset,
    error,
    isError,
  ]);

  return { register, data, error, isLoading, isSuccess, reset };
};
