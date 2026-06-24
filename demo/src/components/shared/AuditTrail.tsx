'use client';

import { useState } from 'react';
import { useDataStore, AuditEntry } from '@/stores/dataStore';

interface AuditTrailProps {
  entityId?: string;
}

function formatEntry(entry: AuditEntry): { name: string; action: string; date: string; time: string; actor: 'user' | 'system' } {
  const ts = new Date(entry.timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = `${months[ts.getMonth()]} ${ts.getDate()}`;
  const hours = ts.getHours();
  const mins = ts.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const time = `${h12}:${mins} ${ampm}`;

  return {
    name: entry.actor,
    action: entry.action,
    date,
    time,
    actor: entry.actorType,
  };
}

export default function AuditTrail({ entityId }: AuditTrailProps) {
  const [expanded, setExpanded] = useState(false);
  const auditLog = useDataStore((s) => s.auditLog);

  const filtered = entityId
    ? auditLog.filter((e) => e.entityId === entityId)
    : auditLog;

  const events = filtered.map(formatEntry);

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E4E8ED', marginTop: 24 }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'var(--type-card-title)', fontWeight: 600 }}>Audit Trail</span>
          <span style={{
            fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: '#F1F3F5', color: '#374151',
          }}>
            {events.length} events
          </span>
        </div>
        <span style={{
          fontSize: 'var(--type-body-sm)', color: '#374151',
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease', display: 'inline-block',
        }}>
          &#9660;
        </span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #E4E8ED' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '20px 1fr 70px 64px',
            gap: 8, padding: '6px 16px', background: '#FAFBFC',
            borderBottom: '1px solid #EEF1F4',
          }}>
            <span />
            <span style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Event</span>
            <span style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>Date</span>
            <span style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>Time</span>
          </div>

          {/* Event rows */}
          {events.map((evt, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '20px 1fr 70px 64px',
              gap: 8, padding: '7px 16px', alignItems: 'center',
              borderBottom: i < events.length - 1 ? '1px solid #F4F6F8' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: evt.actor === 'user' ? '#0074B8' : '#5A45C7',
                }} />
              </div>

              <div style={{ fontSize: 'var(--type-body-sm)', color: '#1B2D3D', lineHeight: 1.4, minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>{evt.name}</span>
                {' '}{evt.action}
              </div>

              <div style={{
                fontSize: 'var(--type-caption)', color: '#374151', textAlign: 'right',
                fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap',
              }}>
                {evt.date}
              </div>

              <div style={{
                fontSize: 'var(--type-caption)', color: '#374151', textAlign: 'right',
                fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap',
              }}>
                {evt.time}
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--type-body)', color: '#374151' }}>
              No audit events recorded yet.
            </div>
          )}

          {/* Legend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '8px 16px', borderTop: '1px solid #EEF1F4', background: '#FAFBFC',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0074B8' }} />
              <span style={{ fontSize: 'var(--type-caption)', color: '#374151', fontWeight: 500 }}>User action</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5A45C7' }} />
              <span style={{ fontSize: 'var(--type-caption)', color: '#374151', fontWeight: 500 }}>System action</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
