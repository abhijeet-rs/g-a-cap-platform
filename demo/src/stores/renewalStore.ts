import { create } from 'zustand';
import { useDataStore } from './dataStore';

interface RenewalState {
  selectedClient: string;
  diffDecisions: Record<string, 'accept' | 'reject'>;
  rebaseDone: boolean;
  approved: boolean;
  setSelectedClient: (id: string) => void;
  setDiff: (key: string, decision: 'accept' | 'reject') => void;
  acceptAllCarriedForward: () => void;
  rebase: () => void;
  approve: () => void;
  reset: () => void;
}

export const useRenewalStore = create<RenewalState>((set, get) => ({
  selectedClient: 'itafos',
  diffDecisions: {},
  rebaseDone: false,
  approved: false,
  setSelectedClient: (selectedClient) => set({ selectedClient }),
  setDiff: (key, decision) => {
    set(s => ({ diffDecisions: { ...s.diffDecisions, [key]: decision } }));
    const clientId = get().selectedClient;
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `${decision === 'accept' ? 'accepted' : 'rejected'} diff field "${key}"`,
      entity: 'cap', entityId: `cap-${clientId}-2026`,
    });
  },
  acceptAllCarriedForward: () => {
    set(s => ({ diffDecisions: { ...s.diffDecisions, vis_eo: 'accept' } }));
    const clientId = get().selectedClient;
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: 'accepted all carried-forward values',
      entity: 'cap', entityId: `cap-${clientId}-2026`,
    });
  },
  rebase: () => {
    set({ rebaseDone: true });
    const clientId = get().selectedClient;
    useDataStore.getState().addAudit({
      actor: 'System', actorType: 'system',
      action: 'rebased renewal CAP with latest master data',
      entity: 'cap', entityId: `cap-${clientId}-2026`,
    });
  },
  approve: () => {
    set({ approved: true });
    const clientId = get().selectedClient;
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: 'approved renewal CAP',
      entity: 'cap', entityId: `cap-${clientId}-2026`,
    });
  },
  reset: () => set({ selectedClient: 'itafos', diffDecisions: {}, rebaseDone: false, approved: false }),
}));
