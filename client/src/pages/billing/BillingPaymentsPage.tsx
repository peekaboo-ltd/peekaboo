import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCreditCard,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { ColumnDef } from "@tanstack/react-table";
import { useAppSelector } from "@/states/hooks";
import {
  useFetchAllBillingsQuery,
  useFetchMyBillingBreakdownQuery,
  useFetchMyBillingEstimateQuery,
  useFetchMyBillingHistoryQuery,
  useFetchMyOrganizationQuery,
  useFetchOrganizationBillingBreakdownQuery,
  useFetchOrganizationBillingEstimateQuery,
  useFetchOrganizationBillingHistoryQuery,
  useFetchOrganizationOrdersQuery,
  useFetchOrganizationsQuery,
} from "@/api/queries/organization.queries";
import {
  useMarkBillingAsPaidMutation,
  useMarkMyBillingAsPaidMutation,
} from "@/api/mutations/organization.mutations";
import { useDocumentTitle } from "@/hooks/common/useDocumentTitle";
import { formatCurrency, formatDate } from "@/utils/strings.util";
import { localStorageUtil } from "@/utils/localStorage.util";
import { ENVIRONMENTS } from "@/constants/environments.constants";
import Button from "@/components/inputs/Button";
import TelInput from "@/components/inputs/TelInput";
import Modal from "@/components/Modal";
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
  InternalStatCard,
} from "@/components/layout/InternalPage";
import { StatusBadge } from "@/components/inputs/StatusBadge";
import Table from "@/components/table/Table";
import { Order } from "@/types/order.type";
import type {
  BillingBreakdownResponseData,
  EarlyPaymentEstimateResponseData,
  OrganizationBillingSummary,
  TierBreakdown,
  TierBreakdownType,
} from "@/types/organization.type";
import { UUID } from "@/types";
import { RoleTypes } from "@/types/auth.type";
import Select from "@/components/inputs/Select";
import { Link } from "react-router-dom";
import { tableActionClassName } from "@/constants/inputs.constants";
import { faFileLines } from "@fortawesome/free-regular-svg-icons";
import { validateAndFormatPhoneNumber } from "@/utils/phone.util";
import { controlClassName } from '@/components/inputs/control';
import { cn } from '@/lib/utils';
import { useI18n, type I18nContextValue } from '@/i18n/i18n';

interface OrganizationRow {
  id: UUID;
  name: string;
  billingPeriod?: string;
  phoneNumber?: string;
  businessPlan?: {
    id: UUID;
    name?: string;
    billingPeriod?: string;
    pricePerOrder?: number;
    currency?: string;
  };
}

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const PAGE_SIZE = 10;
const NON_PAID_STATUSES = new Set(["PENDING", "INVOICED", "OVERDUE"]);
const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const isBillingPaymentRequired = (row?: OrganizationBillingSummary) => {
  if (!row) return false;
  if (row.status === "INVOICED" || row.status === "OVERDUE") return true;
  if (row.status === "PENDING" && row.periodEnd) {
    return new Date(row.periodEnd).getTime() < Date.now();
  }
  return false;
};

type Translate = I18nContextValue['t'];

const resolveAssignmentLabel = (order: Order, t: Translate) => {
  if (!order.assignments?.length) return t('billing.notAssigned');
  const latest = [...order.assignments].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime(),
  )[0];

  const assignedName =
    latest?.assignedTo?.name ||
    latest?.assignedTo?.phoneNumber ||
    t('billing.unknownRider');
  return `${assignedName} (${t(`status.${(latest?.status || 'PENDING').toLowerCase()}`)})`;
};

const resolveBillingCurrency = (...values: Array<string | undefined>) =>
  values.find((value) => value && value.trim()) || "RWF";

const resolveInvoiceIdentifier = (
  billing?: OrganizationBillingSummary | null,
) => billing?.invoiceNumber || billing?.id || "N/A";

const formatBillingPeriodRange = (
  periodStart?: string | Date,
  periodEnd?: string | Date,
  t?: Translate,
) => {
  if (!periodStart && !periodEnd) return t?.('billing.notAvailable') || 'N/A';
  const start = periodStart
    ? formatDate(periodStart, "YYYY-MM-DD")
    : t?.('billing.unknownStart') || 'N/A';
  const end = periodEnd ? formatDate(periodEnd, "YYYY-MM-DD") : t?.('billing.unknownEnd') || 'N/A';
  return t ? t('billing.range', { start, end }) : `${start} – ${end}`;
};

const getBreakdownTypeLabel = (type: TierBreakdownType | undefined, t: Translate) => {
  switch (type) {
    case "package":
      return t('billing.package');
    case "fallback":
      return t('billing.fallback');
    case "per_unit":
      return t('billing.perUnit');
    case "overflow":
      return t('billing.overflow');
    default:
      return t('billing.lineItem');
  }
};

