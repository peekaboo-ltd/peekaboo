import { useCallback, useEffect, useMemo, useState } from 'react';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import Table from '@/components/table/Table';
import { UserStatus } from '@/constants/user.constants';
import useDebounce from '@/hooks/common/debounce.hooks';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useRiderAttendanceColumns } from '@/hooks/users/columns.riderAttendance';
import { useRiderManagementColumns } from '@/hooks/users/columns.riderManagement';
import { useRiderProblemReportColumns } from '@/hooks/users/columns.riderProblemReports';
import {
  useFetchRiderManagementAttendance,
  useFetchRiderManagementPerformance,
  useFetchRiderManagementProblemReports,
} from '@/hooks/users/users.hooks';
import {
  RiderAttendanceItem,
  RiderPerformanceItem,
  RiderProblemReportItem,
  RiderManagementTimeframe,
} from '@/types/user.type';
import { formatCurrency, formatNumbers } from '@/utils/strings.util';
import { ColumnDef } from '@tanstack/react-table';
import { useI18n } from '@/i18n/i18n';

type SortBy = 'deliveries' | 'earnings' | 'canceled' | 'failed' | 'activeDays' | 'activeHours';
type SortOrder = 'asc' | 'desc';
type ComparisonMetricKey =
  | 'rank'
  | 'totalDeliveries'
  | 'totalEarnings'
  | 'canceled'
  | 'failed'
  | 'activeDays'
  | 'activeHours';

const comparisonMetricLabelKeys: Record<ComparisonMetricKey, string> = {
  rank: 'riderManagement.rank',
  totalDeliveries: 'riderManagement.totalDeliveries',
  totalEarnings: 'riderManagement.totalEarnings',
  canceled: 'riderManagement.canceled',
  failed: 'riderManagement.failed',
  activeDays: 'riderManagement.activeDays',
  activeHours: 'riderManagement.activeHours',
};

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveDateInputValue = (value: Date | { target?: { value?: string } }) => {
  if (value instanceof Date) {
    return formatDateForInput(value);
  }
  return String(value?.target?.value || '');
};

const RiderManagementPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('riderManagement.docTitle'));

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [timeframe, setTimeframe] = useState<RiderManagementTimeframe>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(formatDateForInput(new Date()));
  const [attendanceName, setAttendanceName] = useState('');
  const [problemReportsDate, setProblemReportsDate] = useState(formatDateForInput(new Date()));
  const [problemReportsName, setProblemReportsName] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('deliveries');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [compareLeftId, setCompareLeftId] = useState('');
  const [compareRightId, setCompareRightId] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const {
    fetchRiderManagementPerformance,
    data: performanceData,
    isFetching: isPerformanceFetching,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  } = useFetchRiderManagementPerformance();

  const {
    fetchRiderManagementAttendance,
    data: attendanceData,
    isFetching: isAttendanceFetching,
    page: attendancePage,
    setPage: setAttendancePage,
    size: attendanceSize,
  } = useFetchRiderManagementAttendance();

  const {
    fetchRiderManagementProblemReports,
    data: problemReportsData,
    isFetching: isProblemReportsFetching,
    page: problemReportsPage,
    setPage: setProblemReportsPage,
    size: problemReportsSize,
  } = useFetchRiderManagementProblemReports();

  const performanceRows = useMemo(
    () => (performanceData?.data?.rows ?? []) as RiderPerformanceItem[],
    [performanceData],
  );
  const attendanceRows = useMemo(
    () => (attendanceData?.data?.rows ?? []) as RiderAttendanceItem[],
    [attendanceData],
  );
  const problemReportRows = useMemo(
    () => (problemReportsData?.data?.rows ?? []) as RiderProblemReportItem[],
    [problemReportsData],
  );
  const { attendanceColumns } = useRiderAttendanceColumns();
  const { problemReportColumns } = useRiderProblemReportColumns();

  useEffect(() => {
    setPage(0);
  }, [
    debouncedSearch,
    status,
    timeframe,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    setPage,
  ]);

  const normalizedCustomRange = useMemo(() => {
    if (timeframe !== 'custom') {
      return { startDate: undefined, endDate: undefined };
    }

    // Single-day filtering: if only one side is selected, use it for both.
    if (startDate && !endDate) {
      return { startDate, endDate: startDate };
    }

    if (!startDate && endDate) {
      return { startDate: endDate, endDate };
    }

    if (startDate && endDate && startDate > endDate) {
      return { startDate: endDate, endDate: startDate };
    }

    return {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }, [timeframe, startDate, endDate]);

  const performanceDetailSearch = useMemo(() => {
    const params = new URLSearchParams();
    params.set('timeframe', timeframe);
    if (normalizedCustomRange.startDate) params.set('startDate', normalizedCustomRange.startDate);
    if (normalizedCustomRange.endDate) params.set('endDate', normalizedCustomRange.endDate);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status !== 'ALL') params.set('status', status);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    const query = params.toString();
    return query ? `?${query}` : '';
  }, [
    debouncedSearch,
    normalizedCustomRange.endDate,
    normalizedCustomRange.startDate,
    sortBy,
    sortOrder,
    status,
    timeframe,
  ]);
  const { riderManagementColumns } = useRiderManagementColumns(performanceDetailSearch);

  const comparisonDateFilterLabel = useMemo(() => {
    if (timeframe === 'custom') {
      if (normalizedCustomRange.startDate && normalizedCustomRange.endDate) {
        return t('riderManagement.range', {
          start: normalizedCustomRange.startDate,
          end: normalizedCustomRange.endDate,
        });
      }
      return t('riderManagement.customRange');
    }

    if (timeframe === 'daily') return t('riderManagement.daily');
    if (timeframe === 'weekly') return t('riderManagement.weekly');
    return t('riderManagement.monthly');
  }, [timeframe, normalizedCustomRange.startDate, normalizedCustomRange.endDate, t]);

  useEffect(() => {
    fetchRiderManagementPerformance({
      page,
      size,
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : status,
      timeframe,
      startDate: normalizedCustomRange.startDate,
      endDate: normalizedCustomRange.endDate,
      sortBy,
      sortOrder,
    });
  }, [
    fetchRiderManagementPerformance,
    page,
    size,
    debouncedSearch,
    status,
    timeframe,
    normalizedCustomRange.startDate,
    normalizedCustomRange.endDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setAttendancePage(0);
  }, [attendanceDate, attendanceName, setAttendancePage]);
  useEffect(() => {
    setProblemReportsPage(0);
  }, [problemReportsDate, problemReportsName, setProblemReportsPage]);

  useEffect(() => {
    fetchRiderManagementAttendance({
      page: attendancePage,
      size: attendanceSize,
      attendanceDate: attendanceDate || undefined,
      name: attendanceName.trim() && attendanceName !== 'ALL' ? attendanceName.trim() : undefined,
    });
  }, [
    fetchRiderManagementAttendance,
    attendancePage,
    attendanceSize,
    attendanceDate,
    attendanceName,
  ]);
  useEffect(() => {
    fetchRiderManagementProblemReports({
      page: problemReportsPage,
      size: problemReportsSize,
      attendanceDate: problemReportsDate || undefined,
      name: problemReportsName.trim() ? problemReportsName.trim() : undefined,
    });
  }, [
    fetchRiderManagementProblemReports,
    problemReportsPage,
    problemReportsSize,
    problemReportsDate,
    problemReportsName,
  ]);

  const visibleTotals = useMemo(
    () =>
      performanceRows.reduce(
        (acc, row) => {
          acc.deliveries += row.totalDeliveriesCompleted;
          acc.earnings += row.totalEarnings;
          return acc;
        },
        { deliveries: 0, earnings: 0 },
      ),
    [performanceRows],
  );

  const compareOptions = useMemo(
    () =>
      performanceRows.map((rider) => ({
        label: `${rider.riderName || t('riderManagement.unknown')} (${rider.riderPhoneNumber || '-'})`,
        value: rider.riderId,
      })),
    [performanceRows, t],
  );

  const attendanceNameOptions = useMemo(() => {
    const uniqueNames = Array.from(
      new Set(
        attendanceRows
          .map((row) => (row.riderName || '').trim())
          .filter((name) => name.length > 0),
      ),
    ).sort((firstName, secondName) => firstName.localeCompare(secondName));

    return [
      { label: t('riderManagement.allRiders'), value: 'ALL' },
      ...uniqueNames.map((name) => ({ label: name, value: name })),
    ];
  }, [attendanceRows, t]);

  useEffect(() => {
    if (performanceRows.length === 0) {
      setCompareLeftId('');
      setCompareRightId('');
      return;
    }

    if (!compareLeftId || !performanceRows.some((rider) => rider.riderId === compareLeftId)) {
      setCompareLeftId(performanceRows[0].riderId);
    }

    if (!compareRightId || !performanceRows.some((rider) => rider.riderId === compareRightId)) {
      setCompareRightId(performanceRows[Math.min(1, performanceRows.length - 1)].riderId);
    }
  }, [performanceRows, compareLeftId, compareRightId]);

  const leftRider = performanceRows.find((rider) => rider.riderId === compareLeftId);
  const rightRider = performanceRows.find((rider) => rider.riderId === compareRightId);

  const comparisonRows = useMemo(() => {
    if (!leftRider || !rightRider) return [];

    const metrics: Array<{
      metricKey: ComparisonMetricKey;
      leftValue: number;
      rightValue: number;
      higherIsBetter: boolean;
    }> = [
      {
        metricKey: 'rank',
        leftValue: leftRider.rank,
        rightValue: rightRider.rank,
        higherIsBetter: false,
      },
      {
        metricKey: 'totalDeliveries',
        leftValue: leftRider.totalDeliveriesCompleted,
        rightValue: rightRider.totalDeliveriesCompleted,
        higherIsBetter: true,
      },
      {
        metricKey: 'totalEarnings',
        leftValue: leftRider.totalEarnings,
        rightValue: rightRider.totalEarnings,
        higherIsBetter: true,
      },
      {
        metricKey: 'canceled',
        leftValue: leftRider.canceledDeliveries,
        rightValue: rightRider.canceledDeliveries,
        higherIsBetter: false,
      },
      {
        metricKey: 'failed',
        leftValue: leftRider.failedDeliveries,
        rightValue: rightRider.failedDeliveries,
        higherIsBetter: false,
      },
      {
        metricKey: 'activeDays',
        leftValue: leftRider.activeDays,
        rightValue: rightRider.activeDays,
        higherIsBetter: true,
      },
      {
        metricKey: 'activeHours',
        leftValue: leftRider.activeHours,
        rightValue: rightRider.activeHours,
        higherIsBetter: true,
      },
    ];

    return metrics.map((metric) => {
      let winner: 'left' | 'right' | 'tie' = 'tie';
      if (metric.leftValue !== metric.rightValue) {
        const leftWins = metric.higherIsBetter
          ? metric.leftValue > metric.rightValue
          : metric.leftValue < metric.rightValue;
        winner = leftWins ? 'left' : 'right';
      }

      return {
        ...metric,
        label: t(comparisonMetricLabelKeys[metric.metricKey]),
        winner,
      };
    });
  }, [leftRider, rightRider, t]);

  const comparisonSummary = useMemo(() => {
    if (!leftRider || !rightRider) return null;

    const leftWins = comparisonRows.filter((row) => row.winner === 'left').length;
    const rightWins = comparisonRows.filter((row) => row.winner === 'right').length;
    const ties = comparisonRows.filter((row) => row.winner === 'tie').length;
    const gap = Math.abs(leftWins - rightWins);

    const leader = leftWins === rightWins ? 'tie' : leftWins > rightWins ? 'left' : 'right';
    const isFarAhead = gap >= 3;

    return {
      leftWins,
      rightWins,
      ties,
      leader,
      isFarAhead,
      gap,
    };
  }, [leftRider, rightRider, comparisonRows]);

  type ComparisonRowItem = {
    metricKey: ComparisonMetricKey;
    label: string;
    leftValue: number;
    rightValue: number;
    higherIsBetter: boolean;
    winner: 'left' | 'right' | 'tie';
  };

  const formatComparisonValue = useCallback((metricKey: ComparisonMetricKey, value: number) => {
    return metricKey === 'totalEarnings' ? formatCurrency(value, 'RWF') : formatNumbers(value);
  }, []);

  // COMPARISON SUMMARY COLUMNS
  const comparisonSummaryColumns: ColumnDef<ComparisonRowItem>[] = useMemo(
    () => [
      {
        header: t('riderManagement.metric'),
        accessorKey: 'label',
      },
      {
        header: leftRider?.riderName || t('riderManagement.riderA'),
        accessorKey: 'leftValue',
        cell: ({ row }) => (
          <p className={`text-xs ${row.original.winner === 'left' ? 'font-normal text-(--ink)' : 'text-(--ink)'}`}>
            {formatComparisonValue(row.original.metricKey, row.original.leftValue)}
          </p>
        ),
      },
      {
        header: rightRider?.riderName || t('riderManagement.riderB'),
        accessorKey: 'rightValue',
        cell: ({ row }) => (
          <p className={`text-xs ${row.original.winner === 'right' ? 'font-normal text-(--ink)' : ''}`}>
            {formatComparisonValue(row.original.metricKey, row.original.rightValue)}
          </p>
        ),
      },
      {
        header: t('riderManagement.difference'),
        id: 'difference',
        cell: ({ row }) =>
          formatComparisonValue(
            row.original.metricKey,
            Math.abs(row.original.leftValue - row.original.rightValue),
          ),
      },
    ],
    [leftRider?.riderName, rightRider?.riderName, formatComparisonValue, t],
  );

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="type-page-title">{t('riderManagement.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('riderManagement.description')}
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="bg-(--paper) border border-(--line) rounded-xl p-4">
          <p className="type-meta">{t('riderManagement.ridersFiltered')}</p>
          <p className="type-metric mt-1">
            {formatNumbers(totalCount) || '0'}
          </p>
        </article>
        <article className="bg-(--paper) border border-(--line) rounded-xl p-4">
          <p className="type-meta">{t('riderManagement.deliveriesPage')}</p>
          <p className="type-metric mt-1">
            {formatNumbers(visibleTotals.deliveries) || '0'}
          </p>
        </article>
        <article className="bg-(--paper) border border-(--line) rounded-xl p-4">
          <p className="type-meta">{t('riderManagement.earningsPage')}</p>
          <p className="type-metric mt-1">
            {formatCurrency(visibleTotals.earnings, 'RWF') || 'RWF 0'}
          </p>
        </article>
      </section>

      <section className="bg-(--paper) border border-(--line) rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
        <Input
          label={t('riderManagement.search')}
          placeholder={t('riderManagement.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          label={t('common.status')}
          value={status}
          onChange={(value) => setStatus(value)}
          options={[
            { label: t('riderManagement.all'), value: 'ALL' },
            { label: t('status.active'), value: UserStatus.ACTIVE },
            { label: t('status.inactive'), value: UserStatus.INACTIVE },
            { label: t('status.suspended'), value: UserStatus.SUSPENDED },
          ]}
        />

        <Select
          label={t('riderManagement.timeframe')}
          value={timeframe}
          onChange={(value) => setTimeframe(value as RiderManagementTimeframe)}
          options={[
            { label: t('riderManagement.daily'), value: 'daily' },
            { label: t('riderManagement.weekly'), value: 'weekly' },
            { label: t('riderManagement.monthly'), value: 'monthly' },
            { label: t('riderManagement.custom'), value: 'custom' },
          ]}
        />

        <Input
          label={t('riderManagement.startDate')}
          type="date"
          placeholder={t('common.selectDate')}
          value={startDate}
          onChange={(value) => {
            setTimeframe('custom');
            setStartDate(resolveDateInputValue(value as Date | { target?: { value?: string } }));
          }}
        />
        <Input
          label={t('riderManagement.endDate')}
          type="date"
          placeholder={t('common.selectDate')}
          value={endDate}
          onChange={(value) => {
            setTimeframe('custom');
            setEndDate(resolveDateInputValue(value as Date | { target?: { value?: string } }));
          }}
        />
        <Select
          label={t('riderManagement.sortBy')}
          value={sortBy}
          onChange={(value) => setSortBy(value as SortBy)}
          options={[
            { label: t('riderManagement.deliveries'), value: 'deliveries' },
            { label: t('riderManagement.earnings'), value: 'earnings' },
            { label: t('riderManagement.canceled'), value: 'canceled' },
            { label: t('riderManagement.failed'), value: 'failed' },
            { label: t('riderManagement.activeDays'), value: 'activeDays' },
            { label: t('riderManagement.activeHours'), value: 'activeHours' },
          ]}
        />
        <Select
          label={t('riderManagement.sortOrder')}
          value={sortOrder}
          onChange={(value) => setSortOrder(value as SortOrder)}
          options={[
            { label: t('riderManagement.descending'), value: 'desc' },
            { label: t('riderManagement.ascending'), value: 'asc' },
          ]}
        />
      </section>

      <Table
        columns={riderManagementColumns}
        data={performanceRows}
        showPagination
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isPerformanceFetching}
        noDataMessage={t('riderManagement.noRiders')}
      />

      <section className="bg-(--paper) border border-(--line) rounded-xl p-4 flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="type-card-title">{t('riderManagement.attendance')}</h2>
          <p className="type-meta">
            {t('riderManagement.attendanceDescription')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label={t('riderManagement.attendanceDate')}
            type="date"
            value={attendanceDate}
            onChange={(value) =>
              setAttendanceDate(resolveDateInputValue(value as Date | { target?: { value?: string } }))
            }
          />
          <Select
            label={t('riderManagement.riderName')}
            value={attendanceName || 'ALL'}
            onChange={(value) => setAttendanceName(value)}
            options={attendanceNameOptions}
          />
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={attendanceColumns}
            data={attendanceRows}
            showPagination
            page={attendancePage}
            setPage={setAttendancePage}
            size={attendanceSize}
            isLoading={isAttendanceFetching}
            noDataMessage={
              isAttendanceFetching
                ? t('riderManagement.loadingAttendance')
                : t('riderManagement.noAttendance')
            }
          />
        </div>
      </section>

      <section className="bg-(--paper) border border-(--line) rounded-xl p-4 flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="type-card-title">{t('riderManagement.problemReports')}</h2>
          <p className="type-meta">
            {t('riderManagement.problemReportsDescription')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label={t('riderManagement.reportDate')}
            type="date"
            value={problemReportsDate}
            onChange={(value) =>
              setProblemReportsDate(resolveDateInputValue(value as Date | { target?: { value?: string } }))
            }
          />
          <Input
            label={t('riderManagement.riderName')}
            placeholder={t('riderManagement.typeName')}
            value={problemReportsName}
            onChange={(event) => setProblemReportsName(event.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={problemReportColumns}
            data={problemReportRows}
            showPagination
            page={problemReportsPage}
            setPage={setProblemReportsPage}
            size={problemReportsSize}
            isLoading={isProblemReportsFetching}
            noDataMessage={
              isProblemReportsFetching
                ? t('riderManagement.loadingReports')
                : t('riderManagement.noReports')
            }
          />
        </div>
      </section>

      <section className="bg-(--paper) border border-(--line) rounded-xl p-4 flex flex-col gap-4">
        <header>
          <h2 className="type-card-title">{t('riderManagement.compare')}</h2>
          <p className="type-meta">
            {t('riderManagement.compareDescription')}
          </p>
          <p className="type-meta mt-1">
            {t('riderManagement.comparisonPeriod', { period: comparisonDateFilterLabel })}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Select
            label={t('riderManagement.comparisonTimeframe')}
            value={timeframe}
            onChange={(value) => setTimeframe(value as RiderManagementTimeframe)}
            options={[
              { label: t('riderManagement.daily'), value: 'daily' },
              { label: t('riderManagement.weekly'), value: 'weekly' },
              { label: t('riderManagement.monthly'), value: 'monthly' },
              { label: t('riderManagement.custom'), value: 'custom' },
            ]}
          />
          <Input
            label={t('riderManagement.compareFrom')}
            type="date"
            placeholder={t('riderManagement.startDate')}
            value={startDate}
            onChange={(value) => {
              setTimeframe('custom');
              setStartDate(resolveDateInputValue(value as Date | { target?: { value?: string } }));
            }}
          />
          <Input
            label={t('riderManagement.compareTo')}
            type="date"
            placeholder={t('riderManagement.endDate')}
            value={endDate}
            onChange={(value) => {
              setTimeframe('custom');
              setEndDate(resolveDateInputValue(value as Date | { target?: { value?: string } }));
            }}
          />
          <button
            type="button"
            className="h-10 rounded-lg px-3 text-sm text-(--ink) hover:bg-(--surface)"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setTimeframe('monthly');
            }}
          >
            {t('riderManagement.resetDates')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label={t('riderManagement.riderA')}
            value={compareLeftId}
            onChange={(value) => setCompareLeftId(value)}
            options={compareOptions}
          />
          <Select
            label={t('riderManagement.riderB')}
            value={compareRightId}
            onChange={(value) => setCompareRightId(value)}
            options={compareOptions}
          />
        </div>

        {leftRider && rightRider && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <article className="border border-(--line) rounded-lg p-3">
                <p className="type-meta">
                  {t('riderManagement.wins', {
                    name: leftRider.riderName || t('riderManagement.riderA'),
                  })}
                </p>
                <p className="type-metric">
                  {comparisonSummary?.leftWins ?? 0}
                </p>
              </article>
              <article className="border border-(--line) rounded-lg p-3">
                <p className="type-meta">{t('riderManagement.result')}</p>
                <p className="text-sm font-normal mt-1">
                  {comparisonSummary?.leader === 'tie' && (
                    <span className="text-(--ink)">{t('riderManagement.balanced')}</span>
                  )}
                  {comparisonSummary?.leader === 'left' && (
                    <span className="text-(--ink)">
                      {comparisonSummary.isFarAhead
                        ? t('riderManagement.farAhead', {
                            name: leftRider.riderName || t('riderManagement.riderA'),
                          })
                        : t('riderManagement.ahead', {
                            name: leftRider.riderName || t('riderManagement.riderA'),
                          })}
                    </span>
                  )}
                  {comparisonSummary?.leader === 'right' && (
                    <span className="text-(--ink)">
                      {comparisonSummary.isFarAhead
                        ? t('riderManagement.farAhead', {
                            name: rightRider.riderName || t('riderManagement.riderB'),
                          })
                        : t('riderManagement.ahead', {
                            name: rightRider.riderName || t('riderManagement.riderB'),
                          })}
                    </span>
                  )}
                </p>
                <p className="type-meta mt-1">
                  {t('riderManagement.gap', { count: String(comparisonSummary?.gap ?? 0) })}
                </p>
              </article>
              <article className="border border-(--line) rounded-lg p-3">
                <p className="type-meta">
                  {t('riderManagement.wins', {
                    name: rightRider.riderName || t('riderManagement.riderB'),
                  })}
                </p>
                <p className="type-metric">
                  {comparisonSummary?.rightWins ?? 0}
                </p>
                <p className="type-meta mt-1">
                  {t('riderManagement.ties', { count: String(comparisonSummary?.ties ?? 0) })}
                </p>
              </article>
            </div>

            <div className="overflow-x-auto">
              <Table
                columns={comparisonSummaryColumns}
                data={
                  comparisonSummary
                    ? comparisonRows.map((row) => ({
                        metricKey: row.metricKey,
                        label: row.label,
                        leftValue: row.leftValue,
                        rightValue: row.rightValue,
                        higherIsBetter: row.higherIsBetter,
                        winner: row.winner,
                      }))
                    : []
                }
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default RiderManagementPage;
