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
import WizardFooter from '@/components/new-business/WizardFooter';
import { WizardSkeleton } from '@/components/shared/Skeleton';

const steps = [
  { num: 1, label: 'Intake & Upload' },
  { num: 2, label: 'AI Extraction' },
  { num: 3, label: 'Assembly' },
  { num: 4, label: 'Plan Design & Rates' },
  { num: 5, label: 'Readiness' },
  { num: 6, label: 'Preview & Submit' },
];

const versionHistory = [
  { version: 'v4', date: 'Jun 22', author: 'Dana Whitfield', note: 'Updated contribution strategy' },
  { version: 'v3', date: 'Jun 21', author: 'Marcus Reyes', note: 'Corrected dental rate' },
  { version: 'v2', date: 'Jun 20', author: 'Dana Whitfield', note: 'Added underwriting params' },
  { version: 'v1', date: 'Jun 18', author: 'Dana Whitfield', note: 'Initial creation' },
];

function CAPInfoBar() {
  const [showVersions, setShowVersions] = useState(false);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E4E8ED',
      borderRadius: 8,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontSize: 11,
      marginBottom: 2,
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* CAP ID + Client */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
          fontSize: 11,
          color: '#1B2D3D',
        }}>CAP-2026-0847</span>
        <span style={{ color: '#98A1A8' }}>&middot;</span>
        <span style={{ fontWeight: 500, color: '#4A5568' }}>Itafos Conda</span>
      </div>

      {/* Version Badge */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowVersions(!showVersions)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 22, padding: '0 8px', borderRadius: 4,
            background: '#E7F1FA', color: '#0074B8',
            fontSize: 10, fontWeight: 600, border: 'none',
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
              fontSize: 10, fontWeight: 600, color: '#98A1A8',
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
                  fontSize: 10, fontWeight: 700,
                  color: i === 0 ? '#0074B8' : '#64707A',
                  minWidth: 20,
                }}>{v.version}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#1B2D3D' }}>
                    <span style={{ fontWeight: 500 }}>{v.date}</span>
                    <span style={{ color: '#98A1A8' }}> &middot; {v.author}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#64707A', fontStyle: 'italic', marginTop: 1 }}>
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
        <span style={{ fontSize: 10, color: '#1B2D3D', fontWeight: 500 }}>Dana W. editing</span>
        <span style={{ color: '#DCE2E8' }}>|</span>
        <span style={{ fontSize: 10, color: '#98A1A8' }}>&#x1F441; Marcus R. viewing</span>
      </div>

      {/* Comments */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        <span style={{ fontSize: 12 }}>&#x1F4AC;</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#64707A' }}>3 comments</span>
      </div>

      {/* Audit events */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        <span style={{ fontSize: 12 }}>&#x1F4CB;</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#64707A' }}>14 events</span>
      </div>
    </div>
  );
}

export default function NewBusinessPage() {
  const step = useNewBusinessStore((s) => s.step);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StepIndicator steps={steps} current={step} />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '8px 24px 0' }}>
        <CAPInfoBar />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '10px 24px 16px' }}>
          {step === 1 && <StepIntake />}
          {step === 2 && <StepExtraction />}
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
