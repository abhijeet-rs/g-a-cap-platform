import { create } from 'zustand';
import { Signer, EsignState } from '@/lib/types';
import { useDataStore } from './dataStore';

interface EsignStoreState {
  client: string;
  state: EsignState;
  signers: Signer[];
  send: () => void;
  simulateClientSign: () => void;
  publish: () => void;
  reset: () => void;
}

const initialSigners: Signer[] = [
  { role: 'Account Manager', name: 'Dana Whitfield', org: 'G&A Partners', status: 'waiting' },
  { role: 'Client Signer', name: 'Robert Hale, CFO', org: 'Client Company', status: 'waiting' },
  { role: 'Account Executive', name: 'Marcus Reyes', org: 'G&A Partners', status: 'waiting' },
];

export const useEsignStore = create<EsignStoreState>((set) => ({
  client: 'Itafos Conda',
  state: 'ready',
  signers: initialSigners,
  send: () => {
    set({
      state: 'sent',
      signers: [
        { role: 'Account Manager', name: 'Dana Whitfield', org: 'G&A Partners', status: 'signed', date: 'Jun 14' },
        { role: 'Client Signer', name: 'Robert Hale, CFO', org: 'Client Company', status: 'pending' },
        { role: 'Account Executive', name: 'Marcus Reyes', org: 'G&A Partners', status: 'waiting' },
      ],
    });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: 'sent e-sign envelope for Itafos Conda',
      entity: 'esign', entityId: 'cap-itafos-2026',
    });
  },
  simulateClientSign: () => {
    set({
      state: 'partial',
      signers: [
        { role: 'Account Manager', name: 'Dana Whitfield', org: 'G&A Partners', status: 'signed', date: 'Jun 14' },
        { role: 'Client Signer', name: 'Robert Hale, CFO', org: 'Client Company', status: 'signed', date: 'Jun 16' },
        { role: 'Account Executive', name: 'Marcus Reyes', org: 'G&A Partners', status: 'pending' },
      ],
    });
    useDataStore.getState().addAudit({
      actor: 'Robert Hale', actorType: 'user',
      action: 'signed e-sign envelope as Client Signer',
      entity: 'esign', entityId: 'cap-itafos-2026',
    });
  },
  publish: () => {
    set({
      state: 'complete',
      signers: [
        { role: 'Account Manager', name: 'Dana Whitfield', org: 'G&A Partners', status: 'signed', date: 'Jun 14' },
        { role: 'Client Signer', name: 'Robert Hale, CFO', org: 'Client Company', status: 'signed', date: 'Jun 16' },
        { role: 'Account Executive', name: 'Marcus Reyes', org: 'G&A Partners', status: 'signed', date: 'Jun 17' },
      ],
    });
    useDataStore.getState().addAudit({
      actor: 'Marcus Reyes', actorType: 'user',
      action: 'completed final signature and published CAP',
      entity: 'esign', entityId: 'cap-itafos-2026',
    });
  },
  reset: () => set({ client: 'Itafos Conda', state: 'ready', signers: initialSigners }),
}));
