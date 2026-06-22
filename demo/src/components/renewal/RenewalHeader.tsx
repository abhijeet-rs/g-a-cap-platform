'use client';

import { useRenewalStore } from '@/stores/renewalStore';

export default function RenewalHeader() {
  const diffDecisions = useRenewalStore((s) => s.diffDecisions);

  const totalDecisions = 4;
  const madeDecisions = Object.keys(diffDecisions).length;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      {/* Left side */}
      <div>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#B0690A' }}>
          Year-over-Year Renewal &middot; R5
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>Itafos Conda</h1>
        <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 2 }}>
          GA-2908 &middot; Platinum &middot; 298 WSE &middot; Danielle Andre
        </div>
      </div>

      {/* Right side — metric cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Rate Change card */}
        <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#B0690A' }}>+5.3%</div>
          <div style={{ fontSize: 9, color: '#98A1A8' }}>Medical EO YoY</div>
        </div>

        {/* Resolved card */}
        <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1A7A4A' }}>
            {madeDecisions}/{totalDecisions}
          </div>
          <div style={{ fontSize: 9, color: '#98A1A8' }}>Decisions</div>
        </div>
      </div>
    </div>
  );
}
