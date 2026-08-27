import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckedState } from '@radix-ui/react-checkbox';
import {
  ChangeEvent,
  forwardRef,
  LegacyRef,
  MouseEventHandler,
  ReactNode,
  useRef,
  useState,
} from 'react';
import { FieldValues, SetFieldValue } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Checkbox } from '../ui/checkbox';
import CustomTooltip from './CustomTooltip';
import DatePicker from './DatePicker';
import { SkeletonLoader } from './Loader';
import { toast } from 'sonner';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

/**
 * Props for the Input component
 * @interface InputProps
 */

/**
 * Label text or element to display above the input
 * @property {string | ReactNode} [label]
 */
export interface InputProps {
  label?: string | ReactNode;

  /**
   * Placeholder text to show when input is empty
   * @property {string} [placeholder]
   */
  placeholder?: string;

  /**
   * Additional CSS classes to apply to the input container
   * @property {string} [className]
   */
  className?: string;

  /**
   * Whether the input is required
   * @property {boolean} [required]
   */
  required?: boolean;

  /**
   * Callback fired when input value changes
   * @property {((e: ChangeEvent<HTMLInputElement>) => void) | undefined} [onChange]
   */
  onChange?: ((e: ChangeEvent<HTMLInputElement>) => void) | undefined;

  /**
   * Default value for the input
   * @property {string | number | Date} [defaultValue]
   */
  defaultValue?: string | number | Date;

  /**
   * Whether this input is part of a form submission
   * @property {boolean} [submit]
   */
  submit?: boolean;

  /**
   * Type of input (text, number, date, etc)
   * @property {string} [type]
   */
  type?: string;

  /**
   * Current value of the input
   * @property {string | number | readonly string[] | undefined} [value]
   */
  value?: string | number | Date | readonly string[] | undefined;

  /**
   * Icon to display after the input
   * @property {IconProp} [suffixIcon]
   */
  suffixIcon?: IconProp;

  /**
   * Icon to display before the input
   * @property {IconProp} [prefixIcon]
   */
  prefixIcon?: IconProp;

  /**
   * Click handler for suffix icon
   * @property {MouseEventHandler<HTMLAnchorElement> | undefined} [suffixIconHandler]
   */
  suffixIconHandler?: MouseEventHandler<HTMLAnchorElement> | undefined;

  /**
   * Name attribute for the input
   * @property {string} [name]
   */
  name?: string;

  /**
   * Whether to style suffix icon as primary
   * @property {boolean} [suffixIconPrimary]
   */
  suffixIconPrimary?: boolean;

  /**
   * Click handler for prefix icon
   * @property {MouseEventHandler<HTMLAnchorElement> | undefined} [prefixIconHandler]
   */
  prefixIconHandler?: MouseEventHandler<HTMLAnchorElement> | undefined;

  /**
   * Whether to style prefix icon as primary
   * @property {boolean} [prefixIconPrimary]
   */
  prefixIconPrimary?: boolean;

  /**
   * Text to display before the input
   * @property {string | ReactNode} [prefixText]
   */
  prefixText?: string | ReactNode;

  /**
   * Default checked state for checkbox/radio inputs
   * @property {CheckedState} [defaultChecked]
   */
  defaultChecked?: CheckedState;

  /**
   * Accepted file types for file inputs
   * @property {string} [accept]
   */
  accept?: string;

  /**
   * Minimum value for number inputs
   * @property {string | number} [min]
   */
  min?: string | number;

  /**
   * Whether the input is read-only
   * @property {boolean} [readOnly]
   */
  readOnly?: boolean;

  /**
   * Whether multiple files can be selected
   * @property {boolean} [multiple]
   */
  multiple?: boolean;

  /**
   * ID of the input
   * @property {string} [id]
   */
  id?: string;

  /**
   * Additional CSS classes for the label
   * @property {string} [labelClassName]
   */
  labelClassName?: string;

  /**
   * Whether this is a range input
   * @property {boolean} [range]
   */
  range?: boolean;

  /**
   * Start date for date range
   * @property {Date} [fromDate]
   */
  fromDate?: Date;

