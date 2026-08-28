import type { RefObject } from 'react';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useCreateOrder, useCreatePublicOrder } from '@/hooks/orders/orders.hooks';
import { normalizePhoneNumber } from '@/utils/phone.util';
import { useAppSelector } from '@/states/hooks';
import type { LandingStats } from '@/types/landing.type';
import type { CustomerTab, HeroCopy, HomeFormValues } from '../home.types';
import { entranceVariants } from '../home.animations';
import HeroTabs from './HeroTabs';
import HeroHeadline from './HeroHeadline';
import HeroTrustIndicators from './HeroTrustIndicators';
import HeroBusinessCta from './HeroBusinessCta';
import HeroForm from './HeroForm';
import HeroRouteCard from './HeroRouteCard';

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
      locationFrom: undefined,
      locationTo: undefined,
    },
  });
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { createOrder, isLoading: isCreatingOrder } = useCreateOrder();
  const { createPublicOrder, isLoading: isCreatingPublicOrder } =
    useCreatePublicOrder();
  const isLoading = isCreatingOrder || isCreatingPublicOrder;

  const onSubmit = handleSubmit((data) => {
    const senderPhoneNumber = normalizePhoneNumber(data.senderPhoneNumber);
    const recipientPhoneNumber = normalizePhoneNumber(data.recipientPhoneNumber);
    if (!senderPhoneNumber || !recipientPhoneNumber) return;

    const payload = {
      senderPhoneNumber,
      recipientPhoneNumber,
      locationFrom: data.locationFrom,
      locationTo: data.locationTo,
    };

    if (isAuthenticated) createOrder(payload);
    else createPublicOrder(payload);
  });

  return (
    <section className="w-full bg-(--paper) text-(--ink) min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="app-container pb-10 pt-8 lg:pb-14 lg:pt-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-14">
          <motion.div
            className="flex flex-col items-start gap-5"
            variants={entranceVariants}
            initial="hidden"
            animate="visible"
          >
            {/* <HeroTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              personalLabel={heroCopy.personalTabLabel}
              businessLabel={heroCopy.businessTabLabel}
            /> */}

            <HeroHeadline
              activeTab={activeTab}
              personalTitle1={heroCopy.personalTitle1}
              personalTitle2={heroCopy.personalTitle2}
              personalSubtitle={heroCopy.personalSubtitle}
              businessTitle1={heroCopy.businessTitle1}
              businessTitle2={heroCopy.businessTitle2}
              businessSubtitle={heroCopy.businessSubtitle}
            />

            <HeroForm
              formRef={formRef}
              onSubmit={onSubmit}
              control={control}
              errors={errors}
              copy={{
                formTitle: heroCopy.formTitle,
                formSubtitle: heroCopy.formSubtitle,
                senderLabel: heroCopy.senderLabel,
                senderPlaceholder: heroCopy.senderPlaceholder,
                recipientLabel: heroCopy.recipientLabel,
                recipientPlaceholder: heroCopy.recipientPlaceholder,
              }}
            />

            <HeroBusinessCta
              isActive={activeTab === 'business'}
              isLoading={isLoading}
              accountLabel={heroCopy.businessAccountCta}
              primaryLabel={heroCopy.continueLabel}
              tryQuickDeliveryLabel={heroCopy.tryQuickDeliveryLabel}
              onContactClick={onContactClick}
              onTrackClick={onTrackClick}
            />

            <HeroTrustIndicators
              landingStats={landingStats}
              activeCustomersLabel={heroCopy.activeCustomersLabel}
              completedOrdersLabel={heroCopy.completedOrdersLabel}
              fallbackLabel={heroCopy.growingCommunityLabel}
            />
          </motion.div>

          <div className="max-lg:hidden">
            <HeroRouteCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
