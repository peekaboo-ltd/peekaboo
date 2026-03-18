import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ className, style, toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={["toaster group", className].filter(Boolean).join(" ")}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          ...(style ?? {}),
        } as React.CSSProperties
      }
      toastOptions={toastOptions}
      {...props}
    />
  )
}

export { Toaster }
