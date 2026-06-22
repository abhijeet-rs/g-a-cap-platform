'use client';

import { renewalDiffRows } from '@/data/renewalDiff';
import { useRenewalStore } from '@/stores/renewalStore';

const gridCols = '1.5fr 1fr 1fr 60px 80px 100px';

export default function DiffTable() {
  const diffDecisions = useRenewalStore((s) => s.diffDecisions);
  const setDiff = useRenewalStore((s) => s.setDiff);
  const acceptAllCarriedForward = useRenewalStore((s) => s.acceptAllCarriedForward);

  return (
    <div>
      {/* Legend row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, background: '#FDECEF', color: '#C60C30', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 8px' }}>
          Client-driven
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, background: '#E7F1FA', color: '#0074B8', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 8px' }}>
          Master-data drift
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={acceptAllCarriedForward}
          style={{ color: '#1A7A4A', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          Accept all carried-forward
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, background: '#FAFBFC', borderBottom: '1px solid #E4E8ED', padding: '8px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Field</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prior</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>&Delta;</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decision</div>
        </div>

        {/* Rows */}
        {renewalDiffRows.map((row) => {
          const decision = diffDecisions[row.key];
          const rowBg = decision === 'accept'
            ? '#F0FAF4'
            : decision === 'reject'
            ? '#FEF2F2'
            : '#fff';

          return (
            <div
              key={row.key}
              style={{ display: 'grid', gridTemplateColumns: gridCols, borderTop: '1px solid #E4E8ED', padding: '10px 16px', background: rowBg }}
            >
              {/* Field */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 500 }}>{row.plan}</div>
                <div style={{ fontSize: 9, color: '#98A1A8' }}>{row.field}</div>
              </div>

              {/* Prior */}
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", display: 'flex', alignItems: 'center' }}>{row.prior}</div>

              {/* New */}
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", display: 'flex', alignItems: 'center', fontWeight: row.changed ? 600 : undefined }}>
                {row.current}
              </div>

              {/* Delta */}
              <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', color: row.changed ? '#B0690A' : '#DCE2E8', fontWeight: row.changed ? 500 : undefined }}>
                {row.changed ? row.delta : '—'}
              </div>

              {/* Type */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {row.changeType === 'client' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, background: '#FDECEF', color: '#C60C30', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 6px' }}>
                    Client
                  </span>
                ) : row.changeType === 'master' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, background: '#E7F1FA', color: '#0074B8', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 6px' }}>
                    Master
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#DCE2E8' }}>&mdash;</span>
                )}
              </div>

              {/* Decision */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {row.changed ? (
                  <>
                    <button
                      onClick={() => setDiff(row.key, 'accept')}
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                        background: decision === 'accept' ? '#1A7A4A' : '#fff',
                        color: decision === 'accept' ? '#fff' : '#64707A',
                        border: decision === 'accept' ? '1px solid #1A7A4A' : '1px solid #E4E8ED',
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setDiff(row.key, 'reject')}
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                        background: decision === 'reject' ? '#C60C30' : '#fff',
                        color: decision === 'reject' ? '#fff' : '#64707A',
                        border: decision === 'reject' ? '1px solid #C60C30' : '1px solid #E4E8ED',
                      }}
                    >
                      Flag
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: '#DCE2E8' }}>&mdash;</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
