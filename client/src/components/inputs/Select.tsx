import { FieldError, FieldValues, FieldErrorsImpl, Merge } from "react-hook-form";
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  errorMessage?:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
}

const Select = ({
  label,
  name,
  placeholder = "Select an option",
  required,
  options,
  value,
  defaultValue,
  onValueChange,
  className,
  disabled,
  errorMessage,
}: SelectProps) => {
  return (
    <label className="w-full flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium">
          {label} {required && <span className="text-black">*</span>}
        </span>
      )}
      <SelectUI
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        disabled={disabled}
      >
        <SelectTrigger
          className={`py-[7px] px-4 font-normal w-full !text-[13px] cursor-pointer rounded-lg border-[1.5px] border-secondary border-opacity-50 outline-none focus:outline-none focus:border-[1.6px] focus:border-primary ease-in-out duration-50 ${className} ${
            errorMessage ? "border-red-500" : ""
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="cursor-pointer hover:bg-background !text-[13px]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectUI>
      {errorMessage && (
        <p className="text-sm text-black">{String(errorMessage)}</p>
      )}
    </label>
  );
};

export default Select;
