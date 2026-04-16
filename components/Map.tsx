'use client';
import React from 'react';
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

function createSOSIcon(count: number, priority: string, selected: boolean) {
  const color = priorityColor[priority as keyof typeof priorityColor] || '#ef4444';
  const size = selected ? 56 : 44;
  const innerSize = selected ? 26 : 20;
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
        ${selected ? `<div style="
          position:absolute;
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color}15;
          border:2.5px solid ${color};
        "></div>` : ''}
        <div style="
          position:absolute;
          width:${size - 14}px;height:${size - 14}px;border-radius:50%;
          background:${color}${selected ? '50' : '25'};
          border:${selected ? '2px' : '1.5px'} solid ${color}${selected ? 'ff' : '90'};
          animation:sosPulse 1.8s ease-out infinite;
        "></div>
        <div style="
          position:relative;
          width:${innerSize}px;height:${innerSize}px;border-radius:50%;
          background:${color};
          display:flex;align-items:center;justify-content:center;
          font-size:${selected ? '12' : '10'}px;font-weight:700;color:white;
          font-family:monospace;
          box-shadow:0 0 ${selected ? '12' : '6'}px ${color};
        ">${count}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createTeamIcon(id: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="
          width:36px;height:36px;
          background:rgba(15,30,80,0.95);
          border:2px solid #3b82f6;
          border-radius:6px;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          box-shadow:0 0 10px #3b82f660;
          gap:1px;
        ">
          <div style="font-size:8px;color:#60a5fa;font-family:monospace;letter-spacing:0.05em;line-height:1;">NDRF</div>
          <div style="font-size:12px;font-weight:700;color:#ffffff;font-family:monospace;line-height:1;">${id}</div>
        </div>
        <div style="
          width:2px;height:8px;
          background:#3b82f6;
        "></div>
        <div style="
          width:6px;height:6px;
          border-radius:50%;
          background:#3b82f6;
        "></div>
      </div>
    `,
    iconSize: [36, 56],
    iconAnchor: [18, 56],
  });
}

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
    <>
      <style>{`
        @keyframes sosPulse {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .leaflet-tile {
          filter: brightness(0.88) saturate(0.85);
        }
      `}</style>

      <MapContainer
        center={[30.402, 79.321]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />

        {/* SOS Clusters — icon only, no circles */}
        {clusters.map((cluster) => (
          <React.Fragment key={cluster.id}>
            <Marker
              position={[cluster.lat, cluster.lng]}
              icon={createSOSIcon(
                cluster.count,
                cluster.priority,
                selectedCluster?.id === cluster.id
              )}
              eventHandlers={{ click: () => onClusterClick(cluster) }}
              zIndexOffset={selectedCluster?.id === cluster.id ? 1000 : 0}
            >
              <Popup>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', minWidth: '190px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', color: priorityColor[cluster.priority] }}>
                    ● {cluster.priority} — Cluster {cluster.id}
                  </div>
                  <div style={{ marginBottom: '3px' }}>{cluster.location}</div>
                  <div style={{ marginBottom: '3px' }}>{cluster.count} SOS signals · {cluster.timestamp}</div>
                  <div style={{ color: '#555', fontStyle: 'italic', marginBottom: '3px' }}>"{cluster.message}"</div>
                  <div style={{ fontSize: '11px', color: '#333' }}>{cluster.parsed}</div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* NDRF Teams */}
        {teams.map((team) => (
          <Marker
            key={team.id}
            position={[team.lat, team.lng]}
            icon={createTeamIcon(team.id)}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>{team.name}</div>
                <div>Status: {team.status}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                  {team.lat.toFixed(4)}°N · {team.lng.toFixed(4)}°E
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Farm zones — dashed circles */}
        {farms.map((farm) => (
          <Circle
            key={farm.id}
            center={[farm.lat, farm.lng]}
            radius={600}
            pathOptions={{
              color: farm.alertStatus === 'ALERT' ? '#ef4444' :
                     farm.alertStatus === 'WARNING' ? '#f97316' : '#22c55e',
              fillOpacity: 0.1,
              weight: 1.5,
              dashArray: '4 4',
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>🌾 {farm.owner}</div>
                <div>{farm.crop} · {farm.acres} acres · {farm.location}</div>
                <div style={{ marginTop: '4px', fontWeight: 600, color:
                  farm.alertStatus === 'ALERT' ? '#ef4444' :
                  farm.alertStatus === 'WARNING' ? '#f97316' : '#22c55e'
                }}>{farm.alertStatus}</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Route line */}
        {routeLine && (
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: '#3b82f6',
              weight: 2.5,
              dashArray: '8 5',
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>
    </>
  );
}