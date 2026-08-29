import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import { Spinner } from '@/components/ui/spinner';
import Input from '@/components/inputs/Input';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setToken, setUser, setIsAuthenticated } from '@/states/slices/auth.slice';
import { localStorageUtil } from '@/utils/localStorage.util';
import { useLoginMutation, useCompleteAccountMutation } from '@/api/mutations/auth.mutations';
import { useLazyCheckAccountQuery } from '@/api/queries/auth.queries';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  AuthCard,
  AuthFooterNote,
  AuthLink,
  AuthPageShell,
  authInputClassName,
  authPrimaryButtonClassName,
} from './AuthPageShell';
import { useI18n } from '@/i18n/i18n';

const CompleteAccount = () => {
  const { t } = useI18n();
  useDocumentTitle(t('auth.complete.docTitle'));

  const [searchParams] = useSearchParams();
  const nextPath = useMemo(
    () => searchParams.get('next') || '/dashboard',
    [searchParams]
  );

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);

  const [checkAccount, { data: accountStatus, isLoading: isChecking }] =
    useLazyCheckAccountQuery();

  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [completeAccount, { isLoading: isCompleteLoading }] =
    useCompleteAccountMutation();

  useEffect(() => {
    checkAccount();
  }, [checkAccount]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userEmail = authUser?.email;
    if (!userEmail) {
      toast.error(t('auth.complete.noEmail'));
      return;
    }
    try {
      const response = await login({ username: userEmail, password }).unwrap();
      let token = '';
      let user = {};
      if (response?.data) {
        token = response?.data?.token;
        user = response?.data?.user;
      }
      localStorageUtil.setItem('token', token);
      localStorageUtil.setItem('user', user);
      dispatch(setToken(token));
      dispatch(setUser(user));
      dispatch(setIsAuthenticated(true));
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(
        (error as { data: { message?: string } })?.data?.message ||
          t('auth.complete.incorrectPassword')
      );
    }
  };

  const handleSetup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(t('auth.passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    try {
      const response = await completeAccount({
        name,
        email,
        password: newPassword,
      }).unwrap();
      let token = '';
      let user = {};
      if (response?.data) {
        token = response?.data?.token;
        user = response?.data?.user;
      }
      localStorageUtil.setItem('token', token);
      localStorageUtil.setItem('user', user);
      dispatch(setToken(token));
      dispatch(setUser(user));
      dispatch(setIsAuthenticated(true));
      toast.success(t('auth.complete.success'));
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(
        (error as { data: { message?: string } })?.data?.message ||
          t('auth.complete.error')
      );
    }
  };

  if (isChecking || !accountStatus) {
    return (
      <AuthPageShell>
        <AuthCard title={t('auth.complete.checkingTitle')} subtitle={t('auth.complete.checkingSubtitle')}>
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  const isExistingUser =
    accountStatus?.hasEmail && accountStatus?.hasPassword;

  return (
    <AuthPageShell>
      <AuthCard
        title={isExistingUser ? t('auth.complete.existingTitle') : t('auth.complete.newTitle')}
        subtitle={
          isExistingUser
            ? t('auth.complete.existingSubtitle')
            : t('auth.complete.newSubtitle')
        }
      >
        {isExistingUser ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <Input
              label={t('auth.complete.emailAddress')}
              type="email"
              value={authUser?.email || ''}
              readOnly
              className={authInputClassName}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              showPasswordToggle
              className={authInputClassName}
            />
            <Button
              type="submit"
              primary
              className={authPrimaryButtonClassName}
              isLoading={isLoginLoading}
            >
              {t('auth.complete.signInContinue')}
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSetup}>
            <Input
              label={t('auth.register.phone')}
              type="tel"
              value={authUser?.phoneNumber || ''}
              readOnly
              className={authInputClassName}
            />
            <Input
              label={t('auth.register.fullName')}
              type="text"
              placeholder={t('auth.complete.fullNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={authInputClassName}
            />
            <Input
              label={t('auth.complete.emailAddress')}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={authInputClassName}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder={t('auth.reset.minimumPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              showPasswordToggle
              className={authInputClassName}
            />
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              placeholder={t('auth.reset.reenterPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              showPasswordToggle
              className={authInputClassName}
            />
            <Button
              type="submit"
              primary
              className={authPrimaryButtonClassName}
              isLoading={isCompleteLoading}
            >
              {t('auth.complete.createContinue')}
            </Button>
          </form>
        )}

        <AuthFooterNote>
          <AuthLink to="/auth/login">{t('auth.complete.differentAccount')}</AuthLink>
        </AuthFooterNote>
      </AuthCard>
    </AuthPageShell>
  );
};

export default CompleteAccount;
