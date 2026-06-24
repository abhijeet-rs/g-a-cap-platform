'use client';

import { useState } from 'react';

interface Activity {
  id: number;
  text: string;
  time: string;
  type: 'submit' | 'approve' | 'generate' | 'sync' | 'review';
}

const typeColors: Record<Activity['type'], string> = {
  submit: '#C60C30',
  approve: '#1A7A4A',
  generate: '#0074B8',
  sync: '#5A45C7',
  review: '#B0690A',
};

const activities: Activity[] = [
  { id: 1, text: 'Dana Whitfield submitted Itafos Conda CAP for review', time: '2h ago', type: 'submit' },
  { id: 2, text: 'Marcus Reyes approved Cascade Health renewal', time: '5h ago', type: 'approve' },
  { id: 3, text: 'Priya Nair generated booklet for Brightline Staffing', time: '8h ago', type: 'generate' },
  { id: 4, text: 'System synced 42 master plan rates from PrismHR', time: '12h ago', type: 'sync' },
  { id: 5, text: 'Lena Ortiz completed QC review for Northgate Mfg', time: '18h ago', type: 'review' },
];

export default function ActivityLog() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      overflow: 'hidden', marginTop: 20,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#111827' }}>Recent Activity</div>
          <div style={{ fontSize: 'var(--type-label)', color: '#9CA3AF', marginTop: 2 }}>Last 24 hours</div>
        </div>
        <div style={{
          fontSize: 'var(--type-badge)', fontWeight: 600, color: '#5A45C7', background: '#F8F4FF',
          padding: '2px 8px', borderRadius: 10, height: 20,
          display: 'inline-flex', alignItems: 'center',
        }}>
          {activities.length} events
        </div>
      </div>

      {activities.map((a) => (
        <div
          key={a.id}
          onMouseEnter={() => setHoveredId(a.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 20px',
            borderTop: '1px solid #F3F4F6',
            background: hoveredId === a.id ? '#F9FAFB' : 'transparent',
            transition: 'background 0.1s ease',
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
            background: typeColors[a.type],
          }} />
          <span style={{ flex: 1, fontSize: 'var(--type-caption)', color: '#374151', lineHeight: 1.5 }}>
            {a.text}
          </span>
          <span style={{
            fontSize: 'var(--type-label)', color: '#9CA3AF', flexShrink: 0, whiteSpace: 'nowrap',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {a.time}
          </span>
        </div>
      ))}
    </div>
  );
}
