'use client';

import { useState, useMemo } from 'react';
import { plans, defaultUWParams } from '@/data/plans';
import { calculateMultiplier, calculateBilledRates, calculateContribution, calculatePPD } from '@/lib/rateCalculator';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { ContribStrategy } from '@/lib/types';

const strategyDescriptions: Record<ContribStrategy, string> = {
  variable: 'Employer pays a fixed percentage of each plan. Employee cost varies by plan richness.',
  base_plan: 'Employer pays the same dollar amount (based on base plan) for all plans. Employee pays the difference.',
  flat_dollar: 'Employer contributes a flat dollar amount per tier, regardless of plan selection.',
  rolldown: 'Employer covers full cost of lowest-cost plan. Savings roll down to richer plans.',
};

const strategyLabels: { key: ContribStrategy; label: string }[] = [
  { key: 'variable', label: 'Variable' },
  { key: 'base_plan', label: 'Base Plan' },
  { key: 'flat_dollar', label: 'Flat Dollar' },
  { key: 'rolldown', label: 'Rolldown' },
];

const tiers = ['eo', 'es', 'ec', 'ef'] as const;
const tierLabels: Record<string, string> = { eo: 'EO', es: 'ES', ec: 'EC', ef: 'EF' };

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  border: '1px solid #E4E8ED',
  padding: 20,
};

const badgeSmall = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 'var(--type-badge)',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 4,
  background: bg,
  color: color,
});

const provenanceChip = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 8,
  fontWeight: 600,
  padding: '2px 6px',
  borderRadius: 3,
  background: bg,
  color: color,
});

const monoStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
};

