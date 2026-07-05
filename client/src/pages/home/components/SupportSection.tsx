import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/inputs/Button';

interface SupportContact {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge: string;
  href?: string;
  external?: boolean;
}

interface SupportSectionProps {
  contacts: SupportContact[];
  onContactClick?: () => void;
}

const helpLinks = [
  { label: 'How do I track an order?', to: '/track' },
  { label: 'What does delivery cost?', to: '/services' },
  { label: 'Where do you currently deliver?', to: '#coverage' },
  { label: 'How do I become a rider?', to: '/contact' },
  { label: 'Can I schedule recurring drops?', to: '/contact' },
  { label: 'How do business invoices work?', to: '/services' },
];

const SupportSection = ({ contacts, onContactClick }: SupportSectionProps) => (
  <section id="support" className="w-full border-t border-border bg-[var(--peekaboo-warm)] py-12 lg:py-16">
    <article className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12 lg:px-10">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Support
        </p>
        <h2 className="mt-3 text-[24px] font-semibold leading-[1.05] tracking-[-0.01em] text-foreground sm:text-[30px]">
          How can
          <br />
          we help?
        </h2>
        <p className="mt-3 max-w-[340px] text-[13px] font-normal leading-relaxed text-muted-foreground">
          Talk to a real person, anytime. Our Kigali team replies in under 90 seconds.
        </p>
        <ul className="mt-5 grid gap-2">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            const content = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#fff4be] text-[#0a0a0a] transition-all duration-300 group-hover:bg-[#edb100] group-hover:scale-110">
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-foreground">
                    {contact.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                    {contact.subtitle}
                  </span>
                </span>
                <span className="rounded-full border border-border bg-[#f7f6f1] px-2 py-0.5 text-[11px] font-medium text-foreground transition-all duration-300 group-hover:border-[#d49e00] group-hover:bg-[#fff4be]">
                  {contact.badge}
                </span>
              </>
            );

            if (contact.href) {
              return (
                <li key={contact.title}>
                  <a
                    href={contact.href}
                    target={contact.external ? '_blank' : undefined}
                    rel={contact.external ? 'noopener noreferrer' : undefined}
                    className="group home-card-interactive flex w-full items-center gap-3 rounded-md border border-border bg-card p-3.5 text-left transition-all duration-300"
                  >
                    {content}
                  </a>
                </li>
              );
            }

            return (
              <li key={contact.title}>
                <Button
                  type="button"
                  styled={false}
                  onClick={onContactClick}
                  className="group home-card-interactive flex w-full items-center gap-3 rounded-md border border-border bg-card p-3.5 text-left transition-all duration-300"
                >
                  {content}
                </Button>
              </li>
            );
          })}
        </ul>
      </header>

      <aside>
        <label className="flex items-center gap-3 rounded-md border border-border bg-card p-3.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search help topics — billing, tracking, coverage..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {helpLinks.map((link) => (
            <li key={link.label}>
              {link.to.startsWith('#') ? (
                <a
                  href={link.to}
                  className="group home-card-interactive flex w-full items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3 text-left text-[13px] font-medium text-foreground transition-all duration-300"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  to={link.to}
                  className="group home-card-interactive flex w-full items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3 text-left text-[13px] font-medium text-foreground transition-all duration-300"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>

        <section className="mt-3 flex flex-col gap-4 rounded-md bg-[#0a0a0a] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <hgroup>
            <h3 className="text-[14px] font-medium">Still stuck? Open a ticket.</h3>
            <p className="mt-1 text-[12px] font-normal leading-relaxed text-white/60">
              Average first response in under 8 minutes during business hours.
            </p>
          </hgroup>
          <Button
            type="button"
            primary
            onClick={onContactClick}
            className="shrink-0 rounded-md font-medium"
          >
            Contact support
            <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </section>
      </aside>
    </article>
  </section>
);

export default SupportSection;
