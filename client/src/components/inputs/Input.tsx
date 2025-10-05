import { FieldError, FieldValues, FieldErrorsImpl, Merge } from "react-hook-form";
import { Input as InputUI } from "../ui/input";

export interface InputProps {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  errorMessage?: | string
  | FieldError
  | Merge<FieldError, FieldErrorsImpl<FieldValues>>
  | undefined;
}

const Input = ({
  label,
  name,
  type,
  placeholder,
  required,
  onChange,
  className,
  errorMessage,
}: InputProps) => {
  return (
    <label className="w-full flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <InputUI
        className={`py-[7px] px-4 font-normal placeholder:!font-light  placeholder:text-[13px] text-[14px] flex items-center w-full rounded-lg border-[1.5px] border-secondary border-opacity-50 outline-none focus:outline-none focus:border-[1.6px] focus:border-primary ease-in-out duration-50 ${className}`}
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
      />
      {errorMessage && (
        <p className="text-sm text-red-500">{String(errorMessage)}</p>
      )}
    </label>
  );
};

export default Input;
