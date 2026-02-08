import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import Modal from '@/components/Modal';
import { useCreateOrder } from '@/hooks/orders/orders.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setCreateOrderModal } from '@/states/slices/order.slice';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface CreateOrderFormValues {
  recipientPhoneNumber: string;
}

const CreateOrder = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { createOrderModal } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);

  // REACT HOOK FORM
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    trigger,
  } = useForm<CreateOrderFormValues>({
    defaultValues: {
      recipientPhoneNumber: '',
    },
  });

  const senderPhoneNumber = useMemo(() => {
    return (
      user?.organizationMembership?.[0]?.organization?.phoneNumber ||
      user?.phoneNumber ||
      ''
    );
  }, [user?.organizationMembership, user?.phoneNumber]);

  // VALIDATE RWANDAN PHONE NUMBER
  const validateRwandanPhone = (value?: string) => {
    return (
      validateAndFormatPhoneNumber(value || '')?.isValid ||
      'Please enter a valid Rwandan phone number'
    );
  };

  // CREATE ORDER
  const {
    createOrder,
    reset: createOrderReset,
    isLoading,
    isSuccess,
    error,
    isError,
  } = useCreateOrder();

  // ON SUBMIT
  const onSubmit = handleSubmit((data) => {
    const sender = validateAndFormatPhoneNumber(senderPhoneNumber);
    const recipient = validateAndFormatPhoneNumber(data.recipientPhoneNumber);

    if (!sender?.isValid || !sender?.formattedNumber) {
      toast.error('Sender phone number is missing or invalid.');
      return;
    }

    if (!recipient?.isValid || !recipient?.formattedNumber) {
      toast.error('Please enter a valid recipient phone number.');
      return;
    }

    createOrder({
      senderPhoneNumber: sender.formattedNumber,
      recipientPhoneNumber: recipient.formattedNumber,
    });
  });

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setCreateOrderModal(false));
    reset();
    createOrderReset();
  }, [createOrderReset, dispatch, reset]);

  useEffect(() => {
    if (isSuccess) {
      if (createOrderModal) {
        toast.success('Order created successfully');
      }
      closeModal();
    }
  }, [isSuccess, closeModal, createOrderModal]);

  return (
    <Modal
      isOpen={createOrderModal}
      onClose={closeModal}
      heading="Create Order"
      description="Create a delivery without leaving the dashboard."
    >
      <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
        <fieldset className="flex flex-col gap-4">
          <Controller
            name="recipientPhoneNumber"
            control={control}
            rules={{ validate: validateRwandanPhone }}
            render={({ field }) => (
              <Input
                {...field}
                label="Recipient Phone Number"
                required
                placeholder="0788123456"
                errorMessage={errors?.recipientPhoneNumber?.message}
                onChange={(e) => {
                  field.onChange(e);
                  trigger('recipientPhoneNumber');
                }}
              />
            )}
          />
        </fieldset>

        {isError && <p className="text-sm text-red-700">{String(error)}</p>}

        <footer className="flex justify-end gap-3 pt-4 border-t">
          <Button type="submit" primary isLoading={isLoading}>
            Create Order
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default CreateOrder;
