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
const OptionalLabel = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <span className="type-meta font-normal">Optional</span>
  </>
);

export const RegisterPage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  useDocumentTitle('Create Account');

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
        message: phoneValidation.error,
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
      <AuthCard title="Create account" subtitle="Start sending deliveries">
        <AuthSocialButton onClick={handleGoogleSignIn}>Sign up with Google</AuthSocialButton>

        <AuthDivider />

        <form className="flex flex-col gap-4" onSubmit={onRegisterSubmit}>
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
                description="You'll use this to log in."
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
                  label={<OptionalLabel>Full name</OptionalLabel>}
                  placeholder="Your name"
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
                  message: 'Enter a valid email address',
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={<OptionalLabel>Email</OptionalLabel>}
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
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
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
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat password"
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
            Sign up
          </Button>
        </form>

        <AuthFooterNote>
          Already have an account? <AuthLink to="/auth/login">Log in</AuthLink>
        </AuthFooterNote>
      </AuthCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
