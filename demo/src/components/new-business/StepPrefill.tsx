'use client';

import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { clients } from '@/data/clients';

interface PrefillData {
  carrier: string;
  effDate: string;
  contribStrategy: string;
  planLineup: string[];
  priorWSE: number;
  currentWSE: number;
  csaBroker: string;
  csaCommission: string;
  crosswalk: { old: string; new: string; plan: string }[];
}

/* Representative prefill data — mirrors renewal/page.tsx examples */
const prefillByClient: Record<string, PrefillData> = {
  westlake: {
    carrier: 'BCBSTX',
    effDate: '2025-07-01',
    contribStrategy: 'Variable',
    planLineup: ['Medical PPO $500', 'Dental PPO $1500', 'Vision Base PPO'],
    priorWSE: 304,
    currentWSE: 312,
    csaBroker: 'Lockton Companies',
    csaCommission: '3.0% of premium',
    crosswalk: [
      { old: 'BCBS-PPO-500-2025', new: 'BCBS-PPO-500-2026', plan: 'Medical PPO $500' },
      { old: 'BCBS-DEN-1500-2025', new: 'BCBS-DEN-1500-2026', plan: 'Dental PPO $1500' },
      { old: 'VSP-BASE-2025', new: 'VSP-BASE-2026', plan: 'Vision Base PPO' },
    ],
  },
  sterling: {
    carrier: 'Aetna',
    effDate: '2025-07-01',
    contribStrategy: 'Flat Dollar',
    planLineup: ['Medical HMO $750', 'Dental DHMO'],
    priorWSE: 36,
    currentWSE: 38,
    csaBroker: 'USI Insurance Services',
    csaCommission: '4.0% of premium',
    crosswalk: [
      { old: 'AET-HMO-750-2025', new: 'AET-HMO-750-2026', plan: 'Medical HMO $750' },
      { old: 'AET-DHMO-2025', new: 'AET-DHMO-2026', plan: 'Dental DHMO' },
    ],
  },
  harbor: {
    carrier: 'UnitedHealthcare',
    effDate: '2025-07-20',
    contribStrategy: 'Base Plan',
    planLineup: ['Medical PPO $1000', 'Dental PPO $2000', 'Vision Enhanced'],
    priorWSE: 84,
    currentWSE: 89,
    csaBroker: 'Marsh McLennan Agency',
    csaCommission: '3.5% of premium',
    crosswalk: [
      { old: 'UHC-PPO-1000-2025', new: 'UHC-PPO-1000-2026', plan: 'Medical PPO $1000' },
      { old: 'UHC-DEN-2000-2025', new: 'UHC-DEN-2000-2026', plan: 'Dental PPO $2000' },
      { old: 'VSP-ENH-2025', new: 'VSP-ENH-2026', plan: 'Vision Enhanced' },
    ],
  },
};

function getPrefill(clientId: string | null): PrefillData {
  if (clientId && prefillByClient[clientId]) return prefillByClient[clientId];
  const client = clients.find((c) => c.id === clientId);
  return {
    carrier: 'BCBSTX',
    effDate: '2025-07-01',
    contribStrategy: 'Variable',
    planLineup: ['Medical PPO $500', 'Dental PPO $1000'],
    priorWSE: Math.max((client?.wse ?? 100) - 8, 0),
    currentWSE: client?.wse ?? 100,
    csaBroker: 'On file in ClientSpace',
    csaCommission: '3.0% of premium',
    crosswalk: [
      { old: 'BCBS-PPO-500-2025', new: 'BCBS-PPO-500-2026', plan: 'Medical PPO $500' },
      { old: 'BCBS-DEN-1000-2025', new: 'BCBS-DEN-1000-2026', plan: 'Dental PPO $1000' },
    ],
  };
}

const cardStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 20,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
};

const monoStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--type-body)',
};

