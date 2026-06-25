'use client';

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface QueueItem {
  id: string;
  name: string;
  wse: number;
  carrier: string;
  status: 'validated' | 'needs_review';
}

const queue: QueueItem[] = [
  { id: 'westlake', name: 'Westlake Financial Group', wse: 312, carrier: 'BCBSTX', status: 'validated' },
  { id: 'northwind', name: 'Northwind LLC', wse: 54, carrier: 'Cigna', status: 'validated' },
  { id: 'acme', name: 'Acme Foods', wse: 112, carrier: 'Aetna', status: 'needs_review' },
  { id: 'sterling', name: 'Sterling Mfg', wse: 38, carrier: 'Aetna', status: 'validated' },
];

const validationChecks = [
  { label: 'Plan codes valid in Prism catalog', pass: true },
  { label: 'Rate tiers match source rate table (F3)', pass: true },
  { label: 'Contribution math verified (ER + EE = Total)', pass: true },
  { label: 'Client record exists in Prism (ID: 2908)', pass: true },
  { label: 'Effective date is future (Jul 1, 2026)', pass: true },
  { label: 'Open-market dental rates not in Prism — will be entered as custom rates', pass: false },
];

interface ApiStep {
  step: number;
  label: string;
  mode: 'read' | 'write';
  description: string;
  methods: string[];
}

const apiSteps: ApiStep[] = [
  {
    step: 1,
    label: 'VALIDATE',
    mode: 'read',
    description: 'Reconcile CAP plans & rates to Prism before any write',
    methods: [
      'BenefitService.getGroupBenefitTypes',
      'BenefitService.getClientBenefitPlans',
      'BenefitService.getGroupBenefitRates',
    ],
  },
  {
    step: 2,
    label: 'CONFIGURE PLANS',
    mode: 'write',
    description: 'Stand up medical/dental/vision/life + FSA/HSA plans, rates, eligibility',
    methods: [
      'BenefitService.setClientBenefitPlanSetupDetails',
      'BenefitService.setGroupBenefitBillingRates',
      'BenefitService.setGroupBenefitPremiumRates',
      'BenefitService.setBenefitRule',
    ],
  },
  {
    step: 3,
    label: 'ENROLL WSEs',
    mode: 'write',
    description: 'From CAP elections: dependents, plan selections, waivers, FSA/HSA, SBC docs',
    methods: [
      'BenefitService.getEnrollInputList',
      'BenefitService.setDependent',
      'BenefitService.enrollBenefit',
      'EmployeeService.benefitPlanSetWaive',
      'BenefitService.setFlexPlan',
      'EmployeeService.setHSA',
      'BenefitService.setEnrollmentPlanDocuments',
    ],
  },
  {
    step: 4,
    label: 'VERIFY',
    mode: 'read',
    description: 'Read back enrollments, capture confirmation #s → ClientSpace audit trail',
    methods: [
      'BenefitService.getActiveBenefitPlans',
      'BenefitService.getBenefitConfirmationList',
      'BenefitService.getBenefitConfirmationData',
      'BenefitService.getBenefitsEnrollmentTrace',
    ],
  },
];

/* ── ClientSpace track (system of record for docs/contracts) ── */

interface CsStep {
  step: number;
  label: string;
  mode: 'read' | 'write';
  description: string;
  endpoints: string[];
}

const clientSpaceSteps: CsStep[] = [
  {
    step: 1,
    label: 'DOCUMENTS',
    mode: 'write',
    description: 'Attach signed Benefits Booklet + approved CAP document to the client case',
    endpoints: [
      'PUT /api/documents/{clientId}/benefits-booklet',
      'PUT /api/documents/{clientId}/cap-document',
    ],
  },
  {
    step: 2,
    label: 'CONTRACT TERMS',
    mode: 'write',
    description: 'Write plan-year contract details incl. renewal credit terms & effective dates',
    endpoints: [
      'PUT /api/contracts/{clientId}',
      'PUT /api/contracts/{clientId}/renewal-credit',
    ],
  },
  {
    step: 3,
    label: 'COMMISSION SCHEDULE',
    mode: 'write',
    description: 'Sync commission schedule back to ClientSpace; mirror to broker of record',
    endpoints: [
      'PUT /api/contracts/{clientId}/commission-schedule',
    ],
  },
  {
    step: 4,
    label: 'AUDIT TRAIL',
    mode: 'write',
    description: 'Log approval audit note + Prism confirmation #s to the case timeline',
    endpoints: [
      'POST /api/cases/{id}/notes',
      'GET  /api/audit/{caseId}',
    ],
  },
];

