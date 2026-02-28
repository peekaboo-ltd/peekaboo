import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import Table from '@/components/table/Table';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import { useFetchUserCurrentLocationHistory } from '@/hooks/users/users.hooks';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

type CoordinateRecord = {
  id: string;
  createdAt?: string;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
};

const getCoordinates = (item: CoordinateRecord) => {
  const lat = item.latitude ?? item.lat;
  const lng = item.longitude ?? item.lng;

  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  return { lat, lng };
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

  const mapCenter = mapRecords[0]?.coordinates ?? { lat: -1.9441, lng: 30.0619 };

  const columns = useMemo<ColumnDef<CoordinateRecord>[]>(
    () => [
      {
        id: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => {
          if (!row.original.createdAt) return '—';
          return new Date(row.original.createdAt).toLocaleString();
        },
      },
      {
        id: 'coordinates',
        header: 'Coordinates',
        cell: ({ row }) => {
          const coordinates = getCoordinates(row.original);
          if (!coordinates) return 'No coordinates';
          return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
        },
      },
    ],
    [],
  );

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
            {mapRecords.map(({ entry, coordinates }, index) => (
              <Marker
                key={entry.id}
                position={coordinates}
                title={`Timeline point ${index + 1}`}
              />
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
        noDataMessage="No location history records found."
      />
    </main>
  );
};

export default UserLocationHistoryPage;
