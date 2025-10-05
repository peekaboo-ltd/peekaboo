import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { useRegister } from "@/hooks/auth/auth.hooks";
import { Controller, useForm } from "react-hook-form";

const Register = () => {

    const { control, handleSubmit, formState: { errors } } = useForm();

    const { register, isLoading } = useRegister();

    // HANDLE FORM SUBMISSION
    const onSubmit = handleSubmit((data) => {
        register({ name: data?.name, email: data?.email, phoneNumber: data?.phoneNumber, password: data?.password });
    });

    return (
        <main className="h-full flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
            <form className="flex flex-col gap-8 py-12 w-full sm:min-w-[30vw] max-w-[500px] shadow-2xl rounded-lg p-6" onSubmit={onSubmit}>
                <header className='flex flex-col gap-2'>
                    <h2 className="mt-2 sm:mt-6 text-center text-lg sm:text-xl font-extrabold text-gray-900">
                        Register
                    </h2>
                </header>
                <fieldset className='w-full grid grid-cols-1 gap-4'>
                    <Controller name="name" control={control} render={({ field }) => {
                        return (
                            <Input {...field} label="Name" placeholder="Enter your name" required errorMessage={errors?.name?.message} />
                        )
                    }} />
                    <Controller name="email" control={control} render={({ field }) => {
                        return (
                            <Input {...field} label="Email" placeholder="Enter your email" required errorMessage={errors?.email?.message} />
                        )
                    }} />
                    <Controller name="phoneNumber" control={control} render={({ field }) => {
                        return (
                            <Input {...field} label="Phone Number" placeholder="Enter your phone number" required errorMessage={errors?.phoneNumber?.message} />
                        )
                    }} />
                    <Controller name="password" control={control} render={({ field }) => {
                        return (
                            <Input {...field} label="Password" type="password" placeholder="Enter your password" required errorMessage={errors?.password?.message} />
                        )
                    }} />
                </fieldset>
                <Button isLoading={isLoading} type="submit" primary>Register</Button>
            </form>
        </main>
    )
}

export default Register