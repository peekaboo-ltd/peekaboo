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
          // A toast reports an outcome, which is exactly what this system
          // spends color on. The ground stays paper so the toast still reads
          // as part of the app; the edge and the text carry the verdict.
          "--success-bg": "var(--approve-surface)",
          "--success-text": "var(--approve)",
          "--success-border": "var(--approve-line)",
          "--error-bg": "var(--danger-surface)",
          "--error-text": "var(--danger)",
          "--error-border": "var(--danger-line)",
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
          toast: "border-(--line) shadow-(--shadow-menu)",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
