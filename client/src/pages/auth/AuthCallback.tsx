import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/states/hooks';
import {
  setToken,
  setUser,
  setIsAuthenticated,
} from '@/states/slices/auth.slice';
import { localStorageUtil } from '@/utils/localStorage.util';
import { toast } from 'sonner';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Controller, useForm } from 'react-hook-form';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';

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
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPhoneFormData>();

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

      // Check if user needs to add phone number
      if (needsPhoneParam === 'true') {
        setNeedsPhone(true);
        setIsLoading(false);
        return;
      }

      // User has phone number, proceed with authentication
      await completeAuthentication(tokenParam);
    };

    processCallback();
  }, [searchParams, navigate, dispatch]);

  const completeAuthentication = async (authToken: string) => {
    try {
      // Fetch user data with the token
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

      // Store token and user data
      localStorageUtil.setItem('token', authToken);
      localStorageUtil.setItem('user', userData);

      // Update Redux state
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
  };

  const handlePhoneSubmit = handleSubmit(async (data) => {
    // Validate phone number
    const validation = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!validation.isValid) {
      setPhoneError(validation.error);
      return;
    }
    setPhoneError(undefined);

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
          phoneNumber: validation.formattedNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add phone number');
      }

      // Phone number added successfully, complete authentication
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

    // Allow user to skip adding phone for now
    await completeAuthentication(token);
  };

  if (isLoading) {
    return (
      <main className="h-full flex items-center justify-center bg-gray-50">
        <article className="text-center">
          <figure className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></figure>
          <p className="mt-4 text-gray-600">Completing sign in...</p>
        </article>
      </main>
    );
  }

  if (needsPhone) {
    return (
      <main className="h-full flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <article className="flex flex-col gap-6 py-8 w-full sm:min-w-[30vw] max-w-[500px] shadow-2xl rounded-lg p-6 bg-white">
          <header className="flex flex-col gap-2">
            <h1 className="text-center text-lg sm:text-xl font-extrabold text-gray-900">
              Add Your Phone Number
            </h1>
            <p className="text-center text-sm text-gray-600">
              Please add your phone number to complete your profile.
            </p>
          </header>

          <form className="flex flex-col gap-6" onSubmit={handlePhoneSubmit}>
            <fieldset className="w-full grid grid-cols-1 gap-4">
              <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: 'Phone number is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Phone Number"
                    placeholder="078XXXXXXX"
                    required
                    errorMessage={phoneError || errors?.phoneNumber?.message}
                  />
                )}
              />
              <aside className="text-xs text-gray-500 -mt-2">
                Valid prefixes: 078, 072, 073, 079, 077
              </aside>
            </fieldset>

            <nav className="flex flex-col gap-3">
              <Button type="submit" primary isLoading={isSubmitting}>
                Add Phone Number
              </Button>
              <Button type="button" onClick={handleSkipPhone}>
                Skip for Now
              </Button>
            </nav>
          </form>
        </article>
      </main>
    );
  }

  return null;
};

export default AuthCallback;
