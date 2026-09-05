import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import peekabooLogo from '/peekaboo.png';
import Button from '@/components/inputs/Button';
import { GoogleGIcon } from '@/components/icons/brands';
import { useI18n } from '@/i18n/i18n';

interface AuthPageShellProps {
  children: ReactNode;
  /**
   * How wide the column may grow. The card fills it, so the width lives in one
   * place instead of being declared on both the column and the card — where
   * the two could disagree and silently clamp each other.
   */
  maxWidthClassName?: string;
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

// Auth screens use the same primitives as the rest of the app. These handles
// carry layout only — they used to carry a stack of !important colour and
// height overrides, which made auth a second, slightly-wrong design system.
export const authInputClassName = 'w-full';

export const authPrimaryButtonClassName = 'mt-2 w-full';

export const authSecondaryButtonClassName = 'w-full';

export const AuthDivider = () => {
  const { t } = useI18n();
  return (
    <div className="relative my-5 flex items-center" aria-hidden="true">
      <div className="h-px flex-1 bg-(--line)" />
      <span className="type-meta px-3">{t('auth.or')}</span>
      <div className="h-px flex-1 bg-(--line)" />
    </div>
  );
};

/** Continue-with-Google. One definition, used by every auth screen that offers it. */
export const AuthSocialButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) => (
  <Button type="button" variant="secondary" onClick={onClick} className="w-full">
    <GoogleGIcon className="size-[18px]" />
    {children}
  </Button>
);

/** The line under the card that hands the reader to the other auth screen.
    Six screens had six copies of this markup; they are now one. */
export const AuthFooterNote = ({ children }: { children: ReactNode }) => (
  <p className="type-body-sm mt-6 text-center">{children}</p>
);

/** The one link style used inside auth copy. A link sitting inside a sentence
    carries a standing underline rather than the app's hover sweep — with no
    color to spend, a sweep that only appears on hover leaves "Sign up" looking
    exactly like the words around it. */
export const AuthLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    to={to}
    className="font-medium text-(--ink) underline decoration-(--line-strong) underline-offset-[3px] transition-colors duration-200 ease-(--ease-flat) hover:decoration-(--ink)"
  >
    {children}
  </Link>
);

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
  <section className="shadow-xl rounded-(--radius-control) bg-white w-full px-8 py-8 max-sm:px-5 max-sm:py-6">
    <header className="mb-6 text-center">
      <h1 className="type-h3">{title}</h1>
      <p className="type-body-sm mt-1 text-(--muted)">{subtitle}</p>
    </header>

    {children}
  </section>
);

export const AuthNotice = ({ children, tone = 'default' }: AuthNoticeProps) => {
  // A notice states an outcome, so it takes the outcome colors. The neutral
  // tone stays a quiet grey fill — it is information, not a verdict.
  const toneClassName =
    tone === 'error'
      ? 'card-framed border-(--danger-line) bg-(--danger-surface) p-4 text-(--danger)'
      : tone === 'success'
        ? 'card-framed border-(--approve-line) bg-(--approve-surface) p-4 text-(--approve)'
        : 'card-quiet p-4 text-(--muted)';

  return <div className={`type-body-sm ${toneClassName}`}>{children}</div>;
};

export const AuthPageShell = ({
  children,
  maxWidthClassName = 'max-w-[440px]',
}: AuthPageShellProps) => {
  const { t } = useI18n();
  return <main className="grid h-screen max-h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-(--surface) px-5 py-6 text-(--ink)">
    <header className="flex justify-center">
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-(--radius-control) px-3 py-1 transition-opacity duration-200 hover:opacity-70"
        aria-label={t('nav.homeLabel')}
      >
        <img
          src={peekabooLogo}
          className="h-10 w-auto object-contain"
          alt="Peekaboo"
        />
      </Link>
    </header>

    {/* The form column is the only scroller: a long form (Complete account)
        scrolls inside the viewport instead of pushing the trust row off it. */}
    <div className="flex items-start justify-center overflow-y-auto py-5 max-sm:py-3">
      <div className={`my-auto w-full ${maxWidthClassName}`}>{children}</div>
    </div>
  </main>;
};
