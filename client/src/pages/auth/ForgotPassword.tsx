import Button from '@/components/inputs/Button';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

const ForgotPassword = () => {
  useDocumentTitle('Forgot Password');

  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Forgot your password?
          </h1>
          <p className="text-sm text-slate-600">
            Please contact support or sign in with Google to regain access.
          </p>
        </header>
        <div className="mt-6 flex flex-col gap-3">
          <Button route="/auth/login" primary className="w-full">
            Back to sign in
          </Button>
          <Button route="/contact" className="w-full">
            Contact support
          </Button>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;
