import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { LucideIcon } from 'lucide-react';

export type CustomerTab = 'personal' | 'business';

export interface HomeFormValues {
  senderPhoneNumber: string;
  recipientPhoneNumber: string;
  locationFrom?: string;
  locationTo?: string;
}

export interface HeroCopy {
  personalTabLabel: string;
  businessTabLabel: string;
  personalTitle1: string;
  personalTitle2: string;
  personalSubtitle: string;
  businessTitle1: string;
  businessTitle2: string;
  businessSubtitle: string;
  tryQuickDeliveryLabel: string;
  quickStartLabel: string;
  formTitle: string;
  formSubtitle: string;
  senderLabel: string;
  senderPlaceholder: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  continueLabel: string;
  haveOrderLabel: string;
  trackHereLabel: string;
  verifiedRidersLabel: string;
  realtimeTrackingLabel: string;
  customersLabel: string;
  trustDailyLabel: string;
  growingCommunityLabel: string;
  businessAccountCta: string;
}

export interface FeatureItem {
  icon: IconDefinition | LucideIcon;
  title: string;
  description: string;
}

export interface BusinessFeatureItem {
  icon: IconDefinition | LucideIcon;
  title: string;
  description: string;
}

export interface BusinessHighlightStat {
  value: string;
  label: string;
  icon: IconDefinition;
}

export interface HeroBusinessStat {
  value: string;
  label: string;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  icon: IconDefinition | LucideIcon;
}

export type TestimonialType = 'business' | 'personal';

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  type: TestimonialType;
}

export interface BusinessPlan {
  name: string;
  description: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  detailsTo?: string;
}
