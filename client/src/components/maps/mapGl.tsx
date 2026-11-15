/**
 * The one place the app touches a map library.
 *
 * Every map renders through react-map-gl's MapLibre build with OpenFreeMap
 * tiles, which need no key and no billing account. To move to Mapbox later,
 * change the `react-map-gl/maplibre` import and the CSS import below to
 * `react-map-gl/mapbox` / `mapbox-gl/dist/mapbox-gl.css`, drop the MapLibre
 * worker setup, pass `mapboxAccessToken`, and point VITE_MAP_STYLE_URL at a
 * mapbox:// style. The components below keep the same props either way.
 */
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useId, useMemo, type ReactNode } from 'react';
import {
  Layer,
  Map,
  Marker,
  NavigationControl,
  Source,
  useMap,
} from 'react-map-gl/maplibre';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import { resolveCssColor, type LatLng } from './mapColors';

export type { LatLng };

// MapLibre looks for its worker next to its own bundle file, which Vite renames
// and moves, so tell it where Vite actually put the worker. Loaded lazily so
// pages without a map never download the library.
let mapLibPromise: Promise<typeof import('maplibre-gl')> | null = null;
const loadMapLib = () => {
  mapLibPromise ??= import('maplibre-gl').then((mapLib) => {
    mapLib.setWorkerUrl(maplibreWorkerUrl);
    return mapLib;
  });
  return mapLibPromise;
};

interface BaseMapProps {
  initialCenter: LatLng;
  initialZoom: number;
  /** Page-embedded maps need Ctrl/⌘ or two fingers to zoom, so they never trap page scroll. */
  cooperativeGestures?: boolean;
  reuseMaps?: boolean;
  children?: ReactNode;
}

export const BaseMap = ({
  initialCenter,
  initialZoom,
  cooperativeGestures = false,
  reuseMaps = false,
  children,
}: BaseMapProps) => (
  <Map
    mapLib={loadMapLib()}
    initialViewState={{
      latitude: initialCenter.lat,
      longitude: initialCenter.lng,
      zoom: initialZoom,
    }}
    mapStyle={ENVIRONMENTS.MAP_STYLE_URL}
    style={{ width: '100%', height: '100%' }}
    cooperativeGestures={cooperativeGestures}
    dragRotate={false}
    pitchWithRotate={false}
    attributionControl={{ compact: true }}
    reuseMaps={reuseMaps}
  >
    <NavigationControl position="top-right" showCompass={false} />
    {children}
  </Map>
);

interface MapMarkerProps {
  position: LatLng;
  anchor?: 'center' | 'bottom';
  children: ReactNode;
}

export const MapMarker = ({ position, anchor = 'center', children }: MapMarkerProps) => (
  <Marker latitude={position.lat} longitude={position.lng} anchor={anchor}>
    {children}
  </Marker>
);

interface MapPinProps {
  position: LatLng;
  title: string;
  background: string;
  borderColor: string;
  glyphColor: string;
}

/** Teardrop pin. Colours are applied as CSS, so design tokens like `var(--ink)` work directly. */
export const MapPin = ({
  position,
  title,
  background,
  borderColor,
  glyphColor,
}: MapPinProps) => (
  <MapMarker position={position} anchor="bottom">
    <svg
      role="img"
      aria-label={title}
      width="26"
      height="34"
      viewBox="0 0 26 34"
      className="block drop-shadow-sm"
    >
      <title>{title}</title>
      <path
        d="M13 1C6.4 1 1 6.3 1 12.9 1 21.8 13 33 13 33s12-11.2 12-20.1C25 6.3 19.6 1 13 1z"
        style={{ fill: background, stroke: borderColor, strokeWidth: 1.5 }}
      />
      <circle cx="13" cy="13" r="4.5" style={{ fill: glyphColor }} />
    </svg>
  </MapMarker>
);

const EARTH_RADIUS_METERS = 6_371_008.8;

