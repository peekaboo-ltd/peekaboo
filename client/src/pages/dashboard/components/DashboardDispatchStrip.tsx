/**
 * The dispatch readings now render as tiles inside DashboardMetricsSection —
 * they were a full-width strip of numbers sitting directly above another
 * full-width strip of numbers. Only the shape survives.
 */
export interface DispatchStripItem {
  label: string;
  value: string;
  status: 'up' | 'watch' | 'down';
}
