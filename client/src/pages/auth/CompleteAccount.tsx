import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setToken, setUser, setIsAuthenticated } from '@/states/slices/auth.slice';
import { localStorageUtil } from '@/utils/localStorage.util';
import { useLoginMutation, useCompleteAccountMutation } from '@/api/mutations/auth.mutations';
import { useLazyCheckAccountQuery } from '@/api/queries/auth.queries';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  AuthCard,
  AuthPageShell,
  authInputClassName,
  authPrimaryButtonClassName,
} from './AuthPageShell';

const CompleteAccount = () => {
  useDocumentTitle('Complete Your Account');

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
      toast.error('No email address found. Please contact support.');
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
          'Incorrect password. Please try again.'
      );
    }
  };

  const handleSetup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
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
      toast.success('Account set up successfully. Welcome!');
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(
        (error as { data: { message?: string } })?.data?.message ||
          'Unable to complete account setup. Please try again.'
      );
    }
  };

  if (isChecking || !accountStatus) {
    return (
      <AuthPageShell>
        <AuthCard title="Checking your account" subtitle="We are preparing your setup.">
          <div className="flex justify-center py-4">
            <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
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
        title={isExistingUser ? 'Welcome back' : 'Complete your account'}
        subtitle={
          isExistingUser
            ? 'Enter your password to continue.'
            : 'Set up your account details to access the dashboard.'
        }
      >
        {isExistingUser ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <Input
              label="Email address"
              type="email"
              value={authUser?.email || ''}
              readOnly
              className={authInputClassName}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
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
              Sign in and continue
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSetup}>
            <Input
              label="Phone number"
              type="tel"
              value={authUser?.phoneNumber || ''}
              readOnly
              className={authInputClassName}
            />
            <Input
              label="Full name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={authInputClassName}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={authInputClassName}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              showPasswordToggle
              className={authInputClassName}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
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
              Create account and continue
            </Button>
          </form>
        )}

        <div className="mt-7 pt-6 text-center text-sm font-normal text-foreground">
          <Link
            to="/auth/login"
            className="font-normal text-primary hover:text-[--muted] underline underline-offset-2"
          >
            Sign in with a different account
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default CompleteAccount;
