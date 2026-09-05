import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/inputs/Button';
import PublicIconBadge, { publicAccentAt } from '@/components/public/PublicIconBadge';
import type { SizableIcon } from '@/components/icons/brands';
import { useI18n } from '@/i18n/i18n';

interface SupportContact {
  icon: SizableIcon;
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

const SupportSection = ({ contacts, onContactClick }: SupportSectionProps) => {
  const { t } = useI18n();
  const helpLinks = [
    { label: t('home.support.trackQuestion'), to: '/track' },
    { label: t('home.support.costQuestion'), to: '/services' },
    { label: t('home.support.coverageQuestion'), to: '#coverage' },
    { label: t('home.support.riderQuestion'), to: '/contact' },
    { label: t('home.support.recurringQuestion'), to: '/contact' },
    { label: t('home.support.invoiceQuestion'), to: '/services' },
  ];
  return (
  <section id="support" className="section-rhythm w-full border-(--line) bg-(--paper)">
    <article className="app-container grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
      <header>
        <p className="type-eyebrow">
          {t('home.support.eyebrow')}
        </p>
        <h2 className="type-h2 mt-2">
          {t('home.support.title1')}
          <br />
          {t('home.support.title2')}
        </h2>
        <p className="mt-3 max-w-[340px] text-sm font-normal leading-relaxed text-muted-foreground">
          {t('home.support.description')}
        </p>
        <ul className="mt-5 grid gap-2">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            const content = (
              <>
                <PublicIconBadge icon={Icon} tone={publicAccentAt(index)} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-normal text-foreground">
                    {contact.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {contact.subtitle}
                  </span>
                </span>
                <span className="rounded-full border border-border bg-(--surface) px-2 py-0.5 text-xs font-normal text-foreground transition-[background-color,color,border-color,box-shadow] duration-200 group-hover:border-(--surface-hover) group-hover:bg-(--surface)">
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
                    className="card-framed card-interactive group flex h-auto w-full items-center gap-3 p-4 text-left"
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
                  variant="ghost"
                  onClick={onContactClick}
                  className="group flex w-full items-center gap-3 rounded-md border border-(--line) bg-(--paper) p-4 text-left transition-[border-color] duration-200 hover:border-(--ink)"
                >
                  {content}
                </Button>
              </li>
            );
          })}
        </ul>
      </header>

      <aside>
        <label className="flex items-center gap-3 rounded-(--radius-control) border border-border bg-(--surface) px-3.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder={t('home.support.searchPlaceholder')}
            className="min-w-0 focus:border-none focus:ring-0 py-2 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {helpLinks.map((link) => (
            <li key={link.label}>
              {link.to.startsWith('#') ? (
                <a
                  href={link.to}
                  className="group card-framed transition-[border-color] duration-200 hover:border-(--ink) flex w-full items-center justify-between gap-4 rounded-(--radius-control) bg-(--surface) px-4 py-3 text-left text-sm font-normal text-foreground"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  to={link.to}
                  className="group card-framed transition-[border-color] duration-200 hover:border-(--ink) flex w-full items-center justify-between gap-4 rounded-(--radius-control) bg-(--surface) px-4 py-3 text-left text-sm font-normal text-foreground"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>

        <section className="invert-surface mt-3 flex flex-col gap-4 rounded-md p-6 sm:flex-row sm:items-center sm:justify-between">
          <hgroup>
            <h3 className="type-label">{t('home.support.ticketTitle')}</h3>
            <p className="type-meta mt-1">
              {t('home.support.ticketDescription')}
            </p>
          </hgroup>
          <Button
            type="button"
            primary
            onClick={onContactClick}
            className="shrink-0 rounded-(--radius-control) font-normal"
          >
            {t('home.support.contact')}
            <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </section>
      </aside>
    </article>
  </section>
  );
};

export default SupportSection;
