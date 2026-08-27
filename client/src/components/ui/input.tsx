import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-(--radius-control) border border-(--line) bg-(--paper) px-3.5 text-base text-(--ink) outline-none transition-[border-color,box-shadow] duration-200 ease-(--ease-flat) placeholder:text-(--muted)",
        "file:mr-4 file:inline-flex file:h-9 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "hover:border-(--line-strong)",
        "focus-visible:border-(--ink) focus-visible:shadow-[var(--ink)_0_0_0_1px_inset]",
        "aria-invalid:border-(--ink) aria-invalid:shadow-[var(--ink)_0_0_0_1px_inset]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-(--surface) disabled:text-(--disabled-fg)",
        className
      )}
      {...props}
    />
  )
}

export { Input }
