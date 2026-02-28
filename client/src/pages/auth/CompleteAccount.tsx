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

  // Login form state
  const [password, setPassword] = useState('');

  // Setup form state
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
      const { token, user } = response?.data;
      localStorageUtil.setItem('token', token);
      localStorageUtil.setItem('user', user);
      dispatch(setToken(token));
      dispatch(setUser(user));
      dispatch(setIsAuthenticated(true));
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
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
      const { token, user } = response?.data;
      localStorageUtil.setItem('token', token);
      localStorageUtil.setItem('user', user);
      dispatch(setToken(token));
      dispatch(setUser(user));
      dispatch(setIsAuthenticated(true));
      toast.success('Account set up successfully. Welcome!');
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Unable to complete account setup. Please try again.'
      );
    }
  };

  if (isChecking || !accountStatus) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </main>
    );
  }

  const isExistingUser =
    accountStatus?.data?.hasEmail && accountStatus?.data?.hasPassword;

  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {isExistingUser ? (
          <>
            <header className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-600">
                You already have an account. Enter your password to continue.
              </p>
            </header>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleLogin}>
              <Input
                label="Email address"
                type="email"
                value={authUser?.email || ''}
                readOnly
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                primary
                className="w-full"
                isLoading={isLoginLoading}
              >
                Sign in and continue
              </Button>
            </form>
          </>
        ) : (
          <>
            <header className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                Complete Your Account
              </h1>
              <p className="text-sm text-slate-600">
                Set up your account details to access the dashboard.
              </p>
            </header>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSetup}>
              <Input
                label="Phone number"
                type="tel"
                value={authUser?.phoneNumber || ''}
                readOnly
              />
              <Input
                label="Full name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                primary
                className="w-full"
                isLoading={isCompleteLoading}
              >
                Create account and continue
              </Button>
            </form>
          </>
        )}

        <div className="mt-4 text-center text-sm text-slate-600">
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Sign in with a different account
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CompleteAccount;
