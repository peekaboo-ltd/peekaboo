import {
  Bike,
  Building2,
  ChartNoAxesCombined,
  Clock3,
  CreditCard,
  FileText,
  Headphones,
  Mail,
  MapPinned,
  MessageSquare,
  PackageCheck,
  PackagePlus,
  Phone,
  Route,
  ScanLine,
  ShieldCheck,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/i18n/i18n';
import type { HeroCopy, HowItWorksStep, Testimonial } from './home.types';

interface IconCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface SupportContact {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge: string;
  href?: string;
  external?: boolean;
}

interface HomeContent {
  heroCopy: HeroCopy;
  quickActions: IconCard[];
  howItWorks: HowItWorksStep[];
  whyItems: IconCard[];
  businessFeatures: IconCard[];
  testimonials: Testimonial[];
  trustedByLabel: string;
  trustedByIndustries: string[];
  supportContacts: SupportContact[];
}

export const useHomeContent = (): HomeContent => {
  const { t } = useI18n();

  const heroCopy: HeroCopy = {
    personalTabLabel: t('home.hero.tab.personal'),
    businessTabLabel: t('home.hero.tab.business'),
    personalTitle1: t('home.hero.personalTitle1'),
    personalTitle2: t('home.hero.personalTitle2'),
    personalSubtitle: t('home.hero.personalSubtitle'),
    businessTitle1: t('home.hero.businessTitle1'),
    businessTitle2: t('home.hero.businessTitle2'),
    businessSubtitle: t('home.hero.businessSubtitle'),
    tryQuickDeliveryLabel: t('home.hero.tryQuickDelivery'),
    quickStartLabel: t('home.hero.quickStart'),
    formTitle: t('home.hero.bookRider'),
    formSubtitle: t('home.hero.formSubtitle'),
    senderLabel: t('home.hero.pickupPhone'),
    senderPlaceholder: '780412884',
    recipientLabel: t('home.hero.recipientPhone'),
    recipientPlaceholder: '788902117',
    continueLabel: t('home.hero.bookDelivery'),
    haveOrderLabel: t('home.hero.haveOrder'),
    trackHereLabel: t('home.hero.trackHere'),
    verifiedRidersLabel: t('home.hero.verifiedRiders'),
    realtimeTrackingLabel: t('home.hero.realtimeTracking'),
    activeCustomersLabel: t('home.stats.activeCustomers').toLowerCase(),
    completedOrdersLabel: t('home.stats.customersWithOrders').toLowerCase(),
    growingCommunityLabel: t('home.hero.community'),
    businessAccountCta: t('home.b2b.cta.contact'),
  };

  const quickActions: IconCard[] = [
    {
      icon: PackagePlus,
      title: t('home.quick.send.title'),
      description: t('home.quick.send.description'),
    },
    {
      icon: MapPinned,
      title: t('home.quick.track.title'),
      description: t('home.quick.track.description'),
    },
    {
      icon: Building2,
      title: t('home.quick.business.title'),
      description: t('home.quick.business.description'),
    },
    {
      icon: Bike,
      title: t('home.quick.rider.title'),
      description: t('home.quick.rider.description'),
    },
  ];

  const howItWorks: HowItWorksStep[] = [
    {
      step: '01',
      title: t('home.steps.location.title'),
      description: t('home.steps.location.description'),
      icon: PackagePlus,
    },
    {
      step: '02',
      title: t('home.steps.handoff.title'),
      description: t('home.steps.handoff.description'),
      icon: Bike,
    },
    {
      step: '03',
      title: t('home.steps.track.title'),
      description: t('home.steps.track.description'),
      icon: PackageCheck,
    },
  ];

  const whyItems: IconCard[] = [
    {
      icon: ShieldCheck,
      title: t('home.why.verified.title'),
      description: t('home.why.verified.description'),
    },
    {
      icon: Clock3,
      title: t('home.why.eta.title'),
      description: t('home.why.eta.description'),
    },
    {
      icon: ScanLine,
      title: t('home.why.handoff.title'),
      description: t('home.why.handoff.description'),
    },
    {
      icon: CreditCard,
      title: t('home.why.payment.title'),
      description: t('home.why.payment.description'),
    },
    {
      icon: MessageSquare,
      title: t('home.why.support.title'),
      description: t('home.why.support.description'),
    },
    {
      icon: Route,
      title: t('home.why.routing.title'),
      description: t('home.why.routing.description'),
    },
  ];

  const businessFeatures: IconCard[] = [
    {
      icon: Upload,
      title: t('home.business.bulk.title'),
      description: t('home.business.bulk.description'),
    },
    {
      icon: ChartNoAxesCombined,
      title: t('home.business.analytics.title'),
      description: t('home.business.analytics.description'),
    },
    {
      icon: FileText,
      title: t('home.business.invoices.title'),
      description: t('home.business.invoices.description'),
    },
    {
      icon: Headphones,
      title: t('home.business.support.title'),
      description: t('home.business.support.description'),
    },
  ];

  const testimonials: Testimonial[] = [
    {
      name: t('home.testimonials.t1.name'),
      role: t('home.testimonials.t1.role'),
      content: t('home.testimonials.t1.content'),
      type: 'business',
    },
    {
      name: t('home.testimonials.t2.name'),
      role: t('home.testimonials.t2.role'),
      content: t('home.testimonials.t2.content'),
      type: 'business',
    },
    {
      name: t('home.testimonials.t3.name'),
      role: t('home.testimonials.t3.role'),
      content: t('home.testimonials.t3.content'),
      type: 'personal',
    },
  ];

  const supportContacts: SupportContact[] = [
    {
      icon: MessageSquare,
      title: t('home.support.whatsapp'),
      subtitle: '+250 794 892 784',
      badge: t('home.support.whatsappBadge'),
      href: 'https://wa.me/250794892784?text=Hello%2C%20I%20need%20help%20with%20Peekaboo',
      external: true,
    },
    {
      icon: Phone,
      title: t('home.support.phone'),
      subtitle: '+250 794 892 784',
      badge: t('home.support.live'),
      href: 'tel:+250794892784',
    },
    {
      icon: Mail,
      title: t('home.support.email'),
      subtitle: 'info@peekaboo.co.rw',
      badge: t('home.support.emailBadge'),
      href: 'mailto:info@peekaboo.co.rw',
    },
  ];

  return {
    heroCopy,
    quickActions,
    howItWorks,
    whyItems,
    businessFeatures,
    testimonials,
    trustedByLabel: t('home.b2b.trustedBy'),
    trustedByIndustries: [
      t('home.industry.ecommerce'),
      t('home.industry.restaurants'),
      t('home.industry.pharmacies'),
      t('home.industry.banks'),
      t('home.industry.retail'),
      t('home.industry.logistics'),
    ],
    supportContacts,
  };
};
