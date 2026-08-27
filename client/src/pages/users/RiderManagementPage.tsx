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

type SortBy = 'deliveries' | 'earnings' | 'canceled' | 'failed' | 'activeDays' | 'activeHours';
type SortOrder = 'asc' | 'desc';

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
  useDocumentTitle('Rider Management');

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
        return `${normalizedCustomRange.startDate} to ${normalizedCustomRange.endDate}`;
      }
      return 'Custom date range';
    }

    if (timeframe === 'daily') return 'Daily';
    if (timeframe === 'weekly') return 'Weekly';
    return 'Monthly';
  }, [timeframe, normalizedCustomRange.startDate, normalizedCustomRange.endDate]);

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
        label: `${rider.riderName || 'Unknown'} (${rider.riderPhoneNumber || '-'})`,
        value: rider.riderId,
      })),
    [performanceRows],
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
      { label: 'All riders', value: 'ALL' },
      ...uniqueNames.map((name) => ({ label: name, value: name })),
    ];
  }, [attendanceRows]);

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

    const metrics = [
      {
        label: 'Rank',
        leftValue: leftRider.rank,
        rightValue: rightRider.rank,
        higherIsBetter: false,
      },
      {
        label: 'Total Deliveries Completed',
        leftValue: leftRider.totalDeliveriesCompleted,
        rightValue: rightRider.totalDeliveriesCompleted,
        higherIsBetter: true,
      },
      {
        label: 'Total Earnings',
        leftValue: leftRider.totalEarnings,
        rightValue: rightRider.totalEarnings,
        higherIsBetter: true,
      },
      {
        label: 'Canceled Deliveries',
        leftValue: leftRider.canceledDeliveries,
        rightValue: rightRider.canceledDeliveries,
        higherIsBetter: false,
      },
      {
        label: 'Failed Deliveries',
        leftValue: leftRider.failedDeliveries,
        rightValue: rightRider.failedDeliveries,
        higherIsBetter: false,
      },
      {
        label: 'Active Days',
        leftValue: leftRider.activeDays,
        rightValue: rightRider.activeDays,
        higherIsBetter: true,
      },
      {
        label: 'Active Hours',
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
        winner,
      };
    });
  }, [leftRider, rightRider]);

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
        header: "Rider",
        accessorKey: "riderName",
        cell: ({ row }) => row.original.riderName || "-",
      },
      {
        header: "Time",
        accessorKey: "timestamp",
        cell: ({ row }) =>
          formatDate(row.original.timestamp, "DD/MM/YYYY HH:mm"),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          let status = {
            icon: faCircleCheck,
            iconColor: 'text-(--ink)',
            text: 'Check In',
          }
          if (row.original.status === UserStatus.INACTIVE) {
            status = {
              icon: faCircleXmark,
              iconColor: 'text-(--ink)',
              text: 'Check Out',
            }
          }
          return (
            <p className={`flex items-center gap-2 text-[11px] ${status.iconColor}`}>
              <FontAwesomeIcon className='text-[11px]' icon={status.icon} />
              {status?.text}
            </p>
          );
        },
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => {
          return (
            <CustomPopover
              trigger={
                <FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />
              }
            >
              <menu className="w-full flex flex-col gap-1">
                <Link className={tableActionClassName} to={`/users/${row.original.riderId}`} onClick={(e) => {
                  e.preventDefault();
                  openAttendanceProof(row.original);
                }}>
                  <FontAwesomeIcon icon={faCircleInfo} />
                  View proof
                </Link>
              </menu>
            </CustomPopover>
          );
        },
      },
    ],
    [openAttendanceProof],
  );
  const problemReportColumns: ColumnDef<RiderProblemReportItem>[] = useMemo(
    () => [
      {
        header: "Rider",
        accessorKey: "riderName",
        cell: ({ row }) => row.original.riderName || "-",
      },
      {
        header: "Time",
        accessorKey: "timestamp",
        cell: ({ row }) => formatDate(row.original.timestamp, "DD/MM/YYYY HH:mm"),
      },
      {
        header: "Type",
        accessorKey: "mediaType",
        cell: ({ row }) => (row.original.mediaType === 'video' ? 'Video' : 'Photo'),
      },
      {
        header: "Location",
        accessorKey: "locationLabel",
        cell: ({ row }) => row.original.locationLabel || "-",
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) => row.original.description || "-",
      },
      {
        header: "Actions",
        id: "problem-actions",
        cell: ({ row }) => (
          <CustomPopover
            trigger={
              <FontAwesomeIcon icon={faEllipsisH} className={ellipsisHClassName} />
            }
          >
            <menu className="w-full flex flex-col gap-1">
              <Link className={tableActionClassName} to={`/users/${row.original.riderId}`} onClick={(e) => {
                e.preventDefault();
                setProblemVideoPreviewError(false);
                setSelectedProblemReport(row.original);
              }}>
                <FontAwesomeIcon icon={faCircleInfo} />
                View evidence
              </Link>
            </menu>
          </CustomPopover>
        ),
      },
    ],
    [],
  );

  type ComparisonRowItem = {
    label: string;
    leftValue: number;
    rightValue: number;
    higherIsBetter: boolean;
    winner: 'left' | 'right' | 'tie';
  };

  const formatComparisonValue = useCallback((label: string, value: number) => {
    return label === 'Total Earnings' ? formatCurrency(value, 'RWF') : formatNumbers(value);
  }, []);

  // COMPARISON SUMMARY COLUMNS
  const comparisonSummaryColumns: ColumnDef<ComparisonRowItem>[] = useMemo(
    () => [
      {
        header: "Metric",
        accessorKey: "label",
      },
      {
        header: leftRider?.riderName || 'Rider A',
        accessorKey: "leftValue",
        cell: ({ row }) => {
          return (
            <p className={`text-[11px] ${row.original.winner === 'left' ? 'font-medium text-(--ink)' : 'text-(--ink)'}`}>
              {formatComparisonValue(row.original.label, row.original.leftValue)}
            </p>
          );
        },
      },
      {
        header: rightRider?.riderName || 'Rider B',
        accessorKey: "rightValue",
        cell: ({ row }) => {
          return (
            <p className={`text-[11px] ${row.original.winner === 'right' ? 'font-medium text-(--ink)' : ''}`}>
              {formatComparisonValue(row.original.label, row.original.rightValue)}
            </p>
          );
        },
      },
      {
        header: "Difference",
        id: "difference",
        cell: ({ row }) => formatComparisonValue(
          row.original.label,
          Math.abs(row.original.leftValue - row.original.rightValue),
        ),
      },
    ],
    [leftRider?.riderName, rightRider?.riderName, formatComparisonValue]
  );

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-(--ink)">Rider Management</h1>
        <p className="text-sm text-muted-foreground">
          Admin dashboard for rider performance, ranking, and reliability tracking.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="bg-(--paper) border border-(--line) rounded-xl p-4">
          <p className="text-xs text-(--muted)">Riders (filtered)</p>
          <p className="text-lg font-medium text-(--ink) mt-1">
            {formatNumbers(totalCount) || '0'}
          </p>
        </article>
        <article className="bg-(--paper) border border-(--line) rounded-xl p-4">
          <p className="text-xs text-(--muted)">Deliveries (page)</p>
          <p className="text-lg font-medium text-(--ink) mt-1">
            {formatNumbers(visibleTotals.deliveries) || '0'}
          </p>
        </article>
        <article className="bg-(--paper) border border-(--line) rounded-xl p-4">
          <p className="text-xs text-(--muted)">Earnings (page)</p>
          <p className="text-lg font-medium text-(--ink) mt-1">
            {formatCurrency(visibleTotals.earnings, 'RWF') || 'RWF 0'}
          </p>
        </article>
      </section>

      <section className="bg-(--paper) border border-(--line) rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-3">
        <Input
          label="Search rider"
          placeholder="Name, email, phone..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          label="Status"
          value={status}
          onChange={(value) => setStatus(value)}
          options={[
            { label: 'All', value: 'ALL' },
            { label: 'Active', value: UserStatus.ACTIVE },
            { label: 'Inactive', value: UserStatus.INACTIVE },
            { label: 'Suspended', value: UserStatus.SUSPENDED },
          ]}
        />

        <Select
          label="Timeframe"
          value={timeframe}
          onChange={(value) => setTimeframe(value as RiderManagementTimeframe)}
          options={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Custom', value: 'custom' },
          ]}
        />

        <Input
          label="Start date"
          type="date"
          placeholder="Select date"
          value={startDate}
          onChange={(value) => {
            setTimeframe('custom');
            setStartDate(resolveDateInputValue(value as Date | { target?: { value?: string } }));
          }}
        />
        <Input
          label="End date"
          type="date"
          placeholder="Select date"
          value={endDate}
          onChange={(value) => {
            setTimeframe('custom');
            setEndDate(resolveDateInputValue(value as Date | { target?: { value?: string } }));
          }}
        />
        <Select
          label="Sort by"
          value={sortBy}
          onChange={(value) => setSortBy(value as SortBy)}
          options={[
            { label: 'Deliveries', value: 'deliveries' },
            { label: 'Earnings', value: 'earnings' },
            { label: 'Canceled deliveries', value: 'canceled' },
            { label: 'Failed deliveries', value: 'failed' },
            { label: 'Active days', value: 'activeDays' },
            { label: 'Active hours', value: 'activeHours' },
          ]}
        />
        <Select
          label="Order"
          value={sortOrder}
          onChange={(value) => setSortOrder(value as SortOrder)}
          options={[
            { label: 'Descending', value: 'desc' },
            { label: 'Ascending', value: 'asc' },
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
        noDataMessage="No riders found for the selected filters."
      />

      <Modal
        isOpen={Boolean(selectedRider)}
        onClose={() => setSelectedRider(null)}
        heading={`Rider Details${selectedRider?.riderName ? ` - ${selectedRider.riderName}` : ''}`}
        description="Full rider metrics and profile summary."
      >
        {selectedRider && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p><strong>Name:</strong> {selectedRider.riderName || '-'}</p>
            <p><strong>Email:</strong> {selectedRider.riderEmail || '-'}</p>
            <p><strong>Phone:</strong> {selectedRider.riderPhoneNumber || '-'}</p>
            <p className="flex items-center gap-2">
              <strong>Status:</strong> <StatusBadge status={selectedRider.riderStatus} />
            </p>
            <p><strong>Rank:</strong> #{selectedRider.rank}</p>
            <p><strong>Total Deliveries Completed:</strong> {formatNumbers(selectedRider.totalDeliveriesCompleted) || '0'}</p>
            <p><strong>Total Earnings:</strong> {formatCurrency(selectedRider.totalEarnings, 'RWF') || 'RWF 0'}</p>
            <p><strong>Canceled Deliveries:</strong> {formatNumbers(selectedRider.canceledDeliveries) || '0'}</p>
            <p><strong>Failed Deliveries:</strong> {formatNumbers(selectedRider.failedDeliveries) || '0'}</p>
            <p><strong>Active Days:</strong> {formatNumbers(selectedRider.activeDays) || '0'}</p>
            <p><strong>Active Hours:</strong> {formatNumbers(selectedRider.activeHours) || '0'}</p>
          </div>
        )}
      </Modal>

      <section className="bg-(--paper) border border-(--line) rounded-xl p-4 flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-(--ink)">Daily Attendance</h2>
          <p className="text-xs text-(--muted)">
            View all raw proof events for riders by date and name.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Attendance date"
            type="date"
            value={attendanceDate}
            onChange={(value) =>
              setAttendanceDate(resolveDateInputValue(value as Date | { target?: { value?: string } }))
            }
          />
          <Select
            label="Rider name"
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
            noDataMessage={isAttendanceFetching ? "Loading attendance data..." : "No attendance data found for the selected filters."}
          />
          </div>
      </section>

      <section className="bg-(--paper) border border-(--line) rounded-xl p-4 flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-(--ink)">Problem Reports</h2>
          <p className="text-xs text-(--muted)">
            View rider-submitted problem evidence separately from attendance logs.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Report date"
            type="date"
            value={problemReportsDate}
            onChange={(value) =>
              setProblemReportsDate(resolveDateInputValue(value as Date | { target?: { value?: string } }))
            }
          />
          <Input
            label="Rider name"
            placeholder="Type rider name"
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
            noDataMessage={isProblemReportsFetching ? "Loading problem reports..." : "No problem reports found for the selected filters."}
          />
        </div>
      </section>

      <Modal
        isOpen={Boolean(attendanceProofRider)}
        onClose={() => setAttendanceProofRider(null)}
        heading={`Attendance Proof${attendanceProofRider?.riderName ? ` - ${attendanceProofRider.riderName}` : ''}`}
        description={`Attendance date: ${attendanceProofRider?.date || '-'}`}
      >
        {attendanceProofRider && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-(--muted)">
              {attendanceProofRider.status === UserStatus.ACTIVE ? 'Check-in' : 'Check-out'} at{' '}
              {formatAttendanceDateTime(attendanceProofRider.timestamp)}
            </p>
            {attendanceProofRider.locationLabel && (
              <p className="text-xs text-(--muted)">
                Location: {attendanceProofRider.locationLabel}
              </p>
            )}
            <img
              src={attendanceProofRider.imageUrl}
              alt={`${attendanceProofRider.riderName || 'Rider'} attendance proof`}
              className="w-full max-h-96 object-contain rounded-lg border border-(--line) bg-(--surface)"
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
        heading={`Problem Report${selectedProblemReport?.riderName ? ` - ${selectedProblemReport.riderName}` : ''}`}
        description={`Reported at: ${selectedProblemReport ? formatAttendanceDateTime(selectedProblemReport.timestamp) : '-'}`}
      >
        {selectedProblemReport && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-xs text-(--muted)">
              <p>
                <strong>Type:</strong> {selectedProblemReport.mediaType === 'video' ? 'Video' : 'Photo'}
              </p>
              <p>
                <strong>Timestamp:</strong> {formatAttendanceDateTime(selectedProblemReport.timestamp)}
              </p>
              <p>
                <strong>Location:</strong> {selectedProblemReport.locationLabel || '-'}
              </p>
              <p>
                <strong>Description:</strong> {selectedProblemReport.description || '-'}
              </p>
            </div>

            {selectedProblemIsVideo ? (
              problemVideoPreviewError ? (
                <div className="w-full rounded-lg border border-(--line) bg-(--surface) p-4 text-sm text-(--ink)">
                  <p className="font-medium">Unable to load video preview.</p>
                  {selectedProblemMediaUrl && (
                    <a
                      href={selectedProblemMediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-medium text-(--ink) underline"
                    >
                      Open video in a new tab
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
                alt={`${selectedProblemReport.riderName || 'Rider'} problem report proof`}
                className="w-full max-h-72 object-contain rounded-lg border border-(--line) bg-(--paper)"
              />
            )}
          </div>
        )}
      </Modal>

      <section className="bg-(--paper) border border-(--line) rounded-xl p-4 flex flex-col gap-4">
        <header>
          <h2 className="text-lg font-medium text-(--ink)">Compare Two Riders</h2>
          <p className="text-xs text-(--muted)">
            Green means winner on that metric, red means lower performance for that metric.
          </p>
          <p className="text-xs text-(--muted) mt-1">
            Comparison data period: <span className="font-medium text-(--ink)">{comparisonDateFilterLabel}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Select
            label="Comparison timeframe"
            value={timeframe}
            onChange={(value) => setTimeframe(value as RiderManagementTimeframe)}
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Custom', value: 'custom' },
            ]}
          />
          <Input
            label="Compare from"
            type="date"
            placeholder="Start date"
            value={startDate}
            onChange={(value) => {
              setTimeframe('custom');
              setStartDate(resolveDateInputValue(value as Date | { target?: { value?: string } }));
            }}
          />
          <Input
            label="Compare to"
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(value) => {
              setTimeframe('custom');
              setEndDate(resolveDateInputValue(value as Date | { target?: { value?: string } }));
            }}
          />
          <button
            type="button"
            className="h-10 border border-(--line) rounded-lg px-3 text-sm text-(--ink) hover:bg-(--surface)"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setTimeframe('monthly');
            }}
          >
            Reset dates
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Rider A"
            value={compareLeftId}
            onChange={(value) => setCompareLeftId(value)}
            options={compareOptions}
          />
          <Select
            label="Rider B"
            value={compareRightId}
            onChange={(value) => setCompareRightId(value)}
            options={compareOptions}
          />
        </div>

        {leftRider && rightRider && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <article className="border border-(--line) rounded-lg p-3">
                <p className="text-xs text-(--muted)">
                  {leftRider.riderName || 'Rider A'} Wins
                </p>
                <p className="text-xl font-medium text-(--ink)">
                  {comparisonSummary?.leftWins ?? 0}
                </p>
              </article>
              <article className="border border-(--line) rounded-lg p-3">
                <p className="text-xs text-(--muted)">Result</p>
                <p className="text-sm font-medium mt-1">
                  {comparisonSummary?.leader === 'tie' && (
                    <span className="text-(--ink)">Balanced comparison</span>
                  )}
                  {comparisonSummary?.leader === 'left' && (
                    <span className={comparisonSummary.isFarAhead ? 'text-(--ink)' : 'text-(--ink)'}>
                      {leftRider.riderName || 'Rider A'} is{' '}
                      {comparisonSummary.isFarAhead ? 'far ahead' : 'ahead'}
                    </span>
                  )}
                  {comparisonSummary?.leader === 'right' && (
                    <span className={comparisonSummary.isFarAhead ? 'text-(--ink)' : 'text-(--ink)'}>
                      {rightRider.riderName || 'Rider B'} is{' '}
                      {comparisonSummary.isFarAhead ? 'far ahead' : 'ahead'}
                    </span>
                  )}
                </p>
                <p className="text-xs text-(--muted) mt-1">
                  Gap: {comparisonSummary?.gap ?? 0} metric{comparisonSummary?.gap === 1 ? '' : 's'}
                </p>
              </article>
              <article className="border border-(--line) rounded-lg p-3">
                <p className="text-xs text-(--muted)">
                  {rightRider.riderName || 'Rider B'} Wins
                </p>
                <p className="text-xl font-medium text-(--ink)">
                  {comparisonSummary?.rightWins ?? 0}
                </p>
                <p className="text-xs text-(--muted) mt-1">Ties: {comparisonSummary?.ties ?? 0}</p>
              </article>
            </div>

            <div className="overflow-x-auto">
              <Table columns={comparisonSummaryColumns} data={comparisonSummary ? comparisonRows.map((row) => ({
                label: row.label,
                leftValue: row.leftValue,
                rightValue: row.rightValue,
                higherIsBetter: row.higherIsBetter,
                winner: row.winner,
              })) : []}  />
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default RiderManagementPage;
