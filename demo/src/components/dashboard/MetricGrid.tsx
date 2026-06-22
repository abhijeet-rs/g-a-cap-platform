'use client';

const tiles = [
  { label: 'ACTIVE CAPS', value: '12', sub: 'Across all account managers', icon: '▦', iconBg: '#FDECEF', iconFg: '#C60C30' },
  { label: 'IN REVIEW', value: '3', sub: 'Awaiting validation & approval', icon: '◷', iconBg: '#E7F1FA', iconFg: '#0074B8' },
  { label: 'AWAITING SIGNATURE', value: '4', sub: 'In DocuSign routing', icon: '△', iconBg: '#FBF0DD', iconFg: '#B0690A' },
  { label: 'PUBLISHED 2026', value: '3', sub: 'Synced to downstream systems', icon: '✓', iconBg: '#E4F2EA', iconFg: '#1A7A4A' },
];

export default function MetricGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
      {tiles.map((t) => (
        <div key={t.label} style={{
          background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#64707A', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.label}</div>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: t.iconBg, color: t.iconFg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
            }}>{t.icon}</div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, lineHeight: 1 }}>{t.value}</div>
          <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 4 }}>{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
