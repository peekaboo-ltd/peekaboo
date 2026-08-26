import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full field-sizing-content rounded-[--radius-control] border-0 bg-[--surface] px-4 py-4 text-base text-[--ink] outline-none transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] placeholder:text-[--muted] focus-visible:shadow-[var(--ink)_0_0_0_2px_inset] aria-invalid:shadow-[var(--ink)_0_0_0_2px_inset] disabled:cursor-not-allowed disabled:text-[--disabled-fg] disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
