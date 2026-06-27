import { useState, type BaseSyntheticEvent, type RefObject } from 'react';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { HomeFormValues } from '../home.types';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import PlaceSearch from '@/components/inputs/PlaceSearch';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheckCircle, faClock, faCreditCard, faShield } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import Input from '@/components/inputs/Input';

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
  const senderPhoneNumber = useWatch({ control, name: 'senderPhoneNumber' });

  const [confirmedLocations, setConfirmedLocations] = useState<{
    from: boolean;
    to: boolean;
  }>({ from: false, to: false });

  const validateRecipientPhone = (value: string | undefined) => {
    const baseValidation = validateRwandanPhone(value);
    if (baseValidation !== true) {
      return baseValidation;
    }

    if (!senderPhoneNumber) {
      return true;
    }

    const normalizedSender =
      validateAndFormatPhoneNumber(senderPhoneNumber).formattedNumber ||
      senderPhoneNumber.trim();
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
    <form ref={formRef} onSubmit={onSubmit} className="home-scroll-target relative isolate w-full">
      <article className="relative rounded-[10px] border border-[#ececea] bg-white p-6 text-[#0a0a0a] shadow-[0_18px_42px_-34px_rgba(10,10,10,0.42)] sm:p-8">
        <header className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9e9d98]">
            New order
          </p>
          <h2 className="mt-2 text-[18px] font-bold leading-tight tracking-[-0.015em] text-[#0a0a0a] sm:text-[20px]">
            {copy.formTitle}
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6b6f76]">
            {copy.formSubtitle}
          </p>
        </header>

        <fieldset className="grid gap-3">
          <Controller
            name="senderPhoneNumber"
            control={control}
            rules={{ validate: validateRwandanPhone }}
            render={({ field }) => (
              <label className='w-full flex flex-col gap-1'>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    label={copy.senderLabel}
                    required
                    type="tel"
                    placeholder={copy.senderPlaceholder}
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
              <label className='w-full flex flex-col gap-1'>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    label={copy.recipientLabel}
                    required
                    type="tel"
                    placeholder={copy.recipientPlaceholder}
                    errorMessage={errors.recipientPhoneNumber?.message}
                  />
              </label>
            )}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Controller
              name="locationFrom"
              control={control}
              render={({ field }) => (
                <label className="w-full flex flex-col gap-1">
                  <p className="text-[12.5px] font-medium text-[#0a0a0a]">
                    Pickup location <span className="text-red-600">*</span>
                  </p>
                  {confirmedLocations.from && field.value ? (
                    <ul className="flex items-center gap-2 rounded-md border border-green-700/15 bg-green-700/5 px-3 py-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-700 text-[13px]" aria-hidden="true" />
                      <span className="flex-1 text-[13px] text-[#0a0a0a] truncate">
                        {field.value}
                      </span>
                        <FontAwesomeIcon onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmedLocations((prev) => ({ ...prev, from: false }));
                        }} icon={faPenToSquare} className="text-[11px] cursor-pointer" aria-hidden="true" />
                    </ul>
                  ) : (
                    <PlaceSearch
                      value={field.value}
                      onChange={field.onChange}
                      onLocationSelect={(result) => {
                        field.onChange(result.formattedAddress);
                        setConfirmedLocations((prev) => ({ ...prev, from: true }));
                      }}
                      placeholder="Pickup location"
                      country="rw"
                    />
                  )}
                </label>
              )}
            />

            <Controller
              name="locationTo"
              control={control}
              render={({ field }) => (
                <label className="w-full flex flex-col gap-1">
                  <p className="text-[12.5px] font-medium text-[#0a0a0a]">
                    Drop-off location <span className="text-red-600">*</span>
                  </p>
                  {confirmedLocations.to && field.value ? (
                    <ul className="flex items-center gap-2 rounded-md border border-green-700/15 bg-green-700/5 px-3 py-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-700 text-[13px]" aria-hidden="true" />
                      <span className="flex-1 text-[13px] text-[#0a0a0a] truncate">
                        {field.value}
                      </span>
                      <FontAwesomeIcon onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmedLocations((prev) => ({ ...prev, to: false }));
                      }} icon={faPenToSquare} className="text-[11px] cursor-pointer" aria-hidden="true" />
                    </ul>
                  ) : (
                    <PlaceSearch
                      value={field.value}
                      onChange={field.onChange}
                      onLocationSelect={(result) => {
                        field.onChange(result.formattedAddress);
                        setConfirmedLocations((prev) => ({ ...prev, to: true }));
                      }}
                      placeholder="Drop-off location"
                      country="rw"
                    />
                  )}
                </label>
              )}
            />
          </div>
        </fieldset>

        <p className="mt-5 border-t border-[#ececea] pt-4 text-[12px] leading-relaxed text-[#6b6f76]">
          We confirm the price and ETA as soon as a rider is matched.
        </p>

        <Button
          submit
          isLoading={isLoading}
          disabled={isLoading}
          className="mt-5 h-10 w-full rounded-md border-[#edb100] bg-[#edb100] text-[13px] font-semibold text-[#0a0a0a] shadow-none hover:border-[#d49e00] hover:bg-[#d49e00]"
        >
          {isLoading ? 'Booking...' : copy.continueLabel}
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" aria-hidden="true" />
        </Button>

        <nav className="mt-4 flex items-center justify-center gap-1.5 text-[12px]">
          <span className="text-[12px] text-[#6b6f76]">{copy.haveOrderLabel}</span>
          <Link
            to="/track"
            className="font-medium text-[12px] underline text-[#0a0a0a] underline-offset-2 hover:underline"
          >
            {copy.trackHereLabel}
          </Link>
        </nav>

        <aside className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#9e9d98]">
          <span className="flex items-center gap-1 text-[8px]">
            <FontAwesomeIcon icon={faShield} className="text-[10px]" aria-hidden="true" />
            {copy.verifiedRidersLabel}
          </span>
          <span className="flex items-center gap-1.5 text-[8px]">
            <FontAwesomeIcon icon={faClock} className="text-[10px]" aria-hidden="true" />
            {copy.realtimeTrackingLabel}
          </span>
          <span className="flex items-center gap-1.5 text-[8px]">
            <FontAwesomeIcon icon={faCreditCard} className="text-[10px]" aria-hidden="true" />
            3+ payment methods
          </span>
        </aside>
      </article>
    </form>
  );
};

export default HeroForm;
