'use client';

import { useState, useMemo } from 'react';
import { auditTrail, auditTypeMeta, type OnboardingAuditEntry } from '@/data/onboarding';

/* ================================================================
   Audit Trail — timeline view of onboarding actions
   ================================================================ */

const actionTypes: OnboardingAuditEntry['type'][] = [
  'upload', 'extraction', 'validation', 'resolution', 'approval', 'sync', 'system',
];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${date} at ${time}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AuditPage() {
  const [filterType, setFilterType] = useState<OnboardingAuditEntry['type'] | 'all'>('all');
  const [filterDocument, setFilterDocument] = useState<string>('all');

  const documents = useMemo(
    () => Array.from(new Set(auditTrail.map((e) => e.document))),
    [],
  );

  const filtered = useMemo(() => {
    let result = [...auditTrail];
    if (filterType !== 'all') result = result.filter((e) => e.type === filterType);
    if (filterDocument !== 'all') result = result.filter((e) => e.document === filterDocument);
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [filterType, filterDocument]);

  return (
    <div style={{ padding: '24px 24px 32px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 'var(--type-section-title)', color: '#5A45C7' }} />
          <h1 style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Audit Trail
          </h1>
        </div>
        <p style={{ fontSize: 'var(--type-body)', color: 'var(--text-secondary)', margin: 0 }}>
          Complete history of CSA extraction, validation, and system synchronization events.
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 10,
        padding: '12px 16px', marginBottom: 20, boxShadow: 'var(--shadow-xs)',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        {/* Document filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Document:</span>
          <select
            value={filterDocument}
            onChange={(e) => setFilterDocument(e.target.value)}
            style={{
              height: 30, padding: '0 10px', borderRadius: 6,
              border: '1px solid var(--border-primary)', background: '#fff',
              fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Documents</option>
            {documents.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Type filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Type:</span>
          <button
            onClick={() => setFilterType('all')}
            style={{
              height: 24, padding: '0 9px', borderRadius: 6,
              border: '1px solid ' + (filterType === 'all' ? '#5A45C7' : 'var(--border-primary)'),
              background: filterType === 'all' ? '#F8F6FE' : '#fff',
              color: filterType === 'all' ? '#5A45C7' : 'var(--text-secondary)',
              fontSize: 'var(--type-badge)', fontWeight: 600, cursor: 'pointer',
            }}
          >
            All
          </button>
          {actionTypes.map((t) => {
            const meta = auditTypeMeta[t];
            const active = filterType === t;
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  height: 24, padding: '0 9px', borderRadius: 6,
                  border: `1px solid ${active ? meta.color : 'var(--border-primary)'}`,
                  background: active ? meta.bg : '#fff',
                  color: active ? meta.color : 'var(--text-secondary)',
                  fontSize: 'var(--type-badge)', fontWeight: 600, cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 12,
        boxShadow: 'var(--shadow-xs)', overflow: 'hidden',
      }}>
        {filtered.map((entry, idx) => {
          const meta = auditTypeMeta[entry.type];
          const isLast = idx === filtered.length - 1;
          return (
            <div key={entry.id} style={{
              display: 'flex', gap: 16, padding: '16px 20px',
              borderBottom: isLast ? 'none' : '1px solid var(--border-secondary)',
              alignItems: 'flex-start',
            }}>
              {/* Timeline connector */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 36,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: meta.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 13, color: meta.color }} />
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {entry.action}
                  </span>
                  <span style={{
                    fontSize: 'var(--type-badge)', fontWeight: 600, color: meta.color,
                    background: meta.bg, padding: '1px 7px', borderRadius: 5,
                    textTransform: 'capitalize',
                  }}>
                    {entry.type}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                  {entry.details}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="fa-solid fa-user" style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)' }} />
                    <span style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {entry.actor}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="fa-solid fa-file" style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)' }} />
                    <span style={{ fontSize: 'var(--type-badge)', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                      {entry.document}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {relativeTime(entry.timestamp)}
                </div>
                <div style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {formatTimestamp(entry.timestamp)}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--type-body-sm)' }}>
            No audit entries match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
