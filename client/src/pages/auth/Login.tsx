import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/inputs/Input';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/inputs/Button';
import { useLogin, useRegister } from '@/hooks/auth/auth.hooks';
import { useAppSelector } from '@/states/hooks';
import { useEffect, useState, useCallback } from 'react';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import { ENVIRONMENTS } from '@/constants/environments.constants';

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
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [phoneError, setPhoneError] = useState<string | undefined>();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Login form
  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  // Register form
  const {
    control: registerControl,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch,
    setError: setRegisterError,
  } = useForm<RegisterFormData>();

  const { login, isLoading: isLoginLoading } = useLogin();
  const { register, isLoading: isRegisterLoading } = useRegister();

  // Watch password for confirmation validation
  const password = watch('password');

  // Handle login submission
  const onLoginSubmit = handleLoginSubmit((data) => {
    login({ username: data.username, password: data.password });
  });

  // Handle registration submission
  const onRegisterSubmit = handleRegisterSubmit((data) => {
    // Validate phone number
    const phoneValidation = validateAndFormatPhoneNumber(data.phoneNumber);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      return;
    }
    setPhoneError(undefined);

    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      setRegisterError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }

    // Validate password strength
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

  // Handle phone number change with validation
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
    []
  );

  // Handle Google Sign In
  const handleGoogleSignIn = () => {
    window.location.href = `${ENVIRONMENTS.API_URL}/auth/google`;
  };

  // Toggle between login and register modes
  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setPhoneError(undefined);
  };

  return (
    <main className="h-full flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <article className="flex flex-col gap-6 py-8 w-full sm:min-w-[30vw] max-w-[500px] shadow-2xl rounded-lg p-6 bg-white">
        <header className="flex flex-col gap-2">
          <h1 className="mt-2 sm:mt-4 text-center text-lg sm:text-xl font-extrabold text-gray-900">
            {authMode === 'login' ? 'Sign in to Peekaboo' : 'Create Account'}
          </h1>
          <p className="text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <Link
                  to="#"
                  onClick={toggleAuthMode}
                  className="font-medium text-[13px] hover:underline text-primary hover:text-primary/80"
                >
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  to="#"
                  onClick={toggleAuthMode}
                  className="font-medium text-[13px] hover:underline text-primary hover:text-primary/80"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </header>

        {/* Google Sign In Button */}
        <section className="w-full">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full cursor-pointer flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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

        {/* Divider */}
        <aside className="relative flex items-center">
          <span className="flex-grow border-t border-gray-300"></span>
          <span className="flex-shrink px-4 text-sm text-gray-500">or</span>
          <span className="flex-grow border-t border-gray-300"></span>
        </aside>

        {/* Login Form */}
        {authMode === 'login' && (
          <form className="flex flex-col gap-6" onSubmit={onLoginSubmit}>
            <fieldset className="w-full grid grid-cols-1 gap-4">
              <Controller
                name="username"
                control={loginControl}
                rules={{ required: 'Username is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Phone Number or Email"
                    placeholder="Enter phone number or email"
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
                    required
                    errorMessage={loginErrors?.password?.message}
                  />
                )}
              />
              <nav className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 justify-between">
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
                  to="/forgot-password"
                  className="font-medium text-sm sm:text-[13px] hover:underline text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </nav>
            </fieldset>
            <Button type="submit" primary isLoading={isLoginLoading} className="cursor-pointer">
              Sign In
            </Button>
          </form>
        )}

        {/* Register Form */}
        {authMode === 'register' && (
          <form className="flex flex-col gap-6" onSubmit={onRegisterSubmit}>
            <fieldset className="w-full grid grid-cols-1 gap-4">
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
              <aside className="text-xs text-gray-500 -mt-2">
                Valid prefixes: 078, 072, 073, 079, 077
              </aside>
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
            <Button type="submit" primary isLoading={isRegisterLoading} className="cursor-pointer">
              Create Account
            </Button>
          </form>
        )}
      </article>
    </main>
  );
};
