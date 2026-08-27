import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-(--radius-control) text-sm font-medium outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] disabled:pointer-events-none disabled:opacity-40 focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-(--ink) text-(--paper) hover:bg-[color-mix(in_oklab,var(--ink)_88%,var(--paper))] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]",
        secondary:
          "bg-(--surface) text-(--ink) hover:bg-(--surface-hover) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]",
        outline:
          "border border-(--ink) bg-transparent text-(--ink) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]",
        ghost:
          "bg-transparent text-(--ink) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]",
        link: "link-sweep h-auto bg-transparent p-0 text-(--ink) active:text-(--muted)",
      },
      size: {
        sm: "h-9 px-4",
        default: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
