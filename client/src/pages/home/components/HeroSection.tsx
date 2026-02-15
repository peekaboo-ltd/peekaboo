import type { RefObject } from 'react';
import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import HeroScene from '@/components/three/HeroScene';
import { useCreateOrder, useCreatePublicOrder } from '@/hooks/orders/orders.hooks';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import { useAppSelector } from '@/states/hooks';
import type { LandingStats } from '@/types/landing.type';
import type { HeroCopy, HomeFormValues } from '../home.types';
import { containerVariants, itemVariants } from '../home.animations';
import HeroTabs from './HeroTabs';
import HeroHeadline from './HeroHeadline';
import HeroTrustIndicators from './HeroTrustIndicators';
import HeroBusinessCta from './HeroBusinessCta';
import HeroForm from './HeroForm';
import HeroScrollIndicator from './HeroScrollIndicator';

interface HeroSectionProps {
  formRef: RefObject<HTMLFormElement | null>;
  onScrollToForm: () => void;
  landingStats?: LandingStats;
  heroCopy: HeroCopy;
  onContactClick?: () => void;
}

const HeroSection = ({
  formRef,
  onScrollToForm,
  landingStats,
  heroCopy,
  onContactClick,
}: HeroSectionProps) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HomeFormValues>({ mode: 'onChange' });
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { createOrder, isLoading: isCreatingOrder } = useCreateOrder();
  const { createPublicOrder, isLoading: isCreatingPublicOrder } = useCreatePublicOrder();

  const onSubmit = handleSubmit((data) => {
    const sender = validateAndFormatPhoneNumber(data.senderPhoneNumber);
    const recipient = validateAndFormatPhoneNumber(data.recipientPhoneNumber);
    if (!sender.formattedNumber || !recipient.formattedNumber) return;
    if (isAuthenticated) {
      createOrder({
        senderPhoneNumber: sender.formattedNumber,
        recipientPhoneNumber: recipient.formattedNumber,
      });
    } else {
      createPublicOrder({
        senderPhoneNumber: sender.formattedNumber,
        recipientPhoneNumber: recipient.formattedNumber,
      });
    }
  });

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white">
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-slate-100/40"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-slate-200/35 blur-[120px]"
        aria-hidden="true"
      />

      <figure
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      <article className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 pt-10 pb-16 lg:pt-14 lg:pb-20">
        <motion.section
          className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-center max-lg:justify-center min-h-[calc(100vh-6rem)]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.header
            className="w-full lg:w-[45%] lg:self-center flex flex-col max-lg:items-center max-lg:justify-center gap-6 order-2 lg:order-1 text-center lg:text-left"
            variants={itemVariants}
          >
            <HeroTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              personalLabel={heroCopy.personalTabLabel}
              businessLabel={heroCopy.businessTabLabel}
            />

            <HeroHeadline
              activeTab={activeTab}
              personalTitle1={heroCopy.personalTitle1}
              personalTitle2={heroCopy.personalTitle2}
              personalSubtitle={heroCopy.personalSubtitle}
              businessTitle1={heroCopy.businessTitle1}
              businessTitle2={heroCopy.businessTitle2}
              businessSubtitle={heroCopy.businessSubtitle}
            />

            <HeroTrustIndicators
              landingStats={landingStats}
              customersLabel={heroCopy.customersLabel}
              trustDailyLabel={heroCopy.trustDailyLabel}
              growingCommunityLabel={heroCopy.growingCommunityLabel}
            />

            <HeroBusinessCta
              isActive={activeTab === 'business'}
              accountLabel={heroCopy.businessAccountCta}
              tryQuickDeliveryLabel={heroCopy.tryQuickDeliveryLabel}
              onScrollToForm={onScrollToForm}
              onContactClick={onContactClick}
            />
          </motion.header>

          <motion.aside
            className="w-full lg:w-[55%] flex justify-center lg:justify-end order-1 lg:order-2"
            variants={itemVariants}
          >
            <motion.article
              className="relative w-full max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <HeroForm
                formRef={formRef}
                onSubmit={onSubmit}
                control={control}
                isLoading={isCreatingOrder || isCreatingPublicOrder}
                errors={errors}
                copy={{
                  formTitle: heroCopy.formTitle,
                  formSubtitle: heroCopy.formSubtitle,
                  quickStartLabel: heroCopy.quickStartLabel,
                  senderLabel: heroCopy.senderLabel,
                  senderPlaceholder: heroCopy.senderPlaceholder,
                  recipientLabel: heroCopy.recipientLabel,
                  recipientPlaceholder: heroCopy.recipientPlaceholder,
                  continueLabel: heroCopy.continueLabel,
                  haveOrderLabel: heroCopy.haveOrderLabel,
                  trackHereLabel: heroCopy.trackHereLabel,
                  verifiedRidersLabel: heroCopy.verifiedRidersLabel,
                  realtimeTrackingLabel: heroCopy.realtimeTrackingLabel,
                }}
              />
            </motion.article>
          </motion.aside>
        </motion.section>
      </article>

      <HeroScrollIndicator />
    </section>
  );
};

export default HeroSection;
