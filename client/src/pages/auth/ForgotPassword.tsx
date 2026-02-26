import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useForgotPasswordMutation } from '@/api/mutations/auth.mutations';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
    <main className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Reset your password</h1>
          <p className="text-sm text-slate-600">
            Enter your email or phone number and we&apos;ll send instructions to reset your
            password.
          </p>
        </header>

        {isSubmitted ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            If your account exists, a reset email has been sent. Please check your inbox.
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
            <Input
              label="Email or phone number"
              placeholder="name@example.com or 078XXXXXXX"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Button type="submit" primary className="w-full" isLoading={isLoading}>
              Send reset instructions
            </Button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-slate-600">
          Remembered your password?{' '}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;
