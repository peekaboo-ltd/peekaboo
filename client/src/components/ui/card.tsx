import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// A card is separated from the page by a surface step OR a hairline — never
// both. `framed` is the default for content; `quiet` is for stats and inert
// grouping, where the fill already does the separating and a border on top of
// it just draws a box around a box.
const cardVariants = cva("flex flex-col rounded-(--radius-card) text-(--ink)", {
  variants: {
    variant: {
      framed: "border border-(--line) bg-(--paper)",
      quiet: "bg-(--surface)",
      // Locally swaps ink and paper, so children, focus rings, and text
      // selection all keep working without special-casing.
      inverted: "invert-surface",
      plain: "bg-transparent",
    },
    padding: {
      none: "",
      sm: "gap-3 p-4",
      default: "gap-4 p-5",
      lg: "gap-5 p-6",
    },
    interactive: {
      true: "transition-[border-color,background-color] duration-200 ease-(--ease-flat)",
      false: "",
    },
  },
  compoundVariants: [
    { variant: "framed", interactive: true, className: "hover:border-(--ink)" },
    { variant: "quiet", interactive: true, className: "hover:bg-(--surface-hover)" },
  ],
  defaultVariants: {
    variant: "framed",
    padding: "default",
    interactive: false,
  },
})

function Card({
  className,
  variant,
  padding,
  interactive,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant ?? "framed"}
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("type-card-title", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("type-meta", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn(className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center [.border-t]:pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
