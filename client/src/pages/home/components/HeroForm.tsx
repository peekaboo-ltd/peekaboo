import { useState, type BaseSyntheticEvent, type RefObject } from 'react';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { LocateFixed, Pencil, TriangleAlert } from 'lucide-react';
import type { HomeFormValues } from '../home.types';
import type { OrderLocation } from '@/types/order.type';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import {
  describeLocation,
  placeSearchResultToOrderLocation,
} from '@/utils/locations.util';
import type { GeolocationPickupState } from '@/hooks/locations/useGeolocationPickup';
import PlaceSearch from '@/components/inputs/PlaceSearch';
import TelInput from '@/components/inputs/TelInput';
import Button from '@/components/inputs/Button';
import Modal from '@/components/Modal';
import { FieldMessage } from '@/components/inputs/Field';
import { fieldErrorClassName } from '@/components/inputs/control';

export const HERO_DELIVERY_FORM_ID = 'hero-delivery-form';

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
  geolocation: GeolocationPickupState;
}

const validateRwandanPhone = (value: string | undefined) => {
  if (!value?.trim()) return 'Phone number is required';
  const result = validateAndFormatPhoneNumber(value);
  return result.isValid ? true : (result.error ?? 'Invalid phone number');
};

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <span className={`mt-1.5 ${fieldErrorClassName}`} role="alert">
      <TriangleAlert className="mt-[0.15em] size-3.5 shrink-0" aria-hidden="true" />
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
  geolocation?: GeolocationPickupState;
}

const LocationField = ({
  name,
  control,
  label,
  placeholder,
  requiredMessage,
  errorMessage,
  validate,
  geolocation,
}: LocationFieldProps) => {
  const [searchText, setSearchText] = useState('');
  const [confirmGeoOpen, setConfirmGeoOpen] = useState(false);
  const {
    pickupSource,
    setPickupSource,
    locationError,
    isLocating,
    useMyLocation: requestMyLocation,
    clearLocationError,
  } = geolocation ?? {};

  const handleUseMyLocation = async () => {
    setConfirmGeoOpen(false);
    await requestMyLocation?.();
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: requiredMessage, validate }}
      render={({ field }) => (
        <div>
          <label className="type-label mb-1.5 block" htmlFor={`hero-${name}`}>
            {label}
          </label>

          {field.value ? (
            <div className="flex h-10 items-center gap-3 rounded-(--radius-control) border border-(--line) bg-(--paper) pl-3.5 pr-1.5">
              <span className="min-w-0 flex-1 truncate text-sm text-(--ink)">
                {pickupSource === 'geolocation' && name === 'locationFrom'
                  ? field.value.name ||
                    field.value.formattedAddress ||
                    'Your location'
                  : describeLocation(field.value)}
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
                <Pencil className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <PlaceSearch
                value={searchText}
                onChange={setSearchText}
                onLocationSelect={(result) => {
                  setSearchText(result.formattedAddress || result.name);
                  clearLocationError?.();
                  if (name === 'locationFrom') {
                    setPickupSource?.('search');
                  }
                  field.onChange(placeSearchResultToOrderLocation(result));
                }}
                placeholder={placeholder}
                country="rw"
                className={geolocation ? '[&_input]:pr-10' : undefined}
                emptyOption={
                  geolocation
                    ? {
                        label: isLocating
                          ? 'Finding your current location…'
                          : 'Use current location',
                        description: 'Set your device location as pickup',
                        icon: (
                          <LocateFixed
                            className={`size-4 ${isLocating ? 'animate-pulse' : ''}`}
                          />
                        ),
                        disabled: isLocating,
                        onSelect: handleUseMyLocation,
                      }
                    : undefined
                }
              />
              {geolocation ? (
                <button
                  type="button"
                  onClick={() => setConfirmGeoOpen(true)}
                  disabled={isLocating}
                  className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-(--radius-control) text-(--muted) outline-none transition-[background-color,color,box-shadow] duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Use my current location"
                >
                  <LocateFixed
                    className={`size-4 ${isLocating ? 'animate-pulse' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              ) : null}
            </div>
          )}

          {geolocation ? (
            <FieldMessage errorMessage={locationError ?? undefined} />
          ) : null}
          <FieldError message={errorMessage} />

          {geolocation ? (
            <Modal
              isOpen={confirmGeoOpen}
              onClose={() => setConfirmGeoOpen(false)}
              heading="Use your current location?"
              description="We'll set where you are now as the pickup point. You can change it anytime."
            >
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmGeoOpen(false)}
                >
                  Type address instead
                </Button>
                <Button
                  type="button"
                  primary
                  onClick={handleUseMyLocation}
                  isLoading={isLocating}
                >
                  Use my location
                </Button>
              </div>
            </Modal>
          ) : null}
        </div>
      )}
    />
  );
};

const HeroForm = ({
  formRef,
  onSubmit,
  control,
  copy,
  errors,
  geolocation,
}: HeroFormProps) => {
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
      id={HERO_DELIVERY_FORM_ID}
      ref={formRef}
      onSubmit={onSubmit}
      className="home-scroll-target w-full"
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
          geolocation={geolocation}
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
