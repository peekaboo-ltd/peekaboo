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
    personalTitle1: 'Send anything*,',
    personalTitle2: 'anywhere',
    personalSubtitle:
      'Peekaboo connects senders to verified riders for same-day delivery across Kigali. Book in under a minute, track every step, pay when it arrives.',
    businessTitle1: 'Move every order,',
    businessTitle2: 'smarter',
    businessSubtitle:
      'Bulk drops, live delivery analytics, weekly invoices, and dedicated support for Kigali teams that need logistics without the extra operations layer.',
    tryQuickDeliveryLabel: t('home.hero.tryQuickDelivery'),
    quickStartLabel: t('home.hero.quickStart'),
    formTitle: 'Book a rider',
    formSubtitle: "Share both phone numbers and we'll match a rider.",
    senderLabel: 'Pickup phone',
    senderPlaceholder: '780412884',
    recipientLabel: 'Recipient phone',
    recipientPlaceholder: '788902117',
    continueLabel: 'Book delivery',
    haveOrderLabel: t('home.hero.haveOrder'),
    trackHereLabel: t('home.hero.trackHere'),
    verifiedRidersLabel: t('home.hero.verifiedRiders'),
    realtimeTrackingLabel: t('home.hero.realtimeTracking'),
    activeCustomersLabel: t('home.stats.activeCustomers').toLowerCase(),
    completedOrdersLabel: t('home.stats.customersWithOrders').toLowerCase(),
    growingCommunityLabel: 'Trusted by senders across Kigali',
    businessAccountCta: t('home.b2b.cta.contact'),
  };

  const quickActions: IconCard[] = [
    {
      icon: PackagePlus,
      title: 'Send a package',
      description: 'Book a rider in under a minute',
    },
    {
      icon: MapPinned,
      title: 'Track delivery',
      description: 'Live updates from pickup to drop',
    },
    {
      icon: Building2,
      title: 'Business deliveries',
      description: 'Bulk sends, billing, dashboards',
    },
    {
      icon: Bike,
      title: 'Become a rider',
      description: 'Earn flexibly across Kigali',
    },
  ];

  const howItWorks: HowItWorksStep[] = [
    {
      step: '01',
      title: 'Tell us where',
      description:
        'Drop two phone numbers and the pickup area. We match a verified rider in seconds.',
      icon: PackagePlus,
    },
    {
      step: '02',
      title: 'Hand off the package',
      description:
        'Your rider arrives with ID, scans the parcel, and confirms drop details with you.',
      icon: Bike,
    },
    {
      step: '03',
      title: 'Track until it lands',
      description:
        'Live map. SMS to recipient. Photo proof on delivery. Pay cash, MoMo, or card.',
      icon: PackageCheck,
    },
  ];

  const whyItems: IconCard[] = [
    {
      icon: ShieldCheck,
      title: 'Verified riders',
      description: 'Background-checked, insured, and rated after every drop.',
    },
    {
      icon: Clock3,
      title: 'Predictable ETAs',
      description:
        "Live route times that account for Kigali's traffic, not just distance.",
    },
    {
      icon: ScanLine,
      title: 'Tamper-evident handoffs',
      description:
        'Sealed sleeves, photo proof, and signature capture for sensitive items.',
    },
    {
      icon: CreditCard,
      title: 'Pay how you want',
      description: 'Cash on delivery, MoMo, card, or post-paid invoices for businesses.',
    },
    {
      icon: MessageSquare,
      title: 'Real human support',
      description: 'WhatsApp, phone, or web chat answered by a Kigali team in under 90s.',
    },
    {
      icon: Route,
      title: 'Smart routing',
      description: 'Riders are matched and routed across Kigali to keep every drop on time.',
    },
  ];

  const businessFeatures: IconCard[] = [
    {
      icon: Upload,
      title: 'Bulk uploads',
      description: 'CSV in, hundreds of drops out. Schedule by hour or by route.',
    },
    {
      icon: ChartNoAxesCombined,
      title: 'Live analytics',
      description: 'Watch on-time, cost-per-drop, and rider performance in real time.',
    },
    {
      icon: FileText,
      title: 'Post-paid invoicing',
      description: 'Weekly statements, cost centres, MoMo or wire payment.',
    },
    {
      icon: Headphones,
      title: 'Dedicated support',
      description: 'An ops lead on WhatsApp, plus uptime support for engineering teams.',
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
      title: 'WhatsApp',
      subtitle: '+250 794 892 784',
      badge: '~90s',
      href: 'https://wa.me/250794892784?text=Hello%2C%20I%20need%20help%20with%20Peekaboo',
      external: true,
    },
    {
      icon: Phone,
      title: 'Phone',
      subtitle: '+250 794 892 784',
      badge: 'Live',
      href: 'tel:+250794892784',
    },
    {
      icon: Mail,
      title: 'Email',
      subtitle: 'info@peekaboo.co.rw',
      badge: '8 min',
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
      'E-commerce',
      'Restaurants',
      'Pharmacies',
      'Banks',
      'Retail',
      'Logistics',
    ],
    supportContacts,
  };
};
