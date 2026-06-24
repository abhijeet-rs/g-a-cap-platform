'use client';

import { useRenewalStore } from '@/stores/renewalStore';

interface RenewalHeaderProps {
  clientName?: string;
  clientPrism?: string;
  clientTier?: string;
  clientWSE?: number;
  clientOwner?: string;
  medicalIncrease?: string;
}

export default function RenewalHeader({
  clientName = 'Westlake Financial Group',
  clientPrism = 'GA-3041',
  clientTier = 'Platinum',
  clientWSE = 312,
  clientOwner = 'Danielle Andre',
  medicalIncrease = '+5.3%',
}: RenewalHeaderProps) {
  const diffDecisions = useRenewalStore((s) => s.diffDecisions);

  const totalDecisions = 4;
  const madeDecisions = Object.keys(diffDecisions).length;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      {/* Left side */}
      <div>
        <div style={{ fontSize: 'var(--type-table-header)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#B0690A' }}>
          Year-over-Year Renewal &middot; R5
        </div>
        <h1 style={{ fontSize: 'var(--type-section-title)', fontWeight: 600, marginTop: 2 }}>{clientName}</h1>
        <div style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 2 }}>
          {clientPrism} &middot; {clientTier} &middot; {clientWSE} WSE &middot; {clientOwner}
        </div>
      </div>

      {/* Right side — metric cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#B0690A' }}>{medicalIncrease}</div>
          <div style={{ fontSize: 'var(--type-caption)', color: '#374151' }}>Medical EO YoY</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1A7A4A' }}>
            {madeDecisions}/{totalDecisions}
          </div>
          <div style={{ fontSize: 'var(--type-caption)', color: '#374151' }}>Decisions</div>
        </div>
      </div>
    </div>
  );
}
