import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { APIProvider, AdvancedMarker, Map, Pin } from '@vis.gl/react-google-maps';
import Table from '@/components/table/Table';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import { useFetchUsersTracking } from '@/hooks/users/users.hooks';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useAppSelector } from '@/states/hooks';
import { RoleTypes } from '@/types/auth.type';
import LocationDisplay from '@/containers/locations/LocationDisplay';

type Coordinate = {
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
};

type TrackingUser = {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  currentLocation?: Coordinate | null;
};

const RIDER_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const getCoordinates = (location?: Coordinate | null) => {
  if (!location) return null;

  const lat = location.latitude ?? location.lat;
  const lng = location.longitude ?? location.lng;

  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  return { lat, lng };
};

const UsersTrackingPage = () => {
  useDocumentTitle('Users Tracking');

  const { user } = useAppSelector((state) => state.auth);

  const hasOrganizationMembership =
    (user?.organizationMembership?.length ?? 0) > 0;
  const organizationId = hasOrganizationMembership
    ? user?.organizationMembership?.[0]?.organization?.id
    : undefined;

  const {
    fetchUsersTracking,
    data,
    isFetching,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
  } = useFetchUsersTracking();

  const rows = useMemo(() => (data?.data?.rows ?? []) as TrackingUser[], [data]);

  useEffect(() => {
    fetchUsersTracking({
      page,
      size,
      organizationId,
      roles: [RoleTypes.RIDER],
    });
  }, [fetchUsersTracking, page, size, organizationId]);

  // Assign a stable color to each rider by their index in the current page
  const riderColorMap = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        rows.map((rider, index) => [rider.id, RIDER_COLORS[index % RIDER_COLORS.length]]),
      ),
    [rows],
  );

  const mapMarkers = useMemo(
    () =>
      rows
        .map((trackedUser) => ({
          user: trackedUser,
          coordinates: getCoordinates(trackedUser.currentLocation),
          color: riderColorMap[trackedUser.id],
        }))
        .filter(
          (item): item is { user: TrackingUser; coordinates: { lat: number; lng: number }; color: string } =>
            Boolean(item.coordinates),
        ),
    [rows, riderColorMap],
  );

  const mapCenter = mapMarkers[0]?.coordinates ?? { lat: -1.9441, lng: 30.0619 };

  const columns = useMemo<ColumnDef<TrackingUser>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const color = riderColorMap[row.original.id];
          return (
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              {row.original.name || '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email || '—',
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone',
        cell: ({ row }) => row.original.phoneNumber || '—',
      },
      {
        id: 'currentLocation',
        header: 'Current location',
        cell: ({ row }) => {
          return (
          <LocationDisplay location={row.original.currentLocation} />
        )},
      },
      {
        id: 'locationHistory',
        header: 'History',
        cell: ({ row }) => (
          <Link className="text-(--ink) underline" to={`/users/${row.original.id}/location-history`}>
            View history
          </Link>
        ),
      },
    ],
    [riderColorMap],
  );

  return (
    <main className="w-full flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-medium text-(--ink)">Users tracking</h1>
        <p className="text-sm text-muted-foreground">
          Live map and latest known location for trackable users.
        </p>
      </header>

      <section className="border rounded-md overflow-hidden h-[420px]">
        <APIProvider apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY || ''}>
          <Map defaultCenter={mapCenter} defaultZoom={11} mapId="users-tracking-map">
            {mapMarkers.map(({ user: trackedUser, coordinates, color }) => (
              <AdvancedMarker
                key={trackedUser.id}
                position={coordinates}
                title={trackedUser.name || trackedUser.email || trackedUser.id}
              >
                <Pin
                  background={color}
                  borderColor={color}
                  glyphColor="var(--paper)"
                />
              </AdvancedMarker>
            ))}
          </Map>
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
        noDataMessage="No tracked users found."
      />
    </main>
  );
};

export default UsersTrackingPage;
