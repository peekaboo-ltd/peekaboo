import { useRef } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const ContactChannelsPanel = ({
  contacts,
  onFormClick,
}: {
  contacts: ReturnType<typeof useHomeContent>['supportContacts'];
  onFormClick: () => void;
}) => {
  const { t } = useI18n();
  return (
  <aside className="rounded-md border border-(--line) bg-(--surface) p-6">
    <p className="type-eyebrow">{t('contact.reachDirectly')}</p>
    <p className="type-body-sm mt-2 max-w-[32ch] text-(--muted)">
      {t('contact.reachDescription')}
    </p>
    <ul className="mt-5 grid gap-2">
      {contacts.map((contact) => {
        const Icon = contact.icon;
        const content = (
          <>
            <span className="flex size-9 shrink-0 items-center justify-center text-(--ink)">
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
};

const ContactUsPage = () => {
  const { t } = useI18n();
  const formRef = useRef<HTMLDivElement>(null);
  const { data: landingStats } = useGetLandingStatsQuery();
  const { heroCopy, supportContacts } = useHomeContent();

  useDocumentTitle(t('contact.docTitle'));

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                <p className="type-eyebrow">{t('contact.eyebrow')}</p>
                <h1 className="type-display max-w-[14ch] text-(--ink)">
                  {t('contact.title')}
                </h1>
                <p className="type-body max-w-[46ch] text-(--muted)">
                  {t('contact.subtitle')}
                </p>
              </hgroup>

              <dl className="flex w-full max-w-md flex-wrap gap-x-10 gap-y-4 border-t border-(--line) pt-6">
                <div>
                  <dt className="type-eyebrow">{t('contact.responseTime')}</dt>
                  <dd className="type-card-title mt-2">{t('contact.under90Seconds')}</dd>
                </div>
                <div>
                  <dt className="type-eyebrow">{t('contact.channels')}</dt>
                  <dd className="type-card-title mt-2">{t('contact.channelList')}</dd>
                </div>
                <div>
                  <dt className="type-eyebrow">{t('contact.coverage')}</dt>
                  <dd className="type-card-title mt-2">{t('contact.kigaliWide')}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={scrollToForm}
                className="link-sweep inline-flex items-center gap-1.5 text-sm text-(--ink)"
              >
                {t('contact.sendMessage')}
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
              <p className="type-eyebrow">{t('contact.inquiry')}</p>
              <h2 className="type-h2 mt-2">
                {t('contact.messageTitle1')}
                <br />{t('contact.messageTitle2')}
              </h2>
            </hgroup>
            <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
              {t('contact.messageDescription')}
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
        title={t('contact.ctaTitle')}
        subtitle={t('contact.ctaSubtitle')}
        buttonLabel={t('contact.ctaButton')}
      />
    </main>
  );
};

export default ContactUsPage;
