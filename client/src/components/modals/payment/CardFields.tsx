import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCcMastercard, faCcVisa } from '@fortawesome/free-brands-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/inputs/Input';
import type { PaymentFormValues } from './payment.types';
import { useI18n } from '@/i18n/i18n';

interface CardFieldsProps {
  control: Control<PaymentFormValues>;
  errors: FieldErrors<PaymentFormValues>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * UrubutoPay handles card entry on its own hosted page, so the card number,
 * expiry and CVV are never entered here. We only collect what the gateway needs
 * to open that page and issue a receipt.
 */
const CardFields = ({ control, errors }: CardFieldsProps) => {
  const { t } = useI18n();
  return (
  <>
    <Controller
      name="cardholderName"
      control={control}
      rules={{
        validate: (value) => {
          const trimmed = value?.trim() ?? '';
          if (!trimmed) return t('orderPayment.cardholderRequired');
          if (trimmed.length < 2) return t('orderPayment.cardholderFull');
          if (/\d/.test(trimmed)) return t('orderPayment.cardholderNumbers');
          return true;
        },
      }}
      render={({ field }) => (
        <Input
          {...field}
          label={t('orderPayment.cardholder')}
          required
          placeholder={t('orderPayment.cardholderPlaceholder')}
          autoComplete="cc-name"
          errorMessage={errors.cardholderName?.message}
        />
      )}
    />

    <Controller
      name="payerEmail"
      control={control}
      rules={{
        validate: (value) => {
          const trimmed = value?.trim() ?? '';
          if (!trimmed) return t('orderPayment.emailRequired');
          return EMAIL_PATTERN.test(trimmed) ? true : t('publicOrder.emailInvalid');
        },
      }}
      render={({ field }) => (
        <Input
          {...field}
          type="email"
          label={t('orderPayment.receiptEmail')}
          required
          placeholder="you@example.com"
          autoComplete="email"
          errorMessage={errors.payerEmail?.message}
        />
      )}
    />

    <aside className="rounded-md bg-(--surface) p-3">
      <p className="flex items-start gap-2 text-xs leading-snug text-(--muted)">
        <FontAwesomeIcon
          icon={faLock}
          className="mt-0.5 text-(--muted)"
          aria-hidden="true"
        />
        <span>
          {t('orderPayment.cardSecurity')}
        </span>
      </p>
      <p className="mt-2 flex items-center gap-2 text-(--muted)">
        <span className="sr-only">{t('orderPayment.acceptedCards')}</span>
        <FontAwesomeIcon icon={faCcVisa} className="text-2xl" aria-hidden="true" />
        <FontAwesomeIcon icon={faCcMastercard} className="text-2xl" aria-hidden="true" />
      </p>
    </aside>
  </>
  );
};

export default CardFields;
