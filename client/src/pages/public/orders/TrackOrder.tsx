import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Hash, MapPinned, PackageCheck } from 'lucide-react';
import Button from '@/components/inputs/Button';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useGetOrderByReferenceId } from '@/hooks/orders/orders.hooks';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import Input from '@/components/inputs/Input';
import PublicApproximateMap from '@/components/maps/PublicApproximateMap';
import HeroTrustIndicators from '@/pages/home/components/HeroTrustIndicators';
import SupportSection from '@/pages/home/components/SupportSection';
import FinalCtaSection from '@/pages/home/components/FinalCtaSection';
import { useHomeContent } from '@/pages/home/useHomeContent';
import { entranceVariants } from '@/pages/home/home.animations';
import { HERO_DELIVERY_FORM_ID } from '@/pages/home/components/HeroForm';

const TrackOrder = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  useDocumentTitle(t('track.docTitle'));
  const trackingFeatures = [
    { icon: Hash, title: t('track.feature.reference.title'), description: t('track.feature.reference.description') },
    { icon: MapPinned, title: t('track.feature.map.title'), description: t('track.feature.map.description') },
    { icon: PackageCheck, title: t('track.feature.proof.title'), description: t('track.feature.proof.description') },
  ];

  const formRef = useRef<HTMLFormElement>(null);
  const [referenceId, setReferenceId] = useState(initialRef);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: landingStats } = useGetLandingStatsQuery();
  const { heroCopy, supportContacts } = useHomeContent();

  const {
    getOrderByReferenceId,
    isFetching,
    isSuccess,
    isError,
    data,
    reset,
  } = useGetOrderByReferenceId();

  const handleSearch = useCallback((refId?: string) => {
    const searchRef = refId || referenceId.trim().toUpperCase();
    if (!searchRef) {
      setErrorMessage(t('trackOrder.enterOrderId'));
      return;
    }
    setErrorMessage('');
    getOrderByReferenceId({ referenceId: searchRef });
  }, [referenceId, getOrderByReferenceId, t]);

  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [handleSearch, initialRef]);

  useEffect(() => {
    if (isSuccess && data?.data?.id) {
      navigate(`/p/orders/${data.data.id}/tracking`);
      reset();
    }
  }, [isSuccess, data, navigate, reset]);

  useEffect(() => {
    if (isError) {
      setErrorMessage(t('trackOrder.notFound'));
    }
  }, [isError, t]);

  const handleContactNavigation = () => {
    navigate('/contact');
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
                <p className="type-eyebrow">{t('trackOrder.eyebrow')}</p>
                <h1 className="type-display max-w-[14ch] text-(--ink)">
                  {t('trackOrder.title')}
                </h1>
                <p className="type-body max-w-[46ch] text-(--muted)">
                  {t('trackOrder.subtitle')}
                </p>
              </hgroup>

              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="home-scroll-target w-full max-w-md"
              >
                <Input
                  id="reference-id"
                  label={t('trackOrder.orderIdLabel')}
                  value={referenceId}
                  onChange={(e) => {
                    setReferenceId(e.target.value.toUpperCase());
                    setErrorMessage('');
                  }}
                  placeholder={t('trackOrder.orderIdPlaceholder')}
                  prefixIcon={faMagnifyingGlass}
                  description={t('trackOrder.hint')}
                  errorMessage={errorMessage}
                />

                <Button
                  type="submit"
                  primary
                  isLoading={isFetching}
                  className="mt-5 max-sm:w-full"
                >
                  {t('trackOrder.searchButton')}
                </Button>
              </form>

              <Link
                to={`/#${HERO_DELIVERY_FORM_ID}`}
                className="link-sweep text-sm text-(--ink)"
              >
                {t('track.bookInstead')}
              </Link>

              <HeroTrustIndicators
                landingStats={landingStats}
                activeCustomersLabel={heroCopy.activeCustomersLabel}
                completedOrdersLabel={heroCopy.completedOrdersLabel}
                fallbackLabel={heroCopy.growingCommunityLabel}
              />
            </motion.div>

            <div className="max-lg:hidden">
              <PublicApproximateMap
                statusLabel={t('track.liveTracking')}
                etaLabel={t('home.trust.kigaliWide')}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-rhythm w-full border-(--line) bg-(--paper)">
        <div className="app-container">
          <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <hgroup>
              <p className="type-eyebrow">{t('track.liveTracking')}</p>
              <h2 className="type-h2 mt-2">
                {t('track.seeEveryStep1')}
                <br />
                {t('track.seeEveryStep2')}
              </h2>
            </hgroup>
            <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
              {t('track.sectionDescription')}
            </p>
          </header>

          <ol className="grid gap-6 md:grid-cols-3">
            {trackingFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="relative rounded-md border border-(--line) p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="type-meta">0{index + 1}</span>
                    <span className="flex size-10 items-center justify-center rounded-(--radius-control) border border-(--ink)">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="type-h3 mt-8">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-[1.55] text-(--muted)">
                    {feature.description}
                  </p>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[42ch] text-sm leading-[1.55] text-(--muted)">
              {t('track.referenceHelp')}
            </p>
            <button
              type="button"
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="link-arrow inline-flex items-center gap-1.5 text-sm text-(--ink)"
            >
              {t('nav.trackOrder')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <SupportSection
        contacts={supportContacts}
        onContactClick={handleContactNavigation}
      />

      <FinalCtaSection
        title={t('track.ctaTitle')}
        subtitle={t('track.ctaSubtitle')}
        buttonLabel={t('track.ctaButton')}
        onScrollToForm={handleBookDelivery}
      />
    </main>
  );
};

export default TrackOrder;
