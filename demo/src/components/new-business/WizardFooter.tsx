'use client';

import { useRouter } from 'next/navigation';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { useSyncStore } from '@/stores/syncStore';
import { useUIStore } from '@/stores/uiStore';
import { syncSequences } from '@/data/syncSequences';
import { validationGroups } from '@/data/validation';

export default function WizardFooter() {
  const router = useRouter();
  const step = useNewBusinessStore((s) => s.step);
  const next = useNewBusinessStore((s) => s.next);
  const prev = useNewBusinessStore((s) => s.prev);
  const setSubmitted = useNewBusinessStore((s) => s.setSubmitted);
  const assemblyFields = useNewBusinessStore((s) => s.assemblyFields);
  const dentalRateAccepted = useNewBusinessStore((s) => s.dentalRateAccepted);
  const dismissedWarnings = useNewBusinessStore((s) => s.dismissedWarnings);
  const showSync = useSyncStore((s) => s.show);
  const showToast = useUIStore((s) => s.showToast);

  const handleSubmit = () => {
    if (errorCount > 0) return;
    const seq = syncSequences.nbSubmit;
    showSync(seq.title, seq.steps, () => {
      setSubmitted(true);
      showToast('CAP submitted for coordinator review', 'success');
      router.push('/dashboard');
    });
  };

  const isLastStep = step === 6;

  // Dynamic validation: recompute based on store state
  const uwComplete = (assemblyFields['Underwriting__Bucket'] || '').length > 0
    && (assemblyFields['Underwriting__Admin Factor'] || '').length > 0;

  const errorCount = validationGroups
    .flatMap((g) => g.checks)
    .filter((c) => {
      if (c.label === 'UW parameters complete' && uwComplete) return false;
      if (c.label === 'Dental EO matches carrier quote' && dentalRateAccepted) return false;
      return c.status === 'error';
    }).length;

  const warningCount = validationGroups
    .flatMap((g) => g.checks)
    .filter((c) => c.status === 'warning' && !dismissedWarnings.includes(c.label)).length;

  const attentionCount = errorCount + warningCount;

  const submitBlocked = isLastStep && errorCount > 0;

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        borderTop: '1px solid #E4E8ED',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
      }}
    >
      {/* Back button */}
      {step > 1 ? (
        <button
          onClick={prev}
          style={{
            height: 38,
            padding: '0 20px',
            borderRadius: 6,
            border: '1px solid #E4E8ED',
            fontSize: 'var(--type-body-sm)',
            fontWeight: 600,
            color: '#374151',
            background: '#fff',
            cursor: 'pointer',
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          &larr; Back
        </button>
      ) : (
        <div />
      )}

      {/* Readiness indicator */}
      {step >= 3 && step <= 5 && attentionCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#D69E2E',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 'var(--type-body-sm)',
              fontWeight: 600,
              color: '#B0690A',
            }}
          >
            {attentionCount} items need attention
          </span>
        </div>
      )}
      {isLastStep && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {errorCount > 0 ? (
            <>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#C60C30',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 'var(--type-body-sm)',
                  fontWeight: 600,
                  color: '#C60C30',
                }}
              >
                {errorCount} blockers
              </span>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#1A7A4A',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 'var(--type-body-sm)',
                  fontWeight: 600,
                  color: '#1A7A4A',
                }}
              >
                Ready for handoff
              </span>
            </>
          )}
        </div>
      )}

      {/* Continue / Submit button */}
      {isLastStep ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
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
              background: submitBlocked ? '#C60C30' : '#C60C30',
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
      ) : (
        <button
          onClick={next}
          style={{
            height: 38,
            padding: '0 20px',
            background: '#C60C30',
            color: '#fff',
            borderRadius: 6,
            fontSize: 'var(--type-body-sm)',
            fontWeight: 600,
            boxShadow: '0 3px 10px rgba(198,12,48,.2)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          Continue &rarr;
        </button>
      )}
    </div>
  );
}
