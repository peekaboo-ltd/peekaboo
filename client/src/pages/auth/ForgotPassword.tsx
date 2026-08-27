import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { useForgotPasswordMutation } from '@/api/mutations/auth.mutations';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  AuthCard,
  AuthNotice,
  AuthPageShell,
  authInputClassName,
  authPrimaryButtonClassName,
} from './AuthPageShell';

const ForgotPassword = () => {
  useDocumentTitle('Forgot Password');
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await forgotPassword({ identifier }).unwrap();
      toast.success(response?.message || 'Password reset instructions sent');
      setIsSubmitted(true);
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Unable to submit request. Please try again.'
      );
    }
  };

  return (
    <AuthPageShell>
      <AuthCard
        title="Reset your password"
        subtitle="Enter your email or phone number and we will send reset instructions."
      >
        {isSubmitted ? (
          <AuthNotice tone="success">
            If your account exists, reset instructions have been sent. Please check your inbox.
          </AuthNotice>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <Input
              label="Email or phone"
              placeholder="name@example.com or 7XXXXXXXX"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className={authInputClassName}
            />
            <Button
              type="submit"
              primary
              className={authPrimaryButtonClassName}
              isLoading={isLoading}
            >
              Send reset instructions
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <span>Remembered your password? </span>
          <Link
            to="/auth/login"
            className="link-sweep text-(--ink)"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default ForgotPassword;
