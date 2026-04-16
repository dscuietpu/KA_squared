export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SOSCluster = {
  id: string;
  location: string;
  lat: number;
  lng: number;
  count: number;
  priority: Priority;
  message: string;
  parsed: string;
  timestamp: string;
  assignedTeam?: string;
};

export type RescueTeam = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'EN_ROUTE' | 'STANDBY' | 'ON_SITE';
  assignedTo?: string;
};

export type Farm = {
  id: string;
  owner: string;
  location: string;
  lat: number;
  lng: number;
  crop: string;
  acres: number;
  alertStatus: 'ALERT' | 'WARNING' | 'SAFE';
};

export type CrisisState = {
  clusters: SOSCluster[];
  teams: RescueTeam[];
  farms: Farm[];
  riverLevel: number;
  rainfall: number;
};