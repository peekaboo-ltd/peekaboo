import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import Button from '@/components/inputs/Button';
import { useRegister } from '@/hooks/auth/auth.hooks';
import { useAppSelector } from '@/states/hooks';
import { localStorageUtil } from '@/utils/localStorage.util';
import {
  validateAndFormatPhoneNumber,
  validateRwandanPhoneNumber,
} from '@/utils/phone.util';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import {
  AuthCard,
  AuthDivider,
  AuthFooterNote,
  AuthLink,
  AuthPageShell,
  AuthSocialButton,
  authInputClassName,
  authPrimaryButtonClassName,
} from './AuthPageShell';
import { useI18n } from '@/i18n/i18n';

interface RegisterFormData {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  name?: string;
  email?: string;
}

/**
 * Fields that belong together sit on one row. Pairing name with email and the
 * password with its confirmation groups them by what they ask for, without
 * needing headings to say so — and it halves the form's height, so the whole
 * signup fits without scrolling. Stacks below `sm`, so a narrow screen never
 * scrolls sideways.
 */
const FieldRow = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
    {children}
  </div>
);

/**
 * A field nobody has to fill says so. Four asterisked fields followed by two
 * unmarked ones left the reader inferring which were which from an absence.
 */
const OptionalLabel = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  return <>{children}<span className="type-meta font-normal">{t('auth.optional')}</span></>;
};

export const RegisterPage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useI18n();
  useDocumentTitle(t('auth.register.docTitle'));

  const {
    control,
    handleSubmit,
    watch,
    setError: setRegisterError,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const { register, isLoading } = useRegister();
  const password = watch('password');

  const onRegisterSubmit = handleSubmit((data) => {
    // The field rules already block submission on a bad password or a
    // mismatch, so this handler only does the one thing they cannot: convert
    // the typed number into the E.164 form the API stores. It used to re-run
    // the length and match checks too, in branches that could never be
    // reached.
    const phoneValidation = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!phoneValidation.e164) {
      setRegisterError('phoneNumber', {
        type: 'validate',
        message: t('validation.invalidPhone'),
      });
      return;
    }

    register({
      phoneNumber: phoneValidation.e164,
      password: data.password,
      name: data.name,
      email: data.email,
    });
  });

  const handleGoogleSignIn = () => {
    window.location.href = `${ENVIRONMENTS.API_URL}/auth/google`;
  };

  if (isAuthenticated) {
    const redirectPath = localStorageUtil.getItem<string>('from');
    const locationStateFrom = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
    const fallbackFrom = locationStateFrom?.pathname
      ? `${locationStateFrom.pathname}${locationStateFrom.search || ''}`
      : undefined;
    localStorageUtil.removeItem('from');
    return <Navigate to={redirectPath || fallbackFrom || '/dashboard'} replace />;
  }

  return (
    <AuthPageShell maxWidthClassName="max-w-[560px]">
      <AuthCard title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
        <AuthSocialButton onClick={handleGoogleSignIn}>{t('auth.register.google')}</AuthSocialButton>

        <AuthDivider />

        <form className="flex flex-col gap-4" onSubmit={onRegisterSubmit}>
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
                description={t('auth.register.phoneHint')}
                className={authInputClassName}
                errorMessage={errors?.phoneNumber?.message}
              />
            )}
          />

          <FieldRow>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={<OptionalLabel>{t('auth.register.fullName')}</OptionalLabel>}
                  placeholder={t('auth.register.namePlaceholder')}
                  autoComplete="name"
                  className={authInputClassName}
                  errorMessage={errors?.name?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                // Optional, but a malformed address reached the API unchecked:
                // the field had no rule at all behind the browser's own.
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('auth.register.emailInvalid'),
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={<OptionalLabel>{t('auth.register.email')}</OptionalLabel>}
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={authInputClassName}
                  errorMessage={errors?.email?.message}
                />
              )}
            />
          </FieldRow>

          <FieldRow>
            <Controller
              name="password"
              control={control}
              rules={{
                required: t('auth.passwordRequired'),
                minLength: {
                  value: 8,
                  message: t('auth.passwordMin'),
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('auth.password')}
                  type="password"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  autoComplete="new-password"
                  required
                  showPasswordToggle
                  className={authInputClassName}
                  errorMessage={errors?.password?.message}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: t('auth.confirmPasswordRequired'),
                validate: (value) =>
                  value === password || t('auth.passwordMismatch'),
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('auth.confirmPassword')}
                  type="password"
                  placeholder={t('auth.register.repeatPassword')}
                  autoComplete="new-password"
                  required
                  showPasswordToggle
                  className={authInputClassName}
                  errorMessage={errors?.confirmPassword?.message}
                />
              )}
            />
          </FieldRow>

          <Button
            type="submit"
            primary
            className={authPrimaryButtonClassName}
            isLoading={isLoading}
          >
            {t('auth.register.submit')}
          </Button>
        </form>

        <AuthFooterNote>
          {t('auth.register.hasAccount')} <AuthLink to="/auth/login">{t('auth.register.login')}</AuthLink>
        </AuthFooterNote>
      </AuthCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
