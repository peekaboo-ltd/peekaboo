import { Controller, useForm, type FieldValues } from 'react-hook-form';
import Input from '../../components/inputs/Input';
import { useCreatePublicOrder } from '../../hooks/orders/orders.hooks';
import Button from '@/components/inputs/Button';

const Home = () => {
  // REACT HOOK FORM
  const { control, handleSubmit } = useForm();

  // ORDER HOOKS
  const { createPublicOrder, isLoading } = useCreatePublicOrder();

  // HANDLE FORM SUBMISSION
  const onSubmit = handleSubmit((data: FieldValues) => {
    createPublicOrder({
      senderPhoneNumber: data?.senderPhoneNumber,
      recipientPhoneNumber: data?.recipientPhoneNumber,
    });
  });

  return (
    <main className="min-h-screen w-[80vw] mx-auto self-center flex items-center justify-between">
      <section className="w-full grid grid-cols-2 self-center">
        <article className="w-full flex flex-col gap-6">
          <h2 className="text-4xl font-bold">Peekaboo</h2>
          <p className="text-sm">
            Some random 12 words text goes right here in this code block now
          </p>
        </article>
      </section>
      <form
        onSubmit={onSubmit}
        className="w-full flex flex-col gap-6 self-center"
      >
        <ul className="w-full flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Send a package</h2>
          <p className="text-sm">
            Please enter your phone number and the recipient's to get matched
            with one of our riders.
          </p>
        </ul>
        <fieldset className="w-full flex flex-col gap-4">
          <Controller
            name="senderPhoneNumber"
            control={control}
            render={({ field }) => (
              <label className="w-full flex flex-col gap-4">
                <p className="text-sm">Your phone number</p>
                <Input {...field} />
              </label>
            )}
          />
          <Controller
            name="recipientPhoneNumber"
            control={control}
            render={({ field }) => (
              <label className="w-full flex flex-col gap-4">
                <p className="text-sm">Recipient's phone number</p>
                <Input {...field} />
              </label>
            )}
          />
        </fieldset>
        <Button
          className="w-full bg-primary-900 p-4 rounded-lg cursor-pointer"
          isLoading={isLoading}
          type="submit"
        >
          Continue
        </Button>
      </form>
    </main>
  );
};

export default Home;
