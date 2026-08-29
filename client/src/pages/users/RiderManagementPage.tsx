import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/Modal';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import Table from '@/components/table/Table';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import { UserStatus } from '@/constants/user.constants';
import useDebounce from '@/hooks/common/debounce.hooks';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useRiderManagementColumns } from '@/hooks/users/columns.riderManagement';
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
import { formatCurrency, formatDate, formatNumbers } from '@/utils/strings.util';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomPopover from '@/components/inputs/CustomPopover';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { ellipsisHClassName, tableActionClassName } from '@/constants/inputs.constants';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
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

const formatAttendanceDateTime = (value?: string) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString();
};

const normalizeProblemMediaUrl = (value?: string) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    return new URL(trimmed).toString();
  } catch {
    return encodeURI(trimmed);
  }
};

const isLikelyVideoMedia = (mediaType?: string, url?: string) => {
  if (mediaType === 'video') return true;
  if (!url) return false;
  return /\.(mp4|webm|ogg|m3u8|mov|qt)(\?.*)?$/i.test(url);
};

const getCloudinaryVideoSourceCandidates = (url: string) => {
  if (!url) return [] as string[];

  const candidates = new Set<string>([url]);
  if (!url.includes('/res.cloudinary.com/') || !url.includes('/video/upload/')) {
    return Array.from(candidates);
  }

  const urlObj = new URL(url);

  // Transcode to MP4/H.264 — required for MOV and other formats that browsers
  // (Chrome, Firefox) cannot play natively. Cloudinary applies this server-side.
  candidates.add(url.replace('/video/upload/', '/video/upload/f_mp4,vc_h264/'));

  // Fallback: strip the full transformation chain and request the raw asset
  // transcoded to MP4. Useful when the overlay/watermark chain fails for the
  // source format (e.g. MOV with complex named-layer overlays).
  // Use [^?]+ to exclude the query string so urlObj.search isn't duplicated.
  const pathMatch = url.match(/\/v\d+\/[^?]+/);
  if (pathMatch?.[0]) {
    // Preserve the Cloudinary cloud name (first path segment after the host).
    const cloudName = urlObj.pathname.split('/')[1];
    const base = `${urlObj.protocol}//${urlObj.host}/${cloudName}`;
    const plainPathUrl = `${base}/video/upload/f_mp4,vc_h264${pathMatch[0]}`;
    const querySuffix = urlObj.search || '';
    candidates.add(`${plainPathUrl}${querySuffix}`);
  }

  return Array.from(candidates);
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
  const [selectedRider, setSelectedRider] = useState<RiderPerformanceItem | null>(null);
  const [attendanceProofRider, setAttendanceProofRider] = useState<RiderAttendanceItem | null>(null);
  const [selectedProblemReport, setSelectedProblemReport] = useState<RiderProblemReportItem | null>(null);
  const [problemVideoPreviewError, setProblemVideoPreviewError] = useState(false);
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
  const selectedProblemMediaUrl = useMemo(
    () => normalizeProblemMediaUrl(selectedProblemReport?.imageUrl),
    [selectedProblemReport?.imageUrl],
  );
  const selectedProblemIsVideo = useMemo(
    () => isLikelyVideoMedia(selectedProblemReport?.mediaType, selectedProblemMediaUrl),
    [selectedProblemReport?.mediaType, selectedProblemMediaUrl],
  );
  const selectedProblemVideoSources = useMemo(
    () => getCloudinaryVideoSourceCandidates(selectedProblemMediaUrl),
    [selectedProblemMediaUrl],
  );
  const { riderManagementColumns } = useRiderManagementColumns(setSelectedRider);

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

  const openAttendanceProof = useCallback((row: RiderAttendanceItem) => {
    setAttendanceProofRider(row);
  }, []);

  // ATTENDANCE COLUMNS
  const attendanceColumns: ColumnDef<RiderAttendanceItem>[] = useMemo(
    () => [
      {
        header: t('riderManagement.rider'),
        accessorKey: 'riderName',
        cell: ({ row }) => row.original.riderName || '-',
      },
      {
        header: t('riderManagement.time'),
        accessorKey: 'timestamp',
        cell: ({ row }) =>
          formatDate(row.original.timestamp, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: t('common.status'),
        accessorKey: 'status',
        cell: ({ row }) => {
          const status = row.original.status === UserStatus.INACTIVE
            ? {
                icon: faCircleXmark,
                iconColor: 'text-(--ink)',
                text: t('riderManagement.checkOut'),
              }
            : {
                icon: faCircleCheck,
                iconColor: 'text-(--ink)',
                text: t('riderManagement.checkIn'),
              };
          return (
            <p className={`flex items-center gap-2 text-xs ${status.iconColor}`}>
              <FontAwesomeIcon className="text-xs" icon={status.icon} />
              {status.text}
            </p>
          );
        },
      },
      {
        header: t('common.actions'),
        id: 'actions',
        cell: ({ row }) => (
          <CustomPopover
            trigger={
              <FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />
            }
          >
            <menu className="w-full flex flex-col gap-1">
              <Link
                className={tableActionClassName}
                to={`/users/${row.original.riderId}`}
                onClick={(e) => {
                  e.preventDefault();
                  openAttendanceProof(row.original);
                }}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                {t('riderManagement.viewProof')}
              </Link>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    [openAttendanceProof, t],
  );
  const problemReportColumns: ColumnDef<RiderProblemReportItem>[] = useMemo(
    () => [
      {
        header: t('riderManagement.rider'),
        accessorKey: 'riderName',
        cell: ({ row }) => row.original.riderName || '-',
      },
      {
        header: t('riderManagement.time'),
        accessorKey: 'timestamp',
        cell: ({ row }) => formatDate(row.original.timestamp, 'DD/MM/YYYY HH:mm'),
      },
      {
        header: t('riderManagement.type'),
        accessorKey: 'mediaType',
        cell: ({ row }) =>
          row.original.mediaType === 'video'
            ? t('riderManagement.video')
            : t('riderManagement.photo'),
      },
      {
        header: t('riderManagement.location'),
        accessorKey: 'locationLabel',
        cell: ({ row }) => row.original.locationLabel || '-',
      },
      {
        header: t('riderManagement.descriptionLabel'),
        accessorKey: 'description',
        cell: ({ row }) => row.original.description || '-',
      },
      {
        header: t('common.actions'),
        id: 'problem-actions',
        cell: ({ row }) => (
          <CustomPopover
            trigger={
              <FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />
            }
          >
            <menu className="w-full flex flex-col gap-1">
              <Link
                className={tableActionClassName}
                to={`/users/${row.original.riderId}`}
                onClick={(e) => {
                  e.preventDefault();
                  setProblemVideoPreviewError(false);
                  setSelectedProblemReport(row.original);
                }}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                {t('riderManagement.viewEvidence')}
              </Link>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    [t],
  );

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

      <Modal
        isOpen={Boolean(selectedRider)}
        onClose={() => setSelectedRider(null)}
        heading={t('riderManagement.details', {
          name: selectedRider?.riderName ? ` - ${selectedRider.riderName}` : '',
        })}
        description={t('riderManagement.detailsDescription')}
      >
        {selectedRider && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p><strong>{t('riderManagement.name')}:</strong> {selectedRider.riderName || '-'}</p>
            <p><strong>{t('riderManagement.email')}:</strong> {selectedRider.riderEmail || '-'}</p>
            <p><strong>{t('riderManagement.phone')}:</strong> {selectedRider.riderPhoneNumber || '-'}</p>
            <p className="flex items-center gap-2">
              <strong>{t('common.status')}:</strong> <StatusBadge status={selectedRider.riderStatus} />
            </p>
            <p><strong>{t('riderManagement.rank')}:</strong> #{selectedRider.rank}</p>
            <p><strong>{t('riderManagement.totalDeliveries')}:</strong> {formatNumbers(selectedRider.totalDeliveriesCompleted) || '0'}</p>
            <p><strong>{t('riderManagement.totalEarnings')}:</strong> {formatCurrency(selectedRider.totalEarnings, 'RWF') || 'RWF 0'}</p>
            <p><strong>{t('riderManagement.canceled')}:</strong> {formatNumbers(selectedRider.canceledDeliveries) || '0'}</p>
            <p><strong>{t('riderManagement.failed')}:</strong> {formatNumbers(selectedRider.failedDeliveries) || '0'}</p>
            <p><strong>{t('riderManagement.activeDays')}:</strong> {formatNumbers(selectedRider.activeDays) || '0'}</p>
            <p><strong>{t('riderManagement.activeHours')}:</strong> {formatNumbers(selectedRider.activeHours) || '0'}</p>
          </div>
        )}
      </Modal>

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

      <Modal
        isOpen={Boolean(attendanceProofRider)}
        onClose={() => setAttendanceProofRider(null)}
        heading={t('riderManagement.attendanceProof', {
          name: attendanceProofRider?.riderName ? ` - ${attendanceProofRider.riderName}` : '',
        })}
        description={t('riderManagement.attendanceProofDate', {
          date: attendanceProofRider?.date || '-',
        })}
      >
        {attendanceProofRider && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-(--muted)">
              {t('riderManagement.attendanceEvent', {
                event:
                  attendanceProofRider.status === UserStatus.ACTIVE
                    ? t('riderManagement.checkIn')
                    : t('riderManagement.checkOut'),
                time: formatAttendanceDateTime(attendanceProofRider.timestamp),
              })}
            </p>
            {attendanceProofRider.locationLabel && (
              <p className="type-meta">
                {t('riderManagement.location')}: {attendanceProofRider.locationLabel}
              </p>
            )}
            <img
              src={attendanceProofRider.imageUrl}
              alt={t('riderManagement.proofAlt', {
                name: attendanceProofRider.riderName || t('riderManagement.rider'),
              })}
              className="w-full max-h-96 object-contain rounded-lg bg-(--surface)"
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(selectedProblemReport)}
        onClose={() => {
          setProblemVideoPreviewError(false);
          setSelectedProblemReport(null);
        }}
        heading={t('riderManagement.problemReport', {
          name: selectedProblemReport?.riderName ? ` - ${selectedProblemReport.riderName}` : '',
        })}
        description={t('riderManagement.reportedAt', {
          time: selectedProblemReport
            ? formatAttendanceDateTime(selectedProblemReport.timestamp)
            : '-',
        })}
      >
        {selectedProblemReport && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-xs text-(--muted)">
              <p>
                <strong>{t('riderManagement.type')}:</strong>{' '}
                {selectedProblemReport.mediaType === 'video'
                  ? t('riderManagement.video')
                  : t('riderManagement.photo')}
              </p>
              <p>
                <strong>{t('riderManagement.timestamp')}:</strong>{' '}
                {formatAttendanceDateTime(selectedProblemReport.timestamp)}
              </p>
              <p>
                <strong>{t('riderManagement.location')}:</strong>{' '}
                {selectedProblemReport.locationLabel || '-'}
              </p>
              <p>
                <strong>{t('riderManagement.descriptionLabel')}:</strong>{' '}
                {selectedProblemReport.description || '-'}
              </p>
            </div>

            {selectedProblemIsVideo ? (
              problemVideoPreviewError ? (
                <div className="w-full rounded-lg bg-(--surface) p-4 text-sm text-(--ink)">
                  <p className="font-normal">{t('riderManagement.videoError')}</p>
                  {selectedProblemMediaUrl && (
                    <a
                      href={selectedProblemMediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-normal text-(--ink) underline"
                    >
                      {t('riderManagement.openVideo')}
                    </a>
                  )}
                </div>
              ) : (
                <video
                  key={selectedProblemReport?.id}
                  controls
                  preload="metadata"
                  className="w-full max-h-72 rounded-lg border border-(--line) bg-(--ink)"
                  onError={() => setProblemVideoPreviewError(true)}
                  onLoadedData={() => setProblemVideoPreviewError(false)}
                >
                  {selectedProblemVideoSources.map((sourceUrl, sourceIndex) => (
                    <source key={`problem-report-video-source-${sourceIndex}`} src={sourceUrl} />
                  ))}
                </video>
              )
            ) : (
              <img
                src={selectedProblemMediaUrl}
                alt={t('riderManagement.problemAlt', {
                  name: selectedProblemReport.riderName || t('riderManagement.rider'),
                })}
                className="w-full max-h-72 object-contain rounded-lg border border-(--line) bg-(--paper)"
              />
            )}
          </div>
        )}
      </Modal>

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
