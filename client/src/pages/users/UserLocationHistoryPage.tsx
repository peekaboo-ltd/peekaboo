import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import Table from "@/components/table/Table";
import { BaseMap, MapLine, MapPin } from "@/components/maps/mapGl";
import { useFetchUserCurrentLocationHistory } from "@/hooks/users/users.hooks";
import { useDocumentTitle } from "@/hooks/common/useDocumentTitle";
import { useLazyFetchOrderAssignmentsQuery } from "@/api/queries/orderAssignment.queries";
import { useLazyFetchOrdersQuery } from "@/api/queries/orders.queries";
import LocationDisplay from "@/containers/locations/LocationDisplay";
import { UUID } from "@/types";
import Select from "@/components/inputs/Select";
import Button from "@/components/inputs/Button";
import DatePicker from "@/components/inputs/DatePicker";
import { controlClassName } from '@/components/inputs/control';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/i18n';

type CoordinateRecord = {
  id: string;
  createdAt?: string;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  timestamp?: string;
};

type OrderSummary = {
  id: string;
  referenceId?: string;
  trackingId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AssignmentRecord = {
  id: string;
  order?: OrderSummary;
};

const getCoordinates = (item: CoordinateRecord) => {
  const lat = item.latitude ?? item.lat;
  const lng = item.longitude ?? item.lng;

  if (typeof lat !== "number" || typeof lng !== "number") return null;

  return { lat, lng };
};

const toInputDateTime = (isoString: string) =>
  moment(isoString).format("YYYY-MM-DDTHH:mm");

const toInputTime = (value: string) => moment(value).format("HH:mm");

const mergeDateAndTime = (date: Date, time: string) =>
  moment(`${moment(date).format("YYYY-MM-DD")} ${time}`, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DDTHH:mm",
  );

const toUtcIsoString = (value: string) => {
  if (!value) return undefined;
  return moment(value).utc().toISOString();
};

const getDefaultRange = () => {
  const end = moment();
  const start = end.clone().subtract(7, "days");

  return {
    startTime: start.format("YYYY-MM-DDTHH:mm"),
    endTime: end.format("YYYY-MM-DDTHH:mm"),
  };
};

const DEFAULT_RANGE = getDefaultRange();

const UserLocationHistoryPage = () => {
  const { t, language } = useI18n();
  useDocumentTitle(t('locationHistory.docTitle'));

  // NAVIGATION
  const { id } = useParams<{ id: UUID }>();
  const navigate = useNavigate();

  // FETCH USER CURRENT LOCATION HISTORY
  const {
    fetchUserCurrentLocationHistory,
    data,
    isFetching,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  } = useFetchUserCurrentLocationHistory();

  // FETCH ORDER ASSIGNMENTS
  const [
    fetchOrderAssignments,
    { data: assignmentsData, isFetching: isFetchingAssignments },
  ] = useLazyFetchOrderAssignmentsQuery();

  // FETCH SEARCHED ORDERS
  const [
    fetchOrders,
    { data: searchedOrdersData, isFetching: isSearchingOrders },
  ] = useLazyFetchOrdersQuery();

  // STATE
  const [selectedAssignmentOrderId, setSelectedAssignmentOrderId] =
    useState("");
  const [selectedSearchedOrderId, setSelectedSearchedOrderId] = useState("");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [hasSearchedOrder, setHasSearchedOrder] = useState(false);
  const [appliedStartTime, setAppliedStartTime] = useState<string | undefined>(
    toUtcIsoString(DEFAULT_RANGE.startTime),
  );
  const [appliedEndTime, setAppliedEndTime] = useState<string | undefined>(
    toUtcIsoString(DEFAULT_RANGE.endTime),
  );
  const [dateRange, setDateRange] = useState(DEFAULT_RANGE);

  // MEMOIZED VALUES
  const rows = useMemo(
    () => (data?.data?.rows ?? []) as CoordinateRecord[],
    [data],
  );

  const assignedOrderOptions = useMemo<OrderSummary[]>(() => {
    const assignmentRows = (assignmentsData?.data?.rows ??
      []) as AssignmentRecord[];
    const weekAgo = moment().subtract(7, "days");

    const normalized = assignmentRows
      .map((assignment) => assignment.order)
      .filter((order): order is OrderSummary => Boolean(order?.id))
      .filter((order) => {
        if (!order.updatedAt) return false;
        return moment(order.updatedAt).isSameOrAfter(weekAgo);
      });

    return Array.from(
      new Map(normalized.map((order) => [order.id, order])).values(),
    );
  }, [assignmentsData]);

  const searchedOrders = useMemo(() => {
    const orderRows = (searchedOrdersData?.data?.rows ?? []) as OrderSummary[];
    return orderRows;
  }, [searchedOrdersData]);

  const selectedOrder = useMemo(() => {
    if (selectedSearchedOrderId) {
      return searchedOrders.find(
        (order) => order.id === selectedSearchedOrderId,
      );
    }

    return assignedOrderOptions.find(
      (order) => order.id === selectedAssignmentOrderId,
    );
  }, [
    assignedOrderOptions,
    searchedOrders,
    selectedAssignmentOrderId,
    selectedSearchedOrderId,
  ]);

  useEffect(() => {
    if (!id) return;

    fetchOrderAssignments({
      page: 0,
      size: 100,
      assignedToId: id,
    });
  }, [fetchOrderAssignments, id]);

  useEffect(() => {
    if (!id) return;

    fetchUserCurrentLocationHistory({
      userId: id,
      page,
      size,
      startTime: appliedStartTime,
      endTime: appliedEndTime,
    });
  }, [
    appliedEndTime,
    appliedStartTime,
    fetchUserCurrentLocationHistory,
    id,
    page,
    size,
  ]);

  const mapRecords = useMemo(
    () =>
      rows
        .map((entry) => ({ entry, coordinates: getCoordinates(entry) }))
        .filter(
          (
            item,
          ): item is {
            entry: CoordinateRecord;
            coordinates: { lat: number; lng: number };
          } => Boolean(item.coordinates),
        ),
    [rows],
  );

  const path = useMemo(
    () => mapRecords.map(({ coordinates }) => coordinates),
    [mapRecords],
  );

  const mapCenter = mapRecords[0]?.coordinates ?? {
    lat: -1.9441,
    lng: 30.0619,
  };

  // COLUMNS
  const columns = useMemo<ColumnDef<CoordinateRecord>[]>(
    () => [
      {
        id: "timestamp",
        header: t('locationHistory.timestamp'),
        cell: ({ row }) => {
          if (!row.original.timestamp) return "—";
          return moment(row.original.timestamp).locale(language).local().format("lll");
        },
      },
      {
        id: "location",
        header: t('locationHistory.location'),
        cell: ({ row }) => <LocationDisplay location={row.original} />,
      },
    ],
    [language, t],
  );

  // FIRST AND LAST RECORDS
  const first = mapRecords[0];
  const last = mapRecords[mapRecords.length - 1];

  // HANDLERS
  const onSearchOrders = async () => {
    if (!orderSearchTerm.trim()) {
      toast.error(t('locationHistory.searchFirst'));
      return;
    }

    setHasSearchedOrder(true);
    setSelectedSearchedOrderId("");

    await fetchOrders({
      page: 0,
      size: 20,
      orderLookup: orderSearchTerm.trim(),
    });
  };

  const onSelectAssignmentOrder = (orderId: string) => {
    setSelectedAssignmentOrderId(orderId);
    setSelectedSearchedOrderId("");
  };

  const onSelectSearchedOrder = (orderId: string) => {
    setSelectedSearchedOrderId(orderId);
  };

  const onApplyFilters = () => {
    let nextStart = dateRange.startTime;
    let nextEnd = dateRange.endTime;

    if (selectedOrder?.createdAt) {
      nextStart = toInputDateTime(selectedOrder.createdAt);
      nextEnd = selectedOrder.updatedAt
        ? toInputDateTime(selectedOrder.updatedAt)
        : toInputDateTime(new Date().toISOString());

      setDateRange({
        startTime: nextStart,
        endTime: nextEnd,
      });
    }

    const normalizedStart = toUtcIsoString(nextStart);
    const normalizedEnd = toUtcIsoString(nextEnd);

    if (!normalizedStart || !normalizedEnd) {
      toast.error(t('locationHistory.invalidRange'));
      return;
    }

    if (moment(normalizedStart).isAfter(moment(normalizedEnd))) {
      toast.error(t('locationHistory.rangeOrder'));
      return;
    }

    setPage(0);
    setAppliedStartTime(normalizedStart);
    setAppliedEndTime(normalizedEnd);
  };

  // RENDER
  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <article>
          <h1 className="type-page-title">
            {t('locationHistory.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('locationHistory.description')}
          </p>
        </article>
        <Link className="text-sm underline text-(--ink)" to="/users/tracking">
          {t('locationHistory.backTracking')}
        </Link>
      </header>

      <section className="border rounded-md p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="flex flex-col gap-2">
          <label
            className="type-meta"
            htmlFor="assigned-order"
          >
            {t('locationHistory.assignedOrders')}
          </label>
          <Select
            options={assignedOrderOptions.map((order) => ({
              label: `${order?.referenceId || order?.id} · ${order?.trackingId || t('locationHistory.noOtp')}`,
              value: order?.id,
            }))}
            isLoading={isFetchingAssignments}
            value={selectedAssignmentOrderId}
            onChange={(value) => onSelectAssignmentOrder(value)}
          />
        </article>

        <article className="flex flex-col gap-2">
          <label
            className="type-meta"
            htmlFor="order-search"
          >
            {t('locationHistory.searchOrder')}
          </label>
          <div className="flex gap-2">
            <input
              id="order-search"
              className={cn(controlClassName, 'px-3')}
              placeholder={t('locationHistory.searchPlaceholder')}
              value={orderSearchTerm}
              onChange={(event) => setOrderSearchTerm(event.target.value)}
            />
            <Button
              type="button"
              className="px-3 py-2 rounded bg-(--ink) text-(--paper) text-sm"
              onClick={onSearchOrders}
              disabled={isSearchingOrders}
            >
              {t('common.search')}
            </Button>
          </div>
          {hasSearchedOrder && (
            <Select
              options={searchedOrders.map((order) => ({
                label: `${order?.referenceId || order?.id} · ${order?.trackingId || t('locationHistory.noOtp')}`,
                value: order?.id,
              }))}
              value={selectedSearchedOrderId}
              onChange={(value) => onSelectSearchedOrder(value)}
              isLoading={isSearchingOrders}
            />
          )}
        </article>

        <article className="flex flex-col gap-2">
          <label
            className="type-meta"
            htmlFor="start-time"
          >
            {t('locationHistory.startTime')}
          </label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <DatePicker
              value={moment(dateRange.startTime).toDate()}
              onChange={(event) => {
                const nextDate = event as unknown as Date | undefined;
                if (!nextDate) return;

                setDateRange((prev) => ({
                  ...prev,
                  startTime: mergeDateAndTime(nextDate, toInputTime(prev.startTime)),
                }));
              }}
              placeholder={t('locationHistory.startDate')}
              toDate={moment(dateRange.endTime).toDate()}
            />
            <input
              id="start-time"
              type="time"
              className={cn(controlClassName, 'w-full px-3 sm:w-[140px]')}
              value={toInputTime(dateRange.startTime)}
              onChange={(event) =>
                setDateRange((prev) => ({
                  ...prev,
                  startTime: mergeDateAndTime(
                    moment(prev.startTime).toDate(),
                    event.target.value,
                  ),
                }))
              }
            />
          </div>
        </article>

        <article className="flex flex-col gap-2">
          <label
            className="type-meta"
            htmlFor="end-time"
          >
            {t('locationHistory.endTime')}
          </label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <DatePicker
              value={moment(dateRange.endTime).toDate()}
              onChange={(event) => {
                const nextDate = event as unknown as Date | undefined;
                if (!nextDate) return;

                setDateRange((prev) => ({
                  ...prev,
                  endTime: mergeDateAndTime(nextDate, toInputTime(prev.endTime)),
                }));
              }}
              placeholder={t('locationHistory.endDate')}
              fromDate={moment(dateRange.startTime).toDate()}
            />
            <input
              id="end-time"
              type="time"
              className={cn(controlClassName, 'w-full px-3 sm:w-[140px]')}
              value={toInputTime(dateRange.endTime)}
              onChange={(event) =>
                setDateRange((prev) => ({
                  ...prev,
                  endTime: mergeDateAndTime(
                    moment(prev.endTime).toDate(),
                    event.target.value,
                  ),
                }))
              }
            />
          </div>
        </article>

        <article className="lg:col-span-2 flex justify-end">
          <Button primary onClick={onApplyFilters} submit>
            {t('locationHistory.apply')}
          </Button>
        </article>
      </section>

      <section className="border rounded-md overflow-hidden h-[420px]">
        <BaseMap initialCenter={mapCenter} initialZoom={12}>
          <MapLine path={path} color="var(--ink)" width={3} />

          {first && (
            <MapPin
              position={first.coordinates}
              title={t('locationHistory.start')}
              background="var(--ink)"
              borderColor="var(--ink)"
              glyphColor="var(--paper)"
            />
          )}

          {last && last.entry.id !== first?.entry.id && (
            <MapPin
              position={last.coordinates}
              title={t('locationHistory.latest')}
              background="var(--chart-3)"
              borderColor="var(--ink)"
              glyphColor="var(--paper)"
            />
          )}
        </BaseMap>
      </section>

      <Table
        columns={columns}
        data={rows}
        showPagination
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isFetching}
        noDataMessage={t('locationHistory.empty')}
      />
      <footer className="w-full flex items-center justify-between">
        <Button
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          {t('common.actions.back')}
        </Button>
      </footer>
    </main>
  );
};

export default UserLocationHistoryPage;
