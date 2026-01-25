import type {
  FleetEfficiencyData,
  VehicleStatusData,
  FleetMetrics,
  VehicleMetrics,
} from '@/types/dashboard.type';

// Fleet efficiency mock data for donut chart
export const fleetEfficiencyMockData: FleetEfficiencyData[] = [
  { name: 'onTheMove', value: 26, color: 'hsl(var(--chart-1))' },
  { name: 'unutilized', value: 20, color: 'hsl(var(--chart-2))' },
  { name: 'inMaintenance', value: 4, color: 'hsl(var(--chart-3))' },
];

// Vehicles on road mock data for donut chart
export const vehiclesOnRoadMockData: VehicleStatusData[] = [
  { name: 'onRoad', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'parked', value: 30, color: 'hsl(var(--chart-4))' },
  { name: 'inService', value: 25, color: 'hsl(var(--chart-5))' },
];

// Fleet metrics mock
export const fleetMetricsMock: FleetMetrics = {
  efficiencyPercentage: 65,
  onTheMove: 26,
  unutilized: 20,
  inMaintenance: 4,
};

// Vehicle metrics mock
export const vehicleMetricsMock: VehicleMetrics = {
  totalVehicles: 100,
  onRoad: 45,
  parked: 30,
  inService: 25,
};

// Sparkline mock data for metric cards
export const sparklineMockData = {
  orders: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40],
  revenue: [1200, 1900, 1500, 2500, 2200, 3000, 2800, 3500, 3200, 4000],
  profit: [300, 450, 380, 520, 480, 600, 550, 700, 650, 800],
  shipments: [45, 52, 48, 60, 55, 68, 62, 75, 70, 85],
  delivered: [40, 48, 45, 56, 52, 64, 58, 72, 68, 82],
};

// Recent activities mock data with tracking IDs
export const recentActivitiesMock = [
  {
    id: 'act-1',
    type: 'order' as const,
    title: '#OPL1728739',
    description: 'Headpost',
    status: 'IN_TRANSIT',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'act-2',
    type: 'order' as const,
    title: '#OPL1728739',
    description: 'Headpost',
    status: 'PENDING',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'act-3',
    type: 'order' as const,
    title: '#OPL1728042',
    description: 'Electronics',
    status: 'IN_TRANSIT',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'act-4',
    type: 'order' as const,
    title: '#OPL1728435',
    description: 'Documents',
    status: 'COMPLETED',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'act-5',
    type: 'order' as const,
    title: '#OPL1728156',
    description: 'Package',
    status: 'COMPLETED',
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
];
