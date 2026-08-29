import Table from '@/components/table/Table';
import { useAdminPaymentsColumns } from '@/hooks/payments/columns.payments';
import {
  useFetchAdminPayments,
  useFetchPaymentStats,
  useExportPayments,
} from '@/hooks/payments/payment.hooks';
import { useAppSelector } from '@/states/hooks';
import { useCallback, useEffect, useState } from 'react';
import UpdatePaymentStatusModal from './UpdatePaymentStatusModal';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faMoneyBillWave,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faSearch,
  faFilter,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KpayPaymentStatus, Payment } from '@/types/payment.types';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { AdminPaymentsQueryParams } from '@/api/queries/payments.queries';
import { controlClassName } from '@/components/inputs/control';
import DatePicker from '@/components/inputs/DatePicker';
import { cn } from '@/lib/utils';

const formatDateParam = (date?: Date) => {
  if (!date) return undefined;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: KpayPaymentStatus.PENDING, label: 'Pending' },
  { value: KpayPaymentStatus.SUCCESSFUL, label: 'Successful' },
  { value: KpayPaymentStatus.FAILED, label: 'Failed' },
];

const CURRENCY_OPTIONS = [
  { value: 'all', label: 'All Currencies' },
  { value: 'RWF', label: 'RWF' },
  { value: 'USD', label: 'USD' },
];

const METHOD_OPTIONS = [
  { value: 'all', label: 'All Methods' },
  { value: 'momo', label: 'Mobile Money' },
  { value: 'cc', label: 'Credit Card' },
  { value: 'bank', label: 'Bank' },
  { value: 'spenn', label: 'Spenn' },
  { value: 'smartcash', label: 'SmartCash' },
];

