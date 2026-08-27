import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import peekabooLogo from '/peekaboo.png';

interface AuthPageShellProps {
  children: ReactNode;
}

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

interface AuthNoticeProps {
  children: ReactNode;
  tone?: 'default' | 'success' | 'error';
}

const trustMarks = ['Businesses', 'Families', 'Riders', 'Teams', 'Kigali'];

export const authInputClassName =
  'h-10 !border-border text-sm font-normal text-foreground placeholder:text-muted-foreground focus:!border-(--ink)';

export const authPrimaryButtonClassName =
  'mt-2 w-full !rounded-md !bg-(--ink) !font-normal hover:!bg-(--ink)';

export const authSecondaryButtonClassName =
  'w-full !rounded-md !border-border !bg-card !font-normal !text-(--ink) hover:!bg-accent';

export const GoogleIcon = () => (
  <svg className="h-4 w-4 text-(--ink)" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const AuthDivider = () => (
  <div className="relative my-6 flex items-center" aria-hidden="true">
    <div className="h-px flex-1 bg-border" />
    <span className="px-4 text-xs font-normal text-muted-foreground">or</span>
    <div className="h-px flex-1 bg-border" />
  </div>
);

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
  <section className="w-full max-w-[480px] rounded-md border border-border bg-card px-10 py-10 max-sm:px-6 max-sm:py-8">
    <header className="mb-8 text-center">
      <h1 className="text-xl font-normal leading-7 text-card-foreground">{title}</h1>
      <p className="mt-1 text-base font-normal leading-6 text-muted-foreground">{subtitle}</p>
    </header>

    {children}
  </section>
);

export const AuthNotice = ({ children, tone = 'default' }: AuthNoticeProps) => {
  const toneClassName =
    tone === 'success'
      ? 'border-(--line) bg-(--surface) text-(--muted)'
      : tone === 'error'
        ? 'border-destructive/30 bg-destructive/10 text-destructive'
        : 'border-border bg-accent text-foreground';

  return (
    <div className={`rounded-md border p-4 text-sm font-normal ${toneClassName}`}>
      {children}
    </div>
  );
};

export const AuthPageShell = ({ children }: AuthPageShellProps) => (
  <main className="min-h-screen overflow-x-hidden bg-(--paper) text-(--ink)">
    <section className="flex min-h-screen flex-col px-5 py-9">
      <header className="flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md px-3 py-2 transition-opacity hover:opacity-80"
          aria-label="Peekaboo home"
        >
          <img
            src={peekabooLogo}
            className="h-14 w-auto object-contain"
            alt="Peekaboo"
          />
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center py-10 max-sm:py-8">
        {children}
      </div>

      <footer className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center">
        <p className="text-sm font-normal text-foreground">
          Trusted by delivery teams, businesses, and families across Kigali
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm font-normal text-muted-foreground">
          {trustMarks.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </div>
      </footer>
    </section>
  </main>
);
