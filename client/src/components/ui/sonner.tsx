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
          "--normal-bg": "var(--paper)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--line)",
          "--success-bg": "var(--paper)",
          "--success-text": "var(--ink)",
          "--success-border": "var(--line)",
          "--error-bg": "var(--paper)",
          "--error-text": "var(--ink)",
          "--error-border": "var(--line)",
          "--warning-bg": "var(--paper)",
          "--warning-text": "var(--ink)",
          "--warning-border": "var(--line)",
          "--info-bg": "var(--paper)",
          "--info-text": "var(--ink)",
          "--info-border": "var(--line)",
          "--border-radius": "var(--radius-control)",
          ...(style ?? {}),
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: "!border-[--line] !shadow-[var(--shadow-menu)]",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
