import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import peekabooLogo from '/peekaboo.png';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

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

// Auth screens use the same primitives as the rest of the app. These handles
// carry layout only — they used to carry a stack of !important colour and
// height overrides, which made auth a second, slightly-wrong design system.
export const authInputClassName = 'w-full';

export const authPrimaryButtonClassName = 'mt-2 w-full';

export const authSecondaryButtonClassName = 'w-full';

export const AuthDivider = () => (
  <div className="relative my-5 flex items-center" aria-hidden="true">
    <div className="h-px flex-1 bg-(--line)" />
    <span className="type-meta px-3">or</span>
    <div className="h-px flex-1 bg-(--line)" />
  </div>
);

/** Continue-with-Google. One definition, used by every auth screen that offers it. */
export const AuthSocialButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) => (
  <Button type="button" variant="secondary" onClick={onClick} className="w-full">
    <FontAwesomeIcon icon={faGoogle as IconProp} />
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
  <section className="card-framed w-full max-w-[440px] px-8 py-8 max-sm:px-5 max-sm:py-6">
    <header className="mb-6 text-center">
      <h1 className="type-h3">{title}</h1>
      <p className="type-body-sm mt-1 text-(--muted)">{subtitle}</p>
    </header>

    {children}
  </section>
);

export const AuthNotice = ({ children, tone = 'default' }: AuthNoticeProps) => {
  // Tone is carried by the border treatment, not by hue: a solid ink edge for
  // something that needs attention, a quiet fill for something that does not.
  const toneClassName =
    tone === 'error'
      ? 'card-framed border-(--ink) p-4'
      : tone === 'success'
        ? 'card-quiet p-4'
        : 'card-quiet p-4 text-(--muted)';

  return <div className={`type-body-sm ${toneClassName}`}>{children}</div>;
};

export const AuthPageShell = ({ children }: AuthPageShellProps) => (
  <main className="grid h-screen max-h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-(--paper) px-5 py-6 text-(--ink)">
    <header className="flex justify-center">
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-(--radius-control) px-3 py-1 transition-opacity duration-200 hover:opacity-70"
        aria-label="Peekaboo home"
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
      <div className="my-auto w-full max-w-[440px]">{children}</div>
    </div>
  </main>
);
