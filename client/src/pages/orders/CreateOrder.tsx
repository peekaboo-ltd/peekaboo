import Button from "@/components/inputs/Button";
import TelInput from "@/components/inputs/TelInput";
import Modal from "@/components/Modal";
import ContactMethodPicker from "@/components/orders/ContactMethodPicker";
import { useCreateOrder } from "@/hooks/orders/orders.hooks";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { setCreateOrderModal } from "@/states/slices/order.slice";
import {
  parseBillingGuardPrompt,
  type BillingGuardPrompt,
} from "@/utils/billingGuard.util";
import {
  validateAndFormatPhoneNumber,
  validateRwandanPhoneNumber,
} from "@/utils/phone.util";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { PreferredContactMethod } from "@/types/order.type";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CreateOrderFormValues {
  recipientPhoneNumber: string;
}

const CreateOrder = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { createOrderModal } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);
  const [billingGuardPrompt, setBillingGuardPrompt] =
    useState<BillingGuardPrompt | null>(null);
  const [contactMethod, setContactMethod] = useState<
    PreferredContactMethod | undefined
  >(undefined);
  const [contactEmail, setContactEmail] = useState('');
  const [contactEmailError, setContactEmailError] = useState('');

  // REACT HOOK FORM
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrderFormValues>({
    defaultValues: {
      recipientPhoneNumber: "",
    },
  });

  const senderPhoneNumber = useMemo(() => {
    return (
      user?.organizationMembership?.[0]?.organization?.phoneNumber ||
      user?.phoneNumber ||
      ""
    );
  }, [user?.organizationMembership, user?.phoneNumber]);

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

    if (!sender?.isValid || !sender?.e164) {
      toast.error("Sender phone number is missing or invalid.");
      return;
    }

    if (!recipient?.isValid || !recipient?.e164) {
      toast.error("Please enter a valid recipient phone number.");
      return;
    }

    // An EMAIL preference with no address is one the server will reject, so
    // stop here rather than losing the whole form to a round trip.
    if (contactMethod === PreferredContactMethod.EMAIL && !contactEmail.trim()) {
      setContactEmailError('Add an email address, or choose another method.');
      return;
    }

    createOrder({
      senderPhoneNumber: sender.e164,
      recipientPhoneNumber: recipient.e164,
      ...(contactMethod ? { preferredContactMethod: contactMethod } : {}),
      ...(contactMethod === PreferredContactMethod.EMAIL
        ? { contactEmail: contactEmail.trim() }
        : {}),
    });
  });

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setCreateOrderModal(false));
    reset();
    createOrderReset();
    setContactMethod(undefined);
    setContactEmail('');
    setContactEmailError('');
  }, [createOrderReset, dispatch, reset]);

  useEffect(() => {
    if (isSuccess) {
      if (createOrderModal) {
        toast.success("Order created successfully");
      }
      closeModal();
    }
  }, [isSuccess, closeModal, createOrderModal]);

  useEffect(() => {
    if (!isError) return;
    const prompt = parseBillingGuardPrompt(error);
    if (!prompt) return;

    dispatch(setCreateOrderModal(false));
    setBillingGuardPrompt(prompt);
  }, [dispatch, error, isError]);

  const closeBillingGuardModal = useCallback(() => {
    setBillingGuardPrompt(null);
  }, []);

  const handleContactEmailChange = useCallback((value: string) => {
    setContactEmail(value);
    const trimmed = value.trim();
    setContactEmailError(
      !trimmed || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? ''
        : 'Enter a valid email address.',
    );
  }, []);

  const handlePayFirst = useCallback(() => {
    setBillingGuardPrompt(null);
    navigate("/billing-payments");
  }, [navigate]);

  return (
    <>
      <Modal
        isOpen={createOrderModal}
        onClose={closeModal}
        heading="Create order"
        description="Enter the recipient’s phone number. You’ll set the route before payment."
      >
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
          <fieldset className="flex flex-col gap-4">
            <Controller
              name="recipientPhoneNumber"
              control={control}
              rules={{ validate: (value) => validateRwandanPhoneNumber(value) }}
              render={({ field }) => (
                <TelInput
                  {...field}
                  label="Recipient phone number"
                  required
                  placeholder="0788123456"
                  errorMessage={errors?.recipientPhoneNumber?.message}
                />
              )}
            />

            <ContactMethodPicker
              value={contactMethod}
              onChange={setContactMethod}
              email={contactEmail}
              onEmailChange={handleContactEmailChange}
              emailError={contactEmailError}
              label="How should we reach the sender?"
              description="Used for pickup and delivery updates on this order."
            />
          </fieldset>

          {isError && !billingGuardPrompt && (
            <p className="rounded-md bg-[color-mix(in_oklab,var(--destructive)_7%,white)] px-3 py-2 text-sm text-(--ink)">
              {(error as { data?: { message?: string } })?.data?.message ||
                String(error)}
            </p>
          )}

          <footer className="flex justify-end gap-3 border-t border-(--line) pt-4">
            <Button type="submit" primary isLoading={isLoading}>
              Create order
            </Button>
          </footer>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(billingGuardPrompt)}
        onClose={closeBillingGuardModal}
        heading={billingGuardPrompt?.title || "Billing action needed"}
        description={billingGuardPrompt?.description || ""}
      >
        <section className="flex flex-col gap-4">
          {billingGuardPrompt?.billingStatus ? (
            <p className="text-sm text-(--muted)">
              Billing status:{" "}
              <span className="font-normal text-(--ink)">
                {billingGuardPrompt.billingStatus}
              </span>
            </p>
          ) : null}
          <footer className="flex justify-end gap-3 border-t border-(--line) pt-3">
            <Button type="button" onClick={closeBillingGuardModal}>
              Close
            </Button>
            <Button type="button" primary onClick={handlePayFirst}>
              Pay first to continue
            </Button>
          </footer>
        </section>
      </Modal>
    </>
  );
};

export default CreateOrder;
