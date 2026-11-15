import useApproximateLocation from '@/hooks/locations/useApproximateLocation';
import useMediaQuery from '@/hooks/common/useMediaQuery';
import HeroMapViewport from '@/pages/home/components/HeroMapViewport';
import MapAccuracyCircle from './MapAccuracyCircle';
import { BaseMap, MapPin } from './mapGl';
import {
  getApproximateZoom,
  KIGALI_CENTER,
} from './publicMap.utils';
import { useI18n } from '@/i18n/i18n';

interface PublicApproximateMapProps {
  statusLabel?: string;
  etaLabel?: string;
}

const PublicApproximateMapContent = ({
  statusLabel,
  etaLabel,
}: PublicApproximateMapProps) => {
  const { t } = useI18n();
  const resolvedStatus = statusLabel ?? t('track.liveTracking');
  const resolvedEta = etaLabel ?? t('home.trust.kigaliWide');
  const approximateLocation = useApproximateLocation(true);

  const center = approximateLocation?.position ?? KIGALI_CENTER;
  const accuracyMeters = approximateLocation?.accuracyKm
    ? approximateLocation.accuracyKm * 1000
    : 2800;

  return (
    <figure className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-md bg-(--surface)">
      <BaseMap initialCenter={KIGALI_CENTER} initialZoom={12} cooperativeGestures reuseMaps>
        <HeroMapViewport
          positions={[center]}
          emptyCenter={center}
          emptyZoom={getApproximateZoom(approximateLocation?.accuracyKm ?? null)}
        />

        <MapAccuracyCircle
          center={center}
          radiusMeters={accuracyMeters}
          fillColor="var(--public-sky)"
          strokeColor="var(--public-sky)"
        />

        <MapPin
          position={center}
          title={t('home.map.approximateArea', { area: approximateLocation?.label ?? '' })}
          background="var(--public-sky-soft)"
          borderColor="var(--public-sky)"
          glyphColor="var(--public-sky)"
        />
      </BaseMap>

      <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-(--radius-control) bg-(--paper) px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className="size-2 shrink-0 rounded-full bg-(--public-sky)"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-(--ink)">
            {approximateLocation
              ? t('home.map.approximateArea', { area: approximateLocation.label })
              : resolvedStatus}
          </span>
        </span>
        <span className="shrink-0 text-sm text-(--muted) tabular-nums">
          {resolvedEta}
        </span>
      </figcaption>
    </figure>
  );
};

const PublicApproximateMap = (props: PublicApproximateMapProps) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (!isDesktop) return null;

  return <PublicApproximateMapContent {...props} />;
};

export default PublicApproximateMap;
