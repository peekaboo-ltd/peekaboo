import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full field-sizing-content rounded-(--radius-control) border border-(--line) bg-(--paper) px-3.5 py-2.5 text-sm text-(--ink) outline-none transition-[border-color,box-shadow] duration-200 ease-(--ease-flat) placeholder:text-(--muted) hover:border-(--line-strong) focus-visible:border-(--ink) focus-visible:shadow-[var(--ink)_0_0_0_1px_inset] aria-invalid:border-(--ink) aria-invalid:shadow-[var(--ink)_0_0_0_1px_inset] disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-(--surface) disabled:text-(--disabled-fg)",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
