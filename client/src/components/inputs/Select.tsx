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

const RADIX_NAVIGATION_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'Home',
  'End',
  'Enter',
  'Escape',
  'Tab',
]);

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
    const [isOpen, setIsOpen] = useState(false);
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

    // Radix focuses the selected item when the list opens and again as the list
    // re-renders, so the search input has to reclaim focus after each of those.
    useEffect(() => {
      if (!searchable || !isOpen) return;
      const frame = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }, [debouncedSearchTerm, isOpen, searchable]);

    return (
      <label className={`flex flex-col gap-1 w-full ${labelClassName}`}>
        <p className={label ? 'flex items-center gap-1 text-[13px]' : 'hidden'}>
          {label}{' '}
          <CustomTooltip
            label={required ? `${label} is required` : ''}
            labelClassName="text-[13px] bg-[--surface]"
          >
            <span className={required ? `text-[--ink] cursor-pointer` : 'hidden'}>*</span>
          </CustomTooltip>
        </p>
        {isLoading ? (
          <SkeletonLoader type="input" />
        ) : (
          <SelectComponent
            onValueChange={handleValueChange}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) setSearchTerm('');
            }}
            defaultValue={defaultValue}
            value={value}
            name={name}
          >
            <SelectTrigger
              size="sm"
              className={`w-full ${className}`}
            >
              <SelectValue
                className="!text-[10px] truncate"
                placeholder={
                  <p className="text-[13px] text-[--muted] truncate">{placeholder}</p>
                }
              />
            </SelectTrigger>
            <SelectContent>
              {searchable ? (
                <search className="sticky top-0 z-10 -mt-1 bg-[--surface] pb-2 pt-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // Radix runs its own typeahead on keydown and would swallow
                    // the keystrokes, but it still owns list navigation and
                    // closing, so those keys are left to bubble.
                    onKeyDown={(e) => {
                      if (!RADIX_NAVIGATION_KEYS.has(e.key)) {
                        e.stopPropagation();
                      }
                    }}
                    placeholder="Search..."
                    aria-label={label ? `Search ${label}` : 'Search options'}
                    autoComplete="off"
                    className="h-11 w-full rounded-[--radius-control] border-0 bg-[--paper] px-3 text-[13px] outline-none placeholder:text-[--muted] focus:shadow-[var(--ink)_0_0_0_2px_inset]"
                  />
                </search>
              ) : null}
              <SelectGroup>
                {filteredOptions.length === 0 ? (
                  <p className="px-2 py-3 text-center text-[13px] text-[--muted]">
                    No matches found
                  </p>
                ) : (
                  filteredOptions.map((option, index: number) => {
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
                  })
                )}
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
