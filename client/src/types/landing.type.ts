export interface LandingStats {
  activeCustomers: number;
  customersWithOrders: number;
  orderStatus: string;
}

export interface SuggestedRider {
  latitude: number;
  longitude: number;
  distanceKm: number;
  etaMinutes: number;
  isLive: boolean;
  updatedAt: string | null;
}
