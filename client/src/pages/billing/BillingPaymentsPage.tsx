import { useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCheckCircle,
  faCreditCard,
  faMoneyBillWave,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/states/hooks';
import {
  useFetchAllBillingsQuery,
  useFetchMyBillingHistoryQuery,
  useFetchMyOrganizationQuery,
} from '@/api/queries/organization.queries';
import { useFetchBusinessPlansQuery } from '@/api/queries/businessPlan.queries';
import {
  useMarkBillingAsPaidMutation,
  useMarkMyBillingAsPaidMutation,
} from '@/api/mutations/organization.mutations';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import Button from '@/components/inputs/Button';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
  InternalStatCard,
} from '@/components/layout/InternalPage';

type BillingTab = 'organizations' | 'businessPlans';

interface BillingOrder {
  id: string;
  referenceId?: string;
  recipientPhoneNumber?: string;
  recipient?: { phoneNumber?: string };
  createdAt?: string;
}

interface BillingRow {
  id: string;
  organizationId: string;
  totalOrders: number;
  totalAmount: number;
  currency?: string;
  status: string;
  paidAt?: string;
  periodStart?: string;
  periodEnd?: string;
  invoiceNumber?: string;
  organization?: { id: string; name?: string };
  businessPlan?: { id: string; name?: string };
  orders?: BillingOrder[];
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const NON_PAID_STATUSES = new Set(['PENDING', 'INVOICED', 'OVERDUE']);
const isBillingPaymentRequired = (row?: BillingRow) => {
  if (!row) return false;
  if (row.status === 'INVOICED' || row.status === 'OVERDUE') return true;
  if (row.status === 'PENDING' && row.periodEnd) {
    return new Date(row.periodEnd).getTime() < Date.now();
  }
  return false;
};

const BillingPaymentsPage = () => {
  useDocumentTitle('Billing & Payments');

  const { user } = useAppSelector((state) => state.auth);
  const roleNames = useMemo(
    () => (user?.userRoles || []).map((r) => r?.role?.name),
    [user?.userRoles],
  );
  const isAdmin = roleNames.includes('ADMIN');
  const isBusiness = roleNames.includes('BUSINESS');

  const [tab, setTab] = useState<BillingTab>('organizations');

  const {
    data: adminBillingsResp,
    isFetching: adminBillingsLoading,
    refetch: refetchAdminBillings,
  } = useFetchAllBillingsQuery(undefined, { skip: !isAdmin });
  const {
    data: myBillingsResp,
    isFetching: myBillingsLoading,
    refetch: refetchMyBillings,
  } = useFetchMyBillingHistoryQuery(undefined, { skip: !isBusiness });
  const { data: myOrgResp } = useFetchMyOrganizationQuery(undefined, { skip: !isBusiness });
  const { data: businessPlansResp } = useFetchBusinessPlansQuery();

  const [markBillingAsPaid, { isLoading: markingAdminPaid }] = useMarkBillingAsPaidMutation();
  const [markMyBillingAsPaid, { isLoading: markingBusinessPaid }] = useMarkMyBillingAsPaidMutation();

  const adminBillingRows = ((adminBillingsResp as { data?: { rows?: BillingRow[] } })?.data?.rows ||
    []) as BillingRow[];
  const myBillingRows = ((myBillingsResp as { data?: { rows?: BillingRow[] } })?.data?.rows ||
    []) as BillingRow[];
  const businessPlans =
    ((businessPlansResp as { data?: { rows?: Array<{ id: string; name: string; currency?: string; pricePerOrder?: number; billingPeriod?: string; isCustomPricing?: boolean; }> } })?.data?.rows || []);

  const groupedAdminBillings = useMemo(() => {
    const grouped = new Map<string, BillingRow[]>();
    adminBillingRows.forEach((row) => {
      const key = row.organizationId;
      const current = grouped.get(key) || [];
      current.push(row);
      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .map(([organizationId, rows]) => {
        const sorted = [...rows].sort(
          (a, b) =>
            new Date(b.periodEnd || b.createdAt || '').getTime() -
            new Date(a.periodEnd || a.createdAt || '').getTime(),
        );
        const currentDue = sorted.find((r) => NON_PAID_STATUSES.has(r.status));
        const history = sorted.filter((r) => r.status === 'PAID');
        return {
          organizationId,
          organizationName:
            sorted[0]?.organization?.name || `Organization ${organizationId.slice(0, 8)}`,
          currentDue,
          history,
        };
      })
      .sort((a, b) => a.organizationName.localeCompare(b.organizationName));
  }, [adminBillingRows]);

  const myCurrentDue = useMemo(
    () => {
      const sorted = myBillingRows
        .slice()
        .sort(
          (a, b) =>
            new Date(b.periodEnd || b.createdAt || '').getTime() -
            new Date(a.periodEnd || a.createdAt || '').getTime(),
        )
        .filter((row) => NON_PAID_STATUSES.has(row.status));
      return sorted.find((row) => isBillingPaymentRequired(row)) || sorted[0];
    },
    [myBillingRows],
  );

  const myBillingHistory = useMemo(
    () =>
      myBillingRows
        .filter((row) => row.status === 'PAID')
        .sort(
          (a, b) =>
            new Date(b.paidAt || b.updatedAt || '').getTime() -
            new Date(a.paidAt || a.updatedAt || '').getTime(),
        ),
    [myBillingRows],
  );

  const handleAdminMarkPaid = async (organizationId: string, billingId: string) => {
    try {
      await markBillingAsPaid({ organizationId, billingId }).unwrap();
      toast.success('Billing marked as paid successfully.');
      refetchAdminBillings();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to mark billing as paid.';
      toast.error(message);
    }
  };

  const handleBusinessPay = async (billingId: string) => {
    try {
      await markMyBillingAsPaid({ billingId }).unwrap();
      toast.success('Payment done successfully.');
      refetchMyBillings();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Payment failed. Please try again.';
      toast.error(message);
    }
  };

  const pendingAmountAdmin = useMemo(
    () =>
      adminBillingRows
        .filter((row) => NON_PAID_STATUSES.has(row.status))
        .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0),
    [adminBillingRows],
  );

  const pendingAmountBusiness = Number(myCurrentDue?.totalAmount || 0);

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Business"
          title="Billing & Payments"
          description="Track delivery billings, plan-based amounts, and payment history."
        />
      </motion.section>

      {isAdmin && (
        <motion.section className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={itemVariants}>
          <InternalStatCard
            label="Organizations"
            value={groupedAdminBillings.length}
            icon={<FontAwesomeIcon icon={faBuilding} />}
          />
          <InternalStatCard
            label="Pending Amount"
            value={formatCurrency(pendingAmountAdmin, 'RWF')}
            icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
          />
          <InternalStatCard
            label="Plans"
            value={businessPlans.length}
            icon={<FontAwesomeIcon icon={faCreditCard} />}
          />
        </motion.section>
      )}

      {isBusiness && (
        <motion.section className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={itemVariants}>
          <InternalStatCard
            label="Total Amount To Pay"
            value={formatCurrency(pendingAmountBusiness, myCurrentDue?.currency || 'RWF')}
            icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
          />
          <InternalStatCard
            label="Deliveries In Current Billing"
            value={myCurrentDue?.totalOrders || 0}
            icon={<FontAwesomeIcon icon={faBuilding} />}
          />
        </motion.section>
      )}

      {isAdmin && (
        <motion.section variants={itemVariants} className="flex gap-2">
          <Button
            type="button"
            submit
            primary={tab === 'organizations'}
            onClick={() => setTab('organizations')}
          >
            Organisations
          </Button>
          <Button
            type="button"
            submit
            primary={tab === 'businessPlans'}
            onClick={() => setTab('businessPlans')}
          >
            Business Plans
          </Button>
        </motion.section>
      )}

      {isAdmin && tab === 'organizations' && (
        <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4">
          {groupedAdminBillings.map((org) => (
            <InternalSectionCard
              key={org.organizationId}
              eyebrow="Organisation"
              title={org.organizationName}
              description={
                org.currentDue
                  ? `Current amount to pay: ${formatCurrency(org.currentDue.totalAmount, org.currentDue.currency || 'RWF')}`
                  : 'No unpaid billing cycle'
              }
              actions={
                org.currentDue ? (
                  <Button
                    type="button"
                    submit
                    primary
                    isLoading={markingAdminPaid}
                    onClick={() =>
                      handleAdminMarkPaid(org.organizationId, org.currentDue!.id)
                    }
                  >
                    Mark as Paid
                  </Button>
                ) : null
              }
            >
              {org.currentDue ? (
                <section className="space-y-3">
                  {isBillingPaymentRequired(org.currentDue) ? (
                    <p className="text-sm text-amber-700 font-medium">
                      Payment required before new deliveries proceed.
                    </p>
                  ) : null}
                  <div className="text-sm text-slate-600">
                    Plan:{' '}
                    <span className="font-medium text-slate-900">
                      {org.currentDue.businessPlan?.name || 'Not assigned'}
                    </span>{' '}
                    | Deliveries: <span className="font-medium text-slate-900">{org.currentDue.totalOrders}</span>
                  </div>
                  <div className="space-y-2">
                    {(org.currentDue.orders || []).slice(0, 8).map((order) => (
                      <article
                        key={order.id}
                        className="rounded border border-slate-200 bg-slate-50 p-3 text-sm"
                      >
                        <p className="font-medium text-slate-900">
                          Reference ID: {order.referenceId || order.id}
                        </p>
                        <p className="text-slate-600">
                          Delivery Date: {formatDate(order.createdAt, 'YYYY-MM-DD')}
                        </p>
                        <p className="text-slate-600">
                          Recipient Number:{' '}
                          {order.recipientPhoneNumber || order.recipient?.phoneNumber || 'N/A'}
                        </p>
                      </article>
                    ))}
                  </div>
                  {org.history.length > 0 ? (
                    <div className="pt-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                        Payment history
                      </p>
                      <div className="space-y-1">
                        {org.history.slice(0, 5).map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between text-sm text-slate-700"
                          >
                            <span>{formatDate(entry.paidAt || entry.updatedAt, 'YYYY-MM-DD')}</span>
                            <span>{formatCurrency(entry.totalAmount, entry.currency || 'RWF')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : (
                <p className="text-sm text-slate-500">No unpaid billing at the moment.</p>
              )}
            </InternalSectionCard>
          ))}
          {groupedAdminBillings.length === 0 && !adminBillingsLoading ? (
            <InternalSectionCard title="No Billing Data">
              <p className="text-sm text-slate-500">No organization billing records found.</p>
            </InternalSectionCard>
          ) : null}
        </motion.section>
      )}

      {isAdmin && tab === 'businessPlans' && (
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessPlans.map((plan) => (
            <InternalSectionCard
              key={plan.id}
              eyebrow="Plan"
              title={plan.name}
              description={
                plan.isCustomPricing
                  ? 'Custom pricing'
                  : `${formatCurrency(plan.pricePerOrder || 0, plan.currency || 'RWF')} / delivery`
              }
            >
              <p className="text-sm text-slate-600">
                Billing period: <span className="font-medium text-slate-900">{plan.billingPeriod || 'N/A'}</span>
              </p>
            </InternalSectionCard>
          ))}
        </motion.section>
      )}

      {!isAdmin && isBusiness && (
        <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4">
          <InternalSectionCard
            eyebrow="My Organization"
            title={myOrgResp?.data?.name || 'Organization'}
            description="Amounts are auto-calculated from deliveries and your assigned business plan cycle."
            actions={
              myCurrentDue ? (
                <Button
                  type="button"
                  submit
                  primary
                  isLoading={markingBusinessPaid}
                  onClick={() => handleBusinessPay(myCurrentDue.id)}
                >
                  {isBillingPaymentRequired(myCurrentDue) ? 'Pay Required Bill' : 'Pay Now (Optional)'}{' '}
                  {formatCurrency(myCurrentDue.totalAmount, myCurrentDue.currency || 'RWF')}
                </Button>
              ) : null
            }
          >
            {myCurrentDue ? (
              <section className="space-y-3">
                <p className="text-sm text-slate-700">
                  Total amount to pay:{' '}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(myCurrentDue.totalAmount, myCurrentDue.currency || 'RWF')}
                  </span>
                </p>
                <p className="text-sm text-slate-700">
                  Number of deliveries:{' '}
                  <span className="font-semibold text-slate-900">{myCurrentDue.totalOrders}</span>
                </p>
                <p className="text-sm text-slate-700">
                  Billing cycle:{' '}
                  <span className="font-semibold text-slate-900">
                    {formatDate(myCurrentDue.periodStart, 'YYYY-MM-DD')} - {formatDate(myCurrentDue.periodEnd, 'YYYY-MM-DD')}
                  </span>
                </p>
                {isBillingPaymentRequired(myCurrentDue) ? (
                  <aside className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                    Your plan threshold/time cycle has been exceeded. Billing payment is required before proceeding with new deliveries.
                  </aside>
                ) : (
                  <aside className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    You are currently billed by plan cycle. Payment is optional now, and required automatically once limit/time is exceeded.
                  </aside>
                )}
                <div className="space-y-2">
                  {(myCurrentDue.orders || []).map((order) => (
                    <article key={order.id} className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
                      <p className="font-medium text-slate-900">
                        Reference ID: {order.referenceId || order.id}
                      </p>
                      <p className="text-slate-600">
                        Delivery Date: {formatDate(order.createdAt, 'YYYY-MM-DD')}
                      </p>
                      <p className="text-slate-600">
                        Recipient Number:{' '}
                        {order.recipientPhoneNumber || order.recipient?.phoneNumber || 'N/A'}
                      </p>
                    </article>
                  ))}
                </div>
                <aside className="rounded border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">
                    MoMo code
                  </p>
                  <p className="text-base font-semibold text-emerald-900">
                    0464641 PEEKABOO LTD
                  </p>
                  <p className="text-sm text-emerald-800 mt-1">
                    Contact our official for confirmation.
                  </p>
                </aside>
              </section>
            ) : (
              <p className="text-sm text-slate-500">No unpaid billing found.</p>
            )}
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="History"
            title="Payments Completed"
            description="Past paid billing records for your business."
          >
            {myBillingHistory.length === 0 && !myBillingsLoading ? (
              <p className="text-sm text-slate-500">No payment history yet.</p>
            ) : (
              <div className="space-y-2">
                {myBillingHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded border border-slate-200 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {entry.invoiceNumber || 'Billing payment'}
                      </p>
                      <p className="text-slate-500">
                        {formatDate(entry.paidAt || entry.updatedAt, 'YYYY-MM-DD')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>{formatCurrency(entry.totalAmount, entry.currency || 'RWF')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InternalSectionCard>
        </motion.section>
      )}
    </InternalPage>
  );
};

export default BillingPaymentsPage;