  /**
   * End date for date range
   * @property {Date} [toDate]
   */
  toDate?: Date;

  /**
   * Current checked state for checkbox/radio inputs
   * @property {CheckedState} [checked]
   */
  checked?: CheckedState;

  /**
   * Type of date selection
   * @property {'date' | 'month' | 'year' | 'recurringDate'} [selectionType]
   */
  selectionType?: 'date' | 'month' | 'year' | 'recurringDate';

  /**
   * Whether to show search icon suffix
   * @property {boolean} [showSearchSuffix]
   */
  showSearchSuffix?: boolean;

  /**
   * Callback fired on key press
   * @property {(e: React.KeyboardEvent<HTMLInputElement>) => void} [onKeyPress]
   */
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Whether the input is in a loading state
   * @property {boolean} [isLoading]
   */
  isLoading?: boolean;

  /**
   * Default country code for phone inputs
   * @property {string} [defaultCountryCode]
   */
  defaultCountryCode?: string;

  /**
   * Form setValue function from react-hook-form
   * @property {SetFieldValue<FieldValues>} [setValue]
   */
  setValue?: SetFieldValue<FieldValues>;

  /**
   * Input mode for mobile keyboards
   * @property {'text' | 'url' | 'tel' | 'email' | 'numeric' | 'decimal'} [inputMode]
   */
  inputMode?: 'text' | 'url' | 'tel' | 'email' | 'numeric' | 'decimal';

  /**
   * Pattern for input validation
   * @property {string} [pattern]
   */
  pattern?: string;

  /**
   * Step value for number inputs
   * @property {string} [step]
   */
  step?: string;

  /**
   * Callback fired when input loses focus
   * @property {(e: React.FocusEvent<HTMLInputElement>) => void} [onBlur]
   */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Browser autocomplete hint for this input.
   */
  autoComplete?: string;

  /**
   * Mobile text auto-capitalization behavior.
   */
  autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

  /**
   * Mobile/browser autocorrect behavior.
   */
  autoCorrect?: 'on' | 'off';

  /**
   * Browser spellcheck behavior.
   */
  spellCheck?: boolean;

  /**
   * Error message to display below the input
   * @property {string} [errorMessage]
   */
  errorMessage?: string;

