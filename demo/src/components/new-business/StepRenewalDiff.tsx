'use client';

import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { clients } from '@/data/clients';
import DataCurrencyBanner from '@/components/renewal/DataCurrencyBanner';
import RenewalHeader from '@/components/renewal/RenewalHeader';
import DiffTable from '@/components/renewal/DiffTable';

export default function StepRenewalDiff() {
  const clientId = useNewBusinessStore((s) => s.clientId);
  const clientName = useNewBusinessStore((s) => s.clientName);
  const client = clients.find((c) => c.id === clientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 20 }}>
        {/* Data-currency context — only the westlake example carries a live banner */}
        {clientId === 'westlake' && <DataCurrencyBanner />}

        {/* YoY header with decision counter */}
        <RenewalHeader
          clientName={clientName || client?.name}
          clientPrism={client?.prism}
          clientTier={client?.tier}
          clientWSE={client?.wse}
          clientOwner={client?.owner}
        />

        {/* Diff table with accept / flag */}
        <DiffTable />
      </div>
    </div>
  );
}
