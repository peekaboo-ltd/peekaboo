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
  AuthSocialButton,
} from './AuthPageShell';
import { useI18n } from '@/i18n/i18n';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export const Login = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useI18n();
  useDocumentTitle(t('auth.login.docTitle'));

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
      <AuthCard title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
        <AuthSocialButton onClick={handleGoogleSignIn}>{t('auth.login.google')}</AuthSocialButton>

        <AuthDivider />

        <form className="flex flex-col gap-4" onSubmit={onLoginSubmit}>
          <Controller
            name="username"
            control={control}
            rules={{ required: t('auth.emailOrPhoneRequired') }}
            render={({ field }) => (
              <Input
                {...field}
                label={t('auth.emailOrPhone')}
                placeholder={t('auth.emailOrPhonePlaceholder')}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                errorMessage={errors?.username?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: t('auth.passwordRequired') }}
            render={({ field }) => (
              <Input
                {...field}
                label={t('auth.password')}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                showPasswordToggle
                errorMessage={errors?.password?.message}
              />
            )}
          />

          <div className="flex items-center justify-between gap-4">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-(--muted)">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer"
                  />
                  <span>{t('auth.rememberMe')}</span>
                </label>
              )}
            />
            <Link
              to="/auth/forgot-password"
              className="link-sweep text-sm text-(--ink)"
            >
              {t('auth.forgotPasswordLink')}
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {t('auth.login.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span>{t('auth.login.noAccount')} </span>
          <Link
            to="/auth/register"
            className="link-sweep text-(--ink)"
          >
            {t('auth.login.signUp')}
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default Login;