const circlePolygon = (center: LatLng, radiusMeters: number, steps = 64) => {
  const lat = (center.lat * Math.PI) / 180;
  const lng = (center.lng * Math.PI) / 180;
  const angular = radiusMeters / EARTH_RADIUS_METERS;
  const ring: [number, number][] = [];

  for (let step = 0; step <= steps; step += 1) {
    const bearing = (step / steps) * 2 * Math.PI;
    const pointLat = Math.asin(
      Math.sin(lat) * Math.cos(angular) +
        Math.cos(lat) * Math.sin(angular) * Math.cos(bearing),
    );
    const pointLng =
      lng +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(lat),
        Math.cos(angular) - Math.sin(lat) * Math.sin(pointLat),
      );
    ring.push([(pointLng * 180) / Math.PI, (pointLat * 180) / Math.PI]);
  }

  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [ring] },
  };
};

interface MapCircleProps {
  center: LatLng;
  radiusMeters: number;
  fillColor: string;
  strokeColor: string;
}

export const MapCircle = ({ center, radiusMeters, fillColor, strokeColor }: MapCircleProps) => {
  const id = useId();
  const data = useMemo(
    () => circlePolygon(center, radiusMeters),
    [center, radiusMeters],
  );

  return (
    <Source id={`circle-${id}`} type="geojson" data={data}>
      <Layer
        id={`circle-fill-${id}`}
        type="fill"
        paint={{
          'fill-color': resolveCssColor(fillColor, '#6ba3c7'),
          'fill-opacity': 0.14,
        }}
      />
      <Layer
        id={`circle-line-${id}`}
        type="line"
        paint={{
          'line-color': resolveCssColor(strokeColor, '#6ba3c7'),
          'line-opacity': 0.45,
          'line-width': 1.5,
        }}
      />
    </Source>
  );
};

interface MapLineProps {
  path: LatLng[];
  color: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
}

export const MapLine = ({
  path,
  color,
  width = 3,
  opacity = 0.8,
  dashed = false,
}: MapLineProps) => {
  const id = useId();
  const data = useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: path.map(({ lat, lng }) => [lng, lat]),
      },
    }),
    [path],
  );

  if (path.length < 2) return null;

  return (
    <Source id={`line-${id}`} type="geojson" data={data}>
      <Layer
        id={`line-${id}`}
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{
          'line-color': resolveCssColor(color, '#1f1f1f'),
          'line-width': width,
          'line-opacity': opacity,
          ...(dashed ? { 'line-dasharray': [2, 2] } : {}),
        }}
      />
    </Source>
  );
};

interface MapViewportProps {
  positions: LatLng[];
  emptyCenter: LatLng;
  emptyZoom: number;
  singleZoom?: number;
  padding?: number;
}

/** Frames whatever is on the map: one point is centred, several are fitted, none falls back to `emptyCenter`. */
export const MapViewport = ({
  positions,
  emptyCenter,
  emptyZoom,
  singleZoom = 15,
  padding = 48,
}: MapViewportProps) => {
  const { current: map } = useMap();
  const coordinateKey = positions.map(({ lat, lng }) => `${lat},${lng}`).join(';');
  const emptyCenterKey = `${emptyCenter.lat},${emptyCenter.lng}`;

  useEffect(() => {
    if (!map) return;

    const current = coordinateKey
      ? coordinateKey.split(';').map((coordinate) => coordinate.split(',').map(Number))
      : [];
    const distinct = new Set(coordinateKey ? coordinateKey.split(';') : []);

    if (current.length === 0) {
      const [lat, lng] = emptyCenterKey.split(',').map(Number);
      map.easeTo({ center: [lng, lat], zoom: emptyZoom });
      return;
    }

    if (distinct.size === 1) {
      const [lat, lng] = current[0];
      map.easeTo({ center: [lng, lat], zoom: singleZoom });
      return;
    }

    const lats = current.map(([lat]) => lat);
    const lngs = current.map(([, lng]) => lng);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding, maxZoom: 16 },
    );
  }, [coordinateKey, emptyCenterKey, emptyZoom, map, padding, singleZoom]);

  return null;
};
