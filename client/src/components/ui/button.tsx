import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Press is a full-surface inset flood, never a transform — a 999px spread
// floods the control whatever its size. Hover is a flat background change:
// linear easing so it reads mechanical rather than soft. Buttons cast no
// shadow; only menus, popovers, and modals do.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer select-none touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-(--radius-control) text-sm font-medium outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-(--ease-flat) disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] active:transition-[box-shadow_0ms] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary: solid ink. One per view.
        default:
          "border border-(--ink) bg-(--ink) text-(--paper) hover:bg-[color-mix(in_oklab,var(--ink)_85%,var(--paper))] hover:border-[color-mix(in_oklab,var(--ink)_85%,var(--paper))] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]",
        secondary:
          "border border-transparent bg-(--surface) text-(--ink) hover:border-(--line) hover:bg-(--surface-hover) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]",
        // Outline actions share the quiet surface treatment used by the plan
        // CTA: visible at rest, one step stronger on hover, and never mistaken
        // for the page's solid primary action.
        outline:
          "border border-transparent bg-(--surface) text-(--ink) hover:border-(--line) hover:bg-(--surface-hover) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]",
        // Field-shaped trigger: a control that opens something (date picker,
        // combobox) and must line up with the inputs beside it.
        field:
          "justify-start border border-(--line) bg-(--paper) text-(--ink) font-normal hover:border-(--line-strong) hover:bg-(--surface) focus-visible:border-(--ink) focus-visible:shadow-[var(--ink)_0_0_0_1px_inset] data-[state=open]:border-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]",
        // Destructive: an outline that states its consequence in red, and
        // floods to a solid red on hover so the commit is unmistakable. This
        // replaces a strike-through-on-hover trick that existed only because
        // the system had no red to spend.
        destructive:
          "border border-(--danger) bg-transparent text-(--danger) hover:bg-(--danger) hover:text-(--on-consequence) active:bg-[color-mix(in_oklab,var(--danger)_88%,black)] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]",
        // Approve: the same shape in green. Used where an action resolves
        // something — accepting, approving, confirming a request.
        approve:
          "border border-(--approve) bg-transparent text-(--approve) hover:bg-(--approve) hover:text-(--on-consequence) active:bg-[color-mix(in_oklab,var(--approve)_88%,black)] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]",
        ghost:
          "border border-transparent bg-transparent text-(--ink) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]",
        link:
          "link-sweep h-auto border border-transparent bg-transparent p-0 text-(--ink) hover:bg-(--surface) hover:px-2 hover:-mx-2 hover:rounded-(--radius-control) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] active:text-(--ink)",
      },
      size: {
        sm: "h-(--control-sm) gap-1.5 px-3.5",
        default: "h-(--control-md) px-4",
        lg: "h-(--control-lg) px-6",
        icon: "size-(--control-md) p-0",
        "icon-sm": "size-(--control-sm) p-0",
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
