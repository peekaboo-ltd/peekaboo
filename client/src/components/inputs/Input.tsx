import {
  FieldError,
  FieldValues,
  FieldErrorsImpl,
  Merge,
} from 'react-hook-form';
import { Input as InputUI } from '../ui/input';
import CustomTooltip from './CustomTooltip';
import { SkeletonLoader } from './Loader';
import DatePicker, { DatePickerSelectionType } from './DatePicker';
import { ChangeEvent, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { cn } from '@/lib/utils';

export interface InputProps {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  errorMessage?:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
  labelClassName?: string;
  readOnly?: boolean;
  isLoading?: boolean;
  fromDate?: Date;
  toDate?: Date;
  selectionType?: DatePickerSelectionType;
  defaultValue?: string | Date;
}

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  value,
  onChange,
  onBlur,
  className,
  errorMessage,
  labelClassName,
  readOnly = false,
  isLoading = false,
  fromDate,
  toDate,
  selectionType,
  defaultValue,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = useMemo(() => {
    if (!isPassword) return type;
    return showPassword ? 'text' : 'password';
  }, [isPassword, showPassword, type]);

  if (['date'].includes(type)) {
    return (
      <label className={cn('flex flex-col gap-1 w-full', labelClassName)}>
        {label && (
          <span className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
            {label}
            {required && (
              <CustomTooltip
                label={`${label} is required`}
                labelClassName="text-[11px] bg-red-600"
              >
                <span className="text-red-500 cursor-pointer">*</span>
              </CustomTooltip>
            )}
          </span>
        )}
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

  return (
    <label className="w-full flex flex-col gap-1">
      {label && (
        <span className="text-[13px] font-normal text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5 text-[11px]">*</span>}
        </span>
      )}
      <span className="relative w-full">
        <InputUI
          className={cn(
            'h-9 w-full rounded-md border border-gray-200 px-3 py-2 text-[13px] placeholder:text-[12px] placeholder:font-light placeholder:text-gray-400 focus:border-primary-600 focus:ring-1 focus:ring-primary-600/20 focus:outline-none transition-colors duration-150',
            isPassword && 'pr-10',
            className
          )}
          type={inputType}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {isPassword && (
          <FontAwesomeIcon
            className="absolute cursor-pointer right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
            icon={showPassword ? faEyeSlash : faEye}
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
          />
        )}
      </span>
      {errorMessage && (
        <p className="text-[12px] text-red-600">{String(errorMessage)}</p>
      )}
    </label>
  );
};

export default Input;
