import { useForm } from 'react-hook-form';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

interface RegisterFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: 'CUSTOMER' | 'RIDER' | 'ADMIN';
}

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    defaultValues: { role: 'CUSTOMER' },
  });
  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authService.register({
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: values.role,
      });
      toast.success('Registration successful. Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.message ?? 'Registration failed');
    }
  });

  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-xl font-semibold mb-4">Create account</h1>
        <section className="grid grid-cols-1 gap-3">
          <Input label="Name" placeholder="Jane Doe" required {...(register as any)('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}

          <Input label="Email" type="email" placeholder="you@example.com" required {...(register as any)('email', { required: 'Email is required', pattern: { value: /.+@.+\..+/, message: 'Invalid email' } })} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}

          <Input label="Phone number" placeholder="+2507..." required {...(register as any)('phoneNumber', { required: 'Phone is required', minLength: { value: 10, message: 'Invalid phone' } })} />
          {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input label="Password" type="password" required {...(register as any)('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <Input label="Confirm password" type="password" required {...(register as any)('confirmPassword', { required: 'Confirm password', validate: (v: string) => v === password || 'Passwords do not match' })} />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <label className="text-sm font-medium">Role</label>
          <div className="flex gap-4 text-sm">
            {(['CUSTOMER','RIDER','ADMIN'] as const).map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input type="radio" value={r} {...register('role', { required: true })} /> {r}
              </label>
            ))}
          </div>
        </section>
        <footer className="mt-6 flex flex-col gap-3">
          <Button primary type="submit" isLoading={isSubmitting}>Create account</Button>
          <p className="text-xs text-gray-600">Already have an account? <Link className="text-primary underline" to="/login">Login</Link></p>
        </footer>
      </form>
    </main>
  );
};

export default Register;
