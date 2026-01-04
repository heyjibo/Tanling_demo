export interface ChartData {
  label: string;
  value: number;
}
export interface DeviceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  temperature?: number;
}