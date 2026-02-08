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
      <label className={`flex flex-col gap-[5px] w-full ${labelClassName}`}>
        <p
          className={`${
            label ? 'flex items-center gap-[5px] text-[14px]' : 'hidden'
          }`}
        >
          {label}{' '}
          {required && (
            <CustomTooltip
              label={required ? `${label} is required` : ''}
              labelClassName="text-[12px] bg-red-600"
            >
              <span className="text-red-600 cursor-pointer">*</span>
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

  return (
    <label className="w-full flex flex-col gap-1">
      {label && (
        <span className="text-sm font-normal">
          {label}{' '}
          {required && <span className="text-red-700 text-[12px]">*</span>}
        </span>
      )}
      <span className="relative w-full">
        <InputUI
          className={`!py-[8px] focus:!outline-1 h-10 !px-4 ${isPassword ? '!pr-12' : ''} font-normal placeholder:!font-light placeholder:text-[13px] text-[14px] flex items-center w-full rounded-lg border-[1.5px] border-secondary border-opacity-50 outline-none focus:outline-none focus:border-[1.1px] focus:border-primary ease-in-out duration-50 ${className}`}
          type={inputType}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {isPassword && (
          <>
            <FontAwesomeIcon
              className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              icon={showPassword ? faEyeSlash : faEye}
              onClick={(e) => {
                e.preventDefault();
                setShowPassword((prev) => !prev);
              }}
            />
          </>
        )}
      </span>
      {errorMessage && (
        <p className="text-sm text-red-700">{String(errorMessage)}</p>
      )}
    </label>
  );
};

export default Input;
