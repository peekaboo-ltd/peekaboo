import { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
  APIProvider,
  AdvancedMarker,
  Map as GoogleMap,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { toast } from "sonner";
import Table from "@/components/table/Table";
import { ENVIRONMENTS } from "@/constants/environments.constants";
import { useFetchUserCurrentLocationHistory } from "@/hooks/users/users.hooks";
import { useDocumentTitle } from "@/hooks/common/useDocumentTitle";
import { useLazyFetchOrderAssignmentsQuery } from "@/api/queries/orderAssignment.queries";
import { useLazyFetchOrdersQuery } from "@/api/queries/orders.queries";
import LocationDisplay from "@/containers/locations/LocationDisplay";
import { UUID } from "@/types";
import Select from "@/components/inputs/Select";
import Button from "@/components/inputs/Button";

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

// Draws a polyline connecting all path points and keeps it in sync with map
const TrajectoryPolyline = ({
  path,
}: {
  path: google.maps.LatLngLiteral[];
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || path.length < 2) return;

    const ink = getComputedStyle(document.documentElement)
      .getPropertyValue("--ink")
      .trim();

    polylineRef.current = new google.maps.Polyline({
      path,
      map,
      strokeColor: ink,
      strokeWeight: 3,
      strokeOpacity: 0.8,
      geodesic: true,
    });

    return () => {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
  }, [map, path]);

  return null;
};

const UserLocationHistoryPage = () => {
  useDocumentTitle("User Location History");

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
        header: "Timestamp",
        cell: ({ row }) => {
          if (!row.original.timestamp) return "—";
          return moment(row.original.timestamp).local().format("lll");
        },
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => <LocationDisplay location={row.original} />,
      },
    ],
    [],
  );

  // FIRST AND LAST RECORDS
  const first = mapRecords[0];
  const last = mapRecords[mapRecords.length - 1];

  // HANDLERS
  const onSearchOrders = async () => {
    if (!orderSearchTerm.trim()) {
      toast.error("Enter an order reference id or tracking id first");
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
      toast.error("Please provide a valid date range");
      return;
    }

    if (moment(normalizedStart).isAfter(moment(normalizedEnd))) {
      toast.error("Start time must be before end time");
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
          <h1 className="text-2xl font-medium text-(--ink)">
            User location history
          </h1>
          <p className="text-sm text-muted-foreground">
            Paginated timeline of the user&apos;s latest tracked locations.
          </p>
        </article>
        <Link className="text-sm underline text-(--ink)" to="/users/tracking">
          Back to users tracking
        </Link>
      </header>

      <section className="border rounded-md p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="flex flex-col gap-2">
          <label
            className="text-xs font-medium text-(--muted)"
            htmlFor="assigned-order"
          >
            Assigned orders (last 7 days)
          </label>
          <Select
            options={assignedOrderOptions.map((order) => ({
              label: `${order?.referenceId || order?.id} · ${order?.trackingId || "No OTP"}`,
              value: order?.id,
            }))}
            isLoading={isFetchingAssignments}
            value={selectedAssignmentOrderId}
            onChange={(value) => onSelectAssignmentOrder(value)}
          />
        </article>

        <article className="flex flex-col gap-2">
          <label
            className="text-xs font-medium text-(--muted)"
            htmlFor="order-search"
          >
            Search order (reference id or tracking id)
          </label>
          <div className="flex gap-2">
            <input
              id="order-search"
              className="h-11 w-full rounded-(--radius-control) border-0 bg-(--surface) px-3 text-sm outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
              placeholder="Type reference id or tracking id"
              value={orderSearchTerm}
              onChange={(event) => setOrderSearchTerm(event.target.value)}
            />
            <Button
              type="button"
              className="px-3 py-2 rounded bg-(--ink) text-(--paper) text-sm"
              onClick={onSearchOrders}
              disabled={isSearchingOrders}
            >
              Search
            </Button>
          </div>
          {hasSearchedOrder && (
            <Select
              options={searchedOrders.map((order) => ({
                label: `${order?.referenceId || order?.id} · ${order?.trackingId || "No OTP"}`,
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
            className="text-xs font-medium text-(--muted)"
            htmlFor="start-time"
          >
            Start time (local)
          </label>
          <input
            id="start-time"
            type="datetime-local"
            className="h-11 rounded-(--radius-control) border-0 bg-(--surface) px-3 text-sm outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
            value={dateRange.startTime}
            onChange={(event) =>
              setDateRange((prev) => ({
                ...prev,
                startTime: event.target.value,
              }))
            }
          />
        </article>

        <article className="flex flex-col gap-2">
          <label
            className="text-xs font-medium text-(--muted)"
            htmlFor="end-time"
          >
            End time (local)
          </label>
          <input
            id="end-time"
            type="datetime-local"
            className="h-11 rounded-(--radius-control) border-0 bg-(--surface) px-3 text-sm outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
            value={dateRange.endTime}
            onChange={(event) =>
              setDateRange((prev) => ({ ...prev, endTime: event.target.value }))
            }
          />
        </article>

        <article className="lg:col-span-2 flex justify-end">
          <Button primary onClick={onApplyFilters} submit>
            Apply
          </Button>
        </article>
      </section>

      <section className="border rounded-md overflow-hidden h-[420px]">
        <APIProvider apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY || ""}>
          <GoogleMap
            defaultCenter={mapCenter}
            defaultZoom={12}
            mapId="user-location-history-map"
          >
            <TrajectoryPolyline path={path} />

            {first && (
              <AdvancedMarker position={first.coordinates} title="Start">
                <Pin
                  background="var(--ink)"
                  borderColor="var(--ink)"
                  glyphColor="var(--paper)"
                />
              </AdvancedMarker>
            )}

            {last && last.entry.id !== first?.entry.id && (
              <AdvancedMarker position={last.coordinates} title="Latest">
                <Pin
                  background="var(--chart-3)"
                  borderColor="var(--ink)"
                  glyphColor="var(--paper)"
                />
              </AdvancedMarker>
            )}
          </GoogleMap>
        </APIProvider>
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
        noDataMessage="No location history records found."
      />
      <footer className="w-full flex items-center justify-between">
        <Button
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          Back
        </Button>
      </footer>
    </main>
  );
};

export default UserLocationHistoryPage;
