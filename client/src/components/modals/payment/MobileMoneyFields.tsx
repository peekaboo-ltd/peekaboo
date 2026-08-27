import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import TelInput from '@/components/inputs/TelInput';
import {
  detectRwandaMobileNetwork,
  validateAndFormatPhoneNumber,
} from '@/utils/phone.util';
import { PaymentChannel } from '@/types/payment.types';
import type { PaymentFormValues, PayerType } from './payment.types';

interface MobileMoneyFieldsProps {
  control: Control<PaymentFormValues>;
  errors: FieldErrors<PaymentFormValues>;
  channelName: PaymentChannel;
  payerType: PayerType;
  senderLabel?: string;
  recipientLabel?: string;
  /** Phone that will actually be charged, whoever the payer is. */
  payerPhone?: string;
  /** Set at submit time for payers whose number comes from the order. */
  payerPhoneError?: string;
}

const expectedNetwork = (channel: PaymentChannel) =>
  channel === PaymentChannel.AIRTEL_MONEY ? 'AIRTEL' : 'MTN';

const networkLabels = { MTN: 'MTN', AIRTEL: 'Airtel' } as const;

const payerOptions: Array<{ value: PayerType; label: string }> = [
  { value: 'sender', label: 'Sender' },
  { value: 'recipient', label: 'Recipient' },
  { value: 'other', label: 'Other' },
];

const MobileMoneyFields = ({
  control,
  errors,
  channelName,
  payerType,
  senderLabel,
  recipientLabel,
  payerPhone,
  payerPhoneError,
}: MobileMoneyFieldsProps) => {
  const detected = detectRwandaMobileNetwork(payerPhone);
  const expected = expectedNetwork(channelName);
  // Rwanda has number portability, so a mismatch is a nudge, never a blocker.
  const showNetworkWarning = Boolean(detected) && detected !== expected;

  const optionLabel = (value: PayerType) => {
    if (value === 'sender' && senderLabel) return `Sender (${senderLabel})`;
    if (value === 'recipient' && recipientLabel) return `Recipient (${recipientLabel})`;
    return payerOptions.find((option) => option.value === value)?.label ?? '';
  };

  return (
    <>
      <Controller
        name="payerType"
        control={control}
        render={({ field }) => (
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">Who is paying?</legend>
            {payerOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={field.value === option.value}
                  onChange={() => field.onChange(option.value)}
                  onBlur={field.onBlur}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm">{optionLabel(option.value)}</span>
              </label>
            ))}
          </fieldset>
        )}
      />

      {payerType !== 'other' && payerPhoneError ? (
        <p className="text-sm text-(--ink)">{payerPhoneError}</p>
      ) : null}

      {payerType === 'other' && (
        <Controller
          name="customPhone"
          control={control}
          rules={{
            validate: (value) => {
              const result = validateAndFormatPhoneNumber(value ?? '');
              if (!result.isValid) {
                return result.error ?? 'Enter a valid Rwandan phone number';
              }
              if (result.type !== 'MOBILE') {
                return 'Enter a Rwandan mobile number for mobile money';
              }
              return true;
            },
          }}
          render={({ field }) => (
            <TelInput
              {...field}
              id="customPhone"
              label="Phone number to charge"
              required
              placeholder="0788 123 456"
              errorMessage={errors.customPhone?.message}
            />
          )}
        />
      )}

      {showNetworkWarning && detected ? (
        <p className="text-xs font-normal leading-snug text-(--ink)">
          This number looks like {networkLabels[detected]}, but you selected{' '}
          {networkLabels[expected]}. Continue if it is registered with{' '}
          {networkLabels[expected]}.
        </p>
      ) : null}

      <Controller
        name="fallbackPhone"
        control={control}
        rules={{
          validate: (value) => {
            if (!value?.trim()) return true;
            const result = validateAndFormatPhoneNumber(value);
            return result.isValid
              ? true
              : (result.error ?? 'Enter a valid Rwandan phone number');
          },
        }}
        render={({ field }) => (
          <TelInput
            {...field}
            id="fallbackPhone"
            label="Fallback contact number (optional)"
            placeholder="0788 123 456"
            errorMessage={errors.fallbackPhone?.message}
          />
        )}
      />
    </>
  );
};

export default MobileMoneyFields;
