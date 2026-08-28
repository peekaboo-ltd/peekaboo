import { Navigate, useLocation } from 'react-router-dom';
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
  AuthFooterNote,
  AuthLink,
  AuthPageShell,
  AuthSocialButton,
  authInputClassName,
  authPrimaryButtonClassName,
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
        <AuthSocialButton onClick={handleGoogleSignIn}>Log in with Google</AuthSocialButton>

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
                placeholder="name@example.com or 7XXXXXXXX"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                className={authInputClassName}
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
                className={authInputClassName}
                errorMessage={errors?.password?.message}
              />
            )}
          />

          <div className="flex items-center justify-between gap-4">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <label className="type-body-sm flex cursor-pointer items-center gap-2 text-(--muted)">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              )}
            />
            <span className="type-body-sm">
              <AuthLink to="/auth/forgot-password">Forgot password?</AuthLink>
            </span>
          </div>

          <Button
            type="submit"
            primary
            className={authPrimaryButtonClassName}
            isLoading={isLoading}
          >
            Log in
          </Button>
        </form>

        <AuthFooterNote>
          Don&apos;t have an account? <AuthLink to="/auth/register">Sign up</AuthLink>
        </AuthFooterNote>
      </AuthCard>
    </AuthPageShell>
  );
};

export default Login;
