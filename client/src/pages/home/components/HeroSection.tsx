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
import HeroScene from '@/components/three/HeroScene';
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
  onTrackClick?: () => void;
}

const HeroSection = ({
  formRef,
  onScrollToForm,
  landingStats,
  heroCopy,
  onContactClick,
  onTrackClick,
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
    if (!sender.e164 || !recipient.e164) return;

    const payload = {
      senderPhoneNumber: sender.e164,
      recipientPhoneNumber: recipient.e164,
    };

    if (isAuthenticated) {
      createOrder(payload);
    } else {
      createPublicOrder(payload);
    }
  });

  return (
    <section className="relative isolate w-full overflow-hidden bg-[var(--peekaboo-surface)] text-foreground">
      {/* Subtle brand-aligned delivery scene, matching the auth backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <HeroScene />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--secondary)_12%,transparent)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--peekaboo-surface)_36%,transparent)_0%,color-mix(in_oklab,var(--peekaboo-surface)_64%,transparent)_52%,color-mix(in_oklab,var(--peekaboo-surface)_92%,transparent)_100%)]" />

      <article className="relative z-10 mx-auto max-w-[1280px] px-5 pb-12 pt-18 sm:px-8 lg:px-10 lg:pb-14 lg:pt-22">
        <motion.section
          className="grid min-h-[calc(100vh-7rem)] items-center gap-9 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12"
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
              onTrackClick={onTrackClick}
            />

            <HeroTrustIndicators
              landingStats={landingStats}
              activeCustomersLabel={heroCopy.activeCustomersLabel}
              completedOrdersLabel={heroCopy.completedOrdersLabel}
              fallbackLabel={heroCopy.growingCommunityLabel}
            />
          </motion.header>

          <motion.aside variants={itemVariants} className="w-full bg-white lg:justify-self-end">
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

      <aside className="relative z-10 border-t border-border" />

      <HeroScrollIndicator />
    </section>
  );
};

export default HeroSection;
