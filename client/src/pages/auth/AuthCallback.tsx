import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import { Spinner } from '@/components/ui/spinner';
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
import { useI18n } from '@/i18n/i18n';

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
  const { t } = useI18n();
  useDocumentTitle(
    isLoading ? t('auth.callback.signingIn') : needsPhone ? t('auth.callback.addPhoneDocTitle') : t('auth.callback.authenticating'),
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

      toast.success(t('auth.callback.success'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(t('auth.callback.failed'));
      navigate('/auth/login');
    }
  }, [dispatch, navigate, t]);

  useEffect(() => {
    const processCallback = async () => {
      const tokenParam = searchParams.get('token');
      const errorParam = searchParams.get('error');
      const needsPhoneParam = searchParams.get('needsPhone');

      if (errorParam) {
        toast.error(t('auth.callback.failed'));
        navigate('/auth/login');
        return;
      }

      if (!tokenParam) {
        toast.error(t('auth.callback.noToken'));
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
  }, [completeAuthentication, navigate, searchParams, t]);

  const handlePhoneSubmit = handleSubmit(async (data) => {
    const validation = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!validation.isValid) {
      setError('phoneNumber', {
        type: 'validate',
        message: t('validation.invalidPhone'),
      });
      return;
    }

    if (!token) {
      toast.error(t('auth.callback.expired'));
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
        error instanceof Error ? error.message : t('auth.callback.addPhoneFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleSkipPhone = async () => {
    if (!token) {
      toast.error(t('auth.callback.expired'));
      navigate('/auth/login');
      return;
    }

    await completeAuthentication(token);
  };

  if (isLoading) {
    return (
      <AuthPageShell>
        <AuthCard title={t('auth.callback.completingTitle')} subtitle={t('auth.callback.completingSubtitle')}>
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  if (needsPhone) {
    return (
      <AuthPageShell>
        <AuthCard
          title={t('auth.callback.addPhoneTitle')}
          subtitle={t('auth.callback.addPhoneSubtitle')}
        >
          <form className="flex flex-col gap-4" onSubmit={handlePhoneSubmit}>
            <div>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: t('common.phoneRequired'),
                  validate: (value) => validateRwandanPhoneNumber(value) === true || t('validation.invalidPhone'),
                }}
                render={({ field }) => (
                  <TelInput
                    {...field}
                    label={t('auth.register.phone')}
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
                {t('auth.callback.addPhone')}
              </Button>
              <Button
                type="button"
                onClick={handleSkipPhone}
                className={authSecondaryButtonClassName}
              >
                {t('auth.callback.skip')}
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
