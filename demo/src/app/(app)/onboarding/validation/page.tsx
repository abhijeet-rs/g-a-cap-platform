'use client';

import { useState, useMemo } from 'react';
import {
  validationSummary,
  validationMismatches,
  severityMeta,
  type MismatchResolution,
} from '@/data/onboarding';
import { useOnboardingStore } from '@/stores/onboardingStore';

/* ================================================================
   Cross-Validation Mismatch Review
   ================================================================ */

const resolutionLabels: Record<MismatchResolution, { label: string; fg: string; bg: string }> = {
  unresolved: { label: 'Unresolved', fg: '#5B6770', bg: '#F1F3F5' },
  accept_csa: { label: 'CSA Accepted', fg: '#1A7A4A', bg: '#E4F2EA' },
  accept_system: { label: 'System Accepted', fg: '#0074B8', bg: '#E7F1FA' },
  flagged: { label: 'Flagged', fg: '#B0690A', bg: '#FBF0DD' },
};

export default function ValidationPage() {
  const { resolutions, resolve, liveMismatches, isLiveExtraction, documentId } = useOnboardingStore();
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [allApproved, setAllApproved] = useState(false);

  // Determine whether to use live mismatches or mock data
  const useLiveMismatches = isLiveExtraction && liveMismatches.length > 0;

  // Normalize live mismatches to the same shape used in the table
  const displayMismatches = useMemo(() => {
    if (useLiveMismatches) {
      return liveMismatches.map((m, idx) => ({
        id: `live-mm-${idx}`,
        field: m.field_name,
        csaValue: m.csa_value,
        systemValue: m.system_value,
        system: m.system_source,
        mismatchType: m.mismatch_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        severity: m.severity as 'error' | 'warning' | 'info',
        resolution: 'unresolved' as MismatchResolution,
      }));
    }
    return validationMismatches;
  }, [useLiveMismatches, liveMismatches]);

  const resolvedCount = Object.keys(resolutions).length;
  const unresolvedCount = displayMismatches.length - resolvedCount;

  // Summary values: use live data counts when available
  const summary = useLiveMismatches
    ? {
        totalFields: 22,
        validated: 22,
        matched: 22 - displayMismatches.length,
        mismatches: displayMismatches.length,
      }
    : validationSummary;

  const handleApproveAll = () => {
    displayMismatches.forEach((m) => {
      if (!resolutions[m.id]) {
        resolve(m.id, 'accept_csa');
      }
    });
    setAllApproved(true);
  };

  return (
    <div style={{ padding: '24px 24px 32px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <i className="fa-solid fa-code-compare" style={{ fontSize: 'var(--type-section-title)', color: '#B0690A' }} />
          <h1 style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Validation Review
          </h1>
        </div>
        <p style={{ fontSize: 'var(--type-body)', color: 'var(--text-secondary)', margin: 0 }}>
          Cross-validation mismatches between the CSA document and downstream systems. Resolve each discrepancy before approval.
        </p>
      </div>

      {/* Live / Demo data banner */}
      <div style={{
        padding: '10px 16px', borderRadius: 10, marginBottom: 16,
        background: useLiveMismatches ? '#E7F1FA' : '#FBF0DD',
        border: `1px solid ${useLiveMismatches ? '#B3D4F0' : '#EDCF9B'}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <i
          className={`fa-solid ${useLiveMismatches ? 'fa-bolt' : 'fa-flask'}`}
          style={{ fontSize: 14, color: useLiveMismatches ? '#0074B8' : '#B0690A' }}
        />
        <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: useLiveMismatches ? '#0074B8' : '#B0690A' }}>
          {useLiveMismatches
            ? `Live Validation Results -- Document ID: ${documentId}`
            : 'Demo Data -- Showing mock validation mismatches'}
        </span>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Total Fields', value: summary.totalFields, color: '#374151', bg: '#F1F3F5' },
          { label: 'Validated', value: summary.validated, color: '#0074B8', bg: '#E7F1FA' },
          { label: 'Matched', value: summary.matched, color: '#1A7A4A', bg: '#E4F2EA' },
          { label: 'Mismatches', value: summary.mismatches, color: '#C60C30', bg: '#FDECEF' },
          { label: 'Require Attention', value: unresolvedCount, color: '#B0690A', bg: '#FBF0DD' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 10,
            padding: '12px 16px', boxShadow: 'var(--shadow-xs)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Approved banner */}
      {allApproved && (
        <div style={{
          padding: '14px 18px', borderRadius: 10, marginBottom: 20,
          background: '#E4F2EA', border: '1px solid #B7DECA',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <i className="fa-solid fa-circle-check" style={{ color: '#1A7A4A', fontSize: 16 }} />
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1A7A4A' }}>
            All mismatches resolved. CSA extraction approved and ready for system sync.
          </span>
        </div>
      )}

      {/* Mismatch table */}
      <div style={{
        background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 12,
        boxShadow: 'var(--shadow-xs)', overflow: 'hidden', marginBottom: 20,
      }}>
        <div style={{
          padding: '16px 18px', borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Mismatch Details
          </div>
          <span style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            {useLiveMismatches
              ? `Document ID: ${documentId}`
              : 'CSA-2026-0847.pdf -- Acme Corp'}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-secondary)' }}>
              {['Field', 'CSA Value', 'System Value', 'Source', 'Type', 'Severity', 'Resolution'].map((h) => (
                <th key={h} style={{
                  fontSize: 'var(--type-table-header)', fontWeight: 600, color: 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  padding: '10px 14px', textAlign: 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayMismatches.map((m) => {
              const sev = severityMeta[m.severity];
              const currentRes = resolutions[m.id] || m.resolution;
              const resInfo = resolutionLabels[currentRes];
              const isResolved = currentRes !== 'unresolved';

              return (
                <tr key={m.id} style={{
                  borderBottom: '1px solid var(--border-secondary)',
                  background: isResolved ? '#FAFBFC' : undefined,
                  opacity: isResolved ? 0.75 : 1,
                }}>
                  <td style={{ padding: '10px 14px', fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.field}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 'var(--type-body-sm)', color: '#1A7A4A', fontWeight: 600 }}>
                    {m.csaValue}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 'var(--type-body-sm)', color: '#C60C30', fontWeight: 500 }}>
                    {m.systemValue}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: 'var(--type-badge)', fontWeight: 600, color: '#5A45C7',
                      background: '#F8F6FE', padding: '2px 8px', borderRadius: 5,
                    }}>
                      {m.system}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                    {m.mismatchType}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, height: 22,
                      padding: '0 8px', borderRadius: 6,
                      fontSize: 'var(--type-badge)', fontWeight: 600,
                      color: sev.fg, background: sev.bg,
                    }}>
                      <i className={`fa-solid ${sev.icon}`} style={{ fontSize: 9 }} />
                      {sev.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {isResolved ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', height: 22,
                        padding: '0 8px', borderRadius: 6,
                        fontSize: 'var(--type-badge)', fontWeight: 600,
                        color: resInfo.fg, background: resInfo.bg,
                      }}>
                        {resInfo.label}
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {([
                          { key: 'accept_csa', label: 'CSA', color: '#1A7A4A' },
                          { key: 'accept_system', label: 'System', color: '#0074B8' },
                          { key: 'flagged', label: 'Flag', color: '#B0690A' },
                        ] as const).map((act) => (
                          <button
                            key={act.key}
                            onClick={() => resolve(m.id, act.key)}
                            onMouseEnter={() => setHoveredBtn(`${m.id}-${act.key}`)}
                            onMouseLeave={() => setHoveredBtn(null)}
                            style={{
                              height: 22, padding: '0 7px', borderRadius: 5,
                              border: `1px solid ${hoveredBtn === `${m.id}-${act.key}` ? act.color : 'var(--border-primary)'}`,
                              background: hoveredBtn === `${m.id}-${act.key}` ? act.color + '10' : '#fff',
                              color: act.color, fontSize: 'var(--type-badge)', fontWeight: 600,
                              cursor: 'pointer', transition: 'all 0.1s ease',
                            }}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            useOnboardingStore.getState().resetResolutions();
            setAllApproved(false);
          }}
          style={{
            height: 36, padding: '0 18px', borderRadius: 8,
            border: '1px solid var(--border-primary)', background: '#fff',
            color: 'var(--text-secondary)', fontSize: 'var(--type-body-sm)', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset All
        </button>
        <button
          onClick={handleApproveAll}
          disabled={allApproved}
          style={{
            height: 36, padding: '0 18px', borderRadius: 8,
            border: 'none',
            background: allApproved ? '#C0C8D0' : '#2A8F60',
            color: '#fff', fontSize: 'var(--type-body-sm)', fontWeight: 600,
            cursor: allApproved ? 'default' : 'pointer',
            transition: 'background 0.12s ease',
          }}
        >
          {allApproved ? 'Approved' : 'Approve All & Sync'}
        </button>
      </div>
    </div>
  );
}
