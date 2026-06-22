'use client';

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
  return (
    <div style={{
      background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
      overflow: 'hidden', marginTop: 14,
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #EEF1F4',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1B2D3D' }}>Recent Activity</div>
          <div style={{ fontSize: 9, color: '#98A1A8' }}>Last 24 hours</div>
        </div>
        <div style={{
          fontSize: 9, fontWeight: 600, color: '#5A45C7', background: '#F8F4FF',
          padding: '2px 7px', borderRadius: 4,
        }}>
          {activities.length} events
        </div>
      </div>

      {activities.map((a) => (
        <div
          key={a.id}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '10px 16px', borderTop: '1px solid #F4F6F8',
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 3,
            background: typeColors[a.type],
          }} />
          <span style={{ flex: 1, fontSize: 11, color: '#1B2D3D', lineHeight: 1.4 }}>
            {a.text}
          </span>
          <span style={{ fontSize: 9, color: '#98A1A8', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {a.time}
          </span>
        </div>
      ))}
    </div>
  );
}
