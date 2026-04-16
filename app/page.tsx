'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import SOSList from '@/components/SOSList';
import CrisisGPT from '@/components/CrisisGPT';
import FarmPanel from '@/components/FarmPanel';
import SOSSimulator from '@/components/SOSSimulator';
import { mockCrisisState } from '@/lib/mockData';
import { SOSCluster, CrisisState } from '@/lib/types';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

type Tab = 'coordinator' | 'rescue' | 'farm';

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('coordinator');
  const [selectedCluster, setSelectedCluster] = useState<SOSCluster | null>(null);
  const [showSOS, setShowSOS] = useState(false);
  const [crisisState, setCrisisState] = useState<CrisisState>(mockCrisisState);

  const priorityMap: Record<string, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = {
    CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW',
  };
  const priorityRank: Record<string, number> = {
    CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1,
  };

  function onSOSParsed(message: string, parsed: {
    severity: string;
    type: string;
    summary: string;
    peopleCount: number | null;
    needsImmediateRescue: boolean;
  }) {
    const newLat = 30.395 + (Math.random() - 0.5) * 0.05;
    const newLng = 79.350 + (Math.random() - 0.5) * 0.05;
    const incomingPriority = priorityMap[parsed.severity] || 'HIGH';
    const THRESHOLD = 0.03;

    const nearbyCluster = crisisState.clusters.find(c =>
      Math.abs(c.lat - newLat) < THRESHOLD &&
      Math.abs(c.lng - newLng) < THRESHOLD
    );

    if (nearbyCluster) {
      const updated = {
        ...nearbyCluster,
        count: nearbyCluster.count + (parsed.peopleCount || 1),
        priority: priorityRank[incomingPriority] > priorityRank[nearbyCluster.priority]
          ? incomingPriority : nearbyCluster.priority,
        message: message,
        parsed: `${nearbyCluster.parsed} · ${parsed.summary}`,
        timestamp: 'just now',
      };
      setCrisisState((prev) => ({
        ...prev,
        clusters: prev.clusters.map(c => c.id === nearbyCluster.id ? updated : c),
      }));
      setSelectedCluster(updated);
    } else {
      const newCluster: SOSCluster = {
        id: `W${crisisState.clusters.length + 1}`,
        location: 'WhatsApp SOS — Chamoli',
        lat: newLat,
        lng: newLng,
        count: parsed.peopleCount || 1,
        priority: incomingPriority,
        message: message,
        parsed: parsed.summary,
        timestamp: 'just now',
      };
      setCrisisState((prev) => ({
        ...prev,
        clusters: [newCluster, ...prev.clusters],
      }));
      setSelectedCluster(newCluster);
    }

    setShowSOS(false);
    setTab('coordinator');
  }

  const totalSOS = crisisState.clusters.reduce((sum, c) => sum + c.count, 0);
  const criticalCount = crisisState.clusters.filter(c => c.priority === 'CRITICAL').length;
  const highCount = crisisState.clusters.filter(c => c.priority === 'HIGH').length;
  const personsAtRisk = crisisState.clusters.reduce((sum, c) => sum + c.count * 80, 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{
      background: '#080c14',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
    }}>

      {/* TOP BAR */}
      <header style={{
        height: '48px',
        background: 'linear-gradient(90deg, #0a0f1e 0%, #0d1525 100%)',
        borderBottom: '1px solid rgba(239,68,68,0.2)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px' }}>
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" stroke="#ef4444" strokeWidth="1.5" opacity="0.3"/>
              <circle cx="14" cy="14" r="7" stroke="#ef4444" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="14" cy="14" r="3" fill="#ef4444"/>
              <line x1="14" y1="2" x2="14" y2="6" stroke="#ef4444" strokeWidth="1.5"/>
              <line x1="14" y1="22" x2="14" y2="26" stroke="#ef4444" strokeWidth="1.5"/>
              <line x1="2" y1="14" x2="6" y2="14" stroke="#ef4444" strokeWidth="1.5"/>
              <line x1="22" y1="14" x2="26" y2="14" stroke="#ef4444" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#f8fafc' }}>
              GEOSHIELD
            </div>
            <div style={{ fontSize: '9px', color: '#ef4444', letterSpacing: '0.1em', marginTop: '-2px' }}>
              EYES ON GROUND
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.05em' }}>
          <span style={{ color: '#94a3b8' }}>DISTRICT</span>
          {' · '}
          <span style={{ color: '#e2e8f0' }}>Chamoli, Uttarakhand</span>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginLeft: '16px' }}>
          {[
            { label: 'SOS', value: String(totalSOS), color: '#ef4444' },
            { label: 'TEAMS', value: '3', color: '#3b82f6' },
            { label: 'RIVER', value: '3.2m', color: '#f97316' },
            { label: 'RAIN', value: '78mm/hr', color: '#f97316' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.1em' }}>{m.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {(['coordinator', 'rescue', 'farm'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '5px 14px',
                fontSize: '11px',
                fontFamily: 'inherit',
                fontWeight: 600,
                letterSpacing: '0.08em',
                border: tab === t ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                background: tab === t ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: tab === t ? '#fca5a5' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s',
                textTransform: 'uppercase' as const,
              }}
            >
              {t === 'farm' ? 'Farmers' : t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 6px #ef4444',
            animation: 'livepulse 2s infinite',
          }} />
          <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, letterSpacing: '0.1em' }}>LIVE</span>
        </div>
      </header>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <div style={{ flex: 1, position: 'relative' }}>
          <Map
            crisisState={crisisState}
            selectedCluster={selectedCluster}
            onClusterClick={(c) => {
              setSelectedCluster(c);
              setTab('coordinator');
            }}
          />

          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '60px',
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
          }}>
            {[
              { label: 'CRITICAL ZONES', value: String(criticalCount), color: '#ef4444' },
              { label: 'HIGH ZONES', value: String(highCount), color: '#f97316' },
              { label: 'PERSONS AT RISK', value: String(personsAtRisk), color: '#fbbf24' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(8,12,20,0.92)',
                border: `1px solid ${s.color}40`,
                borderRadius: '6px',
                padding: '8px 14px',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, fontFamily: 'inherit' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.08em', marginTop: '2px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid rgba(239,68,68,0.15)',
          background: 'linear-gradient(180deg, #0a0f1e 0%, #080c14 100%)',
          overflow: 'hidden',
        }}>

          {tab === 'coordinator' && (
            <>
              <SOSList
                clusters={crisisState.clusters}
                selected={selectedCluster}
                onSelect={setSelectedCluster}
              />
              <CrisisGPT
                crisisState={crisisState}
                selectedCluster={selectedCluster}
              />
            </>
          )}

          {tab === 'rescue' && (
            <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '0.12em', marginBottom: '4px' }}>
                TEAM POSITIONS · GPS LIVE
              </div>
              {crisisState.teams.map((team) => (
                <div key={team.id} style={{
                  background: 'rgba(30,58,138,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa' }}>{team.id}</span>
                    <span style={{
                      fontSize: '9px', padding: '2px 8px', borderRadius: '20px', fontWeight: 700,
                      background: 'rgba(34,197,94,0.1)', color: '#4ade80',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}>
                      {team.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px 0' }}>{team.name}</p>
                  <p style={{ fontSize: '10px', color: '#334155', margin: 0 }}>
                    {team.lat.toFixed(4)}°N · {team.lng.toFixed(4)}°E
                  </p>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                {[
                  { v: `${crisisState.riverLevel}m`, l: 'River Level', c: '#ef4444' },
                  { v: `${crisisState.rainfall}mm/hr`, l: 'Rainfall', c: '#f97316' },
                  { v: '64%', l: 'Roads Open', c: '#3b82f6' },
                  { v: '2', l: 'Shelters Active', c: '#22c55e' },
                ].map(m => (
                  <div key={m.l} style={{
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: '9px', color: '#475569', marginTop: '3px', letterSpacing: '0.06em' }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'farm' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <FarmPanel farms={crisisState.farms} />
              <button
                onClick={() => setShowSOS(true)}
                style={{
                  margin: '0 14px 14px',
                  padding: '10px 16px',
                  background: 'rgba(37,211,102,0.08)',
                  border: '1px solid rgba(37,211,102,0.3)',
                  borderRadius: '8px',
                  color: '#25d366',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="12" rx="3" stroke="#25d366" strokeWidth="1.2"/>
                  <rect x="3" y="3" width="3" height="3" rx="0.5" fill="#25d366"/>
                  <rect x="8" y="3" width="3" height="3" rx="0.5" fill="#25d366"/>
                  <rect x="3" y="8" width="3" height="3" rx="0.5" fill="#25d366"/>
                  <rect x="8" y="8" width="1.5" height="1.5" fill="#25d366"/>
                  <rect x="10" y="8" width="1.5" height="1.5" fill="#25d366"/>
                  <rect x="8" y="10" width="1.5" height="1.5" fill="#25d366"/>
                  <rect x="10" y="10" width="1.5" height="1.5" fill="#25d366"/>
                </svg>
                SIMULATE WHATSAPP SOS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WHATSAPP SOS MODAL */}
      {showSOS && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowSOS(false); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{
            width: '400px',
            background: '#0a0f1e',
            border: '1px solid rgba(37,211,102,0.3)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(37,211,102,0.12)',
          }}>
            <div style={{
              background: 'rgba(37,211,102,0.12)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderBottom: '1px solid rgba(37,211,102,0.2)',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '8px',
                background: 'rgba(37,211,102,0.15)',
                border: '1px solid rgba(37,211,102,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="4" stroke="#25d366" strokeWidth="1.5"/>
                  <rect x="5" y="5" width="4" height="4" rx="1" fill="#25d366"/>
                  <rect x="11" y="5" width="4" height="4" rx="1" fill="#25d366"/>
                  <rect x="5" y="11" width="4" height="4" rx="1" fill="#25d366"/>
                  <rect x="11" y="11" width="2" height="2" fill="#25d366"/>
                  <rect x="13" y="11" width="2" height="2" fill="#25d366"/>
                  <rect x="11" y="13" width="2" height="2" fill="#25d366"/>
                  <rect x="13" y="13" width="2" height="2" fill="#25d366"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#25d366' }}>
                  WhatsApp SOS Simulator
                </div>
                <div style={{ fontSize: '10px', color: '#475569' }}>
                  GeoShield Farmer Helpline · Chamoli District
                </div>
              </div>
              <button
                onClick={() => setShowSOS(false)}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: '#475569',
                  fontSize: '20px',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '4px',
                }}
              >✕</button>
            </div>
            <SOSSimulator onParsed={onSOSParsed} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes livepulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #ef4444; }
          50% { opacity: 0.4; box-shadow: none; }
        }
      `}</style>
    </div>
  );
}