import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { useResetPasswordMutation } from '@/api/mutations/auth.mutations';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  AuthCard,
  AuthNotice,
  AuthPageShell,
  authInputClassName,
  authPrimaryButtonClassName,
} from './AuthPageShell';

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
    <AuthPageShell>
      <AuthCard title="Set a new password" subtitle="Choose a strong password for your account.">
        {!token ? (
          <AuthNotice tone="error">
            Invalid or missing reset token. Please request a new password reset link.
          </AuthNotice>
        ) : isSubmitted ? (
          <AuthNotice tone="success">
            Your password has been updated successfully.
          </AuthNotice>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <Input
              label="New password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              showPasswordToggle
              className={authInputClassName}
            />
            <Input
              label="Confirm new password"
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
              isLoading={isLoading}
            >
              Update password
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link
            to="/auth/login"
            className="link-sweep text-(--ink)"
          >
            Return to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default ResetPassword;
