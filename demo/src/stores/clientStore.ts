import { create } from 'zustand';
import { clients } from '@/data/clients';
import { Client, Status, Tier } from '@/lib/types';

interface ClientState {
  search: string;
  statusFilter: Status | 'all';
  tierFilter: Tier | 'all';
  setSearch: (s: string) => void;
  setStatusFilter: (f: Status | 'all') => void;
  setTierFilter: (f: Tier | 'all') => void;
  filteredClients: () => Client[];
}

export const useClientStore = create<ClientState>((set, get) => ({
  search: '',
  statusFilter: 'all',
  tierFilter: 'all',
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setTierFilter: (tierFilter) => set({ tierFilter }),
  filteredClients: () => {
    const { search, statusFilter, tierFilter } = get();
    let result = [...clients];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.prism.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }
    if (tierFilter !== 'all') {
      result = result.filter(c => c.tier === tierFilter);
    }
    return result;
  },
}));
