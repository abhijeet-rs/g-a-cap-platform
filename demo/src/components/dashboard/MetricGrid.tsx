'use client';

const tiles = [
  { label: 'ACTIVE CAPS', value: '12', sub: 'Across all account managers', icon: '▦', iconBg: '#FDECEF', iconFg: '#C60C30' },
  { label: 'IN REVIEW', value: '3', sub: 'Awaiting validation & approval', icon: '◷', iconBg: '#E7F1FA', iconFg: '#0074B8' },
  { label: 'AWAITING SIGNATURE', value: '4', sub: 'In DocuSign routing', icon: '△', iconBg: '#FBF0DD', iconFg: '#B0690A' },
  { label: 'PUBLISHED 2026', value: '3', sub: 'Synced to downstream systems', icon: '✓', iconBg: '#E4F2EA', iconFg: '#1A7A4A' },
];

export default function MetricGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
      {tiles.map((t) => (
        <div key={t.label} style={{
          background: '#fff', borderRadius: 12, padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{
              fontSize: 'var(--type-table-header)', fontWeight: 500, color: '#6B7280',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{t.label}</div>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: t.iconBg, color: t.iconFg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--type-body-lg)',
            }}>{t.icon}</div>
          </div>
          <div style={{
            fontSize: 'var(--type-display)', fontWeight: 700, color: '#111827',
            letterSpacing: '-0.02em', lineHeight: 1,
          }}>{t.value}</div>
          <div style={{ fontSize: 'var(--type-caption)', color: '#9CA3AF', marginTop: 4 }}>{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
