import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import TelInput from '@/components/inputs/TelInput';
import { useAppDispatch } from '@/states/hooks';
import {
  setToken,
  setUser,
  setIsAuthenticated,
} from '@/states/slices/auth.slice';
import { localStorageUtil } from '@/utils/localStorage.util';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import {
  validateAndFormatPhoneNumber,
  validateRwandanPhoneNumber,
} from '@/utils/phone.util';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  AuthCard,
  AuthPageShell,
  authInputClassName,
  authPrimaryButtonClassName,
  authSecondaryButtonClassName,
} from './AuthPageShell';

interface AddPhoneFormData {
  phoneNumber: string;
}

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [needsPhone, setNeedsPhone] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useDocumentTitle(
    isLoading ? 'Signing In' : needsPhone ? 'Add Phone Number' : 'Authenticating',
  );

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AddPhoneFormData>();

  const completeAuthentication = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${ENVIRONMENTS.API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const result = await response.json();
      const userData = result.data;

      localStorageUtil.setItem('token', authToken);
      localStorageUtil.setItem('user', userData);

      dispatch(setToken(authToken));
      dispatch(setUser(userData));
      dispatch(setIsAuthenticated(true));

      toast.success('Successfully signed in with Google!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
      navigate('/auth/login');
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    const processCallback = async () => {
      const tokenParam = searchParams.get('token');
      const errorParam = searchParams.get('error');
      const needsPhoneParam = searchParams.get('needsPhone');

      if (errorParam) {
        toast.error('Authentication failed. Please try again.');
        navigate('/auth/login');
        return;
      }

      if (!tokenParam) {
        toast.error('No authentication token received.');
        navigate('/auth/login');
        return;
      }

      setTokenState(tokenParam);

      if (needsPhoneParam === 'true') {
        setNeedsPhone(true);
        setIsLoading(false);
        return;
      }

      await completeAuthentication(tokenParam);
    };

    processCallback();
  }, [completeAuthentication, navigate, searchParams]);

  const handlePhoneSubmit = handleSubmit(async (data) => {
    const validation = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!validation.isValid) {
      setError('phoneNumber', {
        type: 'validate',
        message: validation.error,
      });
      return;
    }

    if (!token) {
      toast.error('Authentication session expired. Please try again.');
      navigate('/auth/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${ENVIRONMENTS.API_URL}/auth/add-phone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: validation.e164,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add phone number');
      }

      await completeAuthentication(token);
    } catch (error) {
      console.error('Error adding phone number:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to add phone number'
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleSkipPhone = async () => {
    if (!token) {
      toast.error('Authentication session expired. Please try again.');
      navigate('/auth/login');
      return;
    }

    await completeAuthentication(token);
  };

  if (isLoading) {
    return (
      <AuthPageShell>
        <AuthCard title="Completing sign in" subtitle="We are securing your session.">
          <div className="flex justify-center py-4">
            <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-[--ink]" />
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  if (needsPhone) {
    return (
      <AuthPageShell>
        <AuthCard
          title="Add your phone number"
          subtitle="Add a phone number to complete your Peekaboo profile."
        >
          <form className="flex flex-col gap-4" onSubmit={handlePhoneSubmit}>
            <div>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: 'Phone number is required',
                  validate: (value) => validateRwandanPhoneNumber(value),
                }}
                render={({ field }) => (
                  <TelInput
                    {...field}
                    label="Phone number"
                    placeholder="7XXXXXXXX"
                    required
                    className={authInputClassName}
                    errorMessage={errors?.phoneNumber?.message}
                  />
                )}
              />
            </div>

            <nav className="flex flex-col gap-3">
              <Button
                type="submit"
                primary
                isLoading={isSubmitting}
                className={authPrimaryButtonClassName}
              >
                Add phone number
              </Button>
              <Button
                type="button"
                onClick={handleSkipPhone}
                className={authSecondaryButtonClassName}
              >
                Skip for now
              </Button>
            </nav>
          </form>
        </AuthCard>
      </AuthPageShell>
    );
  }

  return null;
};

export default AuthCallback;
