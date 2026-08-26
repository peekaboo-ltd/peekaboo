import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full min-w-0 rounded-[--radius-control] border-0 bg-[--surface] px-4 text-base text-[--ink] outline-none transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] placeholder:text-[--muted] file:mr-4 file:inline-flex file:h-9 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-[--disabled-fg] disabled:opacity-40",
        "focus-visible:shadow-[var(--ink)_0_0_0_2px_inset]",
        "aria-invalid:shadow-[var(--ink)_0_0_0_2px_inset]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
