import * as React from "react"

import { cn } from "@/lib/utils"
import { controlClassName } from "../inputs/control"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        controlClassName,
        "file:mr-3 file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-(--ink)",
        "disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
