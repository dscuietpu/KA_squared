'use client';
import { useState } from 'react';

type ParsedSOS = {
  severity: string;
  type: string;
  summary: string;
  peopleCount: number | null;
  needsImmediateRescue: boolean;
};

type Props = {
  onParsed?: (message: string, parsed: ParsedSOS) => void;
};

const severityColor: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const presetMessages = [
  { label: 'Flood incoming', msg: 'बाढ़ आ रही है, मदद चाहिए, 5 लोग फँसे हैं' },
  { label: 'Water in home', msg: 'घर में पानी घुस आया, बाहर नहीं निकल सकते' },
  { label: 'Landslide', msg: 'पहाड़ खिसक रहा है, रास्ता बंद हो गया' },
  { label: 'Elderly trapped', msg: 'बुजुर्ग अकेले फँसे हैं, बहुत पानी है' },
];

export default function SOSSimulator({ onParsed }: Props) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedSOS | null>(null);
  const [sent, setSent] = useState(false);

  async function parseMessage(msg: string) {
    if (!msg.trim()) return;
    setLoading(true);
    setResult(null);
    setSent(true);

    try {
      const res = await fetch('/api/parse-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, district: 'Chamoli' }),
      });
      const data = await res.json();
      setResult(data);

      // After 1.5 seconds show result then call onParsed to update dashboard
      setTimeout(() => {
        if (onParsed) onParsed(msg, data);
      }, 1500);

    } catch {
      const fallback = {
        severity: 'HIGH',
        type: 'other',
        summary: 'Could not parse message',
        peopleCount: null,
        needsImmediateRescue: true,
      };
      setResult(fallback);
      setTimeout(() => {
        if (onParsed) onParsed(msg, fallback);
      }, 1500);
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: '12px 14px' }}>
      {/* Preset buttons */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.08em', marginBottom: '6px' }}>
          QUICK MESSAGES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
          {presetMessages.map((p) => (
            <button
              key={p.label}
              onClick={() => { setMessage(p.msg); setSent(false); setResult(null); }}
              style={{
                padding: '4px 10px',
                fontSize: '10px',
                background: 'transparent',
                border: '1px solid rgba(37,211,102,0.3)',
                borderRadius: '20px',
                color: '#25d366',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.1s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incoming message bubble */}
      {message && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '9px', color: '#475569', marginBottom: '4px' }}>
            Farmer · +91 98XXX XXXXX
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0 10px 10px 10px',
            padding: '8px 12px',
            fontSize: '13px',
            color: '#e2e8f0',
            maxWidth: '85%',
            lineHeight: 1.5,
          }}>
            {message}
          </div>
        </div>
      )}

      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <input
          value={message}
          onChange={(e) => { setMessage(e.target.value); setSent(false); setResult(null); }}
          onKeyDown={(e) => e.key === 'Enter' && parseMessage(message)}
          placeholder="Type Hindi SOS message..."
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '8px 14px',
            fontSize: '12px',
            color: '#e2e8f0',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={() => parseMessage(message)}
          disabled={loading || !message.trim()}
          style={{
            padding: '8px 16px',
            background: '#25d366',
            border: 'none',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#000',
            cursor: 'pointer',
            fontFamily: 'inherit',
            opacity: loading || !message.trim() ? 0.5 : 1,
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          background: 'rgba(30,136,229,0.08)',
          border: '1px solid rgba(30,136,229,0.2)',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '11px',
          color: '#60a5fa',
        }}>
          CrisisGPT parsing message...
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          background: `${severityColor[result.severity] || '#ef4444'}10`,
          border: `1px solid ${severityColor[result.severity] || '#ef4444'}40`,
          borderRadius: '8px',
          padding: '10px 12px',
        }}>
          <div style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
            color: severityColor[result.severity] || '#ef4444',
            marginBottom: '6px',
          }}>
            ✓ PARSED · ADDING TO DASHBOARD...
          </div>
          <div style={{ fontSize: '12px', color: '#e2e8f0', marginBottom: '6px', lineHeight: 1.5 }}>
            {result.summary}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
              background: `${severityColor[result.severity]}20`,
              color: severityColor[result.severity] || '#ef4444',
              border: `1px solid ${severityColor[result.severity]}40`,
              fontWeight: 700,
            }}>{result.severity}</span>
            <span style={{ fontSize: '10px', color: '#475569' }}>Type: {result.type}</span>
            {result.peopleCount && (
              <span style={{ fontSize: '10px', color: '#475569' }}>People: {result.peopleCount}</span>
            )}
            <span style={{ fontSize: '10px', color: result.needsImmediateRescue ? '#ef4444' : '#22c55e' }}>
              {result.needsImmediateRescue ? '⚠ Immediate rescue' : '✓ Monitor'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}