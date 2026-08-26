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

const resolveAssignmentLabel = (order: Order) => {
  if (!order.assignments?.length) return "Not assigned";
  const latest = [...order.assignments].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime(),
  )[0];

  const assignedName =
    latest?.assignedTo?.name ||
    latest?.assignedTo?.phoneNumber ||
    "Unknown rider";
  return `${assignedName} (${latest?.status || "PENDING"})`;
};

const resolveBillingCurrency = (...values: Array<string | undefined>) =>
  values.find((value) => value && value.trim()) || "RWF";

const resolveInvoiceIdentifier = (
  billing?: OrganizationBillingSummary | null,
) => billing?.invoiceNumber || billing?.id || "N/A";

const formatBillingPeriodRange = (
  periodStart?: string | Date,
  periodEnd?: string | Date,
) => {
  if (!periodStart && !periodEnd) return "Not available";
  const start = periodStart
    ? formatDate(periodStart, "YYYY-MM-DD")
    : "Unknown start";
  const end = periodEnd ? formatDate(periodEnd, "YYYY-MM-DD") : "Unknown end";
  return `${start} to ${end}`;
};

const getBreakdownTypeLabel = (type?: TierBreakdownType) => {
  switch (type) {
    case "package":
      return "Package";
    case "fallback":
      return "Fallback";
    case "per_unit":
      return "Per Unit";
    case "overflow":
      return "Overflow";
    default:
      return "Line Item";
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
  if (isLoading) {
    return (
      <div className="rounded border border-[--line] bg-[--surface] px-4 py-3 text-[13px] text-[--muted]">
        Loading billing breakdown...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded border border-[--line] bg-[--surface] px-4 py-3 text-[13px] text-[--ink]">
        {errorMessage}
      </div>
    );
  }

  if (!breakdown?.length) {
    return (
      <div className="rounded border border-[--line] bg-[--surface] px-4 py-3 text-[13px] text-[--muted]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-[--line]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-[13px]">
          <thead className="bg-[--surface] text-left text-[--muted]">
            <tr>
              <th className="px-4 py-3 font-normal text-[12px]">Tier</th>
              <th className="px-4 py-3 font-normal text-[12px]">Type</th>
              <th className="px-4 py-3 font-normal text-[12px]">Deliveries</th>
              <th className="px-4 py-3 font-normal text-[12px]">Unit Price</th>
              <th className="px-4 py-3 font-normal text-[12px]">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-[--paper]">
            {breakdown.map((row, index) => (
              <tr key={`${row.tierLabel}-${index}`}>
                <td className="px-4 py-3 text-[--ink]">{row.tierLabel}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full border border-[--line] bg-[--surface] px-2 py-1 text-[11px] uppercase text-[--muted]">
                    {getBreakdownTypeLabel(row.type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-[--ink]">{row.quantity}</td>
                <td className="px-4 py-3 text-[--ink]">
                  {formatCurrency(row.unitPrice, currency)}
                </td>
                <td className="px-4 py-3 font-normal text-[12px] text-[--ink]">
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
  useDocumentTitle("Billing & Payments");

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
    "No plan assigned";

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
    if (!myCurrentDue) return "No unpaid billing available right now.";
    if (myBillingEstimateLoading)
      return "Loading the latest early payment estimate...";
    if (myBillingEstimateError) {
      return "Unable to load the current estimate. Please refresh and try again.";
    }
    if (currentEstimateAmount <= 0)
      return "No amount is due for this billing record right now.";
    if (editableBusinessPhoneValidation?.isValid === false) {
      return editableBusinessPhoneValidation.error || "Enter a valid Rwandan phone number.";
    }
    return "";
  }, [
    currentEstimateAmount,
    myBillingEstimateError,
    myBillingEstimateLoading,
    myCurrentDue,
    editableBusinessPhoneValidation,
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
      toast.success("Billing marked as paid successfully.");
      refetchAdminBillings();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to mark billing as paid.";
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
      toast.success(
        "Payment completed. A new billing cycle will start for upcoming deliveries.",
      );
      setPaymentWorkflowOpen(false);
      setBusinessOrdersPage(0);
      refetchMyBillings();
      setShowBusinessHistory(true);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Payment failed. Please try again.";
      toast.error(message);
    }
  };

  const adminOrdersColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "Reference ID",
        accessorKey: "referenceId",
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: "Tracking ID",
        accessorKey: "trackingId",
        cell: ({ row }) => row.original.trackingId || "N/A",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: "Recipient Number",
        id: "recipientNumber",
        cell: ({ row }) =>
          row.original.recipientPhoneNumber ||
          row.original.recipient?.phoneNumber ||
          "N/A",
      },
      {
        header: "Sender Number",
        id: "senderNumber",
        cell: ({ row }) =>
          row.original.sender?.phoneNumber ||
          row.original.senderPhoneNumber ||
          "N/A",
      },
      {
        header: "Assigned Rider",
        id: "assignedRider",
        cell: ({ row }) => resolveAssignmentLabel(row.original),
      },
      {
        header: "Fee",
        accessorKey: "finalFee",
        cell: ({ row }) =>
          formatCurrency(
            row.original.finalFee || row.original.initialFee || 0,
            "RWF",
          ),
      },
      {
        header: "Created By",
        id: "createdBy",
        cell: ({ row }) =>
          row.original.createdBy?.name ||
          row.original.createdBy?.phoneNumber ||
          "N/A",
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          formatDate(row.original.createdAt, "YYYY-MM-DD HH:mm"),
      },
    ],
    [],
  );

  const businessOrdersColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "Reference ID",
        accessorKey: "referenceId",
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: "Tracking ID",
        accessorKey: "trackingId",
        cell: ({ row }) => row.original.trackingId || "N/A",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: "Recipient Number",
        id: "recipientNumber",
        cell: ({ row }) =>
          row.original.recipientPhoneNumber ||
          row.original.recipient?.phoneNumber ||
          "N/A",
      },
      {
        header: "Sender Number",
        id: "senderNumber",
        cell: ({ row }) =>
          row.original.sender?.phoneNumber ||
          row.original.senderPhoneNumber ||
          "N/A",
      },
      {
        header: "Fee",
        accessorKey: "finalFee",
        cell: ({ row }) =>
          formatCurrency(
            row.original.finalFee || row.original.initialFee || 0,
            "RWF",
          ),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          formatDate(row.original.createdAt, "YYYY-MM-DD HH:mm"),
      },
    ],
    [],
  );

  const billingHistoryColumns = useMemo<
    ColumnDef<OrganizationBillingSummary>[]
  >(
    () => [
      {
        header: "Invoice",
        accessorKey: "invoiceNumber",
        cell: ({ row }) => resolveInvoiceIdentifier(row.original),
      },
      {
        header: "Paid Date",
        id: "paidDate",
        cell: ({ row }) =>
          formatDate(
            row.original.paidAt || row.original.updatedAt,
            "YYYY-MM-DD",
          ),
      },
      {
        header: "Deliveries",
        accessorKey: "totalOrders",
      },
      {
        header: "Amount",
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
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: "Action",
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
            <FontAwesomeIcon icon={faFileLines} className="text-[--ink]" />
            View Invoice
          </Link>
        ),
      },
    ],
    [],
  );

  const invoiceDeliveryColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "Reference ID",
        accessorKey: "referenceId",
        cell: ({ row }) => row.original.referenceId || row.original.id,
      },
      {
        header: "Tracking ID",
        accessorKey: "trackingId",
        cell: ({ row }) => row.original.trackingId || "N/A",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: "Recipient Number",
        id: "recipientNumber",
        cell: ({ row }) =>
          row.original.recipientPhoneNumber ||
          row.original.recipient?.phoneNumber ||
          "N/A",
      },
      {
        header: "Sender Number",
        id: "senderNumber",
        cell: ({ row }) =>
          row.original.sender?.phoneNumber ||
          row.original.senderPhoneNumber ||
          "N/A",
      },
      {
        header: "Fee",
        accessorKey: "finalFee",
        cell: ({ row }) =>
          formatCurrency(
            row.original.finalFee || row.original.initialFee || 0,
            "RWF",
          ),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          formatDate(row.original.createdAt, "YYYY-MM-DD HH:mm"),
      },
    ],
    [],
  );

  const closeInvoiceDeliveriesModal = useCallback(() => {
    setInvoiceDeliveriesModalOpen(false);
    setSelectedHistoryBilling(null);
  }, []);

  const openAdminReportConfirmation = useCallback(
    (action: "download" | "email") => {
      if (!selectedOrganizationId) {
        toast.error("Please select a business first.");
        return;
      }

      if (!reportStartDate || !reportEndDate) {
        toast.error("Please select both start and end dates.");
        return;
      }

      if (
        new Date(reportStartDate).getTime() > new Date(reportEndDate).getTime()
      ) {
        toast.error("Start date cannot be after end date.");
        return;
      }

      setAdminReportAction(action);
      setAdminReportConfirmOpen(true);
    },
    [reportEndDate, reportStartDate, selectedOrganizationId],
  );

  const handleConfirmAdminReport = useCallback(async () => {
    if (!adminReportAction || !selectedOrganizationId) return;

    const token = localStorageUtil.getItem("token");
    if (!token) {
      toast.error("Please sign in again to continue.");
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
          throw new Error("Unable to download report");
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
        toast.success("Report downloaded successfully.");
      } else {
        const response = await fetch(
          `${ENVIRONMENTS.API_URL}/dashboard/business-report/email?${query.toString()}`,
          {
            method: "POST",
            headers: { authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to request report");
        }

        toast.success("Report requested and sent to email.");
      }

      setAdminReportConfirmOpen(false);
      setAdminReportAction(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Report action failed.",
      );
    } finally {
      setIsSubmittingAdminReport(false);
    }
  }, [
    adminReportAction,
    reportEndDate,
    reportStartDate,
    selectedOrganizationId,
  ]);

  const handleRequestReport = useCallback(async () => {
    const token = localStorageUtil.getItem("token");
    if (!token) {
      toast.error("Please sign in again to request report.");
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
        throw new Error("Unable to request report");
      }

      toast.success("Report requested. It will be sent to your email.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to request report.",
      );
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
          description="Track server-calculated billing estimates, package-tier breakdowns, and payment history."
        />
      </motion.section>

      {isAdmin && (
        <motion.section
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={itemVariants}
        >
          <InternalStatCard
            label="Organizations"
            value={organizations.length}
            icon={<FontAwesomeIcon icon={faBuilding} />}
          />
          <InternalStatCard
            label="Pending Amount"
            value={formatCurrency(pendingAmountAdminGlobal, "RWF")}
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
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 gap-4"
        >
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
                  onClick={() => openAdminReportConfirmation("email")}
                >
                  Request Report
                </Button>
                <Button
                  type="button"
                  submit
                  disabled={isSubmittingAdminReport}
                  onClick={() => openAdminReportConfirmation("download")}
                >
                  Download Report
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="text-[13px] text-[--ink]">
                Business
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

              <label className="text-[13px] text-[--ink]">
                Start date
                <input
                  type="date"
                  className="mt-1 h-11 w-full rounded-[--radius-control] border-0 bg-[--surface] px-3 text-[13px] outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
                  value={reportStartDate}
                  onChange={(event) => setReportStartDate(event.target.value)}
                />
              </label>

              <label className="text-[13px] text-[--ink]">
                End date
                <input
                  type="date"
                  className="mt-1 h-11 w-full rounded-[--radius-control] border-0 bg-[--surface] px-3 text-[13px] outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
                  value={reportEndDate}
                  onChange={(event) => setReportEndDate(event.target.value)}
                />
              </label>
            </div>
            <p className="mt-3 text-[13px] text-[--muted]">
              Selected:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {selectedOrganization?.name || "N/A"}
              </span>{" "}
              | {reportStartDate} to {reportEndDate}
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
            label="Current Estimated Amount Due"
            value={formatCurrency(
              currentEstimateAmount,
              currentBillingCurrency,
            )}
            icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
          />
          <InternalStatCard
            label="Deliveries In Current Billing"
            value={currentTotalOrders}
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

      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 gap-4"
      >
        <InternalSectionCard
          eyebrow="Current Plan"
          title={currentPlanName}
          description={
            isAdmin
              ? selectedOrganization
                ? `${selectedOrganization.name} • ${
                    selectedOrganization.businessPlan?.billingPeriod ||
                    selectedOrganization.billingPeriod ||
                    "N/A"
                  } cycle`
                : "Select a business to see current plan in use."
              : `${myOrgResp?.data?.name || "My Organization"} • ${
                  myOrgResp?.data?.businessPlan?.billingPeriod ||
                  myOrgResp?.data?.billingPeriod ||
                  "N/A"
                } cycle`
          }
        >
          <p className="text-[13px] text-[--muted]">
            {isAdmin
              ? "Highlighted plan is based on the currently selected business."
              : "This plan card reflects the active business plan tied to the current billing cycle."}
          </p>
        </InternalSectionCard>
      </motion.section>

      {isAdmin && (
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 gap-4"
        >
          <InternalSectionCard
            eyebrow="Businesses"
            title="Select Business"
            description="Choose a business to load deliveries and billing details for that organization."
          >
            <label className="block max-w-md text-[13px] text-[--ink]">
              Business
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
            eyebrow="Current Invoice"
            title={formatCurrency(
              currentEstimateAmount,
              currentBillingCurrency,
            )}
            description="Server-calculated amount due for the selected business's active billing record."
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
            {selectedOrganizationDue ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 rounded border border-[--line] bg-[--surface] p-4 text-[13px] text-[--ink] md:grid-cols-2">
                  <p className="text-[12px] font-medium text-[--ink]">
                    Invoice:{" "}
                    <span className="font-normal text-[12px] text-[--ink]">
                      {resolveInvoiceIdentifier(selectedOrganizationDue)}
                    </span>
                  </p>
                  <p className="text-[12px] font-medium text-[--ink]">
                    Billing period:{" "}
                    <span className="font-normal text-[12px] text-[--ink]">
                      {formatBillingPeriodRange(
                        currentBreakdown?.periodStart ||
                          selectedOrganizationDue.periodStart,
                        currentBreakdown?.periodEnd ||
                          selectedOrganizationDue.periodEnd,
                      )}
                    </span>
                  </p>
                  <p className="text-[12px] font-medium text-[--ink]">
                    Deliveries so far:{" "}
                    <span className="font-normal text-[12px] text-[--ink]">
                      {currentTotalOrders}
                    </span>
                  </p>
                  <p className="text-[12px] font-medium text-[--ink]">
                    Outstanding across unpaid billings:{" "}
                    <span className="font-normal text-[12px] text-[--ink]">
                      {formatCurrency(
                        pendingAmountAdminSelectedOrganization,
                        currentBillingCurrency,
                      )}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-[13px] font-medium text-[--ink]">
                      Billing Breakdown
                    </h3>
                    <p className="text-[13px] text-[--muted]">
                      Invoice totals come from the billing record and its
                      pricing breakdown, not by summing delivery fees.
                    </p>
                  </div>
                  <BreakdownTable
                    breakdown={currentBreakdownRows}
                    currency={currentBillingCurrency}
                    isLoading={currentBreakdownLoading}
                    errorMessage={
                      currentBreakdownError
                        ? "Unable to load the billing breakdown right now."
                        : undefined
                    }
                    emptyMessage="No stored breakdown available for this billing record."
                  />
                </div>

                {currentEstimate?.note ? (
                  <p className="text-[13px] text-[--muted]">
                    {currentEstimate.note}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-[13px] text-[--muted]">
                No unpaid billing at the moment for this business.
              </p>
            )}
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="Deliveries"
            title={
              selectedOrganization
                ? `${selectedOrganization.name} Deliveries`
                : "Deliveries"
            }
            description="All deliveries made by the selected company, including assignment details."
          >
            <Table
              columns={adminOrdersColumns}
              data={adminOrdersRows}
              showPagination={false}
              isLoading={adminOrdersLoading}
              noDataMessage="No deliveries found for the selected business."
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[--muted]">
              <p className="text-[12px] font-medium text-[--ink]">Showing up to 10 deliveries per page.</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-[--line] px-3 py-1 disabled:opacity-50"
                  disabled={adminOrdersPage <= 0}
                  onClick={() =>
                    setAdminOrdersPage((prev) => Math.max(prev - 1, 0))
                  }
                >
                  Prev
                </button>
                <span>
                  Page {adminOrdersTotalPages === 0 ? 1 : adminOrdersPage + 1}{" "}
                  of {adminOrdersTotalPages || 1}
                </span>
                <button
                  type="button"
                  className="rounded border border-[--line] px-3 py-1 disabled:opacity-50"
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
                  Next
                </button>
              </div>
            </div>
            <div className="mt-4 rounded border border-[--line] bg-[--surface] p-3 text-[13px] text-[--muted]">
              Delivery fees shown below are operational records. Invoice totals
              come from the billing breakdown above.
            </div>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="Payment History"
            title="Selected Business Payment History"
            description="Toggle to review paid invoices and their delivery records."
            actions={
              <Button
                type="button"
                submit
                primary={showAdminHistory}
                onClick={() => setShowAdminHistory((prev) => !prev)}
              >
                {showAdminHistory ? "Hide History" : "Show History"}
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
                <div className="flex items-center justify-end gap-2 text-[13px] text-[--muted]">
                  <button
                    type="button"
                    className="rounded border border-[--line] px-3 py-1 disabled:opacity-50"
                    disabled={adminHistoryPage <= 0}
                    onClick={() =>
                      setAdminHistoryPage((prev) => Math.max(prev - 1, 0))
                    }
                  >
                    Prev
                  </button>
                  <span>
                    Page {adminHistoryPage + 1} of{" "}
                    {selectedOrganizationPaidHistoryTotalPages || 1}
                  </span>
                  <button
                    type="button"
                    className="rounded border border-[--line] px-3 py-1 disabled:opacity-50"
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
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-[--muted]">
                History is hidden. Toggle to view.
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
            eyebrow="Current Estimate"
            title={formatCurrency(
              currentEstimateAmount,
              currentBillingCurrency,
            )}
            description="Server-calculated amount due for your active billing period."
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 rounded border border-[--line] bg-[--surface] p-4 text-[13px] text-[--ink] md:grid-cols-2">
                <p className="text-[12px] font-medium text-[--ink]">
                  Current plan:{" "}
                  <span className="font-normal text-[12px] text-[--ink]">
                    {currentPlanName}
                  </span>
                </p>
                <p className="text-[12px] font-medium text-[--ink]">
                  Billing period:{" "}
                  <span className="font-normal text-[12px] text-[--ink]">
                    {formatBillingPeriodRange(
                      currentBreakdown?.periodStart ||
                        myCurrentDue?.periodStart,
                      currentBreakdown?.periodEnd || myCurrentDue?.periodEnd,
                    )}
                  </span>
                </p>
                <p className="text-[12px] font-medium text-[--ink]">
                  Deliveries so far:{" "}
                  <span className="font-normal text-[12px] text-[--ink]">
                    {currentTotalOrders}
                  </span>
                </p>
                <p className="text-[12px] font-medium text-[--ink]">
                  Current estimated amount due:{" "}
                  <span className="font-normal text-[12px] text-[--ink]">
                    {formatCurrency(
                      currentEstimateAmount,
                      currentBillingCurrency,
                    )}
                  </span>
                </p>
              </div>

              <div className="rounded border border-[--line] bg-[--surface] p-4 text-[13px] text-[--ink]">
                <p className="font-normal text-[12px]">How this estimate works</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Final billing is calculated per billing period, not by
                    summing visible order fees.
                  </li>
                  <li>
                    Package tiers are charged in full only after their delivery
                    threshold is met.
                  </li>
                  <li>
                    Partial progress inside a package tier appears as a
                    fallback row at the configured fallback rate.
                  </li>
                  <li>
                    Deliveries beyond the final package threshold appear as
                    overflow rows at the configured overflow rate.
                  </li>
                  <li>
                    Early payment estimates are based on deliveries so far and
                    can change until the billing period closes.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-[13px] font-medium text-[--ink]">
                    Billing Breakdown
                  </h3>
                  <p className="text-[13px] text-[--muted]">
                    This table reflects the current billing estimate from the
                    server.
                  </p>
                </div>
                <BreakdownTable
                  breakdown={currentBreakdownRows}
                  currency={currentBillingCurrency}
                  isLoading={currentBreakdownLoading || currentEstimateLoading}
                  errorMessage={
                    currentBreakdownError || currentEstimateError
                      ? "Unable to load the current billing breakdown right now."
                      : undefined
                  }
                  emptyMessage="No stored breakdown available for this billing record."
                />
              </div>

              {currentEstimate?.note ? (
                <p className="text-[13px] text-[--muted]">
                  {currentEstimate.note}
                </p>
              ) : null}

              {businessPayDisabledReason ? (
                <p className="text-[13px] text-[--ink]">
                  {businessPayDisabledReason}
                </p>
              ) : (
                <p className="text-[13px] text-[--ink]">
                  Payment is active. After payment, new deliveries continue on a
                  new billing record.
                </p>
              )}
            </div>
          </InternalSectionCard>

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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[--muted]">
              <p className="text-[12px] font-medium text-[--ink]">Showing up to 10 deliveries per page.</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-[--line] px-3 py-1 disabled:opacity-50"
                  disabled={businessOrdersPage <= 0}
                  onClick={() =>
                    setBusinessOrdersPage((prev) => Math.max(prev - 1, 0))
                  }
                >
                  Prev
                </button>
                <span>
                  Page{" "}
                  {businessOrdersTotalPages === 0 ? 1 : businessOrdersPage + 1}{" "}
                  of {businessOrdersTotalPages || 1}
                </span>
                <button
                  type="button"
                  className="rounded border border-[--line] px-3 py-1 disabled:opacity-50"
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
            <div className="mt-4 rounded border border-[--line] bg-[--surface] p-3 text-[13px] text-[--muted]">
              Delivery fees shown below are operational records. Invoice totals
              come from the billing breakdown above.
            </div>
          </InternalSectionCard>

          <InternalSectionCard
            eyebrow="Payment History"
            title="Payments Completed"
            description="Open paid invoices to review the billing breakdown first and linked deliveries second."
            actions={
              <Button
                type="button"
                submit
                primary={showBusinessHistory}
                onClick={() => setShowBusinessHistory((prev) => !prev)}
              >
                {showBusinessHistory ? "Hide History" : "Show History"}
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
                <div className="flex items-center justify-end gap-2 text-[13px] text-[--muted]">
                  <button
                    type="button"
                    className="rounded border border-[--line] px-3 py-1 disabled:opacity-50"
                    disabled={businessHistoryPage <= 0}
                    onClick={() =>
                      setBusinessHistoryPage((prev) => Math.max(prev - 1, 0))
                    }
                  >
                    Prev
                  </button>
                  <span>
                    Page {businessHistoryPage + 1} of{" "}
                    {myBillingHistoryTotalPages || 1}
                  </span>
                  <button
                    type="button"
                    className="rounded border border-[--line] px-3 py-1 disabled:opacity-50"
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
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-[--muted]">
                History is hidden. Toggle to view.
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
        heading="Confirm Report Details"
        description="Please confirm the selected business and report time range."
      >
        <section className="space-y-4">
          <div className="space-y-2 rounded border border-[--line] bg-[--surface] p-3 text-[13px]">
            <p className="text-[12px] font-medium text-[--ink]">
              Business:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {selectedOrganization?.name || "Not selected"}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Start date:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {reportStartDate || "Not selected"}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              End date:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {reportEndDate || "Not selected"}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Action:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {adminReportAction === "download"
                  ? "Download report"
                  : "Request report by email"}
              </span>
            </p>
          </div>

          <p className="text-[13px] text-[--ink]">
            Is this the correct business and time range for your report?
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
        description="Review the current server-calculated estimate before paying early."
      >
        <section className="space-y-4">
          <div className="space-y-2 rounded border border-[--line] bg-[--surface] p-3 text-[13px]">
            <p className="text-[12px] font-medium text-[--ink]">
              Current business plan:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {currentPlanName}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Amount to pay now:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {formatCurrency(currentEstimateAmount, currentBillingCurrency)}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Deliveries so far:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {currentTotalOrders}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Billing period:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {formatBillingPeriodRange(
                  currentBreakdown?.periodStart || myCurrentDue?.periodStart,
                  currentBreakdown?.periodEnd || myCurrentDue?.periodEnd,
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
                ? "Unable to load the latest payment estimate right now."
                : undefined
            }
            emptyMessage="No current billing breakdown is available for this estimate."
          />

          {currentEstimate?.note ? (
            <p className="text-[13px] text-[--muted]">{currentEstimate.note}</p>
          ) : null}

          <div>
            <TelInput
              value={editableBusinessNumber}
              onChange={setEditableBusinessNumber}
              label="Business Number (editable)"
              placeholder="Enter business phone number"
              errorMessage={editableBusinessPhoneValidation?.error}
            />
          </div>

          <div className="rounded border border-[--line] bg-[--surface] p-3 text-[13px] text-[--ink]">
            Early payment settles the server estimate shown above. Package,
            fallback, and overflow rows can still change if more deliveries are
            added before the billing period closes.
          </div>

          {!canBusinessPay ? (
            <p className="text-[13px] text-[--ink]">
              {businessPayDisabledReason}
            </p>
          ) : null}

          <footer className="flex justify-end gap-3 border-t pt-2">
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
        heading="Invoice Details"
        description={
          selectedHistoryBilling
            ? `Review invoice ${resolveInvoiceIdentifier(selectedHistoryBilling)} and its linked deliveries.`
            : "Review this invoice and its linked deliveries."
        }
      >
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-3 rounded border border-[--line] bg-[--surface] p-4 text-[13px] text-[--ink] md:grid-cols-2">
            <p className="text-[12px] font-medium text-[--ink]">
              Invoice:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {resolveInvoiceIdentifier(selectedHistoryBilling)}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Status:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {selectedHistoryBilling?.status || "N/A"}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Paid date:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {selectedHistoryBilling?.paidAt
                  ? formatDate(selectedHistoryBilling.paidAt, "YYYY-MM-DD")
                  : "N/A"}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Billing period:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {formatBillingPeriodRange(
                  historyBreakdown?.periodStart ||
                    selectedHistoryBilling?.periodStart,
                  historyBreakdown?.periodEnd ||
                    selectedHistoryBilling?.periodEnd,
                )}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Deliveries:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
                {historyBreakdown?.totalOrders ||
                  selectedHistoryBilling?.totalOrders ||
                  0}
              </span>
            </p>
            <p className="text-[12px] font-medium text-[--ink]">
              Total amount:{" "}
              <span className="font-normal text-[12px] text-[--ink]">
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
              <h3 className="text-[13px] font-medium text-[--ink]">
                Billing Breakdown
              </h3>
              <p className="text-[13px] text-[--muted]">
                Invoice totals are calculated from the billing breakdown first.
                Linked deliveries are shown below for auditability.
              </p>
            </div>
            <BreakdownTable
              breakdown={historyBreakdownRows}
              currency={historyBillingCurrency}
              isLoading={historyBreakdownLoading}
              errorMessage={
                historyBreakdownError
                  ? "Unable to load the invoice breakdown right now."
                  : undefined
              }
              emptyMessage="No stored breakdown available for this billing record."
            />
          </div>

          <div className="rounded border border-[--line] bg-[--surface] p-3 text-[13px] text-[--muted]">
            Delivery fees shown below are operational records. Invoice totals
            come from the billing breakdown above.
          </div>

          <Table
            columns={invoiceDeliveryColumns}
            data={invoicePaidDeliveries}
            showPagination={false}
            noDataMessage="No deliveries found for this invoice."
          />

          <footer className="flex justify-end border-t pt-2">
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
