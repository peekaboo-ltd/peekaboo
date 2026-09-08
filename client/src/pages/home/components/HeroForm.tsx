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
import { useI18n } from '@/i18n/i18n';

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
  const { t } = useI18n();
  const [searchText, setSearchText] = useState('');
  const [confirmGeoOpen, setConfirmGeoOpen] = useState(false);
  const {
    pickupSource,
    setPickupSource,
    locationError,
    activeTarget,
    isLocating: isLocatingAny,
    useMyLocation: requestMyLocation,
    clearLocationError,
  } = geolocation ?? {};

  // The hook serves both fields from one request, so only the field that
  // asked shows the pending state and any failure.
  const isLocating = isLocatingAny && activeTarget === name;
  const fieldLocationError = activeTarget === name ? locationError : null;

  const handleUseMyLocation = async () => {
    setConfirmGeoOpen(false);
    await requestMyLocation?.(name);
  };

  const isPickupField = name === 'locationFrom';
  const useCurrentLocationLabel = isPickupField
    ? t('home.form.pickupDeviceLocation')
    : t('home.form.dropoffDeviceLocation');

  const renderSelectedLocation = (location: OrderLocation) => {
    if (
      isPickupField &&
      pickupSource === 'geolocation' &&
      !location.name?.trim() &&
      !location.formattedAddress?.trim()
    ) {
      return t('home.form.yourLocation');
    }

    if (
      !isPickupField &&
      !location.name?.trim() &&
      !location.formattedAddress?.trim()
    ) {
      return t('home.form.yourLocation');
    }

    return describeLocation(location);
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
                {renderSelectedLocation(field.value)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchText(describeLocation(field.value));
                  field.onChange(undefined);
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) outline-none transition-[background-color,box-shadow] duration-200 ease-(--ease-flat) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
                aria-label={t('home.form.changeLocation', { label: label.toLowerCase() })}
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
                          ? t('home.form.findingLocation')
                          : t('home.form.useCurrentLocation'),
                        description: useCurrentLocationLabel,
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
                  aria-label={t('home.form.useLocation')}
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
            <FieldMessage errorMessage={fieldLocationError ?? undefined} />
          ) : null}
          <FieldError message={errorMessage} />

          {geolocation ? (
            <Modal
              isOpen={confirmGeoOpen}
              onClose={() => setConfirmGeoOpen(false)}
              heading={
                isPickupField
                  ? t('home.form.confirmPickupTitle')
                  : t('home.form.confirmDropoffTitle')
              }
              description={
                isPickupField
                  ? t('home.form.confirmPickupDescription')
                  : t('home.form.confirmDropoffDescription')
              }
            >
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmGeoOpen(false)}
                >
                  {t('home.form.typeAddress')}
                </Button>
                <Button
                  type="button"
                  primary
                  onClick={handleUseMyLocation}
                  isLoading={isLocating}
                >
                  {t('home.form.useLocation')}
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
  const { t } = useI18n();
  const senderPhoneNumber = useWatch({ control, name: 'senderPhoneNumber' });
  const locationFrom = useWatch({ control, name: 'locationFrom' });

  const validateRwandanPhone = (value: string | undefined) => {
    if (!value?.trim()) return t('common.phoneRequired');
    const result = validateAndFormatPhoneNumber(value);
    return result.isValid ? true : t('validation.invalidPhone');
  };

  const validateDistinctLocation = (
    value: OrderLocation | undefined,
  ): true | string => {
    if (!value || !locationFrom) return true;
    const same = locationFrom.placeId
      ? locationFrom.placeId === value.placeId
      : locationFrom.latitude === value.latitude &&
        locationFrom.longitude === value.longitude;
    return same ? t('home.form.locationsDifferent') : true;
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
      ? t('home.form.phonesDifferent')
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
          label={t('home.form.pickupLocation')}
          placeholder={t('home.form.pickupPlaceholder')}
          requiredMessage={t('home.form.pickupRequired')}
          errorMessage={errors.locationFrom?.message}
          geolocation={geolocation}
        />
        <LocationField
          name="locationTo"
          control={control}
          label={t('home.form.dropoffLocation')}
          placeholder={t('home.form.dropoffPlaceholder')}
          requiredMessage={t('home.form.dropoffRequired')}
          errorMessage={errors.locationTo?.message}
          validate={validateDistinctLocation}
          geolocation={geolocation}
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
