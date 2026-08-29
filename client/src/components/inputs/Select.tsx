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
import useDebounce from '@/hooks/common/debounce.hooks';
import { SkeletonLoader } from './Loader';
import { cn } from '@/lib/utils';
import { controlClassName } from './control';
import { FieldShell } from './Field';
import {
  selectEmptyClassName,
  selectListItemHintClassName,
} from '@/components/ui/select-options';

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
    hint?: string;
  }>;
  defaultValue?: string | undefined;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  onChange?: ((value: string) => void) | undefined;
  value?: string | undefined;
  required?: boolean;
  labelClassName?: string | undefined;
  name?: string | undefined;
  searchable?: boolean;
  readOnly?: boolean;
  isLoading?: boolean;
  /** Helper text under the control. An error message replaces it. */
  description?: string;
  errorMessage?: string;
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
      searchPlaceholder = 'Search...',
      className = undefined,
      value = '',
      onChange,
      isLoading = false,
      description,
      errorMessage,
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
      onChange?.(selectedValue);
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
      <FieldShell
        label={label}
        required={required}
        description={description}
        errorMessage={errorMessage}
        className={labelClassName}
      >
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
              aria-invalid={Boolean(errorMessage)}
              className={cn('w-full justify-between text-left', className)}
            >
              <SelectValue className="truncate" placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className="p-0">
              <section className="flex w-full min-w-[14rem] max-h-[75vh] flex-col gap-2">
                {searchable ? (
                  <fieldset className="w-full shrink-0">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      onKeyDown={(event) => {
                        if (!RADIX_NAVIGATION_KEYS.has(event.key)) {
                          event.stopPropagation();
                        }
                      }}
                      placeholder={searchPlaceholder}
                      aria-label={label ? `Search ${label}` : 'Search options'}
                      autoComplete="off"
                    className={cn(controlClassName, 'h-(--control-sm) border-none !border-b border-(--line) focus:!outline-none focus:ring-0 focus:!border-b-ink w-full text-sm')}
                    />
                  </fieldset>
                ) : null}

                <nav
                  className="flex w-full flex-col overflow-y-auto rounded-md bg-(--paper) py-2"
                  style={{ maxHeight: searchable ? 'calc(55vh - 50px)' : 'calc(55vh - 12px)' }}
                  aria-label={label ? `${label} options` : 'Select options'}
                >
                  <SelectGroup className="flex flex-col gap-1">
                    {filteredOptions.length === 0 ? (
                      <p className={selectEmptyClassName}>No matches found</p>
                    ) : (
                      filteredOptions.map((option, index) => (
                        <SelectItem
                          ref={ref}
                          key={`${option.value}-${index}`}
                          value={option.value}
                          disabled={option?.disabled || readOnly}
                        >
                          <span className="truncate">{option?.label}</span>
                          {option.hint ? (
                            <span className={selectListItemHintClassName}>
                              {option.hint}
                            </span>
                          ) : null}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </nav>
              </section>
            </SelectContent>
          </SelectComponent>
        )}
      </FieldShell>
    );
  }
);

Select.displayName = 'Select';

export default Select;
