import { useState, type BaseSyntheticEvent, type RefObject } from 'react';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { Check, Pencil, TriangleAlert } from 'lucide-react';
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

interface LocationFieldProps {
  name: 'locationFrom' | 'locationTo';
  control: Control<HomeFormValues>;
  label: string;
  placeholder: string;
  requiredMessage: string;
  errorMessage?: string;
  validate?: (value: OrderLocation | undefined) => true | string;
  destination?: boolean;
}

const LocationField = ({
  name,
  control,
  label,
  placeholder,
  requiredMessage,
  errorMessage,
  validate,
  destination = false,
}: LocationFieldProps) => {
  const [searchText, setSearchText] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: requiredMessage, validate }}
      render={({ field }) => (
        <div className="relative pl-12">
          <span
            className={`absolute left-[18px] top-[26px] z-10 block size-2 bg-[--ink] ${
              destination ? 'rounded-none' : 'rounded-[--radius-pill]'
            }`}
            aria-hidden="true"
          />
          <span className="sr-only">{label}</span>
          {field.value ? (
            <div className="flex h-14 items-center gap-3 pr-4">
              <Check className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-base">
                {describeLocation(field.value)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchText(describeLocation(field.value));
                  field.onChange(undefined);
                }}
                className="flex size-9 items-center justify-center rounded-[--radius-control] outline-none transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:bg-[--surface-hover] active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
                aria-label={`Edit ${label.toLowerCase()}`}
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
              className="[&_input]:h-14 [&_input]:rounded-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:text-base [&_input]:shadow-none [&_input]:focus:shadow-none"
            />
          )}
          {errorMessage ? (
            <span className="flex items-center gap-2 pb-3 text-[0.8125rem] text-[--ink]" role="alert">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              {errorMessage}
            </span>
          ) : null}
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
      className="home-scroll-target w-full max-w-[620px] space-y-4"
    >
      <fieldset>
        <legend className="sr-only">Delivery route</legend>
        <div className="relative overflow-hidden rounded-[--radius-control] bg-[--surface]">
          <span
            className="absolute left-[21px] top-7 bottom-7 w-px bg-[--line-strong]"
            aria-hidden="true"
          />
          <div className="border-b border-[--line]">
            <LocationField
              name="locationFrom"
              control={control}
              label="Pickup location"
              placeholder="Pickup location"
              requiredMessage="Select a pickup location from the suggestions"
              errorMessage={errors.locationFrom?.message}
            />
          </div>
          <LocationField
            name="locationTo"
            control={control}
            label="Drop-off location"
            placeholder="Drop-off location"
            requiredMessage="Select a drop-off location from the suggestions"
            errorMessage={errors.locationTo?.message}
            validate={validateDistinctLocation}
            destination
          />
        </div>
      </fieldset>

      <details open className="rounded-[--radius-control] border border-[--line] px-4 py-3 open:pb-4">
        <summary className="cursor-pointer text-sm font-medium">
          {copy.formTitle}
          <span className="ml-2 font-normal text-[--muted]">{copy.formSubtitle}</span>
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                className="!min-h-14"
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
                className="!min-h-14"
              />
            )}
          />
        </div>
      </details>
    </form>
  );
};

export default HeroForm;
