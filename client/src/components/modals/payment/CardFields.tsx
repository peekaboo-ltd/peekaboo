import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCcMastercard, faCcVisa } from '@fortawesome/free-brands-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/inputs/Input';
import type { PaymentFormValues } from './payment.types';

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
const CardFields = ({ control, errors }: CardFieldsProps) => (
  <>
    <Controller
      name="cardholderName"
      control={control}
      rules={{
        validate: (value) => {
          const trimmed = value?.trim() ?? '';
          if (!trimmed) return 'Cardholder name is required';
          if (trimmed.length < 2) return 'Enter the full name on the card';
          if (/\d/.test(trimmed)) return 'Cardholder name cannot contain numbers';
          return true;
        },
      }}
      render={({ field }) => (
        <Input
          {...field}
          label="Name on card"
          required
          placeholder="As printed on the card"
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
          if (!trimmed) return 'Email is required for card payments';
          return EMAIL_PATTERN.test(trimmed) ? true : 'Enter a valid email address';
        },
      }}
      render={({ field }) => (
        <Input
          {...field}
          type="email"
          label="Email for the receipt"
          required
          placeholder="you@example.com"
          autoComplete="email"
          errorMessage={errors.payerEmail?.message}
        />
      )}
    />

    <aside className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="flex items-start gap-2 text-xs leading-snug text-slate-600">
        <FontAwesomeIcon
          icon={faLock}
          className="mt-0.5 text-slate-400"
          aria-hidden="true"
        />
        <span>
          You'll be taken to UrubutoPay's secure page to enter your card details.
          Peekaboo never sees or stores your card number.
        </span>
      </p>
      <p className="mt-2 flex items-center gap-2 text-slate-400">
        <span className="sr-only">Accepted cards: Visa and Mastercard</span>
        <FontAwesomeIcon icon={faCcVisa} className="text-2xl" aria-hidden="true" />
        <FontAwesomeIcon icon={faCcMastercard} className="text-2xl" aria-hidden="true" />
      </p>
    </aside>
  </>
);

export default CardFields;
