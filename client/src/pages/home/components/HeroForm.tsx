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
import {
  describeLocation,
  placeSearchResultToOrderLocation,
} from '@/utils/locations.util';
import PlaceSearch from '@/components/inputs/PlaceSearch';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheckCircle, faClock, faCreditCard, faShield } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import TelInput from '@/components/inputs/TelInput';

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

interface LocationFieldProps {
  name: 'locationFrom' | 'locationTo';
  control: Control<HomeFormValues>;
  label: string;
  placeholder: string;
  requiredMessage: string;
  errorMessage?: string;
}

// The picked place — coordinates included — is what gets submitted, so the form
// value is only ever set from a dropdown selection. Free text the user types is
// held locally and clears the selection, otherwise "required" would be satisfied
// by an address we have no coordinates for.
const LocationField = ({
  name,
  control,
  label,
  placeholder,
  requiredMessage,
  errorMessage,
}: LocationFieldProps) => {
  const [searchText, setSearchText] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: requiredMessage }}
      render={({ field }) => (
        <label className="w-full flex flex-col gap-1">
          <p className="text-[12.5px] font-medium text-foreground">
            {label} <span className="text-red-600">*</span>
          </p>
          {field.value ? (
            <ul className="flex items-center gap-2 rounded-md border border-green-700/15 bg-green-700/5 px-3 py-2">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-700 text-[13px]"
                aria-hidden="true"
              />
              <span className="flex-1 text-[13px] text-foreground truncate">
                {describeLocation(field.value)}
              </span>
              <FontAwesomeIcon
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchText(describeLocation(field.value));
                  field.onChange(undefined);
                }}
                icon={faPenToSquare}
                className="text-[11px] cursor-pointer"
                aria-hidden="true"
              />
            </ul>
          ) : (
            <>
              <PlaceSearch
                value={searchText}
                onChange={setSearchText}
                onLocationSelect={(result) => {
                  setSearchText(result.formattedAddress || result.name);
                  field.onChange(placeSearchResultToOrderLocation(result));
                }}
                placeholder={placeholder}
                country="rw"
              />
              {errorMessage ? (
                <span className="text-[11.5px] text-red-600">{errorMessage}</span>
              ) : null}
            </>
          )}
        </label>
      )}
    />
  );
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

  const validateRecipientPhone = (value: string | undefined) => {
    const baseValidation = validateRwandanPhone(value);
    if (baseValidation !== true) {
      return baseValidation;
    }

    if (!senderPhoneNumber) {
      return true;
    }

    const normalizedSender =
      validateAndFormatPhoneNumber(senderPhoneNumber).e164 ||
      senderPhoneNumber.trim();
    const normalizedRecipient =
      validateAndFormatPhoneNumber(value || '').e164 ||
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
      <article className="relative rounded-md border border-border bg-[var(--peekaboo-surface)] p-6 text-foreground shadow-[0_22px_70px_-42px_color-mix(in_oklab,var(--primary)_45%,transparent)] sm:p-8">
        <header className="mb-5">
          <p className="text-[10px] font-medium uppercase text-muted-foreground">
            New order
          </p>
          <h2 className="mt-2 text-[18px] font-semibold leading-tight text-card-foreground sm:text-[20px]">
            {copy.formTitle}
          </h2>
          <p className="mt-1.5 text-[12.5px] font-normal leading-relaxed text-muted-foreground">
            {copy.formSubtitle}
          </p>
        </header>

        <fieldset className="grid gap-3">
          <Controller
            name="senderPhoneNumber"
            control={control}
            rules={{ validate: validateRwandanPhone }}
            render={({ field }) => (
              <TelInput
                {...field}
                label={copy.senderLabel}
                required
                placeholder={copy.senderPlaceholder}
                errorMessage={errors.senderPhoneNumber?.message}
              />
            )}
          />

          <Controller
            name="recipientPhoneNumber"
            control={control}
            rules={{ validate: validateRecipientPhone }}
            render={({ field }) => (
              <TelInput
                {...field}
                label={copy.recipientLabel}
                required
                placeholder={copy.recipientPlaceholder}
                errorMessage={errors.recipientPhoneNumber?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LocationField
              name="locationFrom"
              control={control}
              label="Pickup location"
              placeholder="Pickup location"
              requiredMessage="Select a pickup location from the suggestions"
              errorMessage={errors.locationFrom?.message}
            />

            <LocationField
              name="locationTo"
              control={control}
              label="Drop-off location"
              placeholder="Drop-off location"
              requiredMessage="Select a drop-off location from the suggestions"
              errorMessage={errors.locationTo?.message}
            />
          </div>
        </fieldset>

        <p className="mt-5 pt-4 text-[12px] font-normal leading-relaxed text-muted-foreground">
          We confirm the price and ETA as soon as a rider is matched.
        </p>

        <Button
          submit
          primary
          isLoading={isLoading}
          disabled={isLoading}
          className="mt-5 h-10 w-full rounded-md text-[13px] font-medium"
        >
          {isLoading ? 'Booking...' : copy.continueLabel}
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" aria-hidden="true" />
        </Button>

        <nav className="mt-4 flex items-center justify-center gap-1.5 text-[12px]">
          <span className="text-[12px] text-muted-foreground">{copy.haveOrderLabel}</span>
          <Link
            to="/track"
            className="font-medium text-[12px] underline text-foreground underline-offset-2 hover:underline"
          >
            {copy.trackHereLabel}
          </Link>
        </nav>

        <aside className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10.5px] font-medium uppercase text-muted-foreground">
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
