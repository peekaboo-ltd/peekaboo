import { useForm } from 'react-hook-form';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { useAppDispatch } from '@/states/hooks';
import { loginSuccess } from '@/states/slices/auth.slice';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { token, user } = await authService.login({ email: values.email, password: values.password });
      dispatch(loginSuccess({ token, user, remember: values.remember }));

      const roles = user.roles || [];
      let redirect = '/';
      if (roles.includes('ADMIN')) redirect = '/admin';
      else if (roles.includes('RIDER')) redirect = '/rider';
      else if (roles.includes('CUSTOMER')) redirect = '/customer';

      toast.success('Logged in successfully');
      navigate(redirect || from, { replace: true });
    } catch (error: any) {
      toast.error(error?.message ?? 'Invalid credentials');
    }
  });

  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <section className="space-y-3">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            {...(register as any)('email', { required: 'Email is required', pattern: { value: /.+@.+\..+/, message: 'Invalid email' } })}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}

          <Input
            label="Password"
            type="password"
            placeholder="********"
            required
            {...(register as any)('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('remember')} className="accent-primary" />
            Remember me
          </label>
        </section>

        <footer className="mt-6 flex flex-col gap-3">
          <Button primary type="submit" isLoading={isSubmitting}>Login</Button>
          <p className="text-xs text-gray-600">No account? <Link className="text-primary underline" to="/register">Register</Link></p>
        </footer>
      </form>
    </main>
  );
};

export default Login;
