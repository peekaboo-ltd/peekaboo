import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Search } from 'lucide-react';
import Button from '@/components/inputs/Button';

interface SupportContact {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge: string;
}

interface SupportSectionProps {
  contacts: SupportContact[];
  onContactClick?: () => void;
}

const helpLinks = [
  'How do I track an order?',
  'What does delivery cost?',
  'Where do you currently deliver?',
  'How do I become a rider?',
  'Can I schedule recurring drops?',
  'How do business invoices work?',
];

const SupportSection = ({ contacts, onContactClick }: SupportSectionProps) => (
  <section id="support" className="w-full bg-[#f7f6f1] py-10 lg:py-14">
    <article className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12 lg:px-10">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6f76]">
          Support
        </p>
        <h2 className="mt-3 text-[24px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[#0a0a0a] sm:text-[30px]">
          How can
          <br />
          we help?
        </h2>
        <p className="mt-3 max-w-[340px] text-[13px] leading-relaxed text-[#6b6f76]">
          Talk to a real person, anytime. Our Kigali team replies in under 90 seconds.
        </p>
        <ul className="mt-5 grid gap-2">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <li key={contact.title}>
                <Button
                  type="button"
                  styled={false}
                  onClick={onContactClick}
                  className="home-card-interactive flex w-full items-center gap-3 rounded-[18px] border border-[#ececea] bg-white p-3.5 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fff4be] text-[#0a0a0a]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-[#0a0a0a]">
                      {contact.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-[#6b6f76]">
                      {contact.subtitle}
                    </span>
                  </span>
                  <span className="rounded-full border border-[#ececea] bg-[#f7f6f1] px-2 py-0.5 text-[11px] font-bold text-[#1f1f1f]">
                    {contact.badge}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </header>

      <aside>
        <label className="flex items-center gap-3 rounded-[18px] border border-[#ececea] bg-white p-3.5">
          <Search className="h-4 w-4 shrink-0 text-[#6b6f76]" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search the help centre — billing, tracking, coverage..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#0a0a0a] outline-none placeholder:text-[#9aa0a6]"
          />
          <Button
            type="button"
            className="hidden rounded-full bg-[#ffc400] border-[#ffc400] text-[#0a0a0a] hover:bg-[#e6ad00] hover:border-[#e6ad00] font-semibold sm:inline-flex"
          >
            Search
          </Button>
        </label>

        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {helpLinks.map((link) => (
            <li key={link}>
              <Button
                type="button"
                styled={false}
                className="home-card-interactive flex w-full items-center justify-between gap-4 rounded-[18px] border border-[#ececea] bg-white px-4 py-3 text-left text-[13px] font-medium text-[#0a0a0a]"
              >
                {link}
                <ArrowRight className="h-3 w-3 shrink-0 text-[#6b6f76]" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>

        <section className="mt-3 flex flex-col gap-4 rounded-[18px] bg-[#0a0a0a] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <hgroup>
            <h3 className="text-[14px] font-bold">Still stuck? Open a ticket.</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-white/60">
              Average first response in under 8 minutes during business hours.
            </p>
          </hgroup>
          <Button
            type="button"
            onClick={onContactClick}
            className="shrink-0 rounded-full bg-[#ffc400] border-[#ffc400] text-[#0a0a0a] hover:bg-[#e6ad00] hover:border-[#e6ad00] font-semibold"
          >
            Contact support
          </Button>
        </section>
      </aside>
    </article>
  </section>
);

export default SupportSection;