const BreakdownTable = ({
  breakdown,
  currency,
  isLoading,
  errorMessage,
  emptyMessage,
}: {
  breakdown?: TierBreakdown[];
  currency: string;
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage: string;
}) => {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="rounded bg-(--surface) px-4 py-3 text-sm text-(--muted)">
        {t('billing.breakdownLoading')}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded bg-(--surface) px-4 py-3 text-sm text-(--ink)">
        {errorMessage}
      </div>
    );
  }

  if (!breakdown?.length) {
    return (
      <div className="rounded bg-(--surface) px-4 py-3 text-sm text-(--muted)">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-(--line)">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-(--surface) text-left text-(--muted)">
            <tr>
              <th className="px-4 py-3 font-normal text-xs">{t('billing.tier')}</th>
              <th className="px-4 py-3 font-normal text-xs">{t('billing.type')}</th>
              <th className="px-4 py-3 font-normal text-xs">{t('billing.deliveries')}</th>
              <th className="px-4 py-3 font-normal text-xs">{t('billing.unitPrice')}</th>
              <th className="px-4 py-3 font-normal text-xs">{t('billing.subtotal')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-(--paper)">
            {breakdown.map((row, index) => (
              <tr key={`${row.tierLabel}-${index}`}>
                <td className="px-4 py-3 text-(--ink)">{row.tierLabel}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-(--surface) px-2 py-1 text-xs text-(--muted)">
                    {getBreakdownTypeLabel(row.type, t)}
                  </span>
                </td>
                <td className="px-4 py-3 text-(--ink)">{row.quantity}</td>
                <td className="px-4 py-3 text-(--ink)">
                  {formatCurrency(row.unitPrice, currency)}
                </td>
                <td className="px-4 py-3 font-normal text-xs text-(--ink)">
                  {formatCurrency(row.subtotal, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BillingPaymentsPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('billing.docTitle'));

  const { user } = useAppSelector((state) => state.auth);
  const roleNames = useMemo(
    () => (user?.userRoles || []).map((r) => r?.role?.name),
    [user?.userRoles],
  );
  const isAdmin = roleNames.includes(RoleTypes.ADMIN);
  const isBusiness = roleNames.includes(RoleTypes.BUSINESS);

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    UUID | undefined
  >(undefined);
  const [adminOrdersPage, setAdminOrdersPage] = useState(0);
  const [businessOrdersPage, setBusinessOrdersPage] = useState(0);
  const [showBusinessHistory, setShowBusinessHistory] = useState(false);
  const [showAdminHistory, setShowAdminHistory] = useState(false);
  const [businessHistoryPage, setBusinessHistoryPage] = useState(0);
  const [adminHistoryPage, setAdminHistoryPage] = useState(0);
  const [paymentWorkflowOpen, setPaymentWorkflowOpen] = useState(false);
  const [editableBusinessNumber, setEditableBusinessNumber] = useState("");
  const [invoiceDeliveriesModalOpen, setInvoiceDeliveriesModalOpen] =
    useState(false);
  const [selectedHistoryBilling, setSelectedHistoryBilling] =
    useState<OrganizationBillingSummary | null>(null);
  const [isRequestingReport, setIsRequestingReport] = useState(false);
  const [isSubmittingAdminReport, setIsSubmittingAdminReport] = useState(false);
  const [adminReportAction, setAdminReportAction] = useState<
    "download" | "email" | null
  >(null);
  const [adminReportConfirmOpen, setAdminReportConfirmOpen] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return formatDateInput(date);
  });
  const [reportEndDate, setReportEndDate] = useState(() =>
    formatDateInput(new Date()),
  );

  const { data: organizationsResp } = useFetchOrganizationsQuery(
    { page: 0, size: 100 },
    { skip: !isAdmin },
  );

  const { data: adminBillingsResp, refetch: refetchAdminBillings } =
    useFetchAllBillingsQuery(undefined, { skip: !isAdmin });

  const { data: myBillingsResp, refetch: refetchMyBillings } =
    useFetchMyBillingHistoryQuery(undefined, { skip: !isBusiness });

  const { data: myPaidBillingsResp, isFetching: myPaidBillingsLoading } =
    useFetchMyBillingHistoryQuery(
      {
        page: businessHistoryPage,
        size: PAGE_SIZE,
        status: "PAID",
      },
      { skip: !isBusiness || !showBusinessHistory },
    );

  const { data: myOrgResp } = useFetchMyOrganizationQuery(undefined, {
    skip: !isBusiness,
  });

  const { data: adminOrdersResp, isFetching: adminOrdersLoading } =
    useFetchOrganizationOrdersQuery(
      {
        organizationId: selectedOrganizationId as UUID,
        page: adminOrdersPage,
        size: PAGE_SIZE,
      },
      { skip: !isAdmin || !selectedOrganizationId },
    );

  const { data: adminPaidBillingsResp, isFetching: adminPaidBillingsLoading } =
    useFetchOrganizationBillingHistoryQuery(
      {
        organizationId: selectedOrganizationId as UUID,
        page: adminHistoryPage,
        size: PAGE_SIZE,
        status: "PAID",
      },
      { skip: !isAdmin || !showAdminHistory || !selectedOrganizationId },
    );

  const [markBillingAsPaid, { isLoading: markingAdminPaid }] =
    useMarkBillingAsPaidMutation();
  const [markMyBillingAsPaid, { isLoading: markingBusinessPaid }] =
    useMarkMyBillingAsPaidMutation();

  const organizations = useMemo(
    () =>
      ((organizationsResp as { data?: { rows?: OrganizationRow[] } })?.data
        ?.rows || []) as OrganizationRow[],
    [organizationsResp],
  );

  useEffect(() => {
    if (!isAdmin) return;
    if (!selectedOrganizationId && organizations.length > 0) {
      setSelectedOrganizationId(organizations?.[0]?.id);
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
      myOrgResp?.data?.phoneNumber || user?.phoneNumber || "",
    );
  }, [isBusiness, myOrgResp?.data?.phoneNumber, user?.phoneNumber]);

  const adminBillingRows = useMemo(
    () =>
      ((adminBillingsResp as { data?: { rows?: OrganizationBillingSummary[] } })
        ?.data?.rows || []) as OrganizationBillingSummary[],
    [adminBillingsResp],
  );
  const myBillingRows = useMemo(
    () =>
      ((myBillingsResp as { data?: { rows?: OrganizationBillingSummary[] } })
        ?.data?.rows || []) as OrganizationBillingSummary[],
    [myBillingsResp],
  );

  const adminOrdersRows = ((adminOrdersResp as { data?: { rows?: Order[] } })
    ?.data?.rows || []) as Order[];
  const adminOrdersTotalPages = ((
    adminOrdersResp as { data?: { totalPages?: number } }
  )?.data?.totalPages || 0) as number;
  const adminOrdersTotalCount = ((
    adminOrdersResp as { data?: { totalCount?: number } }
  )?.data?.totalCount || 0) as number;

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
          new Date(b.periodEnd || b.createdAt || "").getTime() -
          new Date(a.periodEnd || a.createdAt || "").getTime(),
      );

    return sorted.find((row) => NON_PAID_STATUSES.has(row.status));
  }, [adminBillingRows, selectedOrganizationId]);

  const myCurrentDue = useMemo(() => {
    const sorted = myBillingRows
      .slice()
      .sort(
        (a, b) =>
          new Date(b.periodEnd || b.createdAt || "").getTime() -
          new Date(a.periodEnd || a.createdAt || "").getTime(),
      )
      .filter((row) => NON_PAID_STATUSES.has(row.status));
    return sorted.find((row) => isBillingPaymentRequired(row)) || sorted[0];
  }, [myBillingRows]);

  useEffect(() => {
    setBusinessOrdersPage(0);
  }, [myCurrentDue?.id]);

  const businessOrdersRows = useMemo(
    () => (myCurrentDue?.orders || []) as Order[],
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

  const myBillingHistory = ((
    myPaidBillingsResp as { data?: { rows?: OrganizationBillingSummary[] } }
  )?.data?.rows || []) as OrganizationBillingSummary[];
  const myBillingHistoryTotalPages = ((
    myPaidBillingsResp as { data?: { totalPages?: number } }
  )?.data?.totalPages || 1) as number;

  const selectedOrganizationPaidHistory = ((
    adminPaidBillingsResp as { data?: { rows?: OrganizationBillingSummary[] } }
  )?.data?.rows || []) as OrganizationBillingSummary[];
  const selectedOrganizationPaidHistoryTotalPages = ((
    adminPaidBillingsResp as { data?: { totalPages?: number } }
  )?.data?.totalPages || 1) as number;

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

  const {
    data: myBillingEstimateResp,
    isFetching: myBillingEstimateLoading,
    error: myBillingEstimateError,
  } = useFetchMyBillingEstimateQuery(myCurrentDue?.id as UUID, {
    skip: !isBusiness || !myCurrentDue?.id,
  });

  const {
    data: myBillingBreakdownResp,
    isFetching: myBillingBreakdownLoading,
    error: myBillingBreakdownError,
  } = useFetchMyBillingBreakdownQuery(myCurrentDue?.id as UUID, {
    skip: !isBusiness || !myCurrentDue?.id,
  });

  const {
    data: adminBillingEstimateResp,
    isFetching: adminBillingEstimateLoading,
    error: adminBillingEstimateError,
  } = useFetchOrganizationBillingEstimateQuery(
    {
      organizationId: selectedOrganizationId as UUID,
      billingId: (selectedOrganizationDue?.id as UUID) || "",
    },
    {
      skip: !isAdmin || !selectedOrganizationId || !selectedOrganizationDue?.id,
    },
  );

  const {
    data: adminBillingBreakdownResp,
    isFetching: adminBillingBreakdownLoading,
    error: adminBillingBreakdownError,
  } = useFetchOrganizationBillingBreakdownQuery(
    {
      organizationId: selectedOrganizationId as UUID,
      billingId: (selectedOrganizationDue?.id as UUID) || "",
    },
    {
      skip: !isAdmin || !selectedOrganizationId || !selectedOrganizationDue?.id,
    },
  );

  const {
    data: myHistoryBreakdownResp,
    isFetching: myHistoryBreakdownLoading,
    error: myHistoryBreakdownError,
  } = useFetchMyBillingBreakdownQuery(selectedHistoryBilling?.id as UUID, {
    skip:
      !isBusiness || !invoiceDeliveriesModalOpen || !selectedHistoryBilling?.id,
  });

  const {
    data: adminHistoryBreakdownResp,
    isFetching: adminHistoryBreakdownLoading,
    error: adminHistoryBreakdownError,
  } = useFetchOrganizationBillingBreakdownQuery(
    {
      organizationId: (selectedHistoryBilling?.organizationId as UUID) || "",
      billingId: (selectedHistoryBilling?.id as UUID) || "",
    },
    {
      skip:
        !isAdmin ||
        !invoiceDeliveriesModalOpen ||
        !selectedHistoryBilling?.id ||
        !selectedHistoryBilling?.organizationId,
    },
  );

  const currentEstimate: EarlyPaymentEstimateResponseData | undefined = isAdmin
    ? adminBillingEstimateResp?.data
    : myBillingEstimateResp?.data;
  const currentBreakdown: BillingBreakdownResponseData | undefined = isAdmin
    ? adminBillingBreakdownResp?.data
    : myBillingBreakdownResp?.data;
  const currentEstimateLoading = isAdmin
    ? adminBillingEstimateLoading
    : myBillingEstimateLoading;
  const currentEstimateError = isAdmin
    ? adminBillingEstimateError
    : myBillingEstimateError;
  const currentBreakdownLoading = isAdmin
    ? adminBillingBreakdownLoading
    : myBillingBreakdownLoading;
  const currentBreakdownError = isAdmin
    ? adminBillingBreakdownError
    : myBillingBreakdownError;

  const historyBreakdown: BillingBreakdownResponseData | undefined = isAdmin
    ? adminHistoryBreakdownResp?.data
    : myHistoryBreakdownResp?.data;
  const historyBreakdownLoading = isAdmin
    ? adminHistoryBreakdownLoading
    : myHistoryBreakdownLoading;
  const historyBreakdownError = isAdmin
    ? adminHistoryBreakdownError
    : myHistoryBreakdownError;

  const currentActiveBilling = isAdmin ? selectedOrganizationDue : myCurrentDue;
  const currentEstimateAmount =
    currentEstimate?.totalAmount || currentActiveBilling?.totalAmount || 0;
  const currentBillingCurrency = resolveBillingCurrency(
    currentEstimate?.currency,
    currentBreakdown?.currency,
    currentActiveBilling?.currency,
    currentActiveBilling?.businessPlan?.currency,
  );
  const currentBreakdownRows =
    currentBreakdown?.breakdown || currentEstimate?.breakdown || [];
  const currentTotalOrders =
    currentBreakdown?.totalOrders || currentActiveBilling?.totalOrders || 0;
  const currentPlanName =
    currentBreakdown?.planName ||
    currentActiveBilling?.businessPlan?.name ||
    selectedOrganization?.businessPlan?.name ||
    myOrgResp?.data?.businessPlan?.name ||
    t('billing.noPlan');

  const historyBreakdownRows = historyBreakdown?.breakdown || [];
  const historyBillingCurrency = resolveBillingCurrency(
    historyBreakdown?.currency,
    selectedHistoryBilling?.currency,
    selectedHistoryBilling?.businessPlan?.currency,
  );
  const invoicePaidDeliveries = useMemo(
    () => (selectedHistoryBilling?.orders || []) as Order[],
    [selectedHistoryBilling?.orders],
  );

  const editableBusinessPhoneValidation = useMemo(
    () =>
      editableBusinessNumber.trim()
        ? validateAndFormatPhoneNumber(editableBusinessNumber)
        : null,
    [editableBusinessNumber],
  );

  const businessPayDisabledReason = useMemo(() => {
    if (!myCurrentDue) return t('billing.noUnpaid');
    if (myBillingEstimateLoading)
      return t('billing.estimateLoading');
    if (myBillingEstimateError) {
      return t('billing.estimateError');
    }
    if (currentEstimateAmount <= 0)
      return t('billing.noAmountDue');
    if (editableBusinessPhoneValidation?.isValid === false) {
      return editableBusinessPhoneValidation.error || t('billing.validPhone');
    }
    return "";
  }, [
    currentEstimateAmount,
    myBillingEstimateError,
    myBillingEstimateLoading,
    myCurrentDue,
    editableBusinessPhoneValidation,
    t,
  ]);

  const canBusinessPay = useMemo(
    () =>
      Boolean(myCurrentDue) &&
      !businessPayDisabledReason &&
      currentEstimateAmount > 0,
    [businessPayDisabledReason, currentEstimateAmount, myCurrentDue],
  );

  const handleAdminMarkPaid = async (
    organizationId: string,
    billingId: string,
  ) => {
    try {
      await markBillingAsPaid({ organizationId, billingId }).unwrap();
      toast.success(t('billing.markPaidSuccess'));
      refetchAdminBillings();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('billing.markPaidError');
      toast.error(message);
    }
  };

  const handleBusinessPay = async (billingId: string) => {
    try {
      await markMyBillingAsPaid({
        billingId,
        amountPaid: currentEstimateAmount,
        notes: editableBusinessPhoneValidation?.e164
          ? `Business payment contact: ${editableBusinessPhoneValidation.e164}`
          : undefined,
      }).unwrap();
      toast.success(t('billing.paymentSuccess'));
      setPaymentWorkflowOpen(false);
      setBusinessOrdersPage(0);
      refetchMyBillings();
      setShowBusinessHistory(true);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t('billing.paymentError');
      toast.error(message);
    }
  };

  const adminOrdersColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: t('common.referenceId'),
        accessorKey: "referenceId",
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: t('billing.trackingId'),
        accessorKey: "trackingId",
        cell: ({ row }) => row.original.trackingId || "N/A",
      },
      {
        header: t('common.status'),
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: t('billing.recipientNumber'),
        id: "recipientNumber",
        cell: ({ row }) =>
          row.original.recipientPhoneNumber ||
          row.original.recipient?.phoneNumber ||
          "N/A",
      },
      {
        header: t('billing.senderNumber'),
        id: "senderNumber",
        cell: ({ row }) =>
          row.original.sender?.phoneNumber ||
          row.original.senderPhoneNumber ||
          "N/A",
      },
      {
        header: t('billing.assignedRider'),
        id: "assignedRider",
        cell: ({ row }) => resolveAssignmentLabel(row.original, t),
      },
      {
        header: t('common.fee'),
        accessorKey: "finalFee",
        cell: ({ row }) =>
          formatCurrency(
            row.original.finalFee || row.original.initialFee || 0,
            "RWF",
          ),
      },
      {
        header: t('common.createdBy'),
        id: "createdBy",
        cell: ({ row }) =>
          row.original.createdBy?.name ||
          row.original.createdBy?.phoneNumber ||
          "N/A",
      },
      {
        header: t('billing.createdAt'),
        accessorKey: "createdAt",
        cell: ({ row }) =>
          formatDate(row.original.createdAt, "YYYY-MM-DD HH:mm"),
      },
    ],
    [t],
  );

  const businessOrdersColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: t('common.referenceId'),
        accessorKey: "referenceId",
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: t('billing.trackingId'),
        accessorKey: "trackingId",
        cell: ({ row }) => row.original.trackingId || "N/A",
      },
      {
        header: t('common.status'),
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: t('billing.recipientNumber'),
        id: "recipientNumber",
        cell: ({ row }) =>
          row.original.recipientPhoneNumber ||
          row.original.recipient?.phoneNumber ||
          "N/A",
      },
      {
        header: t('billing.senderNumber'),
        id: "senderNumber",
        cell: ({ row }) =>
          row.original.sender?.phoneNumber ||
          row.original.senderPhoneNumber ||
          "N/A",
      },
      {
        header: t('common.fee'),
        accessorKey: "finalFee",
        cell: ({ row }) =>
          formatCurrency(
            row.original.finalFee || row.original.initialFee || 0,
            "RWF",
          ),
      },
      {
        header: t('billing.createdAt'),
        accessorKey: "createdAt",
        cell: ({ row }) =>
          formatDate(row.original.createdAt, "YYYY-MM-DD HH:mm"),
      },
    ],
    [t],
  );

  const billingHistoryColumns = useMemo<
    ColumnDef<OrganizationBillingSummary>[]
  >(
    () => [
      {
        header: t('billing.invoice'),
        accessorKey: "invoiceNumber",
        cell: ({ row }) => resolveInvoiceIdentifier(row.original),
      },
      {
        header: t('billing.paidDate'),
        id: "paidDate",
        cell: ({ row }) =>
          formatDate(
            row.original.paidAt || row.original.updatedAt,
            "YYYY-MM-DD",
          ),
      },
      {
        header: t('billing.deliveries'),
        accessorKey: "totalOrders",
      },
      {
        header: t('billing.amount'),
        id: "amount",
        cell: ({ row }) =>
          formatCurrency(
            row.original.totalAmount,
            resolveBillingCurrency(
              row.original.currency,
              row.original.businessPlan?.currency,
            ),
          ),
      },
      {
        header: t('common.status'),
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: t('billing.action'),
        id: "action",
        cell: ({ row }) => (
          <Link
            to={`#`}
            className={`${tableActionClassName} !w-fit`}
            onClick={(e) => {
              e.preventDefault();
              setSelectedHistoryBilling(row.original);
              setInvoiceDeliveriesModalOpen(true);
            }}
          >
            <FontAwesomeIcon icon={faFileLines} className="text-(--ink)" />
            {t('billing.viewInvoice')}
          </Link>
        ),
      },
    ],
    [t],
  );

  const invoiceDeliveryColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: t('common.referenceId'),
        accessorKey: "referenceId",
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: t('billing.trackingId'),
        accessorKey: "trackingId",
        cell: ({ row }) => row.original.trackingId || "N/A",
      },
      {
        header: t('common.status'),
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: t('billing.recipientNumber'),
        id: "recipientNumber",
        cell: ({ row }) =>
          row.original.recipientPhoneNumber ||
          row.original.recipient?.phoneNumber ||
          "N/A",
      },
      {
        header: t('billing.senderNumber'),
        id: "senderNumber",
        cell: ({ row }) =>
          row.original.sender?.phoneNumber ||
          row.original.senderPhoneNumber ||
          "N/A",
      },
      {
        header: t('common.fee'),
        accessorKey: "finalFee",
        cell: ({ row }) =>
          formatCurrency(
            row.original.finalFee || row.original.initialFee || 0,
            "RWF",
          ),
      },
      {
        header: t('billing.createdAt'),
        accessorKey: "createdAt",
        cell: ({ row }) =>
          formatDate(row.original.createdAt, "YYYY-MM-DD HH:mm"),
      },
    ],
    [t],
  );

  const closeInvoiceDeliveriesModal = useCallback(() => {
    setInvoiceDeliveriesModalOpen(false);
    setSelectedHistoryBilling(null);
  }, []);

  const openAdminReportConfirmation = useCallback(
    (action: "download" | "email") => {
      if (!selectedOrganizationId) {
        toast.error(t('billing.reportSelectBusiness'));
        return;
      }

      if (!reportStartDate || !reportEndDate) {
        toast.error(t('billing.reportSelectDates'));
        return;
      }

      if (
        new Date(reportStartDate).getTime() > new Date(reportEndDate).getTime()
      ) {
        toast.error(t('billing.reportDateOrder'));
        return;
      }

      setAdminReportAction(action);
      setAdminReportConfirmOpen(true);
    },
    [reportEndDate, reportStartDate, selectedOrganizationId, t],
  );

  const handleConfirmAdminReport = useCallback(async () => {
    if (!adminReportAction || !selectedOrganizationId) return;

    const token = localStorageUtil.getItem("token");
    if (!token) {
      toast.error(t('billing.signInContinue'));
      return;
    }

    setIsSubmittingAdminReport(true);
    try {
      const query = new URLSearchParams({
        organizationId: selectedOrganizationId,
        startDate: reportStartDate,
        endDate: reportEndDate,
      });

      if (adminReportAction === "download") {
        const response = await fetch(
          `${ENVIRONMENTS.API_URL}/dashboard/business-report/download?${query.toString()}`,
          {
            method: "GET",
            headers: { authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error(t('billing.reportDownloadError'));
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `peekaboo_business_report_${selectedOrganizationId}_${reportStartDate}_${reportEndDate}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        toast.success(t('billing.reportDownloaded'));
      } else {
        const response = await fetch(
          `${ENVIRONMENTS.API_URL}/dashboard/business-report/email?${query.toString()}`,
          {
            method: "POST",
            headers: { authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error(t('billing.reportRequestError'));
        }

        toast.success(t('billing.reportEmailed'));
      }

      setAdminReportConfirmOpen(false);
      setAdminReportAction(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('billing.reportActionError'),
      );
    } finally {
      setIsSubmittingAdminReport(false);
    }
  }, [
    adminReportAction,
    reportEndDate,
    reportStartDate,
    selectedOrganizationId,
    t,
  ]);

  const handleRequestReport = useCallback(async () => {
    const token = localStorageUtil.getItem("token");
    if (!token) {
      toast.error(t('billing.signInRequest'));
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    setIsRequestingReport(true);
    try {
      const query = new URLSearchParams({
        startDate: formatDateInput(startDate),
        endDate: formatDateInput(endDate),
      });
      const response = await fetch(
        `${ENVIRONMENTS.API_URL}/dashboard/business-report/email?${query.toString()}`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(t('billing.reportRequestError'));
      }

      toast.success(t('billing.reportRequested'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('billing.reportRequestError'),
      );
    } finally {
      setIsRequestingReport(false);
    }
  }, [t]);

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow={t('billing.eyebrow')}
          title={t('billing.title')}
          description={t('billing.description')}
        />
      </motion.section>

      {isAdmin && (
        <motion.section
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={itemVariants}
        >
          <InternalStatCard
            label={t('billing.organizations')}
            value={organizations.length}
            icon={<FontAwesomeIcon icon={faBuilding} />}
          />
          <InternalStatCard
            label={t('billing.pendingAmount')}
            value={formatCurrency(pendingAmountAdminGlobal, "RWF")}
            icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
          />
          <InternalStatCard
            label={t('billing.selectedDeliveries')}
            value={adminOrdersTotalCount}
            icon={<FontAwesomeIcon icon={faCreditCard} />}
          />
        </motion.section>
      )}

      {isAdmin && (
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 gap-4"
        >
          <InternalSectionCard
            eyebrow={t('billing.reports')}
            title={t('billing.businessReport')}
            description={t('billing.reportDescription')}
            actions={
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  submit
                  primary
                  disabled={isSubmittingAdminReport}
                  onClick={() => openAdminReportConfirmation("email")}
                >
                  {t('billing.requestReport')}
                </Button>
                <Button
                  type="button"
                  submit
                  disabled={isSubmittingAdminReport}
                  onClick={() => openAdminReportConfirmation("download")}
                >
                  {t('billing.downloadReport')}
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="text-sm text-(--ink)">
                {t('billing.business')}
                <Select
                  className="mt-1"
                  value={selectedOrganizationId}
                  onChange={(value) => setSelectedOrganizationId(value as UUID)}
                  options={organizations.map((org) => ({
                    label: org.name,
                    value: org.id,
                  }))}
                />
              </label>

              <label className="text-sm text-(--ink)">
                {t('billing.startDate')}
                <input
                  type="date"
                  className={cn(controlClassName, 'mt-1 px-3')}
                  value={reportStartDate}
                  onChange={(event) => setReportStartDate(event.target.value)}
                />
              </label>

              <label className="text-sm text-(--ink)">
                {t('billing.endDate')}
                <input
                  type="date"
                  className={cn(controlClassName, 'mt-1 px-3')}
                  value={reportEndDate}
                  onChange={(event) => setReportEndDate(event.target.value)}
                />
              </label>
            </div>
            <p className="mt-3 text-sm text-(--muted)">
              {t('billing.selectedRange', {
                business: selectedOrganization?.name || 'N/A',
                start: reportStartDate,
                end: reportEndDate,
              })}
            </p>
          </InternalSectionCard>
        </motion.section>
      )}

      {isBusiness && (
        <motion.section
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={itemVariants}
        >
          <InternalStatCard
            label={t('billing.currentAmountDue')}
            value={formatCurrency(
              currentEstimateAmount,
              currentBillingCurrency,
            )}
            icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
          />
          <InternalStatCard
            label={t('billing.currentDeliveries')}
            value={currentTotalOrders}
            icon={<FontAwesomeIcon icon={faBuilding} />}
          />
          <InternalStatCard
            label={t('billing.report')}
            value={
              <Button
                type="button"
                submit
                primary
                isLoading={isRequestingReport}
                disabled={isRequestingReport}
                onClick={handleRequestReport}
              >
                {t('billing.requestReport')}
              </Button>
            }
            icon={<FontAwesomeIcon icon={faFileLines} />}
          />
        </motion.section>
      )}

      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 gap-4"
      >
        <InternalSectionCard
          eyebrow={t('billing.currentPlan')}
          title={currentPlanName}
          description={
            isAdmin
              ? selectedOrganization
                ? t('billing.cycle', {
                    name: selectedOrganization.name,
                    period:
                      selectedOrganization.businessPlan?.billingPeriod ||
                      selectedOrganization.billingPeriod ||
                      'N/A',
                  })
                : t('billing.selectPlanHint')
              : t('billing.cycle', {
                  name: myOrgResp?.data?.name || t('billing.myOrganization'),
                  period:
                    myOrgResp?.data?.businessPlan?.billingPeriod ||
                    myOrgResp?.data?.billingPeriod ||
                    'N/A',
                })
          }
        >
          <p className="text-sm text-(--muted)">
            {isAdmin
              ? t('billing.adminPlanHint')
              : t('billing.businessPlanHint')}
          </p>
        </InternalSectionCard>
      </motion.section>

      {isAdmin && (
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 gap-4"
        >
          <InternalSectionCard
            eyebrow={t('billing.businesses')}
            title={t('billing.selectBusiness')}
            description={t('billing.selectBusinessDescription')}
          >
            <label className="block max-w-md text-sm text-(--ink)">
              {t('billing.business')}
              <Select
                className="mt-1"
                value={selectedOrganizationId}
                onChange={(value) => setSelectedOrganizationId(value as UUID)}
                options={organizations.map((org) => ({
                  label: org.name,
                  value: org.id,
                }))}
              />
            </label>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow={t('billing.currentInvoice')}
            title={formatCurrency(
              currentEstimateAmount,
              currentBillingCurrency,
            )}
            description={t('billing.adminInvoiceDescription')}
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
                  {t('billing.markPaid')}
                </Button>
              ) : null
            }
          >
            {selectedOrganizationDue ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 rounded bg-(--surface) p-4 text-sm text-(--ink) md:grid-cols-2">
                  <p className="text-[0.8125rem] text-(--ink)">
                    {t('billing.invoice')}:{" "}
                    <span className="text-[0.8125rem] text-(--ink)">
                      {resolveInvoiceIdentifier(selectedOrganizationDue)}
                    </span>
                  </p>
                  <p className="text-[0.8125rem] text-(--ink)">
                    {t('billing.period')}:{" "}
                    <span className="text-[0.8125rem] text-(--ink)">
                      {formatBillingPeriodRange(
                        currentBreakdown?.periodStart ||
                          selectedOrganizationDue.periodStart,
                        currentBreakdown?.periodEnd || selectedOrganizationDue.periodEnd,
                        t,
                      )}
                    </span>
                  </p>
                  <p className="text-[0.8125rem] text-(--ink)">
                    {t('billing.deliveriesSoFar')}:{" "}
                    <span className="text-[0.8125rem] text-(--ink)">
                      {currentTotalOrders}
                    </span>
                  </p>
                  <p className="text-[0.8125rem] text-(--ink)">
                    {t('billing.outstanding')}:{" "}
                    <span className="text-[0.8125rem] text-(--ink)">
                      {formatCurrency(
                        pendingAmountAdminSelectedOrganization,
                        currentBillingCurrency,
                      )}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="type-label">
                      {t('billing.breakdown')}
                    </h3>
                    <p className="text-sm text-(--muted)">
                      {t('billing.breakdownAdminHint')}
                    </p>
                  </div>
                  <BreakdownTable
                    breakdown={currentBreakdownRows}
                    currency={currentBillingCurrency}
                    isLoading={currentBreakdownLoading}
                    errorMessage={
                      currentBreakdownError
                        ? t('billing.breakdownError')
                        : undefined
                    }
                    emptyMessage={t('billing.breakdownEmpty')}
                  />
                </div>

                {currentEstimate?.note ? (
                  <p className="text-sm text-(--muted)">
                    {currentEstimate.note}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-(--muted)">
                {t('billing.noUnpaidBusiness')}
              </p>
            )}
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow={t('billing.deliveries')}
            title={
              selectedOrganization
                ? t('billing.namedDeliveries', { name: selectedOrganization.name })
                : t('billing.deliveries')
            }
            description={t('billing.adminDeliveriesDescription')}
          >
            <Table
              columns={adminOrdersColumns}
              data={adminOrdersRows}
              showPagination={false}
              isLoading={adminOrdersLoading}
              noDataMessage={t('billing.noBusinessDeliveries')}
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-(--muted)">
              <p className="text-[0.8125rem] text-(--ink)">{t('billing.pageSize')}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-(--line) px-3 py-1 disabled:opacity-50"
                  disabled={adminOrdersPage <= 0}
                  onClick={() =>
                    setAdminOrdersPage((prev) => Math.max(prev - 1, 0))
                  }
                >
                  {t('common.actions.previous')}
                </button>
                <span>
                  {t('pagination.page', { page: adminOrdersTotalPages === 0 ? 1 : adminOrdersPage + 1, total: adminOrdersTotalPages || 1 })}
                </span>
                <button
                  type="button"
                  className="rounded border border-(--line) px-3 py-1 disabled:opacity-50"
                  disabled={
                    adminOrdersTotalPages === 0 ||
                    adminOrdersPage >= adminOrdersTotalPages - 1
                  }
                  onClick={() =>
                    setAdminOrdersPage((prev) =>
                      adminOrdersTotalPages > 0
                        ? Math.min(prev + 1, adminOrdersTotalPages - 1)
                        : 0,
                    )
                  }
                >
                  {t('common.actions.next')}
                </button>
              </div>
            </div>
            <div className="mt-4 rounded bg-(--surface) p-3 text-sm text-(--muted)">
              {t('billing.operationalFees')}
            </div>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow={t('billing.paymentHistory')}
            title={t('billing.selectedHistory')}
            description={t('billing.selectedHistoryDescription')}
            actions={
              <Button
                type="button"
                submit
                primary={showAdminHistory}
                onClick={() => setShowAdminHistory((prev) => !prev)}
              >
                {t(showAdminHistory ? 'billing.hideHistory' : 'billing.showHistory')}
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
                  noDataMessage={t('billing.noBusinessHistory')}
                />
                <div className="flex items-center justify-end gap-2 text-sm text-(--muted)">
                  <button
                    type="button"
                    className="rounded border border-(--line) px-3 py-1 disabled:opacity-50"
                    disabled={adminHistoryPage <= 0}
                    onClick={() =>
                      setAdminHistoryPage((prev) => Math.max(prev - 1, 0))
                    }
                  >
                    {t('common.actions.previous')}
                  </button>
                  <span>
                    {t('pagination.page', { page: adminHistoryPage + 1, total: selectedOrganizationPaidHistoryTotalPages || 1 })}
                  </span>
                  <button
                    type="button"
                    className="rounded border border-(--line) px-3 py-1 disabled:opacity-50"
                    disabled={
                      adminHistoryPage >=
                      selectedOrganizationPaidHistoryTotalPages - 1
                    }
                    onClick={() =>
                      setAdminHistoryPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.max(
                            selectedOrganizationPaidHistoryTotalPages - 1,
                            0,
                          ),
                        ),
                      )
                    }
                  >
                    {t('common.actions.next')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-(--muted)">
                {t('billing.historyHidden')}
              </p>
            )}
          </InternalSectionCard>
        </motion.section>
      )}

      {!isAdmin && isBusiness && (
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 gap-4"
        >
          <InternalSectionCard
            eyebrow={t('billing.currentEstimate')}
            title={formatCurrency(
              currentEstimateAmount,
              currentBillingCurrency,
            )}
            description={t('billing.businessEstimateDescription')}
            actions={
              <Button
                type="button"
                submit
                primary
                disabled={!canBusinessPay || !myCurrentDue}
                onClick={() => setPaymentWorkflowOpen(true)}
              >
                {t('billing.startPayment')}
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 rounded bg-(--surface) p-4 text-sm text-(--ink) md:grid-cols-2">
                <p className="text-[0.8125rem] text-(--ink)">
                  {t('billing.currentPlan')}:{" "}
                  <span className="text-[0.8125rem] text-(--ink)">
                    {currentPlanName}
                  </span>
                </p>
                <p className="text-[0.8125rem] text-(--ink)">
                  {t('billing.period')}:{" "}
                  <span className="text-[0.8125rem] text-(--ink)">
                    {formatBillingPeriodRange(
                      currentBreakdown?.periodStart ||
                        myCurrentDue?.periodStart,
                      currentBreakdown?.periodEnd || myCurrentDue?.periodEnd,
                      t,
                    )}
                  </span>
                </p>
                <p className="text-[0.8125rem] text-(--ink)">
                  {t('billing.deliveriesSoFar')}:{" "}
                  <span className="text-[0.8125rem] text-(--ink)">
                    {currentTotalOrders}
                  </span>
                </p>
                <p className="text-[0.8125rem] text-(--ink)">
                  {t('billing.estimatedDue')}:{" "}
                  <span className="text-[0.8125rem] text-(--ink)">
                    {formatCurrency(
                      currentEstimateAmount,
                      currentBillingCurrency,
                    )}
                  </span>
                </p>
              </div>

              <div className="rounded bg-(--surface) p-4 text-sm text-(--ink)">
                <p className="font-normal text-xs">{t('billing.estimateHow')}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    {t('billing.estimatePeriodRule')}
                  </li>
                  <li>
                    {t('billing.estimatePackageRule')}
                  </li>
                  <li>
                    {t('billing.estimateFallbackRule')}
                  </li>
                  <li>
                    {t('billing.estimateOverflowRule')}
                  </li>
                  <li>
                    {t('billing.estimateChangeRule')}
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="type-label">
                    {t('billing.breakdown')}
                  </h3>
                  <p className="text-sm text-(--muted)">
                    {t('billing.breakdownBusinessHint')}
                  </p>
                </div>
                <BreakdownTable
                  breakdown={currentBreakdownRows}
                  currency={currentBillingCurrency}
                  isLoading={currentBreakdownLoading || currentEstimateLoading}
                  errorMessage={
                    currentBreakdownError || currentEstimateError
                      ? t('billing.currentBreakdownError')
                      : undefined
                  }
                  emptyMessage={t('billing.breakdownEmpty')}
                />
              </div>

              {currentEstimate?.note ? (
                <p className="text-sm text-(--muted)">
                  {currentEstimate.note}
                </p>
              ) : null}

              {businessPayDisabledReason ? (
                <p className="text-sm text-(--ink)">
                  {businessPayDisabledReason}
                </p>
              ) : (
                <p className="text-sm text-(--ink)">
                  {t('billing.paymentActive')}
                </p>
              )}
            </div>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow={t('billing.deliveries')}
            title={t('billing.businessDeliveriesTitle')}
            description={t('billing.businessDeliveriesDescription')}
          >
            <Table
              columns={businessOrdersColumns}
              data={businessPagedOrders}
              showPagination={false}
              noDataMessage={t('billing.noCurrentDeliveries')}
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-(--muted)">
              <p className="text-[0.8125rem] text-(--ink)">{t('billing.pageSize')}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-(--line) px-3 py-1 disabled:opacity-50"
                  disabled={businessOrdersPage <= 0}
                  onClick={() =>
                    setBusinessOrdersPage((prev) => Math.max(prev - 1, 0))
                  }
                >
                  {t('common.actions.previous')}
                </button>
                <span>
                  {t('pagination.page', { page: businessOrdersTotalPages === 0 ? 1 : businessOrdersPage + 1, total: businessOrdersTotalPages || 1 })}
                </span>
                <button
                  type="button"
                  className="rounded border border-(--line) px-3 py-1 disabled:opacity-50"
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
                  {t('common.actions.next')}
                </button>
              </div>
            </div>
            <div className="mt-4 rounded bg-(--surface) p-3 text-sm text-(--muted)">
              {t('billing.operationalFees')}
            </div>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow={t('billing.paymentHistory')}
            title={t('billing.completedPayments')}
            description={t('billing.completedPaymentsDescription')}
            actions={
              <Button
                type="button"
                submit
                primary={showBusinessHistory}
                onClick={() => setShowBusinessHistory((prev) => !prev)}
              >
                {t(showBusinessHistory ? 'billing.hideHistory' : 'billing.showHistory')}
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
                  noDataMessage={t('billing.noHistory')}
                />
                <div className="flex items-center justify-end gap-2 text-sm text-(--muted)">
                  <button
                    type="button"
                    className="rounded border border-(--line) px-3 py-1 disabled:opacity-50"
                    disabled={businessHistoryPage <= 0}
                    onClick={() =>
                      setBusinessHistoryPage((prev) => Math.max(prev - 1, 0))
                    }
                  >
                    {t('common.actions.previous')}
                  </button>
                  <span>
                    {t('pagination.page', { page: businessHistoryPage + 1, total: myBillingHistoryTotalPages || 1 })}
                  </span>
                  <button
                    type="button"
                    className="rounded border border-(--line) px-3 py-1 disabled:opacity-50"
                    disabled={
                      businessHistoryPage >= myBillingHistoryTotalPages - 1
                    }
                    onClick={() =>
                      setBusinessHistoryPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.max(myBillingHistoryTotalPages - 1, 0),
                        ),
                      )
                    }
                  >
                    {t('common.actions.next')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-(--muted)">
                {t('billing.historyHidden')}
              </p>
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
        heading={t('billing.confirmReport')}
        description={t('billing.confirmReportDescription')}
      >
        <section className="space-y-4">
          <div className="space-y-2 rounded bg-(--surface) p-3 text-sm">
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.business')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {selectedOrganization?.name || t('billing.notSelected')}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.startDate')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {reportStartDate || t('billing.notSelected')}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.endDate')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {reportEndDate || t('billing.notSelected')}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.action')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {adminReportAction === "download"
                  ? t('billing.downloadAction')
                  : t('billing.emailAction')}
              </span>
            </p>
          </div>

          <p className="text-sm text-(--ink)">
            {t('billing.confirmQuestion')}
          </p>

          <footer className="flex justify-end gap-3 border-t pt-2">
            <Button
              type="button"
              onClick={() => {
                if (isSubmittingAdminReport) return;
                setAdminReportConfirmOpen(false);
                setAdminReportAction(null);
              }}
            >
              {t('billing.edit')}
            </Button>
            <Button
              type="button"
              primary
              isLoading={isSubmittingAdminReport}
              disabled={isSubmittingAdminReport}
              onClick={handleConfirmAdminReport}
            >
              {t('billing.continue')}
            </Button>
          </footer>
        </section>
      </Modal>

      <Modal
        isOpen={paymentWorkflowOpen}
        onClose={() => setPaymentWorkflowOpen(false)}
        heading={t('billing.paymentWorkflow')}
        description={t('billing.paymentWorkflowDescription')}
      >
        <section className="space-y-4">
          <div className="space-y-2 rounded bg-(--surface) p-3 text-sm">
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.currentPlan')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {currentPlanName}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.amountNow')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {formatCurrency(currentEstimateAmount, currentBillingCurrency)}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.deliveriesSoFar')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {currentTotalOrders}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.period')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {formatBillingPeriodRange(
                  currentBreakdown?.periodStart || myCurrentDue?.periodStart,
                  currentBreakdown?.periodEnd || myCurrentDue?.periodEnd,
                  t,
                )}
              </span>
            </p>
          </div>

          <BreakdownTable
            breakdown={currentEstimate?.breakdown || currentBreakdownRows}
            currency={currentBillingCurrency}
            isLoading={currentEstimateLoading}
            errorMessage={
              currentEstimateError
                ? t('billing.estimateError')
                : undefined
            }
            emptyMessage={t('billing.breakdownEmpty')}
          />

          {currentEstimate?.note ? (
            <p className="text-sm text-(--muted)">{currentEstimate.note}</p>
          ) : null}

          <div>
            <TelInput
              value={editableBusinessNumber}
              onChange={setEditableBusinessNumber}
              label={t('billing.businessPhone')}
              placeholder={t('billing.businessPhonePlaceholder')}
              errorMessage={editableBusinessPhoneValidation?.error}
            />
          </div>

          <div className="rounded bg-(--surface) p-3 text-sm text-(--ink)">
            {t('billing.earlyPaymentNote')}
          </div>

          {!canBusinessPay ? (
            <p className="text-sm text-(--ink)">
              {businessPayDisabledReason}
            </p>
          ) : null}

          <footer className="flex justify-end gap-3 border-t pt-2">
            <Button type="button" onClick={() => setPaymentWorkflowOpen(false)}>
              {t('common.actions.close')}
            </Button>
            <Button
              type="button"
              primary
              isLoading={markingBusinessPaid}
              disabled={!canBusinessPay || !myCurrentDue}
              onClick={() => myCurrentDue && handleBusinessPay(myCurrentDue.id)}
            >
              {t('billing.payPlan')}
            </Button>
          </footer>
        </section>
      </Modal>

      <Modal
        isOpen={invoiceDeliveriesModalOpen}
        onClose={closeInvoiceDeliveriesModal}
        heading={t('billing.invoiceDetails')}
        description={
          selectedHistoryBilling
            ? t('billing.invoiceDetailsNamed', { invoice: resolveInvoiceIdentifier(selectedHistoryBilling) })
            : t('billing.invoiceDetailsFallback')
        }
      >
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-3 rounded bg-(--surface) p-4 text-sm text-(--ink) md:grid-cols-2">
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.invoice')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {resolveInvoiceIdentifier(selectedHistoryBilling)}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('common.status')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {selectedHistoryBilling?.status || "N/A"}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.paidDate')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {selectedHistoryBilling?.paidAt
                  ? formatDate(selectedHistoryBilling.paidAt, "YYYY-MM-DD")
                  : "N/A"}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.period')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {formatBillingPeriodRange(
                  historyBreakdown?.periodStart ||
                    selectedHistoryBilling?.periodStart,
                  historyBreakdown?.periodEnd || selectedHistoryBilling?.periodEnd,
                  t,
                )}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.deliveries')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {historyBreakdown?.totalOrders ||
                  selectedHistoryBilling?.totalOrders ||
                  0}
              </span>
            </p>
            <p className="text-[0.8125rem] text-(--ink)">
              {t('billing.totalAmount')}:{" "}
              <span className="text-[0.8125rem] text-(--ink)">
                {formatCurrency(
                  historyBreakdown?.totalAmount ||
                    selectedHistoryBilling?.totalAmount ||
                    0,
                  historyBillingCurrency,
                )}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <h3 className="type-label">
                {t('billing.breakdown')}
              </h3>
              <p className="text-sm text-(--muted)">
                {t('billing.breakdownInvoiceHint')}
              </p>
            </div>
            <BreakdownTable
              breakdown={historyBreakdownRows}
              currency={historyBillingCurrency}
              isLoading={historyBreakdownLoading}
              errorMessage={
                historyBreakdownError
                  ? t('billing.invoiceBreakdownError')
                  : undefined
              }
              emptyMessage={t('billing.breakdownEmpty')}
            />
          </div>

          <div className="rounded bg-(--surface) p-3 text-sm text-(--muted)">
            {t('billing.operationalFees')}
          </div>

          <Table
            columns={invoiceDeliveryColumns}
            data={invoicePaidDeliveries}
            showPagination={false}
            noDataMessage={t('billing.noInvoiceDeliveries')}
          />

          <footer className="flex justify-end border-t pt-2">
            <Button type="button" onClick={closeInvoiceDeliveriesModal}>
              {t('common.actions.close')}
            </Button>
          </footer>
        </section>
      </Modal>
    </InternalPage>
  );
};

export default BillingPaymentsPage;