export default function StepPrefill() {
  const clientId = useNewBusinessStore((s) => s.clientId);
  const clientName = useNewBusinessStore((s) => s.clientName);
  const next = useNewBusinessStore((s) => s.next);
  const data = getPrefill(clientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Pre-fill Summary */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>Pre-fill Summary</h2>
          <span style={{
            fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            background: '#F8F6FE', color: '#5A45C7', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>Renewal</span>
        </div>
        <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 0, marginBottom: 16, lineHeight: 1.5 }}>
          {clientName || 'This client'}&apos;s baseline carried forward from the prior plan year and the Prism client record. Review the pre-filled values before reconciling the year-over-year diff.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Prior-year CAP info */}
          <div style={{ background: '#FAFBFC', borderRadius: 8, padding: 14, border: '1px solid #EEF1F4' }}>
            <div style={sectionLabelStyle}>Prior-Year CAP</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>Plan Lineup</div>
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{data.planLineup.join(', ')}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>Contribution Strategy</div>
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{data.contribStrategy}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>Prior WSE Count</div>
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{data.priorWSE}</div>
              </div>
            </div>
          </div>

          {/* Prism client record */}
          <div style={{ background: '#FAFBFC', borderRadius: 8, padding: 14, border: '1px solid #EEF1F4' }}>
            <div style={sectionLabelStyle}>Prism Client Record</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>Carrier</div>
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{data.carrier}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>Effective Date</div>
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{data.effDate}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>Current WSE Count</div>
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{data.currentWSE}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ClientSpace pulled callout */}
      <div style={{
        background: '#F0F7FF', border: '1px solid #E7F1FA', borderRadius: 10, padding: 16,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#0074B8', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700,
        }}>&#x21BB;</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#0074B8' }}>Client data synced from ClientSpace</span>
            <span style={{
              fontSize: 'var(--type-badge)', fontWeight: 600, padding: '1px 7px', borderRadius: 4,
              background: '#E7F1FA', color: '#0074B8',
            }}>Updated census on file</span>
          </div>
          <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: 0, lineHeight: 1.5 }}>
            Renewal census, contacts and prior documents are pulled automatically from ClientSpace &mdash; no manual upload required. The current-year CSA is on file with broker <strong style={{ color: '#1B2D3D' }}>{data.csaBroker}</strong> at {data.csaCommission}.
          </p>
        </div>
      </div>

      {/* Plan-Code Crosswalk */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', marginTop: 0, marginBottom: 12 }}>Plan-Code Crosswalk Migration</h2>
        <div style={{ background: '#FAFBFC', borderRadius: 8, border: '1px solid #EEF1F4', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', padding: '8px 14px', borderBottom: '1px solid #EEF1F4' }}>
            <div style={sectionLabelStyle}>Old Code</div>
            <div style={sectionLabelStyle}>New Code</div>
            <div style={sectionLabelStyle}>Plan</div>
          </div>
          {data.crosswalk.map((row, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', padding: '8px 14px',
              borderBottom: i < data.crosswalk.length - 1 ? '1px solid #EEF1F4' : 'none', alignItems: 'center',
            }}>
              <div style={{ ...monoStyle, color: '#374151', textDecoration: 'line-through' }}>{row.old}</div>
              <div style={{ ...monoStyle, color: '#1A7A4A', fontWeight: 600 }}>{row.new}</div>
              <div style={{ fontSize: 'var(--type-body-sm)', color: '#1B2D3D' }}>{row.plan}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section nav (footer also drives next) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={next}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#A80A28'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#C60C30'; }}
          style={{
            height: 38, padding: '0 22px', background: '#C60C30', color: '#fff',
            borderRadius: 8, fontSize: 'var(--type-body-sm)', fontWeight: 600,
            border: 'none', cursor: 'pointer', boxShadow: '0 3px 10px rgba(198,12,48,.2)',
            fontFamily: "'IBM Plex Sans', sans-serif", transition: 'background .12s',
          }}
        >
          Continue to YoY Diff &rarr;
        </button>
      </div>
    </div>
  );
}
