import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCreditCard,
  faFileLines,
  faMoneyBillWave,
} from '@fortawesome/free-solid-svg-icons';
import { ColumnDef } from '@tanstack/react-table';
import { useAppSelector } from '@/states/hooks';
import {
  useFetchAllBillingsQuery,
  useFetchMyBillingHistoryQuery,
  useFetchMyOrganizationQuery,
  useFetchOrganizationBillingHistoryQuery,
  useFetchOrganizationOrdersQuery,
  useFetchOrganizationsQuery,
} from '@/api/queries/organization.queries';
import {
  useMarkBillingAsPaidMutation,
  useMarkMyBillingAsPaidMutation,
} from '@/api/mutations/organization.mutations';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import { localStorageUtil } from '@/utils/localStorage.util';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import Button from '@/components/inputs/Button';
import Modal from '@/components/Modal';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
  InternalStatCard,
} from '@/components/layout/InternalPage';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import Table from '@/components/table/Table';
import { Order } from '@/types/order.type';

interface PricingTier {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit?: number;
  totalPrice?: number;
  label?: string;
  isCustom?: boolean;
}

interface PricingSnapshot {
  tiers?: PricingTier[];
  overflowRate?: number;
}

interface BillingRow {
  id: string;
  organizationId: string;
  totalOrders: number;
  totalAmount: number;
  currency?: string;
  status: string;
  paidAt?: string;
  updatedAt?: string;
  periodStart?: string;
  periodEnd?: string;
  invoiceNumber?: string;
  organization?: { id: string; name?: string };
  businessPlan?: {
    id: string;
    name?: string;
    billingPeriod?: string;
    currency?: string;
    pricePerOrder?: number;
  };
  pricingSnapshot?: PricingSnapshot;
  orders?: Order[];
}

interface OrganizationRow {
  id: string;
  name: string;
  billingPeriod?: string;
  phoneNumber?: string;
  businessPlan?: {
    id: string;
    name?: string;
    billingPeriod?: string;
    pricePerOrder?: number;
    currency?: string;
  };
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const PAGE_SIZE = 10;
const NON_PAID_STATUSES = new Set(['PENDING', 'INVOICED', 'OVERDUE']);
const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const isBillingPaymentRequired = (row?: BillingRow) => {
  if (!row) return false;
  if (row.status === 'INVOICED' || row.status === 'OVERDUE') return true;
  if (row.status === 'PENDING' && row.periodEnd) {
    return new Date(row.periodEnd).getTime() < Date.now();
  }
  return false;
};

const resolveAssignmentLabel = (order: Order) => {
  if (!order.assignments?.length) return 'Not assigned';
  const latest = [...order.assignments].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime(),
  )[0];

  const assignedName =
    latest?.assignedTo?.name || latest?.assignedTo?.phoneNumber || 'Unknown rider';
  return `${assignedName} (${latest?.status || 'PENDING'})`;
};

const resolvePlanTargetAmount = (billing?: BillingRow): number | null => {
  if (!billing) return null;

  const tiers = (billing.pricingSnapshot?.tiers || []).filter((tier) => !tier.isCustom);
  if (tiers.length > 0) {
    const matchingTier = tiers.find(
      (tier) =>
        billing.totalOrders >= tier.minQuantity &&
        (tier.maxQuantity == null || billing.totalOrders <= tier.maxQuantity),
    );

    if (matchingTier?.totalPrice != null) {
      return Number(matchingTier.totalPrice);
    }

    if (matchingTier?.pricePerUnit != null) {
      return Number(matchingTier.pricePerUnit) * Number(billing.totalOrders || 0);
    }
  }

  if (billing.businessPlan?.pricePerOrder != null) {
    return Number(billing.businessPlan.pricePerOrder) * Number(billing.totalOrders || 0);
  }

  return null;
};

