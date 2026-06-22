import { create } from 'zustand';

interface AdminState {
  activeTab: string;
  setTab: (tab: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeTab: 'connections',
  setTab: (activeTab) => set({ activeTab }),
}));
