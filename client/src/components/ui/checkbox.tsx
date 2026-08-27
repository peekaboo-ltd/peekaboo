"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-(--radius-control) border border-(--ink) bg-transparent text-(--ink) outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] active:shadow-[var(--press-on-paper)_999px_999px_0_inset] data-[state=checked]:border-(--ink) data-[state=checked]:bg-(--ink) data-[state=checked]:text-(--paper) focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] aria-invalid:shadow-[var(--ink)_0_0_0_2px_inset] disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