const PaymentsPage = () => {
  useDocumentTitle('Payments');

  const { adminPaymentsList, updateStatusModal } = useAppSelector(
    (state) => state.payment,
  );

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [searchKey, setSearchKey] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Hooks
  const {
    fetchAdminPayments,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
    isFetching,
  } = useFetchAdminPayments();

  const { fetchPaymentStats, stats } = useFetchPaymentStats();
  const {
    exportPayments,
    exportData,
    isFetching: isExporting,
    isSuccess: exportSuccess,
    reset: resetExport,
  } = useExportPayments();

  const { adminPaymentsColumns } = useAdminPaymentsColumns();

  const buildFilterParams = useCallback((
    override?: Partial<Pick<AdminPaymentsQueryParams, 'page' | 'size'>>,
  ): AdminPaymentsQueryParams => {
    const params: AdminPaymentsQueryParams = {
      page: override?.page ?? page,
      size: override?.size ?? size,
    };
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (currencyFilter && currencyFilter !== 'all')
      params.currency = currencyFilter;
    if (methodFilter && methodFilter !== 'all') params.method = methodFilter;
    if (startDate) params.startDate = formatDateParam(startDate);
    if (endDate) params.endDate = formatDateParam(endDate);
    if (minAmount) params.minAmount = Number(minAmount);
    if (maxAmount) params.maxAmount = Number(maxAmount);
    if (searchKey.trim()) params.searchKey = searchKey.trim();
    return params;
  }, [
    page,
    size,
    statusFilter,
    currencyFilter,
    methodFilter,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    searchKey,
  ]);

  // Fetch payments and stats on mount and filter changes
  useEffect(() => {
    const hasOnlyOneDateSet = Boolean(startDate) !== Boolean(endDate);

    if (!updateStatusModal && !hasOnlyOneDateSet) {
      fetchAdminPayments(buildFilterParams());
    }
  }, [
    buildFilterParams,
    fetchAdminPayments,
    page,
    size,
    updateStatusModal,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (!updateStatusModal && startDate && endDate && page !== 0) {
      setPage(0);
      fetchAdminPayments(buildFilterParams({ page: 0 }));
    }
  }, [
    startDate,
    endDate,
    page,
    setPage,
    updateStatusModal,
    fetchAdminPayments,
    buildFilterParams,
  ]);

  useEffect(() => {
    fetchPaymentStats({
      startDate: formatDateParam(startDate),
      endDate: formatDateParam(endDate),
      currency: currencyFilter !== 'all' ? currencyFilter : undefined,
    });
  }, [startDate, endDate, currencyFilter, fetchPaymentStats]);

  const handleApplyFilters = () => {
    setPage(0);
    fetchAdminPayments(buildFilterParams({ page: 0 }));
  };

  const handleStartDateChange = (date?: Date) => {
    setStartDate(date);

    if (endDate && date && date > endDate) {
      setEndDate(date);
    }
  };

  const handleEndDateChange = (date?: Date) => {
    setEndDate(date);

    if (startDate && date && date < startDate) {
      setStartDate(date);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setCurrencyFilter('all');
    setMethodFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setMinAmount('');
    setMaxAmount('');
    setSearchKey('');
    setPage(0);
    fetchAdminPayments({ page: 0, size });
    fetchPaymentStats({});
  };

  // CSV export
  const handleExportCSV = () => {
    const params = buildFilterParams();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page: _p, size: _s, ...exportParams } = params;
    exportPayments(exportParams);
  };

  useEffect(() => {
    if (exportSuccess && exportData) {
      downloadCSV(exportData);
      resetExport();
    }
  }, [exportSuccess, exportData, resetExport]);

  const downloadCSV = (payments: Payment[]) => {
    const headers = [
      'Reference ID',
      'Status',
      'Amount',
      'Currency',
      'Method',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'External Reference',
      'Date',
    ];

    const statusLabels: Record<string, string> = {
      [KpayPaymentStatus.PENDING]: 'Pending',
      [KpayPaymentStatus.SUCCESSFUL]: 'Successful',
      [KpayPaymentStatus.FAILED]: 'Failed',
    };

    const methodLabels: Record<string, string> = {
      momo: 'Mobile Money',
      cc: 'Credit Card',
      bank: 'Bank',
      spenn: 'Spenn',
      smartcash: 'SmartCash',
    };

    const rows = payments.map((p) => [
      p.internalReferenceId || '',
      statusLabels[p.status] || p.status,
      p.amount?.toString() || '0',
      p.currency || '',
      methodLabels[p.method] || p.method || '',
      p.customerName || '',
      p.customerEmail || '',
      p.customerPhone || '',
      p.externalReferenceId || '',
      p.createdAt ? formatDate(p.createdAt, 'YYYY-MM-DD HH:mm:ss') : '',
    ]);

    const escapeCsvField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const csvContent = [
      headers.map(escapeCsvField).join(','),
      ...rows.map((row) => row.map(escapeCsvField).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments_export_${formatDate(new Date(), 'YYYY-MM-DD_HHmm')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <section className="flex items-start justify-between gap-4 flex-wrap">
          <article>
            <h1 className="type-page-title">Payments</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all payments across the platform.
            </p>
          </article>
          <menu className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFilter} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              primary
              type="button"
              onClick={handleExportCSV}
              isLoading={isExporting}
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faDownload} />
              Export CSV
            </Button>
          </menu>
        </section>

        <section className="bg-(--paper) border border-(--line) rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted) text-xs"
              />
              <input
                type="text"
                placeholder="Search by reference, customer name, email, phone..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                className={cn(controlClassName, 'pl-8 pr-3')}
              />
            </div>
            <div className="md:w-[170px]">
              <DatePicker
                value={startDate}
                onChange={(event) =>
                  handleStartDateChange(event as unknown as Date | undefined)
                }
                placeholder="From date"
                toDate={endDate}
              />
            </div>
            <div className="md:w-[170px]">
              <DatePicker
                value={endDate}
                onChange={(event) =>
                  handleEndDateChange(event as unknown as Date | undefined)
                }
                placeholder="To date"
                fromDate={startDate}
              />
            </div>
            <Button primary type="button" onClick={handleApplyFilters}>
              Apply
            </Button>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Revenue',
              value: formatCurrency(stats?.totalRevenue || 0),
              icon: faMoneyBillWave,
              bgColor: 'bg-(--ink)',
            },
            {
              label: 'Successful',
              value: `${stats?.successfulCount || 0}`,
              subtitle: formatCurrency(stats?.successfulAmount || 0),
              icon: faCheckCircle,
              bgColor: 'bg-(--surface)',
            },
            {
              label: 'Pending',
              value: `${stats?.pendingCount || 0}`,
              subtitle: formatCurrency(stats?.pendingAmount || 0),
              icon: faClock,
              bgColor: 'bg-(--surface)',
            },
            {
              label: 'Failed',
              value: `${stats?.failedCount || 0}`,
              subtitle: formatCurrency(stats?.failedAmount || 0),
              icon: faTimesCircle,
              bgColor: 'bg-(--surface)',
            },
          ].map((card) => (
            <article
              key={card.label}
              className="bg-(--paper) border border-(--line) rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="type-meta">
                  {card.label}
                </p>
                <p className="type-metric mt-1">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-(--muted) mt-0.5">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <span
                className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center text-(--ink)`}
              >
                <FontAwesomeIcon icon={card.icon} />
              </span>
            </article>
          ))}
        </section>

        {/* Filters */}
        {showFilters && (
          <section className="bg-(--paper) border border-(--line) rounded-xl p-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="flex flex-col gap-1.5">
                <label className="type-meta">
                  Search
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted) text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Reference, email, name, phone..."
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyFilters();
                    }}
                    className={cn(controlClassName, 'pl-8 pr-3')}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="type-meta">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="flex flex-col gap-1.5">
                <label className="type-meta">
                  Currency
                </label>
                <Select
                  value={currencyFilter}
                  onValueChange={setCurrencyFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Currencies" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="flex flex-col gap-1.5">
                <label className="type-meta">
                  Payment Method
                </label>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    {METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="type-meta">
                  From Date
                </label>
                <DatePicker
                  value={startDate}
                  onChange={(event) =>
                    handleStartDateChange(event as unknown as Date | undefined)
                  }
                  placeholder="From date"
                  toDate={endDate}
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1.5">
                <label className="type-meta">
                  To Date
                </label>
                <DatePicker
                  value={endDate}
                  onChange={(event) =>
                    handleEndDateChange(event as unknown as Date | undefined)
                  }
                  placeholder="To date"
                  fromDate={startDate}
                />
              </div>

              {/* Min Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="type-meta">
                  Min Amount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className={cn(controlClassName, 'px-3')}
                />
              </div>

              {/* Max Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="type-meta">
                  Max Amount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className={cn(controlClassName, 'px-3')}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center gap-2 justify-end">
              <Button type="button" onClick={handleResetFilters}>
                <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
                Reset
              </Button>
              <Button primary type="button" onClick={handleApplyFilters}>
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Apply Filters
              </Button>
            </div>
          </section>
        )}
      </header>

      <Table
        columns={adminPaymentsColumns}
        data={adminPaymentsList}
        showPagination={true}
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isFetching}
      />

      <UpdatePaymentStatusModal />
    </main>
  );
};

export default PaymentsPage;
