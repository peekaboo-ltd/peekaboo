import { Command } from 'cmdk';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { cn } from '@/lib/utils';
import {
  controlClassName,
  readOnlyControlClassName,
} from '@/components/inputs/control';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  selectEmptyClassName,
  selectListItemCheckClassName,
  selectListItemClassName,
  selectListItemHintClassName,
  selectSearchInputClassName,
  selectSearchRowClassName,
  type SelectOption,
} from './select-options';

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search options',
  emptyText = 'No matching options',
  id,
  invalid,
  disabled,
  readOnly,
  ariaLabel,
  triggerLabel,
  triggerClassName,
  contentClassName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  ariaLabel?: string;
  /** Replaces the selected option label in the trigger, for compact controls. */
  triggerLabel?: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const isLocked = disabled || readOnly;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (isLocked) return;
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            controlClassName,
            'flex cursor-pointer items-center justify-between gap-2 px-3 text-left',
            !selected && !triggerLabel && 'text-(--muted)',
            readOnly && readOnlyControlClassName,
            isLocked && 'cursor-not-allowed',
            triggerClassName,
          )}
        >
          <span className="truncate">
            {triggerLabel ?? selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-(--muted)" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={5}
        className={cn(
          'z-[10000] w-(--radix-popover-trigger-width) overflow-hidden p-1',
          contentClassName,
        )}
      >
        {/* A dialog's scroll lock swallows wheel events over content portalled
            outside it, which leaves this list unscrollable by pointer.
            Registering the list's own lock exempts it, without the focus trap
            that Popover's `modal` would add — that fights the dialog's own trap
            and pulls focus back out of the search field. */}
        <RemoveScroll allowPinchZoom removeScrollBar={false}>
          <Command>
            <div className={selectSearchRowClassName}>
              <Search
                className="size-3.5 shrink-0 text-(--muted)"
                aria-hidden="true"
              />
              <Command.Input
                autoFocus
                placeholder={searchPlaceholder}
                className={selectSearchInputClassName}
              />
            </div>
            <Command.List className="max-h-60 overflow-y-auto overscroll-contain">
              <Command.Empty className={selectEmptyClassName}>
                {emptyText}
              </Command.Empty>
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={
                    option.label +
                    ' ' +
                    option.value +
                    (option.hint ? ' ' + option.hint : '')
                  }
                  disabled={option.disabled}
                  onSelect={() => {
                    if (option.disabled) return;
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    selectListItemClassName,
                    option.disabled &&
                      'cursor-not-allowed opacity-40 data-[selected=true]:bg-transparent',
                  )}
                >
                  <Check
                    className={cn(
                      selectListItemCheckClassName,
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{option.label}</span>
                  {option.hint ? (
                    <span className={selectListItemHintClassName}>
                      {option.hint}
                    </span>
                  ) : null}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </RemoveScroll>
      </PopoverContent>
    </Popover>
  );
}