const clientSpacePayload = [
  { label: 'Case ID', value: 'CS-2026-0847 (Itafos Conda · GA-2908)' },
  { label: 'Benefits Booklet', value: 'WSE_Booklet_2026.pdf · DocuSign envelope 9f3a1c' },
  { label: 'CAP Document', value: 'CAP_Westlake_2026_APPROVED.pdf · v4 (locked)' },
  { label: 'Contract Terms', value: 'Plan Year 2026-07-01 → 2027-06-30' },
  { label: 'Renewal Credit', value: '2-month rate hold · $48,200 credit applied' },
  { label: 'Commission Schedule', value: 'BOR Marsh · 4.0% PEPM · synced' },
  { label: 'Approval Audit', value: 'Client-approved Jun 22 · Sam Cho (BA) · 0 blockers' },
];

interface Comment {
  author: string;
  role: string;
  text: string;
  time: string;
}

const existingComments: Comment[] = [
  {
    author: 'Dana Whitfield',
    role: 'AM',
    text: 'Open-market dental rate confirmed with Guardian rep. Group # pending AOR.',
    time: 'Jun 20, 2:45 PM',
  },
  {
    author: 'System',
    role: 'Auto',
    text: 'Pre-write validation passed. 0 blockers.',
    time: 'Jun 22, 9:02 AM',
  },
];

/* ------------------------------------------------------------------ */
/*  Sync Overlay Component (inline)                                    */
/* ------------------------------------------------------------------ */

interface TrackRow {
  step: number;
  label: string;
  mode: 'read' | 'write';
  count: number;
}

