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
    <div className="relative rounded-[26px] bg-white border border-slate-300 p-8 sm:p-10 shadow-[0_28px_56px_-44px_rgba(15,23,42,0.65)]">
      <header className="space-y-4 mb-7">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <figure className="flex items-center gap-3">
            <hgroup>
              <h2 className="text-xl !font-medium text-slate-900">
                {copy?.formTitle}
              </h2>
              <p className="text-slate-500 text-[11px] font-normal">
                {copy?.formSubtitle}
              </p>
            </hgroup>
          </figure>
          <span className="invisible h-[0px] items-center rounded-full border border-slate-300 bg-white px-3 py-1 !text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {copy?.quickStartLabel}
          </span>
        </nav>
      </header>

      <fieldset className="space-y-4 mb-7">
        <Controller
          name="senderPhoneNumber"
          control={control}
          rules={{ validate: validateRwandanPhone }}
          render={({ field }) => (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                {copy.senderLabel} <span className='text-red-700 text-[13px]'>*</span>
              </span>
              <Input
                {...field}
                placeholder={copy.senderPlaceholder}
                className={`!rounded-lg focus:!ring-1 transition-all !py-3 !text-sm ${
                  errors.senderPhoneNumber
                    ? '!border-red-400 focus:!border-red-500 focus:!ring-red-500/10 !bg-red-50/30'
                    : '!border-slate-300 focus:!border-slate-900 focus:!ring-slate-900/10 !bg-slate-50 hover:!bg-white'
                }`}
                errorMessage={errors.senderPhoneNumber?.message}
              />
            </label>
          )}
        />
        <Controller
          name="recipientPhoneNumber"
          control={control}
          rules={{ validate: validateRecipientPhone }}
          render={({ field }) => (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                {copy.recipientLabel} <span className='text-red-700 text-[13px]'>*</span>
              </span>
              <Input
                {...field}
                placeholder={copy.recipientPlaceholder}
                className={`!rounded-lg focus:!ring-1 transition-all !py-3 !text-sm ${
                  errors.recipientPhoneNumber
                    ? '!border-red-400 focus:!border-red-500 focus:!ring-red-500/10 !bg-red-50/30'
                    : '!border-slate-300 focus:!border-slate-900 focus:!ring-slate-900/10 !bg-slate-50 hover:!bg-white'
                }`}
                errorMessage={errors.recipientPhoneNumber?.message}
              />
            </label>
          )}
        />
      </fieldset>

      <footer className="space-y-4">
        <Button
          className="w-full !bg-slate-900 hover:!bg-slate-800 !py-3 !rounded-lg !text-sm !font-medium transition-all duration-200 cursor-pointer !border-0"
          isLoading={isLoading}
          type="submit"
          primary
        >
          {copy.continueLabel}
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </Button>

        <nav className="flex items-center justify-center gap-2 pt-1">
          <span className="text-slate-400 text-xs font-normal">
            {copy.haveOrderLabel}
          </span>
          <Link
            to="/track"
            className="text-slate-900 hover:text-slate-700 text-xs font-medium transition-colors hover:underline underline-offset-2"
          >
            {copy.trackHereLabel} &rarr;
          </Link>
        </nav>
      </footer>

      <aside className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-normal">
        <span className="flex items-center gap-1.5 text-[12px]">
          <FontAwesomeIcon
            size="xs"
            icon={faShieldHalved}
            className="text-slate-400"
          />
          {copy?.verifiedRidersLabel}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" aria-hidden="true" />
        <span className="flex items-center gap-1.5 text-[12px]">
          <FontAwesomeIcon
            size="xs"
            icon={faClock}
            className="text-slate-400"
          />
          {copy?.realtimeTrackingLabel}
        </span>
      </aside>
    </div>
  </form>
  );
};

export default HeroForm;
