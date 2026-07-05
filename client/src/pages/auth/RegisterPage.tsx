import { useState, useCallback } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { useRegister } from '@/hooks/auth/auth.hooks';
import { useAppSelector } from '@/states/hooks';
import { localStorageUtil } from '@/utils/localStorage.util';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import {
  AuthCard,
  AuthDivider,
  AuthPageShell,
  GoogleIcon,
} from './AuthPageShell';

interface RegisterFormData {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  name?: string;
  email?: string;
}

export const RegisterPage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [phoneError, setPhoneError] = useState<string | undefined>();
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
    const phoneValidation = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      return;
    }
    setPhoneError(undefined);

    if (data.password !== data.confirmPassword) {
      setRegisterError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }

    if (data.password.length < 8) {
      setRegisterError('password', {
        type: 'manual',
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    register({
      phoneNumber: phoneValidation.formattedNumber,
      password: data.password,
      name: data.name,
      email: data.email,
    });
  });

  const handlePhoneChange = useCallback(
    (value: string, onChange: (value: string) => void) => {
      onChange(value);
      if (value) {
        const validation = validateAndFormatPhoneNumber(value);
        setPhoneError(validation.isValid ? undefined : validation.error);
      } else {
        setPhoneError(undefined);
      }
    },
    [],
  );

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
    <AuthPageShell>
      <AuthCard title="Create account" subtitle="Start sending deliveries">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-normal text-card-foreground transition-colors hover:bg-accent"
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        <AuthDivider />

        <form className="flex flex-col gap-4" onSubmit={onRegisterSubmit}>
          <div>
            <Controller
              name="phoneNumber"
              control={control}
              rules={{ required: 'Phone number is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Phone number"
                  placeholder="078XXXXXXX"
                  required
                  onChange={(e) =>
                    handlePhoneChange(e.target.value, field.onChange)
                  }
                  className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-primary"
                  errorMessage={phoneError || errors?.phoneNumber?.message}
                />
              )}
            />
            <p className="mt-1 text-xs font-normal text-muted-foreground">
              Valid prefixes: 078, 072, 073, 079, 077
            </p>
          </div>

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
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
                showPasswordToggle
                className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-primary"
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
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                showPasswordToggle
                className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-primary"
                errorMessage={errors?.confirmPassword?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Name"
                  placeholder="Your name"
                  className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-primary"
                  errorMessage={errors?.name?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-primary"
                  errorMessage={errors?.email?.message}
                />
              )}
            />
          </div>

          <Button
            type="submit"
            primary
            isLoading={isLoading}
            className="mt-2 w-full !rounded-md !bg-primary !font-normal hover:!bg-primary-800"
          >
            Sign up
          </Button>
        </form>

        <div className="mt-7 border-t border-border pt-6 text-center text-sm font-normal text-foreground">
          <span>Already have an account? </span>
          <Link
            to="/auth/login"
            className="font-normal text-primary hover:text-secondary-600 underline underline-offset-2"
          >
            Log in
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