const amountEquals = (a?: number | null, b?: number | null) => {
  if (a == null || b == null) return false;
  return Math.abs(Number(a) - Number(b)) < 0.01;
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

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [adminOrdersPage, setAdminOrdersPage] = useState(0);
  const [businessOrdersPage, setBusinessOrdersPage] = useState(0);
  const [showBusinessHistory, setShowBusinessHistory] = useState(false);
  const [showAdminHistory, setShowAdminHistory] = useState(false);
  const [businessHistoryPage, setBusinessHistoryPage] = useState(0);
  const [adminHistoryPage, setAdminHistoryPage] = useState(0);
  const [paymentWorkflowOpen, setPaymentWorkflowOpen] = useState(false);
  const [editableBusinessNumber, setEditableBusinessNumber] = useState('');
  const [invoiceDeliveriesModalOpen, setInvoiceDeliveriesModalOpen] = useState(false);
  const [selectedHistoryBilling, setSelectedHistoryBilling] = useState<BillingRow | null>(null);
  const [isRequestingReport, setIsRequestingReport] = useState(false);
  const [isSubmittingAdminReport, setIsSubmittingAdminReport] = useState(false);
  const [adminReportAction, setAdminReportAction] = useState<'download' | 'email' | null>(null);
  const [adminReportConfirmOpen, setAdminReportConfirmOpen] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return formatDateInput(date);
  });
  const [reportEndDate, setReportEndDate] = useState(() => formatDateInput(new Date()));

  const { data: organizationsResp } = useFetchOrganizationsQuery(
    { page: 0, size: 100 },
    { skip: !isAdmin },
  );

  const {
    data: adminBillingsResp,
    refetch: refetchAdminBillings,
  } = useFetchAllBillingsQuery(undefined, { skip: !isAdmin });

  const {
    data: myBillingsResp,
    refetch: refetchMyBillings,
  } = useFetchMyBillingHistoryQuery(undefined, { skip: !isBusiness });

  const {
    data: myPaidBillingsResp,
    isFetching: myPaidBillingsLoading,
  } = useFetchMyBillingHistoryQuery(
    {
      page: businessHistoryPage,
      size: PAGE_SIZE,
      status: 'PAID',
    },
    { skip: !isBusiness || !showBusinessHistory },
  );

  const { data: myOrgResp } = useFetchMyOrganizationQuery(undefined, { skip: !isBusiness });

  const {
    data: adminOrdersResp,
    isFetching: adminOrdersLoading,
  } = useFetchOrganizationOrdersQuery(
    {
      organizationId: selectedOrganizationId,
      page: adminOrdersPage,
      size: PAGE_SIZE,
    },
    { skip: !isAdmin || !selectedOrganizationId },
  );

  const {
    data: adminPaidBillingsResp,
    isFetching: adminPaidBillingsLoading,
  } = useFetchOrganizationBillingHistoryQuery(
    {
      organizationId: selectedOrganizationId,
      page: adminHistoryPage,
      size: PAGE_SIZE,
      status: 'PAID',
    },
    { skip: !isAdmin || !showAdminHistory || !selectedOrganizationId },
  );

  const [markBillingAsPaid, { isLoading: markingAdminPaid }] = useMarkBillingAsPaidMutation();
  const [markMyBillingAsPaid, { isLoading: markingBusinessPaid }] =
    useMarkMyBillingAsPaidMutation();

  const organizations =
    ((organizationsResp as { data?: { rows?: OrganizationRow[] } })?.data?.rows ||
      []) as OrganizationRow[];

  useEffect(() => {
    if (!isAdmin) return;
    if (!selectedOrganizationId && organizations.length > 0) {
      setSelectedOrganizationId(organizations[0].id);
    }
  }, [isAdmin, organizations, selectedOrganizationId]);

  useEffect(() => {
    setAdminOrdersPage(0);
  }, [selectedOrganizationId]);

  useEffect(() => {
    setAdminHistoryPage(0);
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (!showBusinessHistory) return;
    setBusinessHistoryPage(0);
  }, [showBusinessHistory]);

  useEffect(() => {
    if (!showAdminHistory) return;
    setAdminHistoryPage(0);
  }, [showAdminHistory]);

  useEffect(() => {
    if (!isBusiness) return;
    setEditableBusinessNumber(
      myOrgResp?.data?.phoneNumber || user?.phoneNumber || '',
    );
  }, [isBusiness, myOrgResp?.data?.phoneNumber, user?.phoneNumber]);

  const adminBillingRows = ((adminBillingsResp as { data?: { rows?: BillingRow[] } })?.data
    ?.rows || []) as BillingRow[];
  const myBillingRows = ((myBillingsResp as { data?: { rows?: BillingRow[] } })?.data?.rows ||
    []) as BillingRow[];

  const adminOrdersRows = ((adminOrdersResp as { data?: { rows?: Order[] } })?.data?.rows ||
    []) as Order[];
  const adminOrdersTotalPages =
    ((adminOrdersResp as { data?: { totalPages?: number } })?.data?.totalPages || 0) as number;
  const adminOrdersTotalCount =
    ((adminOrdersResp as { data?: { totalCount?: number } })?.data?.totalCount || 0) as number;

  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === selectedOrganizationId),
    [organizations, selectedOrganizationId],
  );

  const selectedOrganizationDue = useMemo(() => {
    const sorted = adminBillingRows
      .filter((row) => row.organizationId === selectedOrganizationId)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.periodEnd || b.createdAt || '').getTime() -
          new Date(a.periodEnd || a.createdAt || '').getTime(),
      );

    return sorted.find((row) => NON_PAID_STATUSES.has(row.status));
  }, [adminBillingRows, selectedOrganizationId]);

  const myCurrentDue = useMemo(() => {
    const sorted = myBillingRows
      .slice()
      .sort(
        (a, b) =>
          new Date(b.periodEnd || b.createdAt || '').getTime() -
          new Date(a.periodEnd || a.createdAt || '').getTime(),
      )
      .filter((row) => NON_PAID_STATUSES.has(row.status));
    return sorted.find((row) => isBillingPaymentRequired(row)) || sorted[0];
  }, [myBillingRows]);

  useEffect(() => {
    setBusinessOrdersPage(0);
  }, [myCurrentDue?.id]);

  const businessOrdersRows = useMemo(
    () => ((myCurrentDue?.orders || []) as Order[]),
    [myCurrentDue?.orders],
  );

  const businessOrdersTotalCount = businessOrdersRows.length;
  const businessOrdersTotalPages = Math.max(
    1,
    Math.ceil(businessOrdersTotalCount / PAGE_SIZE),
  );
  const businessPagedOrders = useMemo(
    () =>
      businessOrdersRows.slice(
        businessOrdersPage * PAGE_SIZE,
        businessOrdersPage * PAGE_SIZE + PAGE_SIZE,
      ),
    [businessOrdersPage, businessOrdersRows],
  );

  const myBillingHistory = ((myPaidBillingsResp as { data?: { rows?: BillingRow[] } })?.data
    ?.rows || []) as BillingRow[];
  const myBillingHistoryTotalPages =
    ((myPaidBillingsResp as { data?: { totalPages?: number } })?.data?.totalPages || 1) as number;

  const selectedOrganizationPaidHistory =
    ((adminPaidBillingsResp as { data?: { rows?: BillingRow[] } })?.data?.rows || []) as BillingRow[];
  const selectedOrganizationPaidHistoryTotalPages =
    ((adminPaidBillingsResp as { data?: { totalPages?: number } })?.data?.totalPages || 1) as number;

  const pendingAmountAdminGlobal = useMemo(
    () =>
      adminBillingRows
        .filter((row) => NON_PAID_STATUSES.has(row.status))
        .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0),
    [adminBillingRows],
  );

  const pendingAmountAdminSelectedOrganization = useMemo(
    () =>
      adminBillingRows
        .filter((row) => row.organizationId === selectedOrganizationId)
        .filter((row) => NON_PAID_STATUSES.has(row.status))
        .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0),
    [adminBillingRows, selectedOrganizationId],
  );

  const pendingAmountBusiness = useMemo(
    () =>
      myBillingRows
        .filter((row) => NON_PAID_STATUSES.has(row.status))
        .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0),
    [myBillingRows],
  );

  const adminCurrentPageDeliveriesTotal = useMemo(
    () =>
      adminOrdersRows.reduce(
        (sum, order) => sum + Number(order.finalFee || order.initialFee || 0),
        0,
      ),
    [adminOrdersRows],
  );

  const businessCurrentPageDeliveriesTotal = useMemo(
    () =>
      businessPagedOrders.reduce(
        (sum, order) => sum + Number(order.finalFee || order.initialFee || 0),
        0,
      ),
    [businessPagedOrders],
  );

  const businessPlanTargetAmount = useMemo(
    () => resolvePlanTargetAmount(myCurrentDue),
    [myCurrentDue],
  );

  const businessPayableAmount = useMemo(() => {
    if (!myCurrentDue) return 0;
    return amountEquals(pendingAmountBusiness, businessCurrentPageDeliveriesTotal)
      ? pendingAmountBusiness
      : businessCurrentPageDeliveriesTotal;
  }, [businessCurrentPageDeliveriesTotal, myCurrentDue, pendingAmountBusiness]);

  const canBusinessPay = useMemo(() => {
    return Boolean(myCurrentDue) && Number(businessPayableAmount) > 0;
  }, [businessPayableAmount, myCurrentDue]);

  const businessPayDisabledReason = useMemo(() => {
    if (!myCurrentDue) return 'No unpaid billing available right now.';
    if (canBusinessPay) return '';
    return 'No payable delivery amount found in the current page.';
  }, [canBusinessPay, myCurrentDue]);

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
      await markMyBillingAsPaid({
        billingId,
        amountPaid: businessPayableAmount,
        notes: editableBusinessNumber
          ? `Business payment contact: ${editableBusinessNumber}`
          : undefined,
      }).unwrap();
      toast.success('Payment completed. A new billing cycle will start for upcoming deliveries.');
      setPaymentWorkflowOpen(false);
      setBusinessOrdersPage(0);
      refetchMyBillings();
      setShowBusinessHistory(true);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Payment failed. Please try again.';
      toast.error(message);
    }
  };

  const adminOrdersColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: 'Reference ID',
        accessorKey: 'referenceId',
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: 'Tracking ID',
        accessorKey: 'trackingId',
        cell: ({ row }) => row.original.trackingId || 'N/A',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Recipient Number',
        id: 'recipientNumber',
        cell: ({ row }) =>
          row.original.recipientPhoneNumber || row.original.recipient?.phoneNumber || 'N/A',
      },
      {
        header: 'Sender Number',
        id: 'senderNumber',
        cell: ({ row }) =>
          row.original.sender?.phoneNumber || row.original.senderPhoneNumber || 'N/A',
      },
      {
        header: 'Assigned Rider',
        id: 'assignedRider',
        cell: ({ row }) => resolveAssignmentLabel(row.original),
      },
      {
        header: 'Fee',
        accessorKey: 'finalFee',
        cell: ({ row }) =>
          formatCurrency(row.original.finalFee || row.original.initialFee || 0, 'RWF'),
      },
      {
        header: 'Created By',
        id: 'createdBy',
        cell: ({ row }) =>
          row.original.createdBy?.name || row.original.createdBy?.phoneNumber || 'N/A',
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatDate(row.original.createdAt, 'YYYY-MM-DD HH:mm'),
      },
    ],
    [],
  );

  const businessOrdersColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: 'Reference ID',
        accessorKey: 'referenceId',
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: 'Tracking ID',
        accessorKey: 'trackingId',
        cell: ({ row }) => row.original.trackingId || 'N/A',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Recipient Number',
        id: 'recipientNumber',
        cell: ({ row }) =>
          row.original.recipientPhoneNumber || row.original.recipient?.phoneNumber || 'N/A',
      },
      {
        header: 'Sender Number',
        id: 'senderNumber',
        cell: ({ row }) =>
          row.original.sender?.phoneNumber || row.original.senderPhoneNumber || 'N/A',
      },
      {
        header: 'Fee',
        accessorKey: 'finalFee',
        cell: ({ row }) =>
          formatCurrency(row.original.finalFee || row.original.initialFee || 0, 'RWF'),
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatDate(row.original.createdAt, 'YYYY-MM-DD HH:mm'),
      },
    ],
    [],
  );

  const billingHistoryColumns = useMemo<ColumnDef<BillingRow>[]>(
    () => [
      {
        header: 'Invoice',
        accessorKey: 'invoiceNumber',
        cell: ({ row }) => row.original.invoiceNumber || row.original.id,
      },
      {
        header: 'Paid Date',
        id: 'paidDate',
        cell: ({ row }) => formatDate(row.original.paidAt || row.original.updatedAt, 'YYYY-MM-DD'),
      },
      {
        header: 'Deliveries',
        accessorKey: 'totalOrders',
      },
      {
        header: 'Amount',
        id: 'amount',
        cell: ({ row }) =>
          formatCurrency(row.original.totalAmount, row.original.currency || 'RWF'),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Action',
        id: 'action',
        cell: ({ row }) => (
          <button
            type="button"
            className="px-3 py-1 rounded border border-slate-300 text-xs hover:bg-slate-50"
            onClick={() => {
              setSelectedHistoryBilling(row.original);
              setInvoiceDeliveriesModalOpen(true);
            }}
          >
            View Deliveries
          </button>
        ),
      },
    ],
    [],
  );

  const invoiceDeliveryColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: 'Reference ID',
        accessorKey: 'referenceId',
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: 'Tracking ID',
        accessorKey: 'trackingId',
        cell: ({ row }) => row.original.trackingId || 'N/A',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Recipient Number',
        id: 'recipientNumber',
        cell: ({ row }) =>
          row.original.recipientPhoneNumber || row.original.recipient?.phoneNumber || 'N/A',
      },
      {
        header: 'Sender Number',
        id: 'senderNumber',
        cell: ({ row }) =>
          row.original.sender?.phoneNumber || row.original.senderPhoneNumber || 'N/A',
      },
      {
        header: 'Fee',
        accessorKey: 'finalFee',
        cell: ({ row }) =>
          formatCurrency(row.original.finalFee || row.original.initialFee || 0, 'RWF'),
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatDate(row.original.createdAt, 'YYYY-MM-DD HH:mm'),
      },
    ],
    [],
  );

  const invoicePaidDeliveries = useMemo(
    () => ((selectedHistoryBilling?.orders || []) as Order[]),
    [selectedHistoryBilling?.orders],
  );

  const closeInvoiceDeliveriesModal = useCallback(() => {
    setInvoiceDeliveriesModalOpen(false);
    setSelectedHistoryBilling(null);
  }, []);

  const openAdminReportConfirmation = useCallback(
    (action: 'download' | 'email') => {
      if (!selectedOrganizationId) {
        toast.error('Please select a business first.');
        return;
      }

      if (!reportStartDate || !reportEndDate) {
        toast.error('Please select both start and end dates.');
        return;
      }

      if (new Date(reportStartDate).getTime() > new Date(reportEndDate).getTime()) {
        toast.error('Start date cannot be after end date.');
        return;
      }

      setAdminReportAction(action);
      setAdminReportConfirmOpen(true);
    },
    [reportEndDate, reportStartDate, selectedOrganizationId],
  );

  const handleConfirmAdminReport = useCallback(async () => {
    if (!adminReportAction || !selectedOrganizationId) return;

    const token = localStorageUtil.getItem('token');
    if (!token) {
      toast.error('Please sign in again to continue.');
      return;
    }

    setIsSubmittingAdminReport(true);
    try {
      const query = new URLSearchParams({
        organizationId: selectedOrganizationId,
        startDate: reportStartDate,
        endDate: reportEndDate,
      });

      if (adminReportAction === 'download') {
        const response = await fetch(
          `${ENVIRONMENTS.API_URL}/dashboard/business-report/download?${query.toString()}`,
          {
            method: 'GET',
            headers: { authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error('Unable to download report');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `peekaboo_business_report_${selectedOrganizationId}_${reportStartDate}_${reportEndDate}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        toast.success('Report downloaded successfully.');
      } else {
        const response = await fetch(
          `${ENVIRONMENTS.API_URL}/dashboard/business-report/email?${query.toString()}`,
          {
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error('Unable to request report');
        }

        toast.success('Report requested and sent to email.');
      }

      setAdminReportConfirmOpen(false);
      setAdminReportAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Report action failed.');
    } finally {
      setIsSubmittingAdminReport(false);
    }
  }, [adminReportAction, reportEndDate, reportStartDate, selectedOrganizationId]);

  const handleRequestReport = useCallback(async () => {
    const token = localStorageUtil.getItem('token');
    if (!token) {
      toast.error('Please sign in again to request report.');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

    setIsRequestingReport(true);
    try {
      const query = new URLSearchParams({
        startDate: formatDateInput(startDate),
        endDate: formatDateInput(endDate),
      });
      const response = await fetch(
        `${ENVIRONMENTS.API_URL}/dashboard/business-report/email?${query.toString()}`,
        {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error('Unable to request report');
      }

      toast.success('Report requested. It will be sent to your email.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to request report.');
    } finally {
      setIsRequestingReport(false);
    }
  }, []);

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
            value={organizations.length}
            icon={<FontAwesomeIcon icon={faBuilding} />}
          />
          <InternalStatCard
            label="Pending Amount"
            value={formatCurrency(pendingAmountAdminGlobal, 'RWF')}
            icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
          />
          <InternalStatCard
            label="Deliveries (Selected Business)"
            value={adminOrdersTotalCount}
            icon={<FontAwesomeIcon icon={faCreditCard} />}
          />
        </motion.section>
      )}

      {isAdmin && (
        <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4">
          <InternalSectionCard
            eyebrow="Reports"
            title="Business Report"
            description="Pick a business and date range, then request or download its billing report."
            actions={
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  submit
                  primary
                  disabled={isSubmittingAdminReport}
                  onClick={() => openAdminReportConfirmation('email')}
                >
                  Request Report
                </Button>
                <Button
                  type="button"
                  submit
                  disabled={isSubmittingAdminReport}
                  onClick={() => openAdminReportConfirmation('download')}
                >
                  Download Report
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="text-sm text-slate-700">
                Business
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  value={selectedOrganizationId}
                  onChange={(event) => setSelectedOrganizationId(event.target.value)}
                >
                  <option value="" disabled>
                    Select business
                  </option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-700">
                Start date
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  value={reportStartDate}
                  onChange={(event) => setReportStartDate(event.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700">
                End date
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  value={reportEndDate}
                  onChange={(event) => setReportEndDate(event.target.value)}
                />
              </label>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Selected: <span className="font-medium text-slate-900">{selectedOrganization?.name || 'N/A'}</span>{' '}
              | {reportStartDate} to {reportEndDate}
            </p>
          </InternalSectionCard>
        </motion.section>
      )}

      {isBusiness && (
        <motion.section className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={itemVariants}>
          <InternalStatCard
            label="Total Amount To Pay"
            value={formatCurrency(pendingAmountBusiness, myCurrentDue?.currency || 'RWF')}
            icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
          />
          <InternalStatCard
            label="Deliveries In Current Billing"
            value={businessOrdersTotalCount}
            icon={<FontAwesomeIcon icon={faBuilding} />}
          />
          <InternalStatCard
            label="Report"
            value={
              <Button
                type="button"
                submit
                primary
                isLoading={isRequestingReport}
                disabled={isRequestingReport}
                onClick={handleRequestReport}
              >
                Request Report
              </Button>
            }
            icon={<FontAwesomeIcon icon={faFileLines} />}
          />
        </motion.section>
      )}

      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4">
        <InternalSectionCard
          eyebrow="Current Plan"
          title={
            isAdmin
              ? selectedOrganization?.businessPlan?.name ||
                selectedOrganizationDue?.businessPlan?.name ||
                'No plan assigned'
              : myOrgResp?.data?.businessPlan?.name ||
                myCurrentDue?.businessPlan?.name ||
                'No plan assigned'
          }
          description={
            isAdmin
              ? selectedOrganization
                ? `${selectedOrganization.name} • ${
                    selectedOrganization.businessPlan?.billingPeriod ||
                    selectedOrganization.billingPeriod ||
                    'N/A'
                  } cycle`
                : 'Select a business to see current plan in use.'
              : `${myOrgResp?.data?.name || 'My Organization'} • ${
                  myOrgResp?.data?.businessPlan?.billingPeriod ||
                  myOrgResp?.data?.billingPeriod ||
                  'N/A'
                } cycle`
          }
        >
          <p className="text-sm text-slate-600">
            {isAdmin
              ? 'Highlighted plan is based on the currently selected business.'
              : 'This is the active business plan currently used for your deliveries.'}
          </p>
        </InternalSectionCard>
      </motion.section>

      {isAdmin && (
        <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4">
          <InternalSectionCard
            eyebrow="Businesses"
            title="Select Business"
            description="Choose a business to load deliveries and billing details for that organization."
          >
            <label className="block text-sm text-slate-700 max-w-md">
              Business
              <select
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                value={selectedOrganizationId}
                onChange={(event) => setSelectedOrganizationId(event.target.value)}
              >
                <option value="" disabled>
                  Select business
                </option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="Deliveries"
            title={selectedOrganization ? `${selectedOrganization.name} Deliveries` : 'Deliveries'}
            description="All deliveries made by the selected company, including assignment details."
          >
            <Table
              columns={adminOrdersColumns}
              data={adminOrdersRows}
              showPagination={false}
              isLoading={adminOrdersLoading}
              noDataMessage="No deliveries found for the selected business."
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <p>Showing up to 10 deliveries per page.</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                  disabled={adminOrdersPage <= 0}
                  onClick={() => setAdminOrdersPage((prev) => Math.max(prev - 1, 0))}
                >
                  Prev
                </button>
                <span>
                  Page {adminOrdersTotalPages === 0 ? 1 : adminOrdersPage + 1} of{' '}
                  {adminOrdersTotalPages || 1}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                  disabled={
                    adminOrdersTotalPages === 0 || adminOrdersPage >= adminOrdersTotalPages - 1
                  }
                  onClick={() =>
                    setAdminOrdersPage((prev) =>
                      adminOrdersTotalPages > 0
                        ? Math.min(prev + 1, adminOrdersTotalPages - 1)
                        : 0,
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
            <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-600">
                Current page deliveries total:{' '}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(adminCurrentPageDeliveriesTotal, 'RWF')}
                </span>
              </p>
              <p className="text-slate-700 mt-1">
                Total to be paid (selected business):{' '}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(
                    pendingAmountAdminSelectedOrganization,
                    selectedOrganizationDue?.currency || 'RWF',
                  )}
                </span>
              </p>
            </div>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="Total To Be Paid"
            title={formatCurrency(
              pendingAmountAdminSelectedOrganization,
              selectedOrganizationDue?.currency || 'RWF',
            )}
            description="Total outstanding amount for the selected business."
            actions={
              selectedOrganizationDue ? (
                <Button
                  type="button"
                  submit
                  primary
                  isLoading={markingAdminPaid}
                  onClick={() =>
                    handleAdminMarkPaid(
                      selectedOrganizationDue.organizationId,
                      selectedOrganizationDue.id,
                    )
                  }
                >
                  Mark as Paid
                </Button>
              ) : null
            }
          >
            <p className="text-sm text-slate-600">
              {selectedOrganizationDue
                ? `Current unpaid invoice: ${
                    selectedOrganizationDue.invoiceNumber || selectedOrganizationDue.id
                  }`
                : 'No unpaid billing at the moment for this business.'}
            </p>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="Payment History"
            title="Selected Business Payment History"
            description="Toggle to show paid billing history."
            actions={
              <Button
                type="button"
                submit
                primary={showAdminHistory}
                onClick={() => setShowAdminHistory((prev) => !prev)}
              >
                {showAdminHistory ? 'Hide History' : 'Show History'}
              </Button>
            }
          >
            {showAdminHistory ? (
              <div className="space-y-3">
                <Table
                  columns={billingHistoryColumns}
                  data={selectedOrganizationPaidHistory}
                  showPagination={false}
                  isLoading={adminPaidBillingsLoading}
                  noDataMessage="No payment history for this business yet."
                />
                <div className="flex items-center justify-end gap-2 text-sm text-slate-600">
                  <button
                    type="button"
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                    disabled={adminHistoryPage <= 0}
                    onClick={() => setAdminHistoryPage((prev) => Math.max(prev - 1, 0))}
                  >
                    Prev
                  </button>
                  <span>
                    Page {adminHistoryPage + 1} of {selectedOrganizationPaidHistoryTotalPages || 1}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                    disabled={adminHistoryPage >= (selectedOrganizationPaidHistoryTotalPages - 1)}
                    onClick={() =>
                      setAdminHistoryPage((prev) =>
                        Math.min(prev + 1, Math.max(selectedOrganizationPaidHistoryTotalPages - 1, 0)),
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">History is hidden. Toggle to view.</p>
            )}
          </InternalSectionCard>
        </motion.section>
      )}

      {!isAdmin && isBusiness && (
        <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4">
          <InternalSectionCard
            eyebrow="Deliveries"
            title="All Deliveries Made By Your Company"
            description="All delivery information is included in this table except assignments."
          >
            <Table
              columns={businessOrdersColumns}
              data={businessPagedOrders}
              showPagination={false}
              noDataMessage="No deliveries in current billing cycle."
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <p>Showing up to 10 deliveries per page.</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                  disabled={businessOrdersPage <= 0}
                  onClick={() => setBusinessOrdersPage((prev) => Math.max(prev - 1, 0))}
                >
                  Prev
                </button>
                <span>
                  Page {businessOrdersTotalPages === 0 ? 1 : businessOrdersPage + 1} of{' '}
                  {businessOrdersTotalPages || 1}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                  disabled={
                    businessOrdersTotalPages === 0 ||
                    businessOrdersPage >= businessOrdersTotalPages - 1
                  }
                  onClick={() =>
                    setBusinessOrdersPage((prev) =>
                      businessOrdersTotalPages > 0
                        ? Math.min(prev + 1, businessOrdersTotalPages - 1)
                        : 0,
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
            <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-600">
                Current page deliveries total:{' '}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(businessCurrentPageDeliveriesTotal, 'RWF')}
                </span>
              </p>
              <p className="text-slate-700 mt-1">
                Total to be paid at the moment:{' '}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pendingAmountBusiness, myCurrentDue?.currency || 'RWF')}
                </span>
              </p>
            </div>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="Pay Business Plan"
            title={formatCurrency(businessPayableAmount, myCurrentDue?.currency || 'RWF')}
            description="Payment workflow for your current business plan."
            actions={
              <Button
                type="button"
                submit
                primary
                disabled={!canBusinessPay || !myCurrentDue}
                onClick={() => setPaymentWorkflowOpen(true)}
              >
                Start Payment Workflow
              </Button>
            }
          >
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                Current plan:{' '}
                <span className="font-medium text-slate-900">
                  {myOrgResp?.data?.businessPlan?.name ||
                    myCurrentDue?.businessPlan?.name ||
                    'No plan assigned'}
                </span>
              </p>
              <p>
                Deliveries in billing:{' '}
                <span className="font-medium text-slate-900">{myCurrentDue?.totalOrders || 0}</span>
              </p>
              <p>
                Billed amount:{' '}
                <span className="font-medium text-slate-900">
                  {formatCurrency(myCurrentDue?.totalAmount || 0, myCurrentDue?.currency || 'RWF')}
                </span>
              </p>
              <p>
                Pay now amount:{' '}
                <span className="font-medium text-slate-900">
                  {formatCurrency(businessPayableAmount, myCurrentDue?.currency || 'RWF')}
                </span>
              </p>
              <p>
                Plan target amount:{' '}
                <span className="font-medium text-slate-900">
                  {businessPlanTargetAmount != null
                    ? formatCurrency(businessPlanTargetAmount, myCurrentDue?.currency || 'RWF')
                    : 'N/A'}
                </span>
              </p>
              {businessPayDisabledReason ? (
                <p className="text-amber-700">{businessPayDisabledReason}</p>
              ) : (
                <p className="text-emerald-700">
                  Payment is active. After payment, new deliveries continue on a new billing record.
                </p>
              )}
            </div>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="Payment History"
            title="Payments Completed"
            description="Keep this table and toggle it whenever you want to review paid bills."
            actions={
              <Button
                type="button"
                submit
                primary={showBusinessHistory}
                onClick={() => setShowBusinessHistory((prev) => !prev)}
              >
                {showBusinessHistory ? 'Hide History' : 'Show History'}
              </Button>
            }
          >
            {showBusinessHistory ? (
              <div className="space-y-3">
                <Table
                  columns={billingHistoryColumns}
                  data={myBillingHistory}
                  showPagination={false}
                  isLoading={myPaidBillingsLoading}
                  noDataMessage="No payment history yet."
                />
                <div className="flex items-center justify-end gap-2 text-sm text-slate-600">
                  <button
                    type="button"
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                    disabled={businessHistoryPage <= 0}
                    onClick={() => setBusinessHistoryPage((prev) => Math.max(prev - 1, 0))}
                  >
                    Prev
                  </button>
                  <span>
                    Page {businessHistoryPage + 1} of {myBillingHistoryTotalPages || 1}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                    disabled={businessHistoryPage >= (myBillingHistoryTotalPages - 1)}
                    onClick={() =>
                      setBusinessHistoryPage((prev) =>
                        Math.min(prev + 1, Math.max(myBillingHistoryTotalPages - 1, 0)),
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">History is hidden. Toggle to view.</p>
            )}
          </InternalSectionCard>
        </motion.section>
      )}

      <Modal
        isOpen={adminReportConfirmOpen}
        onClose={() => {
          if (isSubmittingAdminReport) return;
          setAdminReportConfirmOpen(false);
          setAdminReportAction(null);
        }}
        heading="Confirm Report Details"
        description="Please confirm the selected business and report time range."
      >
        <section className="space-y-4">
          <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm space-y-2">
            <p>
              Business:{' '}
              <span className="font-medium text-slate-900">
                {selectedOrganization?.name || 'Not selected'}
              </span>
            </p>
            <p>
              Start date:{' '}
              <span className="font-medium text-slate-900">{reportStartDate || 'Not selected'}</span>
            </p>
            <p>
              End date:{' '}
              <span className="font-medium text-slate-900">{reportEndDate || 'Not selected'}</span>
            </p>
            <p>
              Action:{' '}
              <span className="font-medium text-slate-900">
                {adminReportAction === 'download' ? 'Download report' : 'Request report by email'}
              </span>
            </p>
          </div>

          <p className="text-sm text-slate-700">
            Is this the correct business and time range for your report?
          </p>

          <footer className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              onClick={() => {
                if (isSubmittingAdminReport) return;
                setAdminReportConfirmOpen(false);
                setAdminReportAction(null);
              }}
            >
              No, Edit
            </Button>
            <Button
              type="button"
              primary
              isLoading={isSubmittingAdminReport}
              disabled={isSubmittingAdminReport}
              onClick={handleConfirmAdminReport}
            >
              Yes, Continue
            </Button>
          </footer>
        </section>
      </Modal>

      <Modal
        isOpen={paymentWorkflowOpen}
        onClose={() => setPaymentWorkflowOpen(false)}
        heading="Business Plan Payment Workflow"
        description="Review and confirm payment details for your current business plan."
      >
        <section className="space-y-4">
          <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm space-y-2">
            <p>
              Current business plan:{' '}
              <span className="font-medium text-slate-900">
                {myOrgResp?.data?.businessPlan?.name || myCurrentDue?.businessPlan?.name || 'N/A'}
              </span>
            </p>
            <p>
              Amount to pay:{' '}
              <span className="font-medium text-slate-900">
                {formatCurrency(businessPayableAmount, myCurrentDue?.currency || 'RWF')}
              </span>
            </p>
            <p>
              Number of deliveries:{' '}
              <span className="font-medium text-slate-900">{myCurrentDue?.totalOrders || 0}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Business Number (editable)</label>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={editableBusinessNumber}
              onChange={(e) => setEditableBusinessNumber(e.target.value)}
              placeholder="Enter business phone number"
            />
          </div>

          {!canBusinessPay ? (
            <p className="text-sm text-amber-700">{businessPayDisabledReason}</p>
          ) : null}

          <footer className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" onClick={() => setPaymentWorkflowOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              primary
              isLoading={markingBusinessPaid}
              disabled={!canBusinessPay || !myCurrentDue}
              onClick={() => myCurrentDue && handleBusinessPay(myCurrentDue.id)}
            >
              Pay Business Plan
            </Button>
          </footer>
        </section>
      </Modal>

      <Modal
        isOpen={invoiceDeliveriesModalOpen}
        onClose={closeInvoiceDeliveriesModal}
        heading="Invoice Deliveries"
        description={
          selectedHistoryBilling
            ? `Deliveries paid in invoice ${selectedHistoryBilling.invoiceNumber || selectedHistoryBilling.id}`
            : 'Deliveries paid in this invoice.'
        }
      >
        <section className="space-y-3">
          <p className="text-sm text-slate-600">
            Total deliveries: <span className="font-medium text-slate-900">{invoicePaidDeliveries.length}</span>
          </p>
          <Table
            columns={invoiceDeliveryColumns}
            data={invoicePaidDeliveries}
            showPagination={false}
            noDataMessage="No deliveries found for this invoice."
          />
          <footer className="flex justify-end pt-2 border-t">
            <Button type="button" onClick={closeInvoiceDeliveriesModal}>
              Close
            </Button>
          </footer>
        </section>
      </Modal>
    </InternalPage>
  );
};

export default BillingPaymentsPage;
