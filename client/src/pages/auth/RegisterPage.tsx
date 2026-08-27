import { Link, Navigate, useLocation } from 'react-router-dom';
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
      setRegisterError('phoneNumber', {
        type: 'validate',
        message: phoneValidation.error,
      });
      return;
    }

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
                  className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-(--ink)"
                  errorMessage={errors?.phoneNumber?.message}
                />
              )}
            />
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
                className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-(--ink)"
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
                className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-(--ink)"
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
                  className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-(--ink)"
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
                  className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-(--ink)"
                  errorMessage={errors?.email?.message}
                />
              )}
            />
          </div>

          <Button
            type="submit"
            primary
            isLoading={isLoading}
            className="mt-2 w-full !rounded-md !bg-(--ink) !font-normal hover:!bg-(--ink)"
          >
            Sign up
          </Button>
        </form>

        <div className="mt-7 pt-6 text-center text-sm font-normal text-foreground">
          <span>Already have an account? </span>
          <Link
            to="/auth/login"
            className="font-normal text-(--ink) hover:text-(--muted) underline underline-offset-2"
          >
            Log in
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
