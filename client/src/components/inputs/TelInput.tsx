import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import PhoneInput, {
  type Country,
  type Value,
} from 'react-phone-number-input/max';
import { cn } from '@/lib/utils';
import {
  RWANDA_COUNTRY,
  SUPPORTED_PHONE_COUNTRY,
  validateAndFormatPhoneNumber,
} from '@/utils/phone.util';
import 'react-phone-number-input/style.css';
import './TelInput.css';

interface PhoneTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value?: string;
}

const PhoneTextField = forwardRef<HTMLInputElement, PhoneTextFieldProps>(
  ({ className, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      type="tel"
      inputMode="tel"
      className={cn('peekaboo-tel-number', className)}
    />
  ),
);

PhoneTextField.displayName = 'PhoneTextField';

interface RwandaCountrySelectProps {
  name?: string;
  value?: Country;
  onChange: (country?: Country) => void;
  'aria-label'?: string;
}

const RwandaCountrySelect = ({
  name,
  'aria-label': ariaLabel,
}: RwandaCountrySelectProps) => (
  <select
    name={name}
    aria-label={ariaLabel}
    title={`${RWANDA_COUNTRY.name} (${RWANDA_COUNTRY.code}) ${RWANDA_COUNTRY.dial_code}`}
    className="peekaboo-tel-country"
    value={SUPPORTED_PHONE_COUNTRY}
    disabled
  >
    <option value={SUPPORTED_PHONE_COUNTRY}>
      {RWANDA_COUNTRY.code} {RWANDA_COUNTRY.dial_code}
    </option>
  </select>
);

export interface TelInputProps {
  value?: string;
  onChange: (value: string) => void;
  label?: ReactNode;
  name?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  className?: string;
  labelClassName?: string;
  errorMessage?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const TelInput = forwardRef<HTMLInputElement, TelInputProps>(
  (
    {
      value,
      onChange,
      label,
      name,
      id,
      placeholder = 'Enter phone number',
      required = false,
      disabled = false,
      readOnly = false,
      autoComplete = 'tel',
      className,
      labelClassName,
      errorMessage,
      onBlur,
      onKeyDown,
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `tel-${generatedId}`;
    const errorId = `${inputId}-error`;
    const [hasInteracted, setHasInteracted] = useState(false);

    const liveError = useMemo(() => {
      if (!hasInteracted) return undefined;
      if (!value) return required ? 'Phone number is required' : undefined;

      const validation = validateAndFormatPhoneNumber(value);
      return validation.isValid ? undefined : validation.error;
    }, [hasInteracted, required, value]);

    const resolvedError = errorMessage || liveError;

    const handleChange = (nextValue?: Value) => {
      setHasInteracted(true);
      onChange(nextValue ?? '');
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setHasInteracted(true);
      onBlur?.(event);
    };

    return (
      <div className={cn('flex w-full flex-col gap-[5px]', labelClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="flex items-center gap-[5px] pl-1 text-[13px] text-[--ink]"
          >
            {label}
            {required ? <span className="text-[--ink]">*</span> : null}
          </label>
        ) : null}

        <PhoneInput
          // The package forwards this ref to its input at runtime, but its
          // country-select TypeScript declaration still describes a class ref.
          ref={ref as never}
          id={inputId}
          name={name}
          value={value || undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          countries={[SUPPORTED_PHONE_COUNTRY]}
          defaultCountry={SUPPORTED_PHONE_COUNTRY}
          addInternationalOption={false}
          countrySelectComponent={RwandaCountrySelect}
          countrySelectProps={{ disabled: true }}
          labels={{
            country: `${RWANDA_COUNTRY.name} (${RWANDA_COUNTRY.code}) ${RWANDA_COUNTRY.dial_code}`,
          }}
          inputComponent={PhoneTextField}
          placeholder={readOnly ? '' : placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(resolvedError)}
          aria-describedby={resolvedError ? errorId : undefined}
          className={cn(
            'peekaboo-tel-input',
            resolvedError && 'peekaboo-tel-input--invalid',
            disabled && 'peekaboo-tel-input--disabled',
            readOnly && 'peekaboo-tel-input--readonly',
            className,
          )}
        />

        {resolvedError ? (
          <span
            id={errorId}
            role="status"
            aria-live="polite"
            className="text-[11px] text-[--ink]"
          >
            {resolvedError}
          </span>
        ) : null}
      </div>
    );
  },
);

TelInput.displayName = 'TelInput';

export default TelInput;
