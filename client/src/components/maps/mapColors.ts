export interface LatLng {
  lat: number;
  lng: number;
}

/** Turns `var(--token)` into the colour it holds; map layers paint on a canvas and cannot read CSS variables. */
export const resolveCssColor = (value: string, fallback: string): string => {
  if (!value.startsWith('var(') || typeof document === 'undefined') return value;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(value.slice(4, -1))
      .trim() || fallback
  );
};