export default function StepRates() {
  const { contribStrategy, setContribStrategy, erPct, setErPct } = useNewBusinessStore();
  const multiplier = calculateMultiplier(defaultUWParams);

  // Per-plan ER% overrides — initialize from plan defaults
  const [planErPcts, setPlanErPcts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    plans.forEach((p) => { init[p.id] = p.erPct; });
    return init;
  });

  // When contribution strategy changes, apply strategy-specific ER% logic
  const effectiveErPcts = useMemo(() => {
    const result: Record<string, number> = { ...planErPcts };
    if (contribStrategy === 'flat_dollar') {
      // Flat dollar: all plans get the same ER%
      const baseErPct = planErPcts['med1'] ?? 72;
      plans.forEach((p) => { result[p.id] = baseErPct; });
    } else if (contribStrategy === 'rolldown') {
      // Rolldown: cheapest medical gets 100%, others adjust proportionally
      const medPlans = plans.filter((p) => p.type === 'Medical');
      if (medPlans.length > 0) {
        const cheapestBilledEo = medPlans.reduce((min, p) => {
          const b = p.masterOrOpen === 'Master' ? Number((p.base.eo * multiplier).toFixed(2)) : p.base.eo;
          return b < min ? b : min;
        }, Infinity);
        medPlans.forEach((p) => {
          const billedEo = p.masterOrOpen === 'Master' ? Number((p.base.eo * multiplier).toFixed(2)) : p.base.eo;
          result[p.id] = Math.min(100, Math.round((cheapestBilledEo / billedEo) * 100));
        });
      }
    } else if (contribStrategy === 'base_plan') {
      // Base plan: ER$ fixed to base plan amount; erPct varies by plan
      const basePlan = plans.find((p) => p.id === 'med1');
      if (basePlan) {
        const baseBilledEo = basePlan.masterOrOpen === 'Master'
          ? Number((basePlan.base.eo * multiplier).toFixed(2))
          : basePlan.base.eo;
        const baseErDollar = Number((baseBilledEo * (planErPcts['med1'] ?? 72) / 100).toFixed(2));
        plans.forEach((p) => {
          if (p.type === 'Medical') {
            const billedEo = p.masterOrOpen === 'Master' ? Number((p.base.eo * multiplier).toFixed(2)) : p.base.eo;
            result[p.id] = Math.min(100, Math.round((baseErDollar / billedEo) * 100));
          }
        });
      }
    }
    // 'variable' uses per-plan overrides as-is
    return result;
  }, [contribStrategy, planErPcts, multiplier]);

  // Calculate min EE-only contribution for ACA check
  let minEeOnly = Infinity;
  plans.forEach((plan) => {
    if (plan.type === 'Medical') {
      const isMaster = plan.masterOrOpen === 'Master';
      const billedEo = isMaster ? Number((plan.base.eo * multiplier).toFixed(2)) : plan.base.eo;
      const { ee } = calculateContribution(billedEo, effectiveErPcts[plan.id] ?? plan.erPct);
      if (ee < minEeOnly) minEeOnly = ee;
    }
  });
  const acaThreshold = 129.90;
  const acaAffordable = minEeOnly < acaThreshold;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Rate formula card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 'var(--type-section-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
            Rate Formula
          </h3>
          <span style={badgeSmall('#E7F1FA', '#0074B8')}>F3 x F4</span>
          <span style={badgeSmall('#E4F2EA', '#1A7A4A')}>Live</span>
          <span style={provenanceChip('#E7F1FA', '#0074B8')}>F3 &middot; Master Plan Library</span>
          <span style={provenanceChip('#F0EDFA', '#5A45C7')}>F4 &middot; Pricing Stack</span>
        </div>

        <div
          style={{
            ...monoStyle,
            fontSize: 'var(--type-body)',
            color: '#374151',
            marginBottom: 16,
            background: '#F8F9FA',
            borderRadius: 6,
            padding: '8px 12px',
          }}
        >
          Billed = Base x Bucket x AF x (1+Comm) x RF
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {[
            { label: 'Bucket', value: defaultUWParams.bucket.toFixed(3) },
            { label: 'AF', value: defaultUWParams.af.toFixed(3) },
            { label: 'Comm', value: defaultUWParams.comm.toFixed(2) },
            { label: 'RF', value: defaultUWParams.rf.toFixed(3) },
            { label: 'Multiplier', value: multiplier.toFixed(4) },
          ].map((param) => (
            <div
              key={param.label}
              style={{
                background: '#F8F9FA',
                borderRadius: 6,
                padding: '8px 12px',
                flex: 1,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: '#374151',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                {param.label}
              </div>
              <div
                style={{
                  fontSize: 'var(--type-body-sm)',
                  ...monoStyle,
                  fontWeight: 600,
                  color: '#1B2D3D',
                  marginTop: 2,
                }}
              >
                {param.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution strategy card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 'var(--type-section-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
            Contribution Strategy
          </h3>
          <span style={badgeSmall('#F1F3F5', '#374151')}>NB4</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {strategyLabels.map((s) => (
            <button
              key={s.key}
              onClick={() => setContribStrategy(s.key)}
              style={{
                height: 32,
                padding: '0 16px',
                borderRadius: 6,
                fontSize: 'var(--type-body-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  contribStrategy === s.key ? 'none' : '1px solid #DCE2E8',
                background:
                  contribStrategy === s.key ? '#13212C' : '#fff',
                color:
                  contribStrategy === s.key ? '#fff' : '#374151',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: '0 0 8px 0' }}>
          {strategyDescriptions[contribStrategy]}
        </p>
        {contribStrategy !== 'variable' && (
          <div style={{
            background: '#E7F1FA',
            border: '1px solid #C1D9F0',
            borderRadius: 6,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 'var(--type-body-sm)',
            color: '#0074B8',
            fontWeight: 500,
          }}>
            <span style={{ fontSize: 'var(--type-body-sm)', flexShrink: 0 }}>&#x2139;</span>
            ER% values below are auto-calculated by the {contribStrategy.replace('_', ' ')} strategy. Switch to Variable to edit per-plan.
          </div>
        )}
      </div>

      {/* Plan rate cards */}
      {plans.map((plan) => {
        const isMaster = plan.masterOrOpen === 'Master';
        const billed = isMaster ? calculateBilledRates(plan.base, defaultUWParams) : plan.base;
        const currentErPct = effectiveErPcts[plan.id] ?? plan.erPct;
        const isErEditable = contribStrategy === 'variable';

        return (
          <div key={plan.id} style={cardStyle}>
            {/* Plan header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
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
                <h3 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
                  {plan.carrier} {plan.plan}
                </h3>
                {isMaster ? (
                  <span style={provenanceChip('#E7F1FA', '#0074B8')}>F3 &middot; BCBSTX 2026</span>
                ) : (
                  <span style={provenanceChip('#FBF0DD', '#B0690A')}>From upload &middot; confirm</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151', fontWeight: 500 }}>ER%</span>
                <input
                  type="number"
                  value={currentErPct}
                  readOnly={!isErEditable}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                    setPlanErPcts((prev) => ({ ...prev, [plan.id]: val }));
                  }}
                  style={{
                    width: 50,
                    height: 28,
                    border: isErEditable ? '1.5px solid #0074B8' : '1px solid #DCE2E8',
                    borderRadius: 6,
                    padding: '0 8px',
                    fontSize: 'var(--type-body-sm)',
                    ...monoStyle,
                    textAlign: 'center',
                    background: isErEditable ? '#fff' : '#F4F6F8',
                    outline: 'none',
                    cursor: isErEditable ? 'text' : 'default',
                    color: isErEditable ? '#1B2D3D' : '#374151',
                  }}
                  title={isErEditable ? 'Edit ER%' : `ER% is calculated by ${contribStrategy} strategy`}
                />
                {!isErEditable && (
                  <span style={{ fontSize: 8, color: '#374151', fontStyle: 'italic' }}>auto</span>
                )}
              </div>
            </div>

            {/* Rate table */}
            <div style={{ overflow: 'hidden', borderRadius: 6, border: '1px solid #F1F3F5' }}>
              {/* Table header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  background: '#F8F9FA',
                  padding: '6px 12px',
                  borderBottom: '1px solid #F1F3F5',
                }}
              >
                {['Tier', 'Base', 'Billed', 'Employer', 'Employee', 'PPD'].map((col) => (
                  <div
                    key={col}
                    style={{
                      fontSize: 'var(--type-table-header)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: '#374151',
                      letterSpacing: '0.04em',
                      textAlign: col !== 'Tier' ? 'right' : 'left',
                    }}
                  >
                    {col}
                  </div>
                ))}
              </div>

              {/* Tier rows */}
              {tiers.map((tier) => {
                const base = plan.base[tier];
                const billedVal = billed[tier];
                const { er, ee } = calculateContribution(billedVal, currentErPct);
                const ppd = calculatePPD(ee);

                return (
                  <div
                    key={tier}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      padding: '8px 12px',
                      borderTop: '1px solid #F8F9FA',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>
                      {tierLabels[tier]}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--type-body-sm)',
                        ...monoStyle,
                        color: '#374151',
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 0,
                      }}
                    >
                      ${base.toFixed(2)}
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#0074B8', display: 'inline-block', marginLeft: 4, flexShrink: 0 }} />
                      <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 3, marginLeft: 4, background: '#E7F1FA', color: '#0074B8', whiteSpace: 'nowrap' }}>F3</span>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--type-body-sm)',
                        ...monoStyle,
                        fontWeight: 600,
                        color: '#1B2D3D',
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 0,
                      }}
                    >
                      ${billedVal.toFixed(2)}
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#5A45C7', display: 'inline-block', marginLeft: 4, flexShrink: 0 }} />
                      <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 3, marginLeft: 4, background: '#F0EDFA', color: '#5A45C7', whiteSpace: 'nowrap' }}>Calculated</span>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--type-body-sm)',
                        ...monoStyle,
                        color: '#1A7A4A',
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 0,
                      }}
                    >
                      ${er.toFixed(2)}
                      <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 3, marginLeft: 4, background: '#E4F2EA', color: '#1A7A4A', whiteSpace: 'nowrap' }}>{currentErPct}% ER</span>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--type-body-sm)',
                        ...monoStyle,
                        color: '#374151',
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 0,
                      }}
                    >
                      ${ee.toFixed(2)}
                      <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 3, marginLeft: 4, background: '#FBF0DD', color: '#B0690A', whiteSpace: 'nowrap' }}>{100 - currentErPct}% EE</span>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--type-body-sm)',
                        ...monoStyle,
                        color: '#0074B8',
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 0,
                      }}
                    >
                      ${ppd.toFixed(2)}
                      <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 3, marginLeft: 4, background: '#E7F1FA', color: '#0074B8', whiteSpace: 'nowrap' }}>24 ded/yr · F5</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ACA Affordability card */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontSize: 'var(--type-section-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
              ACA Affordability Check
            </h3>
            <span style={badgeSmall('#F1F3F5', '#374151')}>F5 &middot; Parameters</span>
            <span style={provenanceChip('#F0EDFA', '#5A45C7')}>F5 &middot; Parameters &middot; 2026</span>
          </div>
          <span
            style={{
              fontSize: 'var(--type-badge)',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 4,
              background: acaAffordable ? '#E4F2EA' : '#FDECEF',
              color: acaAffordable ? '#1A7A4A' : '#C60C30',
            }}
          >
            {acaAffordable ? '✓ Affordable' : '✕ Not Affordable'}
          </span>
        </div>

        <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: 0 }}>
          Min EE-only contribution:{' '}
          <span style={{ ...monoStyle, fontWeight: 600 }}>${minEeOnly.toFixed(2)}/mo</span> vs.
          threshold{' '}
          <span style={{ ...monoStyle, fontWeight: 600 }}>${acaThreshold.toFixed(2)}/mo</span>
        </p>
      </div>
    </div>
  );
}
