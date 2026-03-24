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
      title: 'Payment Required Before New Delivery',
      description:
        'You already have an unpaid invoiced or overdue billing. Please pay first to continue creating deliveries.',
      billingId: payload?.data?.billingId,
      billingStatus: payload?.data?.billingStatus,
      blockType,
    };
  }

  if (blockType === 'PREVIOUS_PERIOD_UNPAID') {
    return {
      title: 'Previous Billing Is Unpaid',
      description:
        'A previous billing period ended and is still unpaid. Settle the previous amount first, then continue creating deliveries.',
      billingId: payload?.data?.billingId,
      billingStatus: payload?.data?.billingStatus,
      blockType,
    };
  }

  if (blockType === 'PLAN_LIMIT_REACHED') {
    return {
      title: 'Plan Limit Reached',
      description:
        'You reached your current plan delivery limit. Pay the old amount first, then move to a convenient new business plan to continue creating deliveries.',
      billingId: payload?.data?.billingId,
      billingStatus: payload?.data?.billingStatus,
      blockType,
    };
  }

  return {
    title: 'Billing Payment Needed',
    description:
      message ||
      'Billing payment is required before you can continue creating deliveries.',
    billingId: payload?.data?.billingId,
    billingStatus: payload?.data?.billingStatus,
    blockType,
  };
};
