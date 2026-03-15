import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UUID } from 'crypto';
import { useState, useRef, useEffect, forwardRef } from 'react';
import CustomTooltip from './CustomTooltip';
import useDebounce from '@/hooks/common/debounce.hooks';
import { SkeletonLoader } from './Loader';

interface SelectProps {
  label?: string | number | undefined;
  options?: Array<{
    label: string | undefined;
    value: string | UUID;
    disabled?: boolean;
  }>;
  defaultValue?: string | undefined;
  placeholder?: string;
  className?: string;
  onChange?: ((value: string) => void) | undefined;
  value?: string | undefined;
  required?: boolean;
  labelClassName?: string | undefined;
  name?: string | undefined;
  searchable?: boolean;
  readOnly?: boolean;
  isLoading?: boolean;
}

const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      label = undefined,
      required = false,
      labelClassName = undefined,
      name = undefined,
      searchable = false,
      readOnly = false,
      options = [],
      defaultValue = undefined,
      placeholder = 'Select here...',
      className = undefined,
      value = '',
      onChange,
      isLoading = false,
    },
    ref
  ) => {

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = searchable
      ? options.filter((option) =>
          option.label
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
        )
      : options;

    const handleValueChange = (selectedValue: string) => {
      if (onChange) {
        onChange(selectedValue);
      }
      setSearchTerm('');
    };

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [debouncedSearchTerm]);

    return (
      <label className={`flex flex-col gap-1 w-full ${labelClassName}`}>
        <p className={label ? 'flex items-center gap-1 text-[13px]' : 'hidden'}>
          {label}{' '}
          <CustomTooltip
            label={required ? `${label} is required` : ''}
            labelClassName="text-[13px] bg-red-600"
          >
            <span className={required ? `text-red-600 cursor-pointer` : 'hidden'}>*</span>
          </CustomTooltip>
        </p>
        {isLoading ? (
          <SkeletonLoader type="input" />
        ) : (
          <SelectComponent
            onValueChange={handleValueChange}
            defaultValue={defaultValue}
            value={value}
            name={name}
          >
            <SelectTrigger
              className={`w-full focus:ring-transparent ring-0 h-10 ${className}`}
            >
              <SelectValue
                className="!text-[10px] truncate"
                placeholder={
                  <p className="text-[13px] text-gray-500 truncate">{placeholder}</p>
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {filteredOptions.map((option, index: number) => {
                  return (
                    <SelectItem
                      ref={ref}
                      key={index}
                      value={option.value}
                      disabled={option?.disabled || readOnly}
                      className="cursor-pointer text-[13px] py-1 hover:bg-background"
                    >
                      <p className="text-[13px] py-[3px] truncate">{option?.label}</p>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </SelectComponent>
        )}
      </label>
    );
  }
);

Select.displayName = 'Select';

export default Select;
