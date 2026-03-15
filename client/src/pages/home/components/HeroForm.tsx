import type { BaseSyntheticEvent, RefObject } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faClock,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import type { HomeFormValues } from '../home.types';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';

interface HeroFormCopy {
  formTitle: string;
  formSubtitle: string;
  quickStartLabel: string;
  senderLabel: string;
  senderPlaceholder: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  continueLabel: string;
  haveOrderLabel: string;
  trackHereLabel: string;
  verifiedRidersLabel: string;
  realtimeTrackingLabel: string;
}

interface HeroFormProps {
  formRef: RefObject<HTMLFormElement | null>;
  onSubmit: (event?: BaseSyntheticEvent) => void | Promise<void>;
  control: Control<HomeFormValues>;
  isLoading: boolean;
  copy: HeroFormCopy;
  errors: FieldErrors<HomeFormValues>;
}

const validateRwandanPhone = (value: string | undefined) => {
  if (!value || !value.trim()) {
    return 'Phone number is required';
  }
  const result = validateAndFormatPhoneNumber(value);
  return result.isValid ? true : (result.error ?? 'Invalid phone number');
};

const HeroForm = ({
  formRef,
  onSubmit,
  control,
  isLoading,
  copy,
  errors,
}: HeroFormProps) => {
  const validateRecipientPhone = (value: string | undefined) => {
    const baseValidation = validateRwandanPhone(value);
    if (baseValidation !== true) {
      return baseValidation;
    }

    const senderValue = control?._formValues?.senderPhoneNumber as
      | string
      | undefined;

    if (!senderValue) {
      return true;
    }

    const normalizedSender =
      validateAndFormatPhoneNumber(senderValue).formattedNumber ||
      senderValue.trim();
    const normalizedRecipient =
      validateAndFormatPhoneNumber(value || '').formattedNumber ||
      (value || '').trim();

    if (
      normalizedSender &&
      normalizedRecipient &&
      normalizedSender === normalizedRecipient
    ) {
      return 'Sender and recipient phone numbers must be different';
    }

    return true;
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative isolate">
      <article className="relative rounded-2xl bg-white border border-primary-100 p-7 sm:p-8 shadow-[0_20px_50px_rgba(37,52,63,0.08)]">
        <header className="mb-6">
          <h2 className="text-lg font-semibold text-primary-900">
            {copy?.formTitle}
          </h2>
          <p className="text-primary-500 text-[11px] mt-0.5">
            {copy?.formSubtitle}
          </p>
        </header>

        <fieldset className="space-y-4 mb-6">
          <Controller
            name="senderPhoneNumber"
            control={control}
            rules={{ validate: validateRwandanPhone }}
            render={({ field }) => (
              <Input
                {...field}
                label={copy.senderLabel}
                required
                placeholder={copy.senderPlaceholder}
                className={
                  errors.senderPhoneNumber
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                    : ''
                }
                errorMessage={errors.senderPhoneNumber?.message}
              />
            )}
          />
          <Controller
            name="recipientPhoneNumber"
            control={control}
            rules={{ validate: validateRecipientPhone }}
            render={({ field }) => (
              <Input
                {...field}
                label={copy.recipientLabel}
                required
                placeholder={copy.recipientPlaceholder}
                className={
                  errors.recipientPhoneNumber
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                    : ''
                }
                errorMessage={errors.recipientPhoneNumber?.message}
              />
            )}
          />
        </fieldset>

        <footer className="space-y-3">
          <Button
            className="w-full bg-secondary-600 hover:bg-secondary-700 border-secondary-600 hover:border-secondary-700 text-white py-2.5 rounded-md text-[14px] font-medium shadow-sm"
            isLoading={isLoading}
            type="submit"
            primary
          >
            {copy.continueLabel}
            <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 text-[11px]" />
          </Button>

          <nav className="flex items-center justify-center gap-2 pt-1">
            <span className="text-primary-400 text-[11px]">
              {copy.haveOrderLabel}
            </span>
            <Link
              to="/track"
              className="text-primary-900 hover:text-secondary-700 text-[11px] font-medium transition-colors"
            >
              {copy.trackHereLabel} &rarr;
            </Link>
          </nav>
        </footer>

        <aside className="mt-5 pt-4 border-t border-primary-50 flex items-center justify-center gap-4 text-[11px] text-primary-400">
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faShieldHalved} className="text-primary-300" />
            {copy?.verifiedRidersLabel}
          </span>
          <span className="w-0.5 h-0.5 rounded-full bg-primary-300" aria-hidden="true" />
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} className="text-primary-300" />
            {copy?.realtimeTrackingLabel}
          </span>
        </aside>
      </article>
    </form>
  );
};

export default HeroForm;
