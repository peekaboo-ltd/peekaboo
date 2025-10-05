import { Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/inputs/Input';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/inputs/Button';
import { useLogin } from '@/hooks/auth/auth.hooks';

export const Login = () => {

  const { control, handleSubmit, formState: { errors } } = useForm();

  const { login, isLoading } = useLogin();

  // HANDLE FORM SUBMISSION
  const onSubmit = handleSubmit((data) => {
    login({ username: data?.username, password: data.password });
  });

  return (
    <main className="h-full flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <form className="flex flex-col gap-8 py-12 w-full sm:min-w-[30vw] max-w-[500px] shadow-2xl rounded-lg p-6" onSubmit={onSubmit}>
        <header className='flex flex-col gap-2'>
          <h2 className="mt-2 sm:mt-6 text-center text-lg sm:text-xl font-extrabold text-gray-900">
            Sign in to Peekaboo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/auth/register" className="font-medium hover:underline text-primary hover:text-primary/80">
              create a new account
            </Link>
          </p>
        </header>

        <fieldset className='w-full grid grid-cols-1 gap-4'>
          <Controller name="username" control={control} render={({ field }) => {
            return (
              <Input {...field} label='Username' placeholder='Enter email or username' required errorMessage={errors?.username?.message} />
            )
          }} />
          <Controller name="password" control={control} render={({ field }) => {
            return (
              <Input {...field} label='Password' type='password' placeholder='Enter password' required errorMessage={errors?.password?.message} />
            )
          }} />
          <nav className='w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 justify-between'>
            <Controller name="rememberMe" control={control} render={({ field }) => {
              return (
                <label className='flex items-center gap-2'>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className='cursor-pointer'
                  />
                  <span className="text-sm">Remember me</span>
                </label>
              )
            }} />
            <Link to="/forgot-password" className="font-medium text-sm sm:text-[13px] hover:underline text-primary hover:text-primary/80">
              Forgot password?
            </Link>
          </nav>
        </fieldset>
        <Button type="submit" primary isLoading={isLoading}>Login</Button>
      </form>
    </main>
  );
};
