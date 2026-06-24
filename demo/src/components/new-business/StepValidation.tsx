'use client';

import { useState, useCallback } from 'react';
import { validationGroups } from '@/data/validation';
import { useNewBusinessStore } from '@/stores/newBusinessStore';

/* ── detail text per check label ── */
const detailMap: Record<string, string> = {
  'All required fields populated':
    'All 24 required fields have values. No "Needs input" or "Action Needed" sentinels found.',
  'At least one medical plan configured':
    '2 medical plans configured: BCBS Texas PPO $500 80%, BCBS Texas HDHP $3300 90%.',
  'UW parameters complete':
    'The Bucket and Admin Factor fields in Step 3 (Assembly) are still set to "Needs input". Both must be filled before handoff.',
  'PPO $500 EO matches BCBSTX 2026':
    'PPO $500 Employee-Only rate of $847.22 matches the BCBS Texas 2026 rate table within 0.01% tolerance.',
  'HDHP $3300 matches BCBSTX 2026':
    'HDHP $3300 Employee-Only rate of $712.05 matches the BCBS Texas 2026 rate table within 0.01% tolerance.',
  'Dental EO matches carrier quote':
    'Dental Employee-Only rate $29.00 does not match the Guardian TX 2026 quoted rate of $27.50. Variance is +$1.50 (5.5%).',
  'Open-market SBCs complete':
    'Voluntary Life SBC document has not been uploaded. Upload is recommended but not required for handoff.',
  'ER + EE = Total':
    'Employer + Employee contribution splits sum to 100% of premium for all configured tiers.',
  'ACA affordability (F5 threshold $129.90/mo)':
    'Lowest-cost EE-only plan is $118.44/mo, which is below the $129.90/mo affordability threshold (9.02% safe harbor).',
  'Booklet/CAP rates match':
    'All rates in the generated Booklet and CAP document match the rate assembly output within $0.01.',
};

