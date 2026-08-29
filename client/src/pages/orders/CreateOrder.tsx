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
import { validateAndFormatPhoneNumber } from "@/utils/phone.util";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { PreferredContactMethod } from "@/types/order.type";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useI18n } from '@/i18n/i18n';

interface CreateOrderFormValues {
  recipientPhoneNumber: string;
}

const CreateOrder = () => {
  const { t } = useI18n();
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
      toast.error(t('orders.senderInvalid'));
      return;
    }

    if (!recipient?.isValid || !recipient?.e164) {
      toast.error(t('orders.recipientInvalid'));
      return;
    }

    // An EMAIL preference with no address is one the server will reject, so
    // stop here rather than losing the whole form to a round trip.
    if (contactMethod === PreferredContactMethod.EMAIL && !contactEmail.trim()) {
      setContactEmailError(t('orders.contactEmailRequired'));
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
        toast.success(t('orders.created'));
      }
      closeModal();
    }
  }, [isSuccess, closeModal, createOrderModal, t]);

  useEffect(() => {
    if (!isError) return;
    const prompt = parseBillingGuardPrompt(error, t);
    if (!prompt) return;

    dispatch(setCreateOrderModal(false));
    setBillingGuardPrompt(prompt);
  }, [dispatch, error, isError, t]);

  const closeBillingGuardModal = useCallback(() => {
    setBillingGuardPrompt(null);
  }, []);

  const handleContactEmailChange = useCallback((value: string) => {
    setContactEmail(value);
    const trimmed = value.trim();
    setContactEmailError(
      !trimmed || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? ''
        : t('publicOrder.emailInvalid'),
    );
  }, [t]);

  const handlePayFirst = useCallback(() => {
    setBillingGuardPrompt(null);
    navigate("/billing-payments");
  }, [navigate]);

  return (
    <>
      <Modal
        isOpen={createOrderModal}
        onClose={closeModal}
        heading={t('orders.create')}
        description={t('orders.createDescription')}
      >
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
          <fieldset className="flex flex-col gap-4">
            <Controller
              name="recipientPhoneNumber"
              control={control}
              rules={{
                validate: (value) =>
                  validateAndFormatPhoneNumber(value).isValid || t('orders.recipientInvalid'),
              }}
              render={({ field }) => (
                <TelInput
                  {...field}
                  label={t('orders.recipientPhone')}
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
              label={t('orders.senderContact')}
              description={t('orders.senderContactHelp')}
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
              {t('orders.create')}
            </Button>
          </footer>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(billingGuardPrompt)}
        onClose={closeBillingGuardModal}
        heading={billingGuardPrompt?.title || t('orders.billingAction')}
        description={billingGuardPrompt?.description || ""}
      >
        <section className="flex flex-col gap-4">
          {billingGuardPrompt?.billingStatus ? (
            <p className="text-sm text-(--muted)">
              {t('orders.billingStatus', { status: billingGuardPrompt.billingStatus })}
            </p>
          ) : null}
          <footer className="flex justify-end gap-3 border-t border-(--line) pt-3">
            <Button type="button" onClick={closeBillingGuardModal}>
              {t('common.actions.close')}
            </Button>
            <Button type="button" primary onClick={handlePayFirst}>
              {t('orders.payFirst')}
            </Button>
          </footer>
        </section>
      </Modal>
    </>
  );
};

export default CreateOrder;
