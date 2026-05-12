import type { RefObject } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useCreateOrder, useCreatePublicOrder } from '@/hooks/orders/orders.hooks';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import { useAppSelector } from '@/states/hooks';
import type { LandingStats } from '@/types/landing.type';
import type { CustomerTab, HeroCopy, HomeFormValues } from '../home.types';
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
  const [activeTab, setActiveTab] = useState<CustomerTab>('personal');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HomeFormValues>({
    mode: 'onChange',
    defaultValues: {
      senderPhoneNumber: '',
      recipientPhoneNumber: '',
      locationFrom: 'Kacyiru',
      locationTo: 'Nyamirambo',
    },
  });
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { createOrder, isLoading: isCreatingOrder } = useCreateOrder();
  const { createPublicOrder, isLoading: isCreatingPublicOrder } = useCreatePublicOrder();

  const onSubmit = handleSubmit((data) => {
    const sender = validateAndFormatPhoneNumber(data.senderPhoneNumber);
    const recipient = validateAndFormatPhoneNumber(data.recipientPhoneNumber);
    if (!sender.formattedNumber || !recipient.formattedNumber) return;

    const payload = {
      senderPhoneNumber: sender.formattedNumber,
      recipientPhoneNumber: recipient.formattedNumber,
    };

    if (isAuthenticated) {
      createOrder(payload);
    } else {
      createPublicOrder(payload);
    }
  });

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] text-white">
      <figure
        className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,196,0,0.18),transparent_70%)]"
        aria-hidden="true"
      />
      <figure
        className="pointer-events-none absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.05),transparent_70%)]"
        aria-hidden="true"
      />

      <article className="relative mx-auto max-w-[1280px] px-5 pb-12 pt-20 sm:px-8 lg:px-10 lg:pb-16 lg:pt-24">
        <motion.section
          className="grid min-h-[calc(100vh-8rem)] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.header className="flex flex-col items-start gap-6" variants={itemVariants}>
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

            <HeroBusinessCta
              isActive={activeTab === 'business'}
              accountLabel={heroCopy.businessAccountCta}
              tryQuickDeliveryLabel={heroCopy.tryQuickDeliveryLabel}
              onScrollToForm={onScrollToForm}
              onContactClick={onContactClick}
            />

            <HeroTrustIndicators
              landingStats={landingStats}
              customersLabel={heroCopy.customersLabel}
              trustDailyLabel={heroCopy.trustDailyLabel}
              growingCommunityLabel={heroCopy.growingCommunityLabel}
            />
          </motion.header>

          <motion.aside variants={itemVariants} className="w-full lg:justify-self-end">
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
          </motion.aside>
        </motion.section>
      </article>

      <aside className="relative z-10 border-t border-white/[0.05]" />

      <HeroScrollIndicator />
    </section>
  );
};

export default HeroSection;
