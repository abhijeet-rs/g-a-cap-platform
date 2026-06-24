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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(19,33,44,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32,
        width: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>
            Pushing to Prism
          </div>
          <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginTop: 4 }}>
            PrismHR Services API &middot; BenefitService + EmployeeService
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {apiSteps.map((s, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep && !done;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                background: isDone ? '#F0FFF5' : isActive ? '#F0F7FF' : '#FAFBFC',
                border: `1px solid ${isDone ? '#C6F0D4' : isActive ? '#BDD9F0' : '#EEF1F4'}`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--type-badge)', fontWeight: 700, flexShrink: 0,
                  background: isDone ? '#1A7A4A' : isActive ? '#0074B8' : '#EDF0F3',
                  color: isDone || isActive ? '#fff' : '#374151',
                }}>
                  {isDone ? '✓' : s.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>
                    Step {s.step} &middot; {s.label}
                    <span style={{
                      fontSize: 'var(--type-badge)', fontWeight: 600, marginLeft: 6,
                      padding: '1px 5px', borderRadius: 3,
                      background: s.mode === 'read' ? '#E7F1FA' : '#FEF2F2',
                      color: s.mode === 'read' ? '#0074B8' : '#C60C30',
                    }}>{s.mode}</span>
                  </div>
                  {isActive && (
                    <div style={{ fontSize: 'var(--type-body-lg)', color: '#0074B8', marginTop: 2 }}>
                      Processing {s.methods.length} API calls...
                    </div>
                  )}
                  {isDone && (
                    <div style={{ fontSize: 'var(--type-body-lg)', color: '#1A7A4A', marginTop: 2 }}>
                      {s.methods.length} calls completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {done && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: '#1A7A4A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px', color: '#fff', fontSize: 'var(--type-display)', fontWeight: 700,
            }}>{'✓'}</div>
            <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1A7A4A' }}>
              Push Complete
            </div>
            <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginTop: 4 }}>
              18 API calls &middot; 298 WSE enrolled &middot; Confirmation #PRH-2026-84721
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: 16, height: 36, padding: '0 24px',
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

  const sectionLabel: React.CSSProperties = {
    fontSize: 'var(--type-table-header)',
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: 10,
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
              Ben Admin Console &middot; Prism Write-Back
            </div>
            <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 2 }}>
              {queue.length} CAPs approved and ready for Prism setup
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
              }}>PrismHR Target</span>
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

          {/* ════════ Section 3: API Call Sequence ════════ */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, margin: 0 }}>Prism Write-Back Orchestration</h2>
              <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151' }}>
                PrismHR Services API &middot; BenefitService + EmployeeService
              </span>
            </div>
            <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginBottom: 14 }}>
              {apiSteps.reduce((sum, s) => sum + s.methods.length, 0)} total API calls across {apiSteps.length} orchestration steps
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
              Push to Prism &rarr;
            </button>
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
          </div>

        </div>
      </div>

      {/* Sync Overlay */}
      {showSync && <PrismSyncOverlay onClose={() => setShowSync(false)} />}
    </div>
  );
}
