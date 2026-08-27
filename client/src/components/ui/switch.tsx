"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-(--radius-pill) border border-(--line-strong) bg-(--surface) p-1 outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] active:shadow-[var(--press-on-paper)_999px_999px_0_inset] data-[state=checked]:border-(--ink) data-[state=checked]:bg-(--ink) data-[state=checked]:text-(--paper) focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-(--radius-pill) bg-(--ink) transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=checked]:translate-x-5 data-[state=checked]:bg-(--paper)"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
