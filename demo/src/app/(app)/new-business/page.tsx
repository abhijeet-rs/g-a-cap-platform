'use client';

import { useState, useEffect } from 'react';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import StepIndicator from '@/components/new-business/StepIndicator';
import StepIntake from '@/components/new-business/StepIntake';
import StepExtraction from '@/components/new-business/StepExtraction';
import StepAssembly from '@/components/new-business/StepAssembly';
import StepRates from '@/components/new-business/StepRates';
import StepValidation from '@/components/new-business/StepValidation';
import StepPreview from '@/components/new-business/StepPreview';
import StepPrefill from '@/components/new-business/StepPrefill';
import StepRenewalDiff from '@/components/new-business/StepRenewalDiff';
import CapBuilderLanding from '@/components/new-business/CapBuilderLanding';
import WizardFooter from '@/components/new-business/WizardFooter';
import { WizardSkeleton } from '@/components/shared/Skeleton';

const newStepLabels = ['Intake & Upload', 'AI Extraction', 'Assembly', 'Plan Design & Rates', 'Readiness', 'Preview & Submit'];
const renewalStepLabels = ['Prefill', 'YoY Diff', 'Assembly', 'Plan Design & Rates', 'Readiness', 'Preview & Submit'];

function buildSteps(mode: 'new' | 'renewal') {
  const labels = mode === 'renewal' ? renewalStepLabels : newStepLabels;
  return labels.map((label, i) => ({ num: i + 1, label }));
}

const versionHistory = [
  { version: 'v4', date: 'Jun 22', author: 'Dana Whitfield', note: 'Updated contribution strategy' },
  { version: 'v3', date: 'Jun 21', author: 'Marcus Reyes', note: 'Corrected dental rate' },
  { version: 'v2', date: 'Jun 20', author: 'Dana Whitfield', note: 'Added underwriting params' },
  { version: 'v1', date: 'Jun 18', author: 'Dana Whitfield', note: 'Initial creation' },
];

function CAPInfoBar({ mode, clientName, onChange }: { mode: 'new' | 'renewal'; clientName: string; onChange: () => void }) {
  const [showVersions, setShowVersions] = useState(false);
  const displayName = mode === 'renewal' && clientName ? clientName : 'Itafos Conda';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E4E8ED',
      borderRadius: 8,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontSize: 'var(--type-body)',
      marginBottom: 2,
      position: 'relative',
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* CAP ID + Client */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
          fontSize: 'var(--type-body)',
          color: '#1B2D3D',
        }}>CAP-2026-0847</span>
        <span style={{ color: '#374151' }}>&middot;</span>
        <span style={{ fontWeight: 500, color: '#374151' }}>{displayName}</span>
      </div>

      {/* Mode badge + Change link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
          background: mode === 'renewal' ? '#F8F6FE' : '#FDECEF',
          color: mode === 'renewal' ? '#5A45C7' : '#C60C30',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          {mode === 'renewal' ? 'Renewal' : 'New Business'}
        </span>
        <button
          onClick={onChange}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 'var(--type-caption)', fontWeight: 600, color: '#0074B8',
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          Change
        </button>
      </div>

      {/* Version Badge */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowVersions(!showVersions)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 22, padding: '0 8px', borderRadius: 4,
            background: '#E7F1FA', color: '#0074B8',
            fontSize: 'var(--type-badge)', fontWeight: 600, border: 'none',
            cursor: 'pointer',
          }}
        >
          v4 (latest) &#9662;
        </button>
        {showVersions && (
          <div style={{
            position: 'absolute', top: 28, left: 0, zIndex: 50,
            background: '#fff', border: '1px solid #E4E8ED',
            borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            width: 320, overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 12px', borderBottom: '1px solid #E4E8ED',
              fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>Version History</div>
            {versionHistory.map((v, i) => (
              <div key={v.version} style={{
                padding: '8px 12px',
                borderBottom: i < versionHistory.length - 1 ? '1px solid #F1F3F5' : 'none',
                display: 'flex', alignItems: 'flex-start', gap: 8,
                background: i === 0 ? '#F5F7FA' : '#fff',
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 'var(--type-caption)', fontWeight: 700,
                  color: i === 0 ? '#0074B8' : '#374151',
                  minWidth: 20,
                }}>{v.version}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--type-caption)', color: '#1B2D3D' }}>
                    <span style={{ fontWeight: 500 }}>{v.date}</span>
                    <span style={{ color: '#374151' }}> &middot; {v.author}</span>
                  </div>
                  <div style={{ fontSize: 'var(--type-caption)', color: '#374151', fontStyle: 'italic', marginTop: 1 }}>
                    &ldquo;{v.note}&rdquo;
                  </div>
                </div>
                {i === 0 && (
                  <span style={{
                    fontSize: 8, fontWeight: 600, padding: '1px 5px',
                    borderRadius: 3, background: '#E4F2EA', color: '#1A7A4A',
                  }}>LATEST</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Live editing indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%', background: '#1A7A4A',
          boxShadow: '0 0 0 2px rgba(26,122,74,0.2)',
          animation: 'capPresencePulse 2s ease-in-out infinite',
        }} />
        <style>{`@keyframes capPresencePulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>
        <span style={{ fontSize: 'var(--type-caption)', color: '#1B2D3D', fontWeight: 500 }}>Dana W. editing</span>
        <span style={{ color: '#DCE2E8' }}>|</span>
        <span style={{ fontSize: 'var(--type-caption)', color: '#374151' }}>&#x1F441; Marcus R. viewing</span>
      </div>

      {/* Comments */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        <span style={{ fontSize: 'var(--type-body-sm)' }}>&#x1F4AC;</span>
        <span style={{ fontSize: 'var(--type-caption)', fontWeight: 600, color: '#374151' }}>3 comments</span>
      </div>

      {/* Audit events */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        <span style={{ fontSize: 'var(--type-body-sm)' }}>&#x1F4CB;</span>
        <span style={{ fontSize: 'var(--type-caption)', fontWeight: 600, color: '#374151' }}>14 events</span>
      </div>
    </div>
  );
}

export default function NewBusinessPage() {
  const step = useNewBusinessStore((s) => s.step);
  const mode = useNewBusinessStore((s) => s.mode);
  const started = useNewBusinessStore((s) => s.started);
  const clientName = useNewBusinessStore((s) => s.clientName);
  const backToLanding = useNewBusinessStore((s) => s.backToLanding);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <WizardSkeleton />
      </div>
    );
  }

  // Client-first landing — choose new vs renewal before entering the wizard.
  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        <CapBuilderLanding />
      </div>
    );
  }

  const steps = buildSteps(mode);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StepIndicator steps={steps} current={step} />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '8px 24px 0', width: '100%' }}>
        <CAPInfoBar mode={mode} clientName={clientName} onChange={backToLanding} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '10px 24px 16px' }}>
          {/* Step 1/2 are mode-specific; steps 3–6 are shared. */}
          {step === 1 && (mode === 'renewal' ? <StepPrefill /> : <StepIntake />)}
          {step === 2 && (mode === 'renewal' ? <StepRenewalDiff /> : <StepExtraction />)}
          {step === 3 && <StepAssembly />}
          {step === 4 && <StepRates />}
          {step === 5 && <StepValidation />}
          {step === 6 && <StepPreview />}
        </div>
      </div>
      <WizardFooter />
    </div>
  );
}
