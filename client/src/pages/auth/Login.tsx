import { Link, Navigate, useLocation } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/inputs/Input';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/inputs/Button';
import { useLogin } from '@/hooks/auth/auth.hooks';
import { useAppSelector } from '@/states/hooks';
import { localStorageUtil } from '@/utils/localStorage.util';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  AuthCard,
  AuthDivider,
  AuthPageShell,
  GoogleIcon,
} from './AuthPageShell';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export const Login = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  useDocumentTitle('Sign In');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const { login, isLoading } = useLogin();

  const onLoginSubmit = handleSubmit((data) => {
    login({ username: data.username, password: data.password });
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
      <AuthCard title="Welcome back" subtitle="Log in to your account">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-normal text-card-foreground transition-colors hover:bg-accent"
        >
          <GoogleIcon />
          Log in with Google
        </button>

        <AuthDivider />

        <form className="flex flex-col gap-4" onSubmit={onLoginSubmit}>
          <Controller
            name="username"
            control={control}
            rules={{ required: 'Phone number or email is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label="Email or phone"
                placeholder="Enter your email or phone..."
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-(--ink)"
                errorMessage={errors?.username?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: 'Password is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                showPasswordToggle
                className="h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-(--ink)"
                errorMessage={errors?.password?.message}
              />
            )}
          />

          <div className="flex items-center justify-between gap-4">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer border-border"
                  />
                  <span>Remember me</span>
                </label>
              )}
            />
            <Link
              to="/auth/forgot-password"
              className="text-sm font-normal text-(--ink) hover:text-(--muted) underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            primary
            isLoading={isLoading}
            className="mt-2 w-full !rounded-md !bg-(--ink) !font-normal hover:!bg-(--ink)"
          >
            Log in
          </Button>
        </form>

        <div className="mt-7 pt-6 text-center text-sm font-normal text-foreground">
          <span>Don&apos;t have an account? </span>
          <Link
            to="/auth/register"
            className="font-normal text-(--ink) hover:text-(--muted) underline underline-offset-2"
          >
            Sign up
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default Login;