function SyncTrack({
  title,
  subtitle,
  accent,
  accentSoftBg,
  rows,
  currentStep,
  done,
}: {
  title: string;
  subtitle: string;
  accent: string;
  accentSoftBg: string;
  rows: TrackRow[];
  currentStep: number;
  done: boolean;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        paddingBottom: 8, borderBottom: `2px solid ${accent}`,
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%', background: accent, flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: accent }}>{title}</div>
          <div style={{ fontSize: 'var(--type-caption)', color: '#374151' }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((s, i) => {
          const isDone = i < currentStep || done;
          const isActive = i === currentStep && !done;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 8,
              background: isDone ? '#F0FFF5' : isActive ? accentSoftBg : '#FAFBFC',
              border: `1px solid ${isDone ? '#C6F0D4' : isActive ? accent : '#EEF1F4'}`,
              transition: 'all 0.2s',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--type-badge)', fontWeight: 700, flexShrink: 0,
                background: isDone ? '#1A7A4A' : isActive ? accent : '#EDF0F3',
                color: isDone || isActive ? '#fff' : '#374151',
              }}>
                {isDone ? '✓' : s.step}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--type-body)', fontWeight: 600, color: '#1B2D3D' }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: 'var(--type-caption)',
                  color: isDone ? '#1A7A4A' : isActive ? accent : '#98A1A8',
                  marginTop: 1,
                }}>
                  {isDone ? `${s.count} ${s.mode === 'read' ? 'reads' : 'writes'} complete`
                    : isActive ? `Processing ${s.count} call${s.count > 1 ? 's' : ''}...`
                    : `${s.count} call${s.count > 1 ? 's' : ''} queued`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrismSyncOverlay({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useState(() => {
    let step = 0;
    const advance = () => {
      step++;
      if (step < 4) {
        setCurrentStep(step);
        setTimeout(advance, 1200 + Math.random() * 800);
      } else {
        setCurrentStep(4);
        setTimeout(() => setDone(true), 600);
      }
    };
    setTimeout(advance, 1500);
  });

  const prismRows: TrackRow[] = apiSteps.map((s) => ({
    step: s.step, label: s.label, mode: s.mode, count: s.methods.length,
  }));
  const csRows: TrackRow[] = clientSpaceSteps.map((s) => ({
    step: s.step, label: s.label, mode: s.mode, count: s.endpoints.length,
  }));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(19,33,44,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 28,
        width: 760, maxWidth: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>
            Running System Sync
          </div>
          <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginTop: 4 }}>
            Two parallel write-backs &middot; closing the loop on client approval
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <SyncTrack
            title="Prism"
            subtitle="System of record · plans / rates / enrollments"
            accent="#5A45C7"
            accentSoftBg="#F0EDFA"
            rows={prismRows}
            currentStep={currentStep}
            done={done}
          />
          <div style={{ width: 1, alignSelf: 'stretch', background: '#EEF1F4' }} />
          <SyncTrack
            title="ClientSpace"
            subtitle="System of record · documents / contracts"
            accent="#0074B8"
            accentSoftBg="#E7F1FA"
            rows={csRows}
            currentStep={currentStep}
            done={done}
          />
        </div>

        {done && (
          <div style={{
            textAlign: 'center', marginTop: 22, paddingTop: 20,
            borderTop: '1px solid #E4E8ED',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: '#1A7A4A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px', color: '#fff', fontSize: 'var(--type-display)', fontWeight: 700,
            }}>{'✓'}</div>
            <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1A7A4A' }}>
              Loop closed — Prism configured + ClientSpace updated as system of record
            </div>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap',
            }}>
              <span style={{
                ...overlayPill('#F0EDFA', '#5A45C7'),
              }}>
                Prism &middot; 18 calls &middot; 298 WSE &middot; #PRH-2026-84721
              </span>
              <span style={{
                ...overlayPill('#E7F1FA', '#0074B8'),
              }}>
                ClientSpace &middot; 7 writes &middot; Case CS-2026-0847
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: 18, height: 36, padding: '0 24px',
                background: '#1A7A4A', color: '#fff', borderRadius: 8,
                fontSize: 'var(--type-body-sm)', fontWeight: 600, border: 'none', cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function overlayPill(bg: string, fg: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center',
    fontSize: 'var(--type-badge)', fontWeight: 600,
    padding: '4px 10px', borderRadius: 9999,
    background: bg, color: fg,
    fontFamily: "'IBM Plex Mono', monospace",
  };
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function WritebackPage() {
  const [selectedId, setSelectedId] = useState('westlake');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(existingComments);
  const [showSync, setShowSync] = useState(false);

  const selected = queue.find((q) => q.id === selectedId) ?? queue[0];

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      { author: 'Sam Cho', role: 'BA', text: commentText, time: 'Just now' },
    ]);
    setCommentText('');
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #E4E8ED',
    borderRadius: 10,
    padding: 16,
  };

  const mono: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 'var(--type-caption)',
  };

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 24px' }}>

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 'var(--type-section-title)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#5A45C7' }}>
              Ben Admin Console
            </div>
            <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D', marginTop: 2 }}>
              Write-Back &amp; System Sync — Closing the Loop
            </div>
            <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 4, maxWidth: 540 }}>
              On client approval, two parallel syncs run: <strong style={{ color: '#5A45C7' }}>Prism</strong> (plans / rates / enrollments) and <strong style={{ color: '#0074B8' }}>ClientSpace</strong> (documents / contracts, system of record).
            </div>
          </div>
          {/* Cross-cutting notes */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Optimistic concurrency', detail: 'get → checksum → set' },
              { label: 'Error routing', detail: 'per-call exceptions → field-level fixes' },
              { label: 'Re-runnable', detail: 'idempotent — failed run resumes' },
            ].map((note) => (
              <div key={note.label} style={{
                padding: '4px 8px', borderRadius: 5,
                background: '#F8F6FE', border: '1px solid #ECE9FA',
                fontSize: 'var(--type-body)', color: '#5A45C7', fontWeight: 500,
                maxWidth: 160,
              }}>
                <span style={{ fontWeight: 700 }}>{note.label}:</span> {note.detail}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout: Queue + Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ──────── LEFT: Approved CAPs Queue ──────── */}
        <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #E4E8ED' }}>
            <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, margin: 0 }}>Approved CAPs</h2>
            <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 2 }}>Ready for Prism setup</div>
          </div>
          {queue.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #E4E8ED',
                  background: isSelected ? '#F5F7FA' : '#fff',
                  borderLeft: isSelected ? '3px solid #5A45C7' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>{item.name}</div>
                    <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 2 }}>
                      {item.wse} WSE &middot; {item.carrier}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                    background: item.status === 'validated' ? '#E4F2EA' : '#FBF0DD',
                    color: item.status === 'validated' ? '#1A7A4A' : '#B0690A',
                  }}>
                    {item.status === 'validated' ? 'Validated ✓' : 'Needs Review ⚠'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ──────── RIGHT: Selected CAP Detail ──────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 'var(--type-section-title)', fontWeight: 600, margin: 0 }}>{selected.name}</h1>
              <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 2 }}>
                {selected.wse} WSE &middot; {selected.carrier} &middot; Approved CAP
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                background: '#F0EDFA', color: '#5A45C7',
              }}>Prism Target</span>
              <span style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                background: '#E7F1FA', color: '#0074B8',
              }}>ClientSpace SoR</span>
              <span style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                background: selected.status === 'validated' ? '#E4F2EA' : '#FBF0DD',
                color: selected.status === 'validated' ? '#1A7A4A' : '#B0690A',
              }}>
                {selected.status === 'validated' ? 'Pre-write Validated' : 'Needs Review'}
              </span>
            </div>
          </div>

          {/* ════════ Section 1: Payload Preview ════════ */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, margin: 0 }}>Payload Preview</h2>
              <span style={{
                display: 'inline-flex', alignItems: 'center', height: 20,
                background: '#F0EDFA', color: '#5A45C7',
                fontSize: 'var(--type-badge)', fontWeight: 600, borderRadius: 4, padding: '0 8px',
              }}>Structured Data</span>
            </div>
            <div style={{ background: '#FAFBFC', borderRadius: 8, border: '1px solid #EEF1F4', overflow: 'hidden' }}>
              {[
                { label: 'Client', value: 'Westlake Financial Group (3041)' },
                { label: 'Plans', value: '5 medical, 2 dental, 1 vision' },
                { label: 'Tier Rates', value: 'EO $931.52, ES $2,022.31, EC $1,831.84, EF $2,933.04' },
                { label: 'ER Contribution', value: 'Variable 72/50%' },
                { label: 'Enrollments', value: '298 WSE · 41 waivers' },
                { label: 'Effective', value: '2025-07-01' },
                { label: 'FSA', value: 'Plan Year, Voluntary' },
                { label: 'HSA', value: '$500/$1K/$1K/$1.3K quarterly' },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '160px 1fr',
                  padding: '8px 14px', alignItems: 'center',
                  borderBottom: i < arr.length - 1 ? '1px solid #EEF1F4' : 'none',
                }}>
                  <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {row.label}
                  </div>
                  <div style={{ ...mono, fontWeight: 500, color: '#1B2D3D' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════ Section 2: Pre-Write Validation ════════ */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, margin: 0, marginBottom: 12 }}>Pre-Write Validation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {validationChecks.map((check, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '6px 0',
                  borderTop: i > 0 ? '1px solid #F1F3F5' : 'none',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--type-badge)', fontWeight: 700,
                    background: check.pass ? '#E4F2EA' : '#FBF0DD',
                    color: check.pass ? '#1A7A4A' : '#B0690A',
                  }}>
                    {check.pass ? '✓' : '⚠'}
                  </div>
                  <span style={{
                    fontSize: 'var(--type-body)', fontWeight: 500,
                    color: check.pass ? '#2D3339' : '#B0690A',
                  }}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ════════ Section 3: Two Parallel Sync Tracks ════════ */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '2px 0 2px',
          }}>
            <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, margin: 0, color: '#1B2D3D' }}>
              Two Parallel Sync Tracks
            </h2>
            <span style={{
              fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
              background: '#F5F7FA', color: '#374151',
            }}>run together on approval</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

          {/* ── Track A: PRISM ── */}
          <div style={{ ...cardStyle, borderTop: '3px solid #5A45C7' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, margin: 0, color: '#5A45C7' }}>Prism Orchestration</h2>
              <span style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: '#F0EDFA', color: '#5A45C7',
              }}>System of record · plans/rates/enrollments</span>
            </div>
            <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginBottom: 4 }}>
              PrismHR Services API &middot; BenefitService + EmployeeService
            </div>
            <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginBottom: 12, fontStyle: 'italic' }}>
              The tool becomes the interface for Prism setup, replacing manual UI field entry —
              {' '}{apiSteps.reduce((sum, s) => sum + s.methods.length, 0)} API calls across {apiSteps.length} steps.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {apiSteps.map((step) => {
                const isRead = step.mode === 'read';
                const borderColor = isRead ? '#BDD9F0' : '#FECACA';
                const bgColor = isRead ? '#F0F7FF' : '#FFF5F7';
                const labelBg = isRead ? '#E7F1FA' : '#FEF2F2';
                const labelFg = isRead ? '#0074B8' : '#C60C30';
                return (
                  <div key={step.step} style={{
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: bgColor,
                    padding: 14,
                    borderLeft: `3px solid ${labelFg}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 'var(--type-badge)', fontWeight: 700,
                        padding: '2px 8px', borderRadius: 4,
                        background: labelBg, color: labelFg,
                      }}>
                        Step {step.step} &middot; {step.label}
                      </span>
                      <span style={{
                        fontSize: 'var(--type-badge)', fontWeight: 600, padding: '1px 5px',
                        borderRadius: 3, background: labelBg, color: labelFg,
                      }}>{step.mode}</span>
                    </div>
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: 3,
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.7)',
                      borderRadius: 6,
                    }}>
                      {step.methods.map((method) => (
                        <div key={method} style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 'var(--type-caption)', color: '#1B2D3D', fontWeight: 500,
                        }}>
                          {method}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 6, fontStyle: 'italic' }}>
                      &rarr; {step.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Track B: CLIENTSPACE ── */}
          <div style={{ ...cardStyle, borderTop: '3px solid #0074B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, margin: 0, color: '#0074B8' }}>ClientSpace Sync</h2>
              <span style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: '#E7F1FA', color: '#0074B8',
              }}>System of record · documents/contracts</span>
            </div>
            <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginBottom: 4 }}>
              ClientSpace REST API &middot; Documents + Contracts + Cases
            </div>
            <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginBottom: 12, fontStyle: 'italic' }}>
              Writes the signed booklet, CAP document, contract & renewal-credit terms,
              commission schedule, and approval audit trail back as the source of truth —
              {' '}confirmed as case <strong style={{ color: '#0074B8' }}>CS-2026-0847</strong>.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {clientSpaceSteps.map((step) => (
                <div key={step.step} style={{
                  border: '1px solid #BDD9F0',
                  borderRadius: 8,
                  background: '#F0F7FF',
                  padding: 14,
                  borderLeft: '3px solid #0074B8',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 'var(--type-badge)', fontWeight: 700,
                      padding: '2px 8px', borderRadius: 4,
                      background: '#E7F1FA', color: '#0074B8',
                    }}>
                      Step {step.step} &middot; {step.label}
                    </span>
                    <span style={{
                      fontSize: 'var(--type-badge)', fontWeight: 600, padding: '1px 5px',
                      borderRadius: 3, background: '#E7F1FA', color: '#0074B8',
                    }}>{step.mode}</span>
                  </div>
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 3,
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: 6,
                  }}>
                    {step.endpoints.map((endpoint) => (
                      <div key={endpoint} style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 'var(--type-caption)', color: '#1B2D3D', fontWeight: 500,
                        whiteSpace: 'pre',
                      }}>
                        {endpoint}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 6, fontStyle: 'italic' }}>
                    &rarr; {step.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          </div>{/* end two-track grid */}

          {/* ════════ Section 3b: ClientSpace Payload / Record Summary ════════ */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, margin: 0, color: '#0074B8' }}>ClientSpace Record &mdash; What Syncs</h2>
              <span style={{
                display: 'inline-flex', alignItems: 'center', height: 20,
                background: '#E7F1FA', color: '#0074B8',
                fontSize: 'var(--type-badge)', fontWeight: 600, borderRadius: 4, padding: '0 8px',
              }}>System of Record</span>
            </div>
            <div style={{ background: '#F0F7FF', borderRadius: 8, border: '1px solid #DCEAF6', overflow: 'hidden' }}>
              {clientSpacePayload.map((row, i, arr) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '170px 1fr',
                  padding: '8px 14px', alignItems: 'center',
                  borderBottom: i < arr.length - 1 ? '1px solid #DCEAF6' : 'none',
                }}>
                  <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#0074B8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {row.label}
                  </div>
                  <div style={{ ...mono, fontWeight: 500, color: '#1B2D3D' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════ Section 4: Comments & Notes ════════ */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, margin: 0, marginBottom: 12 }}>Comments &amp; Notes</h2>

            {/* Comment input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                placeholder="Add a comment or note..."
                style={{
                  flex: 1, height: 34, border: '1px solid #DCE2E8', borderRadius: 6,
                  padding: '0 10px', fontSize: 'var(--type-body-sm)', background: '#FBFCFD', outline: 'none',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              />
              <button
                onClick={handleAddComment}
                style={{
                  height: 34, padding: '0 14px', borderRadius: 6,
                  background: '#5A45C7', color: '#fff', border: 'none',
                  fontSize: 'var(--type-body-sm)', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Post
              </button>
            </div>

            {/* Existing comments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comments.map((c, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: c.author === 'System' ? '#F5F7FA' : '#FBFCFD',
                  border: `1px solid ${c.author === 'System' ? '#E4E8ED' : '#EEF1F4'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--type-body)', fontWeight: 600, color: '#1B2D3D' }}>{c.author}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
                      background: c.author === 'System' ? '#EDF0F3' : '#E7F1FA',
                      color: c.author === 'System' ? '#374151' : '#0074B8',
                    }}>{c.role}</span>
                    <span style={{ fontSize: 'var(--type-caption)', color: '#374151', marginLeft: 'auto' }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: 'var(--type-body)', color: '#374151', lineHeight: 1.5 }}>{c.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════ Section 5: Action Buttons ════════ */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 0', borderTop: '1px solid #E4E8ED',
          }}>
            <button
              onClick={() => setShowSync(true)}
              style={{
                height: 40, padding: '0 24px',
                background: '#C60C30', color: '#fff',
                borderRadius: 8, fontSize: 'var(--type-body-sm)', fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(198,12,48,.25)',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              Run System Sync &rarr;
            </button>
            <span style={{ fontSize: 'var(--type-caption)', color: '#98A1A8', marginRight: 4 }}>
              Prism + ClientSpace in parallel
            </span>
            <button style={{
              height: 40, padding: '0 20px',
              background: '#fff', color: '#C60C30',
              borderRadius: 8, fontSize: 'var(--type-body-sm)', fontWeight: 600,
              border: '1px solid #C60C30', cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              Request Changes
            </button>
            <button style={{
              height: 40, padding: '0 20px',
              background: '#fff', color: '#374151',
              borderRadius: 8, fontSize: 'var(--type-body-sm)', fontWeight: 600,
              border: '1px solid #DCE2E8', cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              Download Payload
            </button>
            <button style={{
              height: 40, padding: '0 20px',
              background: '#fff', color: '#0074B8',
              borderRadius: 8, fontSize: 'var(--type-body-sm)', fontWeight: 600,
              border: '1px solid #0074B8', cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              Download ClientSpace Record
            </button>
          </div>

        </div>
      </div>

      {/* Sync Overlay */}
      {showSync && <PrismSyncOverlay onClose={() => setShowSync(false)} />}
    </div>
  );
}
