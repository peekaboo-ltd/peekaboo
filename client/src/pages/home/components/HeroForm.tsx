import { useState, type BaseSyntheticEvent, type RefObject } from 'react';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { Pencil, TriangleAlert } from 'lucide-react';
import type { HomeFormValues } from '../home.types';
import type { OrderLocation } from '@/types/order.type';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import {
  describeLocation,
  placeSearchResultToOrderLocation,
} from '@/utils/locations.util';
import PlaceSearch from '@/components/inputs/PlaceSearch';
import TelInput from '@/components/inputs/TelInput';

interface HeroFormCopy {
  formTitle: string;
  formSubtitle: string;
  senderLabel: string;
  senderPlaceholder: string;
  recipientLabel: string;
  recipientPlaceholder: string;
}

interface HeroFormProps {
  formRef: RefObject<HTMLFormElement | null>;
  onSubmit: (event?: BaseSyntheticEvent) => void | Promise<void>;
  control: Control<HomeFormValues>;
  copy: HeroFormCopy;
  errors: FieldErrors<HomeFormValues>;
}

const validateRwandanPhone = (value: string | undefined) => {
  if (!value?.trim()) return 'Phone number is required';
  const result = validateAndFormatPhoneNumber(value);
  return result.isValid ? true : (result.error ?? 'Invalid phone number');
};

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <span
      className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-(--ink)"
      role="alert"
    >
      <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </span>
  ) : null;

interface LocationFieldProps {
  name: 'locationFrom' | 'locationTo';
  control: Control<HomeFormValues>;
  label: string;
  placeholder: string;
  requiredMessage: string;
  errorMessage?: string;
  validate?: (value: OrderLocation | undefined) => true | string;
}

const LocationField = ({
  name,
  control,
  label,
  placeholder,
  requiredMessage,
  errorMessage,
  validate,
}: LocationFieldProps) => {
  const [searchText, setSearchText] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: requiredMessage, validate }}
      render={({ field }) => (
        <div>
          <label className="field-label" htmlFor={`hero-${name}`}>
            {label}
          </label>

          {field.value ? (
            <div className="flex h-12 items-center gap-3 rounded-(--radius-control) border border-(--line) bg-(--paper) pl-3.5 pr-1.5">
              <span className="min-w-0 flex-1 truncate text-base text-(--ink)">
                {describeLocation(field.value)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchText(describeLocation(field.value));
                  field.onChange(undefined);
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) outline-none transition-[background-color,box-shadow] duration-200 ease-(--ease-flat) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
                aria-label={`Change ${label.toLowerCase()}`}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
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
          )}

          <FieldError message={errorMessage} />
        </div>
      )}
    />
  );
};

const HeroForm = ({ formRef, onSubmit, control, copy, errors }: HeroFormProps) => {
  const senderPhoneNumber = useWatch({ control, name: 'senderPhoneNumber' });
  const locationFrom = useWatch({ control, name: 'locationFrom' });

  const validateDistinctLocation = (
    value: OrderLocation | undefined,
  ): true | string => {
    if (!value || !locationFrom) return true;
    const same = locationFrom.placeId
      ? locationFrom.placeId === value.placeId
      : locationFrom.latitude === value.latitude &&
        locationFrom.longitude === value.longitude;
    return same ? 'Pickup and drop-off must be different places' : true;
  };

  const validateRecipientPhone = (value: string | undefined) => {
    const baseValidation = validateRwandanPhone(value);
    if (baseValidation !== true || !senderPhoneNumber) return baseValidation;

    const normalizedSender =
      validateAndFormatPhoneNumber(senderPhoneNumber).e164 ||
      senderPhoneNumber.trim();
    const normalizedRecipient =
      validateAndFormatPhoneNumber(value || '').e164 || (value || '').trim();

    return normalizedSender === normalizedRecipient
      ? 'Sender and recipient phone numbers must be different'
      : true;
  };

  return (
    <form
      id="hero-delivery-form"
      ref={formRef}
      onSubmit={onSubmit}
      className="home-scroll-target w-full max-w-[560px]"
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">{copy.formTitle}</legend>

        <LocationField
          name="locationFrom"
          control={control}
          label="Pickup location"
          placeholder="Where should we collect?"
          requiredMessage="Select a pickup location from the suggestions"
          errorMessage={errors.locationFrom?.message}
        />
        <LocationField
          name="locationTo"
          control={control}
          label="Drop-off location"
          placeholder="Where is it going?"
          requiredMessage="Select a drop-off location from the suggestions"
          errorMessage={errors.locationTo?.message}
          validate={validateDistinctLocation}
        />

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
      </fieldset>
    </form>
  );
};

export default HeroForm;
