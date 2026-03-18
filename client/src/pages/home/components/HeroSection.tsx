import type { RefObject } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
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
    <section className="relative min-h-screen w-full overflow-hidden bg-[#FAFAF7]">
      <figure
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary-200/10 via-transparent to-primary-200/10"
        aria-hidden="true"
      />
      <figure
        className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-secondary-200/30 blur-3xl"
        aria-hidden="true"
      />
      <figure
        className="pointer-events-none absolute -left-32 bottom-20 h-[400px] w-[400px] rounded-full bg-primary-200/20 blur-3xl"
        aria-hidden="true"
      />

      <article className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <motion.section
          className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-center max-lg:justify-center min-h-[calc(100vh-7rem)]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.header
            className="w-full lg:w-[46%] lg:self-center flex flex-col max-lg:items-center max-lg:justify-center gap-6 order-2 lg:order-1 text-center lg:text-left"
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
            className="w-full lg:w-[54%] flex justify-end order-1 lg:order-2"
            variants={itemVariants}
          >
            <section className="w-full max-w-2xl flex items-center justify-end max-lg:justify-center">
              <motion.article
                className="relative w-full"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
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
            </section>
          </motion.aside>
        </motion.section>
      </article>

      <HeroScrollIndicator />
    </section>
  );
};

export default HeroSection;