export default function StepValidation() {
  const goStep = useNewBusinessStore((s) => s.goStep);
  const assemblyFields = useNewBusinessStore((s) => s.assemblyFields);
  const dentalRateAccepted = useNewBusinessStore((s) => s.dentalRateAccepted);
  const storeDismissedWarnings = useNewBusinessStore((s) => s.dismissedWarnings);
  const acceptDentalRate = useNewBusinessStore((s) => s.acceptDentalRate);
  const dismissWarningStore = useNewBusinessStore((s) => s.dismissWarning);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [fixPanelsShown, setFixPanelsShown] = useState<Set<string>>(new Set());
  const [rerunning, setRerunning] = useState(false);

  const dismissedWarnings = new Set(storeDismissedWarnings);

  // Dynamic validation: compute checks from store state
  const uwBucket = assemblyFields['Underwriting__Bucket'] || '';
  const uwAF = assemblyFields['Underwriting__Admin Factor'] || '';
  const uwComplete = uwBucket.length > 0 && uwAF.length > 0;

  const dynamicGroups = validationGroups.map(g => ({
    ...g,
    checks: g.checks.map(c => {
      if (c.label === 'UW parameters complete') {
        return uwComplete
          ? { ...c, status: 'pass' as const, message: undefined }
          : c;
      }
      if (c.label === 'Dental EO matches carrier quote') {
        return dentalRateAccepted
          ? { ...c, status: 'pass' as const, message: undefined }
          : c;
      }
      return c;
    }),
  }));

  /* ── counts ── */
  let totalErrors = 0;
  let totalPasses = 0;
  let totalWarnings = 0;
  let totalChecks = 0;

  dynamicGroups.forEach((g) =>
    g.checks.forEach((c) => {
      totalChecks++;
      if (c.status === 'error') totalErrors++;
      else if (c.status === 'pass') totalPasses++;
      else if (c.status === 'warning') {
        if (!dismissedWarnings.has(c.label)) totalWarnings++;
        else totalPasses++;
      }
    })
  );

  const hasErrors = totalErrors > 0;
  const progressPct = totalChecks > 0 ? Math.round((totalPasses / totalChecks) * 100) : 0;

  /* ── handlers ── */
  const toggleExpand = useCallback((label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const toggleFixPanel = useCallback((label: string) => {
    setFixPanelsShown((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const dismissWarning = useCallback((label: string) => {
    dismissWarningStore(label);
  }, [dismissWarningStore]);

  const handleRerun = useCallback(() => {
    setRerunning(true);
    setTimeout(() => setRerunning(false), 1200);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Readiness summary banner ── */}
      <div
        style={{
          borderRadius: 10,
          border: hasErrors
            ? '1px solid rgba(198,12,48,0.2)'
            : '1px solid rgba(26,122,74,0.2)',
          padding: 20,
          background: hasErrors ? '#FDECEF' : '#E4F2EA',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Top row: icon + text + re-run button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--type-section-title)',
              fontWeight: 600,
              color: '#fff',
              flexShrink: 0,
              background: hasErrors ? '#C60C30' : '#1A7A4A',
            }}
          >
            {hasErrors ? '✕' : '✓'}
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 'var(--type-section-title)',
                fontWeight: 600,
                color: hasErrors ? '#C60C30' : '#1A7A4A',
              }}
            >
              {hasErrors ? 'Validation Issues' : 'Ready for Handoff'}
            </div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 2 }}>
              {hasErrors
                ? `${totalErrors} error(s) block handoff · ${totalPasses} check(s) passed`
                : 'All checks passed'}
              {totalWarnings > 0 && ` · ${totalWarnings} warning(s)`}
            </div>
          </div>

          {/* Re-run Validation button */}
          <button
            onClick={handleRerun}
            disabled={rerunning}
            style={{
              padding: '6px 14px',
              fontSize: 'var(--type-body-sm)',
              fontWeight: 600,
              borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.12)',
              background: '#fff',
              color: '#1B2D3D',
              cursor: rerunning ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
              opacity: rerunning ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {rerunning ? (
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  border: '2px solid #ccc',
                  borderTopColor: '#1B2D3D',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }}
              />
            ) : (
              <span style={{ fontSize: 'var(--type-body-sm)' }}>↻</span>
            )}
            {rerunning ? 'Running...' : 'Re-run Validation'}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: 'rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                borderRadius: 3,
                background: hasErrors
                  ? `linear-gradient(90deg, #1A7A4A ${Math.min(progressPct, 100)}%, #C60C30 100%)`
                  : '#1A7A4A',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 'var(--type-section-title)',
              fontWeight: 600,
              color: hasErrors ? '#C60C30' : '#1A7A4A',
              flexShrink: 0,
              minWidth: 32,
              textAlign: 'right',
            }}
          >
            {progressPct}%
          </span>
        </div>
      </div>

      {/* ── Validation groups ── */}
      {dynamicGroups.map((group) => (
        <div
          key={group.title}
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #E4E8ED',
            padding: 20,
          }}
        >
          <h3
            style={{
              fontSize: 'var(--type-table-header)',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#374151',
              letterSpacing: '0.04em',
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            {group.title}
          </h3>

          <div>
            {group.checks.map((check, i) => {
              const isDismissed =
                check.status === 'warning' && dismissedWarnings.has(check.label);
              if (isDismissed) return null;

              const isExpanded = expandedItems.has(check.label);
              const isFixShown = fixPanelsShown.has(check.label);
              const detail = detailMap[check.label];

              return (
                <div
                  key={check.label}
                  style={{
                    borderTop: i > 0 ? '1px solid #F1F3F5' : 'none',
                    borderLeft:
                      check.status === 'pass'
                        ? '3px solid #1A7A4A'
                        : '3px solid transparent',
                    paddingLeft: check.status === 'pass' ? 10 : 13,
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Main row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 0',
                    }}
                  >
                    {/* Status icon */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--type-section-title)',
                        fontWeight: 600,
                        flexShrink: 0,
                        background:
                          check.status === 'pass'
                            ? '#E4F2EA'
                            : check.status === 'error'
                            ? '#FDECEF'
                            : '#FBF0DD',
                        color:
                          check.status === 'pass'
                            ? '#1A7A4A'
                            : check.status === 'error'
                            ? '#C60C30'
                            : '#B0690A',
                      }}
                    >
                      {check.status === 'pass'
                        ? '✓'
                        : check.status === 'error'
                        ? '✕'
                        : '⚠'}
                    </div>

                    {/* Label + message (clickable to expand) */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        cursor: detail ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={() => detail && toggleExpand(check.label)}
                    >
                      <div
                        style={{
                          fontSize: 'var(--type-body-sm)',
                          fontWeight: 500,
                          color: '#1B2D3D',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {check.label}
                        {detail && (
                          <span
                            style={{
                              fontSize: 8,
                              color: '#8899A6',
                              transform: isExpanded
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                              transition: 'transform 0.2s',
                              display: 'inline-block',
                            }}
                          >
                            ▼
                          </span>
                        )}
                      </div>
                      {check.message && (
                        <div
                          style={{
                            fontSize: 'var(--type-body-sm)',
                            fontFamily: "'IBM Plex Mono', monospace",
                            marginTop: 2,
                            color:
                              check.status === 'error'
                                ? '#C60C30'
                                : '#B0690A',
                          }}
                        >
                          {check.message}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {check.status === 'error' && (
                      <button
                        onClick={() => toggleFixPanel(check.label)}
                        style={{
                          padding: '3px 10px',
                          fontSize: 'var(--type-body-sm)',
                          fontWeight: 600,
                          borderRadius: 4,
                          border: '1px solid rgba(198,12,48,0.3)',
                          background: isFixShown ? '#C60C30' : '#FDECEF',
                          color: isFixShown ? '#fff' : '#C60C30',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s',
                        }}
                      >
                        {isFixShown ? 'Close' : 'Fix'}
                      </button>
                    )}

                    {check.status === 'warning' && (
                      <button
                        onClick={() => dismissWarning(check.label)}
                        style={{
                          padding: '3px 10px',
                          fontSize: 'var(--type-body-sm)',
                          fontWeight: 600,
                          borderRadius: 4,
                          border: '1px solid rgba(176,105,10,0.3)',
                          background: '#FBF0DD',
                          color: '#B0690A',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && detail && (
                    <div
                      style={{
                        fontSize: 'var(--type-body-sm)',
                        color: '#374151',
                        background: '#F7F9FB',
                        borderRadius: 6,
                        padding: '8px 12px',
                        margin: '0 0 8px 30px',
                        lineHeight: 1.5,
                        borderLeft: '2px solid #D2D8DE',
                      }}
                    >
                      {detail}
                    </div>
                  )}

                  {/* Fix suggestion panel for "UW parameters complete" */}
                  {isFixShown &&
                    check.label === 'UW parameters complete' && (
                      <div
                        style={{
                          background: '#FFF5F7',
                          border: '1px solid rgba(198,12,48,0.15)',
                          borderRadius: 8,
                          padding: '12px 16px',
                          margin: '0 0 8px 30px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 'var(--type-label)',
                            fontWeight: 600,
                            color: '#C60C30',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          Suggested Fix
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--type-body-sm)',
                            color: '#1B2D3D',
                            lineHeight: 1.5,
                          }}
                        >
                          Navigate to Step 3 (Assembly) to fill Bucket and Admin
                          Factor fields.
                        </div>
                        <div>
                          <button
                            onClick={() => goStep(3)}
                            style={{
                              padding: '6px 16px',
                              fontSize: 'var(--type-body-sm)',
                              fontWeight: 600,
                              borderRadius: 6,
                              border: 'none',
                              background: '#C60C30',
                              color: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Go to Step 3
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Fix suggestion panel for "Dental EO matches carrier quote" */}
                  {isFixShown &&
                    check.label === 'Dental EO matches carrier quote' && (
                      <div
                        style={{
                          background: '#FFF5F7',
                          border: '1px solid rgba(198,12,48,0.15)',
                          borderRadius: 8,
                          padding: '12px 16px',
                          margin: '0 0 8px 30px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 'var(--type-label)',
                            fontWeight: 600,
                            color: '#C60C30',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          Suggested Fix
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--type-body-sm)',
                            color: '#1B2D3D',
                            lineHeight: 1.5,
                          }}
                        >
                          Dental EO rate $29.00 does not match Guardian TX 2026
                          rate $27.50. Accept the carrier rate or provide
                          justification.
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            onClick={() => { acceptDentalRate(); toggleFixPanel(check.label); }}
                            style={{
                              padding: '6px 16px',
                              fontSize: 'var(--type-body-sm)',
                              fontWeight: 600,
                              borderRadius: 6,
                              border: 'none',
                              background: '#1A7A4A',
                              color: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Accept $27.50
                          </button>
                          <button
                            onClick={() => toggleFixPanel(check.label)}
                            style={{
                              padding: '6px 16px',
                              fontSize: 'var(--type-body-sm)',
                              fontWeight: 600,
                              borderRadius: 6,
                              border: '1px solid #C60C30',
                              background: '#fff',
                              color: '#C60C30',
                              cursor: 'pointer',
                            }}
                          >
                            Override with justification
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Keyframe for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
