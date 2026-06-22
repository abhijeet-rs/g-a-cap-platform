'use client';

import { useState } from 'react';
import { clients } from '@/data/clients';
import { useRouter } from 'next/navigation';

const urgencyColor = (days: number) => {
  if (days < 20) return '#C60C30';
  if (days < 40) return '#B0690A';
  return '#1A7A4A';
};

export default function RenewalRadar() {
  const router = useRouter();
  const [filter, setFilter] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const renewals = [...clients]
    .filter((c) => c.urgDays <= 95)
    .sort((a, b) => a.urgDays - b.urgDays)
    .filter((c) => !filter || c.name.toLowerCase().includes(filter.toLowerCase()))
    .slice(0, 5);

  return (
    <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #EEF1F4' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Renewal Radar</div>
            <div style={{ fontSize: 9, color: '#98A1A8' }}>Upcoming 90 days &middot; R1</div>
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#0074B8', background: '#E7F1FA', padding: '2px 7px', borderRadius: 4 }}>Prism &middot; synced</div>
        </div>
        <div style={{ fontSize: 8, color: '#98A1A8', marginTop: 3 }}>synced 2 min ago</div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search renewals..."
          style={{
            width: '100%', marginTop: 8, height: 26, padding: '0 8px',
            borderRadius: 6, border: '1px solid #E4E8ED', fontSize: 10,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {renewals.map((c) => (
        <button
          key={c.id}
          onClick={() => router.push('/renewal')}
          onMouseEnter={() => setHoveredId(c.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', border: 'none', background: hoveredId === c.id ? '#FAFBFC' : 'none',
            cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #F4F6F8',
            borderLeft: hoveredId === c.id ? `3px solid ${urgencyColor(c.urgDays)}` : '3px solid transparent',
            transition: 'background .12s, border-left .12s',
          }}
        >
          <div style={{ width: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: urgencyColor(c.urgDays), lineHeight: 1 }}>{c.renewDay}</div>
            <div style={{ fontSize: 8, fontWeight: 600, color: '#98A1A8', textTransform: 'uppercase', marginTop: 1 }}>{c.renewMon}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>{c.name}</div>
            <div style={{ fontSize: 9, color: urgencyColor(c.urgDays) }}>
              {c.urgDays} days &middot; Renewal
            </div>
          </div>
          <span style={{ fontSize: 9, color: '#98A1A8', flexShrink: 0 }}>{c.wse}</span>
        </button>
      ))}

      <div
        onClick={() => router.push('/renewal')}
        style={{
          padding: '8px 14px', borderTop: '1px solid #EEF1F4', textAlign: 'center',
          fontSize: 10, fontWeight: 600, color: '#0074B8', cursor: 'pointer',
        }}
      >
        View all renewals &rarr;
      </div>
    </div>
  );
}
