'use client';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CrisisState, SOSCluster } from '@/lib/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const priorityColor = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

type Props = {
  crisisState: CrisisState;
  selectedCluster: SOSCluster | null;
  onClusterClick: (c: SOSCluster) => void;
};

export default function Map({ crisisState, selectedCluster, onClusterClick }: Props) {
  const { clusters, teams, farms } = crisisState;

  const routeLine = selectedCluster
    ? ([[teams[0].lat, teams[0].lng], [selectedCluster.lat, selectedCluster.lng]] as [number, number][])
    : null;

  return (
    <MapContainer
      center={[30.402, 79.321]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      {clusters.map((cluster) => (
        <Circle
          key={cluster.id}
          center={[cluster.lat, cluster.lng]}
          radius={800}
          pathOptions={{
            color: priorityColor[cluster.priority],
            fillColor: priorityColor[cluster.priority],
            fillOpacity: selectedCluster?.id === cluster.id ? 0.4 : 0.2,
            weight: selectedCluster?.id === cluster.id ? 3 : 1.5,
          }}
          eventHandlers={{ click: () => onClusterClick(cluster) }}
        >
          <Popup>
            <strong>Cluster {cluster.id}</strong><br />
            {cluster.location}<br />
            {cluster.count} SOS signals<br />
            <em>"{cluster.message}"</em><br />
            {cluster.parsed}
          </Popup>
        </Circle>
      ))}
      {teams.map((team) => (
        <Marker key={team.id} position={[team.lat, team.lng]}>
          <Popup>
            <strong>{team.name}</strong><br />
            Status: {team.status}
          </Popup>
        </Marker>
      ))}
      {farms.map((farm) => (
        <Circle
          key={farm.id}
          center={[farm.lat, farm.lng]}
          radius={400}
          pathOptions={{
            color: farm.alertStatus === 'ALERT' ? '#ef4444' :
                   farm.alertStatus === 'WARNING' ? '#f97316' : '#22c55e',
            fillOpacity: 0.15,
            weight: 1,
          }}
        >
          <Popup>
            <strong>{farm.owner}</strong><br />
            {farm.crop} · {farm.acres} acres<br />
            Status: {farm.alertStatus}
          </Popup>
        </Circle>
      ))}
      {routeLine && (
        <Polyline
          positions={routeLine}
          pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '8 4' }}
        />
      )}
    </MapContainer>
  );
}