'use client';

import { useState } from 'react';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { clients } from '@/data/clients';

/* Urgency color thresholds per spec */
function urgencyColor(days: number): string {
  if (days < 20) return '#C60C30';
  if (days < 40) return '#B0690A';
  return '#1A7A4A';
}

export default function CapBuilderLanding() {
  const startNew = useNewBusinessStore((s) => s.startNew);
  const startRenewal = useNewBusinessStore((s) => s.startRenewal);
  const [query, setQuery] = useState('');

  const sorted = [...clients].sort((a, b) => a.urgDays - b.urgDays);
  const filtered = sorted.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.prism.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 24px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 'var(--type-table-header)', textTransform: 'uppercase',
          letterSpacing: '0.05em', fontWeight: 700, color: '#C60C30', marginBottom: 4,
        }}>
          CAP Builder
        </div>
        <h1 style={{ fontSize: 'var(--type-display)', fontWeight: 700, color: '#1B2D3D', margin: 0 }}>
          Build a Client Approved Plan
        </h1>
        <p style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 6, marginBottom: 0 }}>
          Start a new client CAP or renew an existing one &mdash; one unified flow.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* ──────── Renew an existing client ──────── */}
        <div style={{
          background: '#fff', border: '1px solid #E4E8ED', borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #E4E8ED' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
                Renew an existing client
              </h2>
              <span style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                background: '#F8F6FE', color: '#5A45C7',
              }}>
                {sorted.length} clients
              </span>
            </div>
            <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: 0 }}>
              Prior-year CAP, plan lineup and Prism record pre-fill automatically.
            </p>
            {/* Search */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by client name or Prism ID…"
              style={{
                width: '100%', height: 36, marginTop: 12,
                border: '1px solid #DCE2E8', borderRadius: 8, padding: '0 12px',
                fontSize: 'var(--type-body-sm)', background: '#FBFCFD', outline: 'none',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            />
          </div>

          <div style={{ maxHeight: 440, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '24px 18px', fontSize: 'var(--type-body-sm)', color: '#98A1A8', textAlign: 'center' }}>
                No clients match &ldquo;{query}&rdquo;
              </div>
            )}
            {filtered.map((c, i) => {
              const urg = urgencyColor(c.urgDays);
              return (
                <button
                  key={c.id}
                  onClick={() => startRenewal(c.id, c.name)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FAFBFC'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                    padding: '12px 18px', background: '#fff', cursor: 'pointer',
                    border: 'none', borderTop: i > 0 ? '1px solid #F1F3F5' : 'none',
                    transition: 'background 0.15s', fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {/* Renewal date badge */}
                  <div style={{
                    width: 42, height: 46, borderRadius: 7, flexShrink: 0,
                    background: `${urg}12`, border: `1px solid ${urg}30`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: urg, lineHeight: 1 }}>{c.renewDay}</div>
                    <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: urg, textTransform: 'uppercase' }}>{c.renewMon}</div>
                  </div>

                  {/* Client info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--type-caption)', color: '#374151' }}>{c.prism}</span>
                      <span style={{ color: '#DCE2E8' }}>&middot;</span>
                      <span style={{ fontSize: 'var(--type-caption)', color: '#374151' }}>{c.tier}</span>
                      <span style={{ color: '#DCE2E8' }}>&middot;</span>
                      <span style={{ fontSize: 'var(--type-caption)', color: '#374151' }}>{c.wse} WSE</span>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: urg }}>{c.urgDays}d</div>
                    <div style={{ fontSize: 'var(--type-caption)', color: '#98A1A8' }}>{c.renewMon} {c.renewDay}</div>
                  </div>

                  <span style={{ fontSize: 'var(--type-body-lg)', color: '#C60C30', flexShrink: 0 }}>&rarr;</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ──────── Start a new client CAP ──────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button
            onClick={startNew}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C60C30'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(198,12,48,.12)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E4E8ED'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
              textAlign: 'left', width: '100%', cursor: 'pointer',
              background: '#FFF5F7', border: '1px solid #E4E8ED', borderRadius: 12, padding: 20,
              transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#C60C30',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 600, lineHeight: 1,
            }}>
              +
            </div>
            <div>
              <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>
                Start a new client CAP
              </div>
              <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 4, lineHeight: 1.45 }}>
                For a brand-new client with no existing record. Begins with a blank intake &mdash; seed info and document upload.
              </div>
            </div>
            <span style={{
              marginTop: 4, fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#C60C30',
            }}>
              New Business intake &rarr;
            </span>
          </button>

          {/* Helper / context card */}
          <div style={{
            background: '#F0F7FF', border: '1px solid #E7F1FA', borderRadius: 12, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: '#E7F1FA', color: '#0074B8', textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                ClientSpace
              </span>
              <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#0074B8' }}>Data syncs automatically</span>
            </div>
            <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: 0, lineHeight: 1.5 }}>
              Census, contacts and prior contracts are pulled from ClientSpace &mdash; you never upload census manually. The CSA (Client Service Agreement) is the only document you provide at intake.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
