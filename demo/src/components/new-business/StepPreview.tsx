'use client';

import { useRouter } from 'next/navigation';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { useSyncStore } from '@/stores/syncStore';
import { useUIStore } from '@/stores/uiStore';
import { plans, defaultUWParams } from '@/data/plans';
import { calculateMultiplier, calculateBilledRates } from '@/lib/rateCalculator';
import { syncSequences } from '@/data/syncSequences';
import { fmt, fmtNum } from '@/lib/formatters';
import { validationGroups } from '@/data/validation';
import AuditTrail from '@/components/shared/AuditTrail';

const workflowSteps = [
  { label: 'AM Submits', active: true },
  { label: 'Coordinator QC', active: false },
  { label: 'Client Sign-off', active: false },
  { label: 'Prism Write-back', active: false },
  { label: 'Configured', active: false },
];

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  border: '1px solid #E4E8ED',
};

const monoStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
};

const badgeSmall = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 'var(--type-badge)',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 4,
  background: bg,
  color: color,
});

export default function StepPreview() {
  const router = useRouter();
  const { company, planYear, eeCount, carrier, setSubmitted, submitted } = useNewBusinessStore();
  const goStep = useNewBusinessStore((s) => s.goStep);
  const showSync = useSyncStore((s) => s.show);
  const showToast = useUIStore((s) => s.showToast);

  const multiplier = calculateMultiplier(defaultUWParams);

  const assemblyFields = useNewBusinessStore((s) => s.assemblyFields);
  const dentalRateAccepted = useNewBusinessStore((s) => s.dentalRateAccepted);

  const uwComplete = (assemblyFields['Underwriting__Bucket'] || '').length > 0
    && (assemblyFields['Underwriting__Admin Factor'] || '').length > 0;

  const errorCount = validationGroups
    .flatMap((g) => g.checks)
    .filter((c) => {
      if (c.label === 'UW parameters complete' && uwComplete) return false;
      if (c.label === 'Dental EO matches carrier quote' && dentalRateAccepted) return false;
      return c.status === 'error';
    }).length;

  const submitBlocked = errorCount > 0;

  // Calculate est annual ER
  let estAnnualER = 0;
  const planDetails = plans.map((plan) => {
    const isMaster = plan.masterOrOpen === 'Master';
    const billed = isMaster ? calculateBilledRates(plan.base, defaultUWParams) : plan.base;
    const billedEo = billed.eo;
    const erAmount = billedEo * (plan.erPct / 100);
    const eeCountNum = parseInt(eeCount) || 298; // fallback to 298
    const annualContrib = erAmount * eeCountNum * 12;
    estAnnualER += annualContrib;
    return { plan, billedEo, erAmount };
  });

  const handleGenerateBooklet = () => {
    const seq = syncSequences.generateBooklet;
    showSync(seq.title, seq.steps, () => {
      showToast('Benefits booklet generated successfully', 'success');
    });
  };

  const handleSubmit = () => {
    if (submitBlocked) return;
    const seq = syncSequences.nbSubmit;
    showSync(seq.title, seq.steps, () => {
      setSubmitted(true);
      showToast('CAP submitted for coordinator review', 'success');
      router.push('/dashboard');
    });
  };

  /* ── NB9 Ben Admin Handoff (post-submit) ── */
  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D', margin: 0 }}>
                BEN ADMIN HANDOFF
              </h3>
              <span style={badgeSmall('#F0EDFA', '#5A45C7')}>NB9</span>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 24,
              background: '#E4F2EA', color: '#1A7A4A', fontSize: 'var(--type-badge)', fontWeight: 600,
              borderRadius: 6, padding: '0 10px',
            }}>
              Submitted for Review
            </span>
          </div>

          <div style={{ borderTop: '2px solid #5A45C7', paddingTop: 16 }}>
            <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#5A45C7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              Structured Prism Payload
            </div>
            <div style={{
              background: '#FAFBFC', border: '1px solid #EEF1F4', borderRadius: 8,
              padding: 0, overflow: 'hidden',
            }}>
              {[
                { label: 'Client', value: `${company} (GA-2908)` },
                { label: 'Plans', value: `${plans.length} configured` },
                ...plans.map((p) => {
                  const isMaster = p.masterOrOpen === 'Master';
                  const billed = isMaster ? calculateBilledRates(p.base, defaultUWParams) : p.base;
                  return { label: `${p.carrier} ${p.plan}`, value: `$${billed.eo.toFixed(2)}/mo` };
                }),
                { label: 'Contribution', value: `Variable ${plans[0]?.erPct ?? 72}% ER` },
                { label: 'Annual Deductions', value: '24' },
                { label: 'ACA Affordable', value: '✓' },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '180px 1fr',
                  padding: '8px 14px',
                  borderBottom: i < arr.length - 1 ? '1px solid #EEF1F4' : 'none',
                  alignItems: 'center',
                }}>
                  <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace", color: '#1B2D3D' }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Downstream Systems */}
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
            Downstream Systems
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { system: 'Prism client config', action: 'ready for write-back', done: true },
              { system: 'WorkSight enrollment portal', action: 'ready for sync', done: true },
              { system: 'ClientSpace case', action: 'created (CASE-2026-0847)', done: true },
              { system: 'Payroll deduction audit', action: 'scheduled', done: true },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i > 0 ? '1px solid #EEF1F4' : 'none',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--type-body-sm)', flexShrink: 0,
                  background: '#E4F2EA', color: '#1A7A4A',
                }}>
                  &#x2713;
                </div>
                <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>
                  {item.system}
                </span>
                <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>
                  &mdash; {item.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSubmitted(false)}
            style={{
              height: 38, padding: '0 20px', borderRadius: 6,
              border: '1px solid #DCE2E8', fontSize: 'var(--type-body-sm)', fontWeight: 600,
              color: '#374151', background: '#fff', cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            &larr; Back to CAP
          </button>
          <button
            onClick={() => showToast('Prism payload generated', 'success')}
            style={{
              height: 38, padding: '0 20px', background: '#5A45C7', color: '#fff',
              borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
              border: 'none', cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            Generate Prism Payload
          </button>
          <button
            onClick={() => showToast('Opening ClientSpace case...', 'info')}
            style={{
              height: 38, padding: '0 20px', borderRadius: 6,
              border: '1px solid #5A45C7', fontSize: 'var(--type-body-sm)', fontWeight: 600,
              color: '#5A45C7', background: '#fff', cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            View in ClientSpace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Workflow status bar */}
      <div
        style={{
          ...cardStyle,
          height: 54,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          marginBottom: 16,
        }}
      >
        {workflowSteps.map((ws, i) => (
          <div key={ws.label} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Circle */}
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--type-badge)',
                fontWeight: 600,
                flexShrink: 0,
                background: ws.active ? '#C60C30' : '#EDF0F3',
                color: ws.active ? '#fff' : '#374151',
              }}
            >
              {i + 1}
            </div>
            {/* Label */}
            <span
              style={{
                fontSize: 'var(--type-body-sm)',
                marginLeft: 6,
                whiteSpace: 'nowrap',
                fontWeight: ws.active ? 600 : 400,
                color: ws.active ? '#1B2D3D' : '#374151',
              }}
            >
              {ws.label}
            </span>
            {/* Arrow */}
            {i < workflowSteps.length - 1 && (
              <span style={{ color: '#CBD2D9', margin: '0 12px', fontSize: 'var(--type-body-sm)' }}>&#8594;</span>
            )}
          </div>
        ))}
      </div>

      {/* ClientSpace Case Card */}
      <div style={{ ...cardStyle, padding: 20 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #E4E8ED',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>ClientSpace PRO</span>
            <span style={{ color: '#374151', fontSize: 'var(--type-body-sm)' }}>&middot;</span>
            <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>Case Management</span>
          </div>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 'var(--type-badge)', fontWeight: 600, color: '#0074B8',
            background: '#E7F1FA', padding: '3px 8px', borderRadius: 4,
          }}>CS-2026-1847</span>
        </div>

        {/* Case Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Case Type', value: 'New Business Onboarding' },
            { label: 'Client', value: `${company} (GA-2908)` },
            { label: 'Status', value: null, custom: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#B0690A' }} />
                <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#B0690A' }}>Open &mdash; Pending AM Submission</span>
              </div>
            )},
            { label: 'Assigned To', value: 'Dana Whitfield (AM)' },
            { label: 'Created', value: 'Jun 18, 2026 9:14 AM' },
            { label: 'SLA', value: '5 business days' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {row.label}
              </span>
              {row.custom ?? <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{row.value}</span>}
            </div>
          ))}
        </div>

        {/* Case Timeline */}
        <div style={{ borderTop: '1px solid #E4E8ED', paddingTop: 14, marginBottom: 14 }}>
          <div style={{
            fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151',
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10,
          }}>Case Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { done: true, time: 'Jun 18 9:14 AM', text: 'Case auto-created from CAP intake' },
              { done: true, time: 'Jun 18 9:17 AM', text: 'Documents attached (3 files)' },
              { done: true, time: 'Jun 20 2:30 PM', text: 'Rate table validated (system)' },
              { done: false, time: 'Pending', text: 'AM submission for coordinator review' },
            ].map((evt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', marginTop: 1,
                  background: evt.done ? '#1A7A4A' : '#E4E8ED',
                  border: evt.done ? 'none' : '2px solid #DCE2E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: '#fff', flexShrink: 0,
                }}>
                  {evt.done && <span>&#x2713;</span>}
                </div>
                <div>
                  <span style={{
                    fontSize: 'var(--type-caption)', fontWeight: 600,
                    color: evt.done ? '#374151' : '#B0690A',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>{evt.time}</span>
                  <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginLeft: 8 }}>{evt.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* On Submit info */}
        <div style={{
          background: '#FAFBFC', border: '1px solid #EEF1F4', borderRadius: 8,
          padding: 12,
        }}>
          <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', marginBottom: 6 }}>On Submit:</div>
          <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', lineHeight: 1.6 }}>
            Case advances to &ldquo;Coordinator QC&rdquo; stage<br />
            &#x2192; Assigned to: Lena Ortiz (Coordinator)<br />
            &#x2192; ClientSpace benefits page updated<br />
            &#x2192; Commission tracking initiated
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div style={{ ...cardStyle, padding: 20 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h3 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
              {company}
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 'var(--type-body-sm)',
                color: '#374151',
              }}
            >
              <span>
                Plan Year: <strong>{planYear}</strong>
              </span>
              <span>&middot;</span>
              <span>
                EEs: <strong>{eeCount}</strong>
              </span>
              <span>&middot;</span>
              <span>
                Carrier: <strong>{carrier}</strong>
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 'var(--type-table-header)',
                color: '#374151',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              Est. Annual ER
            </div>
            <div
              style={{
                fontSize: 'var(--type-body-sm)',
                fontWeight: 600,
                color: '#1A7A4A',
                ...monoStyle,
              }}
            >
              ${fmtNum(Math.round(estAnnualER))}
            </div>
          </div>
        </div>

        {/* Plan rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {planDetails.map(({ plan, billedEo }) => {
            const isMaster = plan.masterOrOpen === 'Master';
            return (
              <div
                key={plan.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderTop: '1px solid #F1F3F5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={
                      isMaster
                        ? badgeSmall('#E7F1FA', '#0074B8')
                        : badgeSmall('#FBF0DD', '#B0690A')
                    }
                  >
                    {plan.masterOrOpen}
                  </span>
                  <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>
                    {plan.carrier} {plan.plan}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>ER {plan.erPct}%</span>
                  <span
                    style={{
                      fontSize: 'var(--type-body-sm)',
                      ...monoStyle,
                      fontWeight: 600,
                      color: '#1B2D3D',
                    }}
                  >
                    EO: ${billedEo.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation blocker banner */}
      {submitBlocked && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#C60C30',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--type-badge)',
              fontWeight: 700,
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            !
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 'var(--type-body-sm)',
                fontWeight: 600,
                color: '#991B1B',
                marginBottom: 4,
              }}
            >
              Cannot submit &mdash; {errorCount} error{errorCount !== 1 ? 's' : ''} block Ben Admin handoff
            </div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: '#B91C1C', lineHeight: 1.5 }}>
              Go to{' '}
              <span
                onClick={() => goStep(5)}
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Step 5 (Readiness)
              </span>{' '}
              to resolve.
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleGenerateBooklet}
          style={{
            height: 38,
            padding: '0 20px',
            borderRadius: 6,
            border: '1px solid #DCE2E8',
            fontSize: 'var(--type-body-sm)',
            fontWeight: 600,
            color: '#374151',
            background: '#fff',
            cursor: 'pointer',
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          Generate Booklet
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitBlocked}
          title={
            submitBlocked
              ? `Resolve ${errorCount} validation error${errorCount !== 1 ? 's' : ''} before submitting`
              : undefined
          }
          style={{
            height: 38,
            padding: '0 20px',
            background: '#C60C30',
            color: '#fff',
            borderRadius: 6,
            fontSize: 'var(--type-body-sm)',
            fontWeight: 600,
            boxShadow: submitBlocked ? 'none' : '0 3px 10px rgba(198,12,48,.2)',
            border: 'none',
            cursor: submitBlocked ? 'not-allowed' : 'pointer',
            opacity: submitBlocked ? 0.5 : 1,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          {submitBlocked
            ? `${errorCount} error${errorCount !== 1 ? 's' : ''} block submission`
            : 'Submit for Review →'}
        </button>
      </div>

      {/* Audit Trail */}
      <AuditTrail entityId="cap-itafos-2026" />
    </div>
  );
}
