import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, CheckCircle2, CircleX, ClockAlert } from 'lucide-react';
import Modal from '@/components/Modal';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import Table from '@/components/table/Table';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import { UserStatus } from '@/constants/user.constants';
import useDebounce from '@/hooks/common/debounce.hooks';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useRiderManagementColumns } from '@/hooks/users/columns.riderManagement';
import { useFetchRiderManagement } from '@/hooks/users/users.hooks';
import { RiderManagementItem, RiderManagementTimeframe } from '@/types/user.type';
import { formatCurrency, formatNumbers } from '@/utils/strings.util';

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

const formatAttendanceTime = (value?: string) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

type AttendanceStatus = 'present' | 'atWork' | 'absent' | 'late';

const getAttendanceStatus = (
  attendance: RiderManagementItem['dailyAttendance']
): AttendanceStatus => {
  const hasCheckIn = Boolean(attendance?.checkInAt);
  const hasCheckOut = Boolean(attendance?.checkOutAt);

  if (!hasCheckIn && !hasCheckOut) {
    return 'absent';
  }

  const checkInDate = attendance?.checkInAt ? new Date(attendance.checkInAt) : null;
  const isValidCheckIn = checkInDate && !Number.isNaN(checkInDate.getTime());

  if (isValidCheckIn) {
    const checkInHour = checkInDate.getHours();
    const checkInMinute = checkInDate.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);

    if (isLate) {
      return 'late';
    }
  }

  if (hasCheckIn && hasCheckOut) {
    return 'present';
  }

  return 'atWork';
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
  const [sortBy, setSortBy] = useState<SortBy>('deliveries');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedRider, setSelectedRider] = useState<RiderManagementItem | null>(null);
  const [attendanceProofRider, setAttendanceProofRider] = useState<RiderManagementItem | null>(null);
  const [compareLeftId, setCompareLeftId] = useState('');
  const [compareRightId, setCompareRightId] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const {
    fetchRiderManagement,
    data,
    isFetching,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  } = useFetchRiderManagement();

  const rows = useMemo(
    () => (data?.data?.rows ?? []) as RiderManagementItem[],
    [data],
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
    attendanceDate,
    attendanceName,
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
    fetchRiderManagement({
      page,
      size,
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : status,
      timeframe,
      startDate: normalizedCustomRange.startDate,
      endDate: normalizedCustomRange.endDate,
      attendanceDate: attendanceDate || undefined,
      name: attendanceName.trim() && attendanceName !== 'ALL' ? attendanceName.trim() : undefined,
      sortBy,
      sortOrder,
    });
  }, [
    fetchRiderManagement,
    page,
    size,
    debouncedSearch,
    status,
    timeframe,
    normalizedCustomRange.startDate,
    normalizedCustomRange.endDate,
    attendanceDate,
    attendanceName,
    sortBy,
    sortOrder,
  ]);

  const visibleTotals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.deliveries += row.totalDeliveriesCompleted;
          acc.earnings += row.totalEarnings;
          return acc;
        },
        { deliveries: 0, earnings: 0 },
      ),
    [rows],
  );

  const compareOptions = useMemo(
    () =>
      rows.map((rider) => ({
        label: `${rider.riderName || 'Unknown'} (${rider.riderPhoneNumber || '-'})`,
        value: rider.riderId,
      })),
    [rows],
  );

  const attendanceNameOptions = useMemo(() => {
    const uniqueNames = Array.from(
      new Set(
        rows
          .map((row) => (row.riderName || '').trim())
          .filter((name) => name.length > 0),
      ),
    ).sort((firstName, secondName) => firstName.localeCompare(secondName));

    return [
      { label: 'All riders', value: 'ALL' },
      ...uniqueNames.map((name) => ({ label: name, value: name })),
    ];
  }, [rows]);

  useEffect(() => {
    if (rows.length === 0) {
      setCompareLeftId('');
      setCompareRightId('');
      return;
    }

    if (!compareLeftId || !rows.some((rider) => rider.riderId === compareLeftId)) {
      setCompareLeftId(rows[0].riderId);
    }

    if (!compareRightId || !rows.some((rider) => rider.riderId === compareRightId)) {
      setCompareRightId(rows[Math.min(1, rows.length - 1)].riderId);
    }
  }, [rows, compareLeftId, compareRightId]);

  const leftRider = rows.find((rider) => rider.riderId === compareLeftId);
  const rightRider = rows.find((rider) => rider.riderId === compareRightId);

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

  const attendanceRows = useMemo(() => {
    const normalizedName = attendanceName.trim().toLowerCase();

    return rows.filter((row) => {
      const riderName = (row.riderName || '').toLowerCase();
      const matchesName = !normalizedName || normalizedName === 'all' || riderName === normalizedName;
      const matchesDate = !attendanceDate || row.dailyAttendance?.date === attendanceDate;
      return matchesName && matchesDate;
    });
  }, [rows, attendanceDate, attendanceName]);

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-black">Rider Management</h1>
        <p className="text-sm text-muted-foreground">
          Admin dashboard for rider performance, ranking, and reliability tracking.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Riders (filtered)</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">
            {formatNumbers(totalCount) || '0'}
          </p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Deliveries (page)</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">
            {formatNumbers(visibleTotals.deliveries) || '0'}
          </p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Earnings (page)</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">
            {formatCurrency(visibleTotals.earnings, 'RWF') || 'RWF 0'}
          </p>
        </article>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-3">
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
        data={rows}
        showPagination
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isFetching}
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

      <section className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-900">Daily Attendance</h2>
          <p className="text-xs text-slate-500">
            View check-in and check-out attendance for each rider by date and name.
          </p>
          <p className="text-xs text-slate-500">
            Shift window: 9:00 AM to 9:00 PM. Check-in after 9:00 AM is marked as late.
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
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-2">Rider</th>
                <th className="text-left py-2 px-2">Phone</th>
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left py-2 px-2">Attendance</th>
                <th className="text-left py-2 px-2">Check-in</th>
                <th className="text-left py-2 px-2">Check-out</th>
                <th className="text-left py-2 px-2">Proofs</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row) => (
                <tr className="border-b border-slate-100" key={`attendance-${row.riderId}`}>
                  <td className="py-2 pr-2 font-medium">{row.riderName || '-'}</td>
                  <td className="py-2 px-2">{row.riderPhoneNumber || '-'}</td>
                  <td className="py-2 px-2">{row.dailyAttendance?.date || attendanceDate || '-'}</td>
                  <td className="py-2 px-2">
                    {(() => {
                      const attendanceStatus = getAttendanceStatus(row.dailyAttendance);

                      if (attendanceStatus === 'present') {
                        return (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                            <CheckCircle2 size={14} />
                            Present
                          </span>
                        );
                      }

                      if (attendanceStatus === 'late') {
                        return (
                          <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-medium">
                            <ClockAlert size={14} />
                            Late to job
                          </span>
                        );
                      }

                      if (attendanceStatus === 'atWork') {
                        return (
                          <span className="inline-flex items-center gap-1 text-blue-700 text-xs font-medium">
                            <BriefcaseBusiness size={14} />
                            At work
                          </span>
                        );
                      }

                      return (
                        <span className="inline-flex items-center gap-1 text-slate-600 text-xs font-medium">
                          <CircleX size={14} />
                          Absent
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-2 px-2">
                    {row.dailyAttendance?.checkInAt ? `✓ ${formatAttendanceTime(row.dailyAttendance?.checkInAt)}` : '-'}
                  </td>
                  <td className="py-2 px-2">
                    {row.dailyAttendance?.checkOutAt ? `✓ ${formatAttendanceTime(row.dailyAttendance?.checkOutAt)}` : '-'}
                  </td>
                  <td className="py-2 px-2">
                    {row.dailyAttendance?.checkInImageUrl || row.dailyAttendance?.checkOutImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setAttendanceProofRider(row)}
                        className="text-primary underline text-xs"
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">No proofs</span>
                    )}
                  </td>
                </tr>
              ))}
              {attendanceRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No attendance records for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={Boolean(attendanceProofRider)}
        onClose={() => setAttendanceProofRider(null)}
        heading={`Attendance Proofs${attendanceProofRider?.riderName ? ` - ${attendanceProofRider.riderName}` : ''}`}
        description={`Attendance date: ${attendanceProofRider?.dailyAttendance?.date || '-'}`}
      >
        {attendanceProofRider && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-900">Check-in Proof</p>
              {attendanceProofRider.dailyAttendance?.checkInImageUrl ? (
                <img
                  src={attendanceProofRider.dailyAttendance.checkInImageUrl}
                  alt={`${attendanceProofRider.riderName || 'Rider'} check-in proof`}
                  className="w-full max-h-72 object-contain rounded-lg border border-slate-200 bg-slate-50"
                />
              ) : (
                <p className="text-sm text-slate-500">No check-in proof.</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-900">Check-out Proof</p>
              {attendanceProofRider.dailyAttendance?.checkOutImageUrl ? (
                <img
                  src={attendanceProofRider.dailyAttendance.checkOutImageUrl}
                  alt={`${attendanceProofRider.riderName || 'Rider'} check-out proof`}
                  className="w-full max-h-72 object-contain rounded-lg border border-slate-200 bg-slate-50"
                />
              ) : (
                <p className="text-sm text-slate-500">No check-out proof.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <section className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
        <header>
          <h2 className="text-lg font-semibold text-slate-900">Compare Two Riders</h2>
          <p className="text-xs text-slate-500">
            Green means winner on that metric, red means lower performance for that metric.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Comparison data period: <span className="font-medium text-slate-700">{comparisonDateFilterLabel}</span>
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
            className="h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-700 hover:bg-slate-50"
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
              <article className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  {leftRider.riderName || 'Rider A'} Wins
                </p>
                <p className="text-xl font-semibold text-slate-900">
                  {comparisonSummary?.leftWins ?? 0}
                </p>
              </article>
              <article className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Result</p>
                <p className="text-sm font-semibold mt-1">
                  {comparisonSummary?.leader === 'tie' && (
                    <span className="text-slate-700">Balanced comparison</span>
                  )}
                  {comparisonSummary?.leader === 'left' && (
                    <span className={comparisonSummary.isFarAhead ? 'text-green-700' : 'text-emerald-700'}>
                      {leftRider.riderName || 'Rider A'} is{' '}
                      {comparisonSummary.isFarAhead ? 'far ahead' : 'ahead'}
                    </span>
                  )}
                  {comparisonSummary?.leader === 'right' && (
                    <span className={comparisonSummary.isFarAhead ? 'text-green-700' : 'text-emerald-700'}>
                      {rightRider.riderName || 'Rider B'} is{' '}
                      {comparisonSummary.isFarAhead ? 'far ahead' : 'ahead'}
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Gap: {comparisonSummary?.gap ?? 0} metric{comparisonSummary?.gap === 1 ? '' : 's'}
                </p>
              </article>
              <article className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  {rightRider.riderName || 'Rider B'} Wins
                </p>
                <p className="text-xl font-semibold text-slate-900">
                  {comparisonSummary?.rightWins ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">Ties: {comparisonSummary?.ties ?? 0}</p>
              </article>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-2">Aspect</th>
                  <th className="text-left py-2 px-2">{leftRider.riderName || 'Rider A'}</th>
                  <th className="text-left py-2 px-2">{rightRider.riderName || 'Rider B'}</th>
                  <th className="text-left py-2 px-2">Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2 pr-2 font-medium">Phone Number</td>
                  <td className="py-2 px-2">{leftRider.riderPhoneNumber || '-'}</td>
                  <td className="py-2 px-2">{rightRider.riderPhoneNumber || '-'}</td>
                  <td className="py-2 px-2 text-slate-500">-</td>
                </tr>
                {comparisonRows.map((row) => (
                  <tr className="border-b border-slate-100" key={row.label}>
                    <td className="py-2 pr-2 font-medium">{row.label}</td>
                    <td
                      className={`py-2 px-2 ${
                        row.winner === 'left'
                          ? 'text-green-600 font-semibold'
                          : row.winner === 'right'
                            ? 'text-red-600'
                            : 'text-slate-700'
                      }`}
                    >
                      {row.label === 'Total Earnings'
                        ? formatCurrency(row.leftValue, 'RWF')
                        : formatNumbers(row.leftValue)}
                    </td>
                    <td
                      className={`py-2 px-2 ${
                        row.winner === 'right'
                          ? 'text-green-600 font-semibold'
                          : row.winner === 'left'
                            ? 'text-red-600'
                            : 'text-slate-700'
                      }`}
                    >
                      {row.label === 'Total Earnings'
                        ? formatCurrency(row.rightValue, 'RWF')
                        : formatNumbers(row.rightValue)}
                    </td>
                    <td className="py-2 px-2 text-slate-700">
                      {row.label === 'Total Earnings'
                        ? formatCurrency(Math.abs(row.leftValue - row.rightValue), 'RWF')
                        : formatNumbers(Math.abs(row.leftValue - row.rightValue))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default RiderManagementPage;
