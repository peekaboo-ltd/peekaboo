import { ENVIRONMENTS } from '@/constants/environments.constants';

declare global {
  interface Window {
    __peekabooGoogleMapsCallback__?: () => void;
  }
}

let mapsApiLoadPromise: Promise<void> | null = null;

const ensureGoogleMapsApi = (): Promise<void> => {
  if (window.google?.maps?.importLibrary) return Promise.resolve();
  if (mapsApiLoadPromise) return mapsApiLoadPromise;

  const apiKey = ENVIRONMENTS.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not configured.'));
  }

  mapsApiLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-peekaboo-google-maps]',
    );

    window.__peekabooGoogleMapsCallback__ = () => {
      delete window.__peekabooGoogleMapsCallback__;
      resolve();
    };

    if (existingScript) {
      existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load.')), {
        once: true,
      });
      return;
    }

    const parameters = new URLSearchParams({
      key: apiKey,
      loading: 'async',
      callback: '__peekabooGoogleMapsCallback__',
    });
    const script = document.createElement('script');
    script.async = true;
    script.dataset.peekabooGoogleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?${parameters.toString()}`;
    script.onerror = () => {
      mapsApiLoadPromise = null;
      delete window.__peekabooGoogleMapsCallback__;
      reject(new Error('Google Maps failed to load.'));
    };
    document.head.append(script);
  });

  return mapsApiLoadPromise;
};

export async function loadGoogleMapsLibrary(
  name: 'places',
): Promise<google.maps.PlacesLibrary>;
export async function loadGoogleMapsLibrary(
  name: 'geocoding',
): Promise<google.maps.GeocodingLibrary>;
export async function loadGoogleMapsLibrary(
  name: 'places' | 'geocoding',
): Promise<google.maps.PlacesLibrary | google.maps.GeocodingLibrary> {
  await ensureGoogleMapsApi();
  return google.maps.importLibrary(name) as Promise<
    google.maps.PlacesLibrary | google.maps.GeocodingLibrary
  >;
}