  /**
   * When true and type is "password", shows a toggle to reveal/hide the password
   * @property {boolean} [showPasswordToggle]
   */
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label = undefined,
      placeholder,
      className,
      required = false,
      value,
      onChange,
      defaultValue,
      suffixIcon = undefined,
      suffixIconHandler,
      suffixIconPrimary = false,
      prefixIcon = undefined,
      prefixIconHandler,
      prefixText = undefined,
      defaultChecked = undefined,
      id,
      name,
      accept = 'application/pdf',
      min,
      readOnly = false,
      labelClassName = '',
      multiple = false,
      fromDate,
      toDate,
      checked,
      selectionType,
      showSearchSuffix = false,
      isLoading = false,
      inputMode = 'text',
      pattern,
      step,
      onBlur,
      autoComplete,
      autoCapitalize,
      autoCorrect,
      spellCheck,
      errorMessage,
      showPasswordToggle = false,
    },
    ref,
  ) => {
    const hiddenFileInput = useRef<HTMLButtonElement>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const isPasswordWithToggle =
      type === 'password' && showPasswordToggle;

    const validateFile = (file: File): boolean => {
      // If accept prop is provided, validate against it
      if (accept) {
        const acceptedTypes = accept
          .split(',')
          .map((a) => a.trim().toLowerCase());

        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const mimeType = file.type.toLowerCase();

        return (
          acceptedTypes.includes(mimeType) || acceptedTypes.includes(fileExt)
        );
      }

      // Default: only allow PDFs
      return (
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
      );
    };

    if (['checkbox', 'radio'].includes(type)) {
      if (['checkbox'].includes(type)) {
        return (
          <label className="flex w-fit items-center gap-2 text-sm">
            <Checkbox
              onCheckedChange={
                onChange as ((checked: CheckedState) => void) | undefined
              }
              name={name}
              value={value as unknown as string}
              checked={checked || !!value}
              defaultChecked={defaultChecked || !!value}
              className={`${
                value || defaultChecked || checked
                  ? 'data-[state=checked]:bg-(--ink) text-(--paper)'
                  : ''
              } size-5 cursor-pointer border-(--ink) outline-none duration-100`}
            />
            <p
              className={`${
                label ? 'flex' : 'hidden'
              } text-(--muted) text-sm`}
            >
              {label}
            </p>
          </label>
        );
      }
      return (
        <label className="flex items-center gap-2 text-sm">
          <input
            type={type}
            name={name}
            value={value as unknown as string}
            defaultChecked={defaultChecked as boolean}
            checked={checked as boolean}
            onChange={onChange}
            className={`size-5 cursor-pointer rounded-(--radius-pill) border border-(--ink) accent-(--ink) outline-none duration-100 ${className}`}
          />
          <p className={`${label ? 'flex' : 'hidden'} text-sm`}>{label}</p>
        </label>
      );
    }

    if (type === 'file') {
      const handleClick = () => {
        hiddenFileInput.current?.click();
      };
      return (
        <>
          {isLoading ? (
            <SkeletonLoader type="button" />
          ) : (
            <menu className="text-sm w-fit">
              <button
                type="button"
                onClick={handleClick}
                disabled={readOnly}
                className={`inline-flex h-(--control-md) w-full cursor-pointer items-center justify-center rounded-(--radius-control) bg-(--ink) px-4 text-sm font-medium text-(--paper) outline-none transition-[background-color,color,box-shadow] duration-200 ease-(--ease-flat) active:shadow-[var(--press-on-ink)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] ${
                  readOnly &&
                  'cursor-not-allowed bg-(--surface) text-(--disabled-fg)'
                } ${className}`}
              >
                {placeholder || 'Choose file'}
                {multiple ? 's' : ''} {required}
              </button>
              <input
                ref={hiddenFileInput as LegacyRef<HTMLInputElement> | undefined}
                type={type}
                multiple={multiple}
                accept={accept}
                readOnly={readOnly}
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;

                  let valid = true;
                  Array.from(files).forEach((file) => {
                    if (!validateFile(file)) {
                      toast.error(
                        `Invalid file: ${file.name}. Please upload a valid PDF file.`,
                      );
                      valid = false;
                    }
                  });

                  if (valid && onChange) {
                    onChange(e);
                  } else {
                    e.target.value = ''; // reset invalid selection
                  }
                }}
                className="hidden"
              />
            </menu>
          )}
        </>
      );
    }

    if (['date'].includes(type)) {
      return (
        <label className={`flex w-full flex-col gap-1.5 ${labelClassName}`}>
          <p
            className={`${
              label ? 'type-label flex items-center gap-1.5' : 'hidden'
            }`}
          >
            {label}{' '}
            {required && (
              <CustomTooltip
                label={required ? `${label} is required` : ''}
                labelClassName="bg-(--surface) text-sm"
              >
                <span className="text-(--ink) cursor-pointer">*</span>
              </CustomTooltip>
            )}
          </p>
          {isLoading ? (
            <SkeletonLoader type="input" />
          ) : (
            <DatePicker
              disabled={readOnly}
              placeholder={placeholder}
              fromDate={fromDate}
              toDate={toDate}
              selectionType={selectionType}
              onChange={
                onChange as
                  | ((e: Date | ChangeEvent<HTMLInputElement>) => void)
                  | undefined
              }
              value={(value || defaultValue) as Date | undefined}
            />
          )}
        </label>
      );
    }

    const resolvedValue =
      (value as string | number | readonly string[] | undefined) ?? undefined;

    return (
      <label className={`flex w-full flex-col gap-1.5 ${labelClassName}`}>
        <p
          className={`${
            label ? 'type-label flex items-center gap-1.5' : 'hidden'
          }`}
        >
          {label}{' '}
          {required && (
            <CustomTooltip
              label={required ? `${label} is required` : ''}
              labelClassName="bg-(--surface) text-sm"
            >
              <span className="text-(--ink) cursor-pointer">*</span>
            </CustomTooltip>
          )}
        </p>

        <section className="relative w-full">
          {prefixIcon || prefixText ? (
            <label className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <Link
                to={'#'}
                onClick={prefixIconHandler}
                className="text-(--muted)"
              >
                {prefixIcon && (
                  <FontAwesomeIcon className="text-current" icon={prefixIcon} />
                )}
                {prefixText && <p className="text-sm">{prefixText}</p>}
              </Link>
            </label>
          ) : null}

          {(suffixIcon || showSearchSuffix) && (
            <Link
              to={'#'}
              onClick={suffixIconHandler}
              className={`absolute inset-y-0 end-0 flex items-center rounded-e-(--radius-control) px-3.5 text-sm outline-none transition-[background-color,color] duration-200 ease-(--ease-flat) ${
                suffixIconPrimary
                  ? 'bg-(--ink) text-(--paper) active:shadow-[var(--press-on-ink)_999px_999px_0_inset]'
                  : 'border-s border-(--line) bg-(--paper) text-(--muted) hover:text-(--ink)'
              }`}
            >
              <FontAwesomeIcon icon={suffixIcon || faSearch} />
            </Link>
          )}

          {isLoading ? (
            <SkeletonLoader type="input" />
          ) : (
            <input
              id={id}
              defaultValue={defaultValue as string}
              value={resolvedValue}
              type={isPasswordWithToggle ? (passwordVisible ? 'text' : 'password') : type || 'text'}
              min={type === 'number' ? 0 : min}
              readOnly={readOnly}
              name={name}
              ref={ref}
              onBlur={onBlur}
              onChange={onChange}
              placeholder={readOnly ? '' : placeholder}
              inputMode={inputMode}
              pattern={pattern}
              step={step}
              autoComplete={autoComplete}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              spellCheck={spellCheck}
              aria-invalid={Boolean(errorMessage)}
              className={`h-10 px-3.5 py-0 font-normal placeholder:text-sm placeholder:text-(--muted) text-sm text-(--ink) flex items-center w-full rounded-(--radius-control) border border-(--line) bg-(--paper) outline-none focus:outline-none hover:border-(--line-strong) focus:border-(--ink) focus:shadow-[var(--ink)_0_0_0_1px_inset] aria-invalid:border-(--ink) aria-invalid:shadow-[var(--ink)_0_0_0_1px_inset] transition-[border-color,box-shadow] duration-200 ease-(--ease-flat) ${className} ${prefixIcon && 'ps-10'} ${prefixText ? 'ps-[3.6rem]' : ''} ${isPasswordWithToggle ? 'pe-10' : ''} ${ readOnly && 'cursor-default border-transparent bg-(--surface) text-(--disabled-fg) hover:border-transparent focus:border-transparent focus:shadow-none' }`}
            />
          )}

          {isPasswordWithToggle && (
            <button
              type="button"
              onClick={() => setPasswordVisible((v) => !v)}
              className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-(--muted) hover:text-(--ink) focus:outline-none"
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              <FontAwesomeIcon
                icon={passwordVisible ? faEyeSlash : faEye}
                className="h-4 w-4 cursor-pointer"
              />
            </button>
          )}

          {showSearchSuffix && (
            <button
              onClick={
                suffixIconHandler as unknown as MouseEventHandler<HTMLButtonElement>
              }
              className="absolute top-0 right-0 flex h-full cursor-pointer items-center rounded-r-(--radius-control) bg-(--ink) px-4 text-sm font-medium text-(--paper) transition-[background-color] duration-200 ease-(--ease-flat) active:shadow-[var(--press-on-ink)_999px_999px_0_inset]"
            >
              Search
            </button>
          )}
        </section>
        {errorMessage && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-(--ink)" role="alert">
            <FontAwesomeIcon icon={faTriangleExclamation} className="size-3 shrink-0" aria-hidden="true" />
            {errorMessage}
          </p>
        )}
      </label>
    );
  },
);

Input.displayName = 'Input';

export default Input;
