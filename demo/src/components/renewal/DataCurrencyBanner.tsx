'use client';

import { useRenewalStore } from '@/stores/renewalStore';
import { useSyncStore } from '@/stores/syncStore';
import { useUIStore } from '@/stores/uiStore';
import { syncSequences } from '@/data/syncSequences';

export default function DataCurrencyBanner() {
  const rebaseDone = useRenewalStore((s) => s.rebaseDone);
  const rebase = useRenewalStore((s) => s.rebase);
  const show = useSyncStore((s) => s.show);
  const showToast = useUIStore((s) => s.showToast);

  if (rebaseDone) return null;

  const handleRebase = () => {
    rebase();
    const seq = syncSequences.rebaseData;
    show(seq.title, seq.steps, () => {
      showToast('Re-baselined onto 2026 data');
    });
  };

  return (
    <div style={{ background: '#FBF0DD', border: '1px solid #F0DDB5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Orange circle icon */}
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#B0690A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 'var(--type-body-sm)' }}>&#x2B06;</span>
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#B0690A' }}>Data-Currency Notice (R4)</span>
        <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginLeft: 6 }}>
          This renewal is based on 2025 master data. Newer versions available: 2026 carrier rates, Pricing Stack v4, ACA threshold 2026. Review 14 changes.
        </span>
      </div>

      {/* Action button */}
      <button
        onClick={handleRebase}
        style={{ color: '#B0690A', fontWeight: 600, fontSize: 'var(--type-body-sm)', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
      >
        Bring up to date &rarr;
      </button>
    </div>
  );
}
