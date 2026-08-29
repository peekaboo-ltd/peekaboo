export interface BillingGuardPrompt {
  title: string;
  description: string;
  billingId?: string;
  billingStatus?: string;
  blockType?: string;
}

type BillingGuardErrorPayload = {
  message?: string;
  data?: {
    billingId?: string;
    billingStatus?: string;
    billingBlockType?: string;
  };
};

export const parseBillingGuardPrompt = (
  error: unknown,
  t: I18nContextValue['t'],
): BillingGuardPrompt | null => {
  const payload = (error as { data?: BillingGuardErrorPayload })?.data;
  const message = payload?.message || '';
  const blockType = payload?.data?.billingBlockType;

  const looksLikeBillingBlock =
    Boolean(payload?.data?.billingId) ||
    message.toLowerCase().includes('billing') ||
    Boolean(blockType);

  if (!looksLikeBillingBlock) {
    return null;
  }

  if (blockType === 'UNPAID_INVOICED_OR_OVERDUE') {
    return {
      title: t('billingGuard.unpaidTitle'),
      description: t('billingGuard.unpaidDescription'),
      billingId: payload?.data?.billingId,
      billingStatus: payload?.data?.billingStatus,
      blockType,
    };
  }

  if (blockType === 'PREVIOUS_PERIOD_UNPAID') {
    return {
      title: t('billingGuard.previousTitle'),
      description: t('billingGuard.previousDescription'),
      billingId: payload?.data?.billingId,
      billingStatus: payload?.data?.billingStatus,
      blockType,
    };
  }

  if (blockType === 'PLAN_LIMIT_REACHED') {
    return {
      title: t('billingGuard.limitTitle'),
      description: t('billingGuard.limitDescription'),
      billingId: payload?.data?.billingId,
      billingStatus: payload?.data?.billingStatus,
      blockType,
    };
  }

  return {
    title: t('billingGuard.defaultTitle'),
    description: message || t('billingGuard.defaultDescription'),
    billingId: payload?.data?.billingId,
    billingStatus: payload?.data?.billingStatus,
    blockType,
  };
};
import type { I18nContextValue } from '@/i18n/i18n';
