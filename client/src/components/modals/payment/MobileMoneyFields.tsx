import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import TelInput from '@/components/inputs/TelInput';
import {
  detectRwandaMobileNetwork,
  validateAndFormatPhoneNumber,
} from '@/utils/phone.util';
import { PaymentChannel } from '@/types/payment.types';
import type { PaymentFormValues, PayerType } from './payment.types';
import { FieldMessage } from '@/components/inputs/Field';
import { useI18n } from '@/i18n/i18n';

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

const payerTypes: PayerType[] = ['sender', 'recipient', 'other'];

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
  const { t } = useI18n();
  const detected = detectRwandaMobileNetwork(payerPhone);
  const expected = expectedNetwork(channelName);
  // Rwanda has number portability, so a mismatch is a nudge, never a blocker.
  const showNetworkWarning = Boolean(detected) && detected !== expected;

  const optionLabel = (value: PayerType) => {
    const role = t(`orderPayment.payer.${value}`);
    if (value === 'sender' && senderLabel) return t('orderPayment.payer.named', { role, name: senderLabel });
    if (value === 'recipient' && recipientLabel) return t('orderPayment.payer.named', { role, name: recipientLabel });
    return role;
  };

  return (
    <>
      <Controller
        name="payerType"
        control={control}
        render={({ field }) => (
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-normal">{t('orderPayment.payerQuestion')}</legend>
            {payerTypes.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={field.value === option}
                  onChange={() => field.onChange(option)}
                  onBlur={field.onBlur}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm">{optionLabel(option)}</span>
              </label>
            ))}
          </fieldset>
        )}
      />

      {payerType !== 'other' && payerPhoneError ? (
        <FieldMessage errorMessage={payerPhoneError} />
      ) : null}

      {payerType === 'other' && (
        <Controller
          name="customPhone"
          control={control}
          rules={{
            validate: (value) => {
              const result = validateAndFormatPhoneNumber(value ?? '');
              if (!result.isValid) {
                return result.error ?? t('orderPayment.invalidPhone');
              }
              if (result.type !== 'MOBILE') {
                return t('orderPayment.mobilePhone');
              }
              return true;
            },
          }}
          render={({ field }) => (
            <TelInput
              {...field}
              id="customPhone"
              label={t('orderPayment.phoneToCharge')}
              required
              placeholder="0788 123 456"
              errorMessage={errors.customPhone?.message}
            />
          )}
        />
      )}

      {showNetworkWarning && detected ? (
        <p className="text-xs font-normal leading-snug text-(--ink)">
          {t('orderPayment.networkWarning', {
            detected: networkLabels[detected],
            expected: networkLabels[expected],
          })}
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
              : (result.error ?? t('orderPayment.invalidPhone'));
          },
        }}
        render={({ field }) => (
          <TelInput
            {...field}
            id="fallbackPhone"
            label={t('orderPayment.fallbackPhone')}
            placeholder="0788 123 456"
            errorMessage={errors.fallbackPhone?.message}
          />
        )}
      />
    </>
  );
};

export default MobileMoneyFields;
