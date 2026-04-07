import { Link, Navigate, useLocation } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/inputs/Input';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/inputs/Button';
import { useLogin, useRegister } from '@/hooks/auth/auth.hooks';
import { useAppSelector } from '@/states/hooks';
import { localStorageUtil } from '@/utils/localStorage.util';
import { useState, useCallback } from 'react';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  PublicPage,
  PublicSectionCard,
} from '@/components/layout/PublicPage';

type AuthMode = 'login' | 'register';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterFormData {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  name?: string;
  email?: string;
}

export const Login = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [phoneError, setPhoneError] = useState<string | undefined>();
  useDocumentTitle(authMode === 'login' ? 'Sign In' : 'Create Account');

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    control: registerControl,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch,
    setError: setRegisterError,
  } = useForm<RegisterFormData>();

  const { login, isLoading: isLoginLoading } = useLogin();
  const { register, isLoading: isRegisterLoading } = useRegister();

  const password = watch('password');

  const onLoginSubmit = handleLoginSubmit((data) => {
    login({ username: data.username, password: data.password });
  });

  const onRegisterSubmit = handleRegisterSubmit((data) => {
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

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setPhoneError(undefined);
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
    <PublicPage className="max-lg:mt-16">
      <PublicSectionCard
        className="mx-auto w-full max-w-3xl border-primary-200"
        title={authMode === 'login' ? 'Sign In' : 'Create Account'}
        description={
          authMode === 'login'
            ? 'Use your existing account details to continue.'
            : 'Enter your details to get started.'
        }
      >
        {authMode === 'login' ? (
          <div className="mb-5 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-900">
              New to Peekaboo?
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Create an account to place deliveries and keep your orders in one place.
            </p>
            <Button
              type="button"
              primary
              onClick={toggleAuthMode}
              className="mt-4 w-full justify-center"
            >
              Create Account
            </Button>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="#"
                onClick={toggleAuthMode}
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        <section className="w-full">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full cursor-pointer flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </section>

        <section className="relative my-5 flex items-center" aria-hidden="true">
          <span className="flex-grow border-t border-slate-200"></span>
          <span className="flex-shrink px-4 text-xs uppercase tracking-[0.24em] text-slate-400">
            or
          </span>
          <span className="flex-grow border-t border-slate-200"></span>
        </section>

        {authMode === 'login' ? (
          <form className="flex flex-col gap-5" onSubmit={onLoginSubmit}>
            <fieldset className="grid grid-cols-1 gap-4">
              <Controller
                name="username"
                control={loginControl}
                rules={{ required: 'Username is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Phone Number or Email"
                    placeholder="Enter phone number or email"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    errorMessage={loginErrors?.username?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={loginControl}
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    showPasswordToggle
                    errorMessage={loginErrors?.password?.message}
                  />
                )}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Controller
                  name="rememberMe"
                  control={loginControl}
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">Remember me</span>
                    </label>
                  )}
                />
                <Link
                  to="/auth/forgot-password"
                  className="font-medium text-sm hover:underline text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </div>
            </fieldset>
            <Button
              type="submit"
              primary
              isLoading={isLoginLoading}
              className="self-end"
            >
              Sign In
            </Button>
          </form>
        ) : (
          <form
            className="flex min-h-0 min-w-0 flex-col gap-5 pb-8"
            onSubmit={onRegisterSubmit}
          >
            <fieldset className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Controller
                  name="phoneNumber"
                  control={registerControl}
                  rules={{ required: 'Phone number is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Phone Number"
                      placeholder="078XXXXXXX"
                      required
                      onChange={(e) =>
                        handlePhoneChange(e.target.value, field.onChange)
                      }
                      errorMessage={
                        phoneError || registerErrors?.phoneNumber?.message
                      }
                    />
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Valid prefixes: 078, 072, 073, 079, 077
                </p>
              </div>
              <Controller
                name="password"
                control={registerControl}
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
                    required
                    errorMessage={registerErrors?.password?.message}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={registerControl}
                rules={{
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    errorMessage={registerErrors?.confirmPassword?.message}
                  />
                )}
              />
              <Controller
                name="name"
                control={registerControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Name (Optional)"
                    placeholder="Enter your name"
                    errorMessage={registerErrors?.name?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={registerControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Email (Optional)"
                    type="email"
                    placeholder="Enter your email"
                    errorMessage={registerErrors?.email?.message}
                  />
                )}
              />
            </fieldset>
            <Button
              type="submit"
              primary
              isLoading={isRegisterLoading}
              className="mt-2 self-end"
            >
              Create Account
            </Button>
          </form>
        )}
      </PublicSectionCard>
    </PublicPage>
  );
};

export default Login;
