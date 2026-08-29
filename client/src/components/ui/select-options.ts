export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Secondary text shown after the label, e.g. a country calling code. */
  hint?: string;
}

/** Shared list-row styles for combobox and select menus. */
export const selectListItemClassName =
  'mx-1 flex cursor-pointer select-none items-center gap-2 rounded-md p-2 text-sm text-(--ink) outline-none transition-[background-color] duration-200 ease-(--ease-flat) data-[highlighted]:bg-(--surface) data-[state=checked]:bg-(--surface)';

export const selectListItemCheckClassName = 'size-3.5 shrink-0 text-(--ink)';

export const selectListItemHintClassName =
  'ml-auto shrink-0 tabular-nums text-(--muted)';

export const selectEmptyClassName =
  'px-2 py-2 text-center text-sm text-(--muted)';

export const selectSearchRowClassName =
  'mb-1 flex items-center gap-2 border-b border-(--line) px-2 pb-2 pt-1';

export const selectSearchInputClassName =
  'min-w-0 flex-1 bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--muted)';
