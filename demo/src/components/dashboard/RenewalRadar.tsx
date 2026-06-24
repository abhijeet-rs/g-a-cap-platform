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
    <div style={{
      background: '#fff', borderRadius: 12, overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#111827' }}>Renewal Radar</div>
            <div style={{ fontSize: 'var(--type-label)', color: '#9CA3AF', marginTop: 2 }}>Upcoming 90 days &middot; R1</div>
          </div>
          <div style={{
            fontSize: 'var(--type-badge)', fontWeight: 600, color: '#1D4ED8', background: '#DBEAFE',
            padding: '2px 8px', borderRadius: 10, height: 20,
            display: 'inline-flex', alignItems: 'center',
          }}>Prism &middot; synced</div>
        </div>
        <div style={{ fontSize: 'var(--type-label)', color: '#9CA3AF', marginBottom: 8 }}>synced 2 min ago</div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search renewals..."
          style={{
            width: '100%', height: 32, padding: '0 10px',
            borderRadius: 6, border: '1px solid #F3F4F6', fontSize: 'var(--type-label)',
            outline: 'none', boxSizing: 'border-box',
            background: '#F9FAFB', color: '#111827',
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
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', border: 'none',
            background: hoveredId === c.id ? '#F9FAFB' : 'transparent',
            cursor: 'pointer', textAlign: 'left',
            borderBottom: '1px solid #F3F4F6',
            transition: 'background .12s ease',
          }}
        >
          <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 'var(--type-body-lg)', fontWeight: 700, color: urgencyColor(c.urgDays), lineHeight: 1 }}>{c.renewDay}</div>
            <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginTop: 2 }}>{c.renewMon}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--type-caption)', fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>{c.name}</div>
            <div style={{ fontSize: 'var(--type-label)', color: urgencyColor(c.urgDays) }}>
              {c.urgDays} days &middot; Renewal
            </div>
          </div>
          <span style={{ fontSize: 'var(--type-label)', color: '#9CA3AF', flexShrink: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{c.wse}</span>
        </button>
      ))}

      <div
        onClick={() => router.push('/renewal')}
        style={{
          padding: 12, borderTop: '1px solid #F3F4F6', textAlign: 'center',
          fontSize: 'var(--type-caption)', fontWeight: 500, color: '#6B7280', cursor: 'pointer',
          transition: 'color 0.12s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
      >
        View all renewals &rarr;
      </div>
    </div>
  );
}
