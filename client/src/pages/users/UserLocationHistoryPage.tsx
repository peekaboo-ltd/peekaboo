import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { APIProvider, AdvancedMarker, Map, Pin, useMap } from '@vis.gl/react-google-maps';
import Table from '@/components/table/Table';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import { useFetchUserCurrentLocationHistory } from '@/hooks/users/users.hooks';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import LocationDisplay from '@/containers/locations/LocationDisplay';

type CoordinateRecord = {
  id: string;
  createdAt?: string;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  timestamp?: string;
};

const getCoordinates = (item: CoordinateRecord) => {
  const lat = item.latitude ?? item.lat;
  const lng = item.longitude ?? item.lng;

  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  return { lat, lng };
};

// Draws a polyline connecting all path points and keeps it in sync with map
const TrajectoryPolyline = ({ path }: { path: google.maps.LatLngLiteral[] }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || path.length < 2) return;

    polylineRef.current = new google.maps.Polyline({
      path,
      map,
      strokeColor: '#4F46E5',
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
  useDocumentTitle('User Location History');

  const { id } = useParams<{ id: string }>();

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

  const rows = useMemo(() => (data?.data?.rows ?? []) as CoordinateRecord[], [data]);

  useEffect(() => {
    if (!id) return;

    fetchUserCurrentLocationHistory({
      userId: id,
      page,
      size,
    });
  }, [fetchUserCurrentLocationHistory, id, page, size]);

  const mapRecords = useMemo(
    () =>
      rows
        .map((entry) => ({ entry, coordinates: getCoordinates(entry) }))
        .filter(
          (item): item is { entry: CoordinateRecord; coordinates: { lat: number; lng: number } } =>
            Boolean(item.coordinates),
        ),
    [rows],
  );

  const path = useMemo(() => mapRecords.map(({ coordinates }) => coordinates), [mapRecords]);

  const mapCenter = mapRecords[0]?.coordinates ?? { lat: -1.9441, lng: 30.0619 };

  const columns = useMemo<ColumnDef<CoordinateRecord>[]>(
    () => [
      {
        id: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => {
          if (!row.original.timestamp) return '—';
          return new Date(row.original.timestamp).toLocaleString();
        },
      },
      {
        id: 'location',
        header: 'Location',
        cell: ({ row }) => <LocationDisplay location={row.original} />,
      },
    ],
    [],
  );

  const first = mapRecords[0];
  const last = mapRecords[mapRecords.length - 1];

  return (
    <main className="w-full flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <article>
          <h1 className="text-2xl font-bold text-black">User location history</h1>
          <p className="text-sm text-muted-foreground">
            Paginated timeline of the user&apos;s latest tracked locations.
          </p>
        </article>
        <Link className="text-sm underline text-primary" to="/users/tracking">
          Back to users tracking
        </Link>
      </header>

      <section className="border rounded-md overflow-hidden h-[420px]">
        <APIProvider apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY || ''}>
          <Map defaultCenter={mapCenter} defaultZoom={12} mapId="user-location-history-map">
            <TrajectoryPolyline path={path} />

            {/* Start pin — green */}
            {first && (
              <AdvancedMarker position={first.coordinates} title="Start">
                <Pin background="#22c55e" borderColor="#16a34a" glyphColor="#ffffff" />
              </AdvancedMarker>
            )}

            {/* End pin — red (only shown when there are at least 2 points) */}
            {last && last.entry.id !== first?.entry.id && (
              <AdvancedMarker position={last.coordinates} title="Latest">
                <Pin background="#ef4444" borderColor="#dc2626" glyphColor="#ffffff" />
              </AdvancedMarker>
            )}
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
        noDataMessage="No location history records found."
      />
    </main>
  );
};

export default UserLocationHistoryPage;
