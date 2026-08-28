import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ContactUsForm from '@/pages/home/components/ContactUsForm';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useI18n } from '@/i18n/i18n';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import HeroTrustIndicators from '@/pages/home/components/HeroTrustIndicators';
import SupportSection from '@/pages/home/components/SupportSection';
import FinalCtaSection from '@/pages/home/components/FinalCtaSection';
import { useHomeContent } from '@/pages/home/useHomeContent';
import { entranceVariants } from '@/pages/home/home.animations';
import { HERO_DELIVERY_FORM_ID } from '@/pages/home/components/HeroForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const ContactChannelsPanel = ({
  contacts,
  onFormClick,
}: {
  contacts: ReturnType<typeof useHomeContent>['supportContacts'];
  onFormClick: () => void;
}) => (
  <aside className="rounded-md border border-(--line) bg-(--surface) p-6">
    <p className="type-eyebrow">Reach us directly</p>
    <p className="type-body-sm mt-2 max-w-[32ch] text-(--muted)">
      Our Kigali team replies in under 90 seconds on WhatsApp and phone.
    </p>
    <ul className="mt-5 grid gap-2">
      {contacts.map((contact) => {
        const Icon = contact.icon;
        const content = (
          <>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) border border-(--ink) text-(--ink)">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-(--ink)">{contact.title}</span>
              <span className="mt-0.5 block truncate text-xs text-(--muted)">
                {contact.subtitle}
              </span>
            </span>
            <span className="rounded-full border border-(--line) bg-(--paper) px-2 py-0.5 text-xs text-(--ink)">
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
                className="card-framed card-interactive group flex items-center gap-3 p-4"
              >
                {content}
              </a>
            </li>
          );
        }

        return (
          <li key={contact.title}>
            <button
              type="button"
              onClick={onFormClick}
              className="group flex w-full items-center gap-3 rounded-md border border-(--line) bg-(--paper) p-4 text-left transition-[border-color] duration-200 hover:border-(--ink)"
            >
              {content}
            </button>
          </li>
        );
      })}
    </ul>
  </aside>
);

const ContactUsPage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const { data: landingStats } = useGetLandingStatsQuery();
  const { heroCopy, supportContacts } = useHomeContent();

  useDocumentTitle('Contact Us');

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookDelivery = () => {
    navigate(`/#${HERO_DELIVERY_FORM_ID}`);
  };

  return (
    <main className="home-page relative min-h-screen w-full overflow-x-clip bg-(--paper)">
      <section className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-(--paper) text-(--ink)">
        <div className="app-container pb-10 pt-8 lg:pb-14 lg:pt-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-14">
            <motion.div
              className="flex flex-col items-start gap-5"
              variants={entranceVariants}
              initial="hidden"
              animate="visible"
            >
              <hgroup className="space-y-3">
                <p className="type-eyebrow">Contact</p>
                <h1 className="type-display max-w-[14ch] text-(--ink)">
                  {t('contact.title')}
                </h1>
                <p className="type-body max-w-[46ch] text-(--muted)">
                  {t('contact.subtitle')}
                </p>
              </hgroup>

              <dl className="flex w-full max-w-md flex-wrap gap-x-10 gap-y-4 border-t border-(--line) pt-6">
                <div>
                  <dt className="type-eyebrow">Response time</dt>
                  <dd className="type-card-title mt-2">Under 90 seconds</dd>
                </div>
                <div>
                  <dt className="type-eyebrow">Channels</dt>
                  <dd className="type-card-title mt-2">WhatsApp · Phone · Email</dd>
                </div>
                <div>
                  <dt className="type-eyebrow">Coverage</dt>
                  <dd className="type-card-title mt-2">Kigali-wide</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={scrollToForm}
                className="link-sweep inline-flex items-center gap-1.5 text-sm text-(--ink)"
              >
                Send a message
                <FontAwesomeIcon icon={faChevronDown} className="size-4" aria-hidden="true" />
              </button>

              <HeroTrustIndicators
                landingStats={landingStats}
                activeCustomersLabel={heroCopy.activeCustomersLabel}
                completedOrdersLabel={heroCopy.completedOrdersLabel}
                fallbackLabel={heroCopy.growingCommunityLabel}
              />
            </motion.div>

            <div className="max-lg:hidden">
              <ContactChannelsPanel
                contacts={supportContacts}
                onFormClick={scrollToForm}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-rhythm w-full border-(--line) bg-(--paper)">
        <div className="app-container">
          <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <hgroup>
              <p className="type-eyebrow">Inquiry</p>
              <h2 className="type-h2 mt-2">
                Send us
                <br />a message.
              </h2>
            </hgroup>
            <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
              Tell us about your business or delivery needs. Our Kigali team
              replies within one business day.
            </p>
          </header>

          <div
            ref={formRef}
            className="home-scroll-target mx-auto w-full max-w-3xl rounded-md border border-(--line) p-6"
          >
            <ContactUsForm hideIntro />
          </div>
        </div>
      </section>

      <SupportSection
        contacts={supportContacts}
        onContactClick={scrollToForm}
      />

      <FinalCtaSection
        title="Need to send something now?"
        subtitle="Book a verified rider in under a minute. Pay when it arrives."
        buttonLabel="Book delivery"
        onScrollToForm={handleBookDelivery}
      />
    </main>
  );
};

export default ContactUsPage;
