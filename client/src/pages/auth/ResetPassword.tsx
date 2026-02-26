import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { useResetPasswordMutation } from '@/api/mutations/auth.mutations';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const ResetPassword = () => {
  useDocumentTitle('Set New Password');
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const response = await resetPassword({ token, newPassword }).unwrap();
      toast.success(response?.message || 'Password reset successful.');
      setIsSubmitted(true);
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Unable to reset your password. Please request a new reset link.'
      );
    }
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Set a new password</h1>
          <p className="text-sm text-slate-600">
            Choose a strong password for your account.
          </p>
        </header>

        {!token ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Invalid or missing reset token. Please request a new password reset link.
          </div>
        ) : isSubmitted ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Your password has been updated successfully.
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
            <Input
              label="New password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" primary className="w-full" isLoading={isLoading}>
              Update password
            </Button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-slate-600">
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Return to sign in
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ResetPassword;
