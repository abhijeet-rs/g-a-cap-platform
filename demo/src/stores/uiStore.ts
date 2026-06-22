import { create } from 'zustand';

interface UIState {
  toast: string;
  toastKind: 'success' | 'error' | 'info';
  toastVisible: boolean;
  showToast: (message: string, kind?: 'success' | 'error' | 'info') => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: '',
  toastKind: 'success',
  toastVisible: false,
  showToast: (message, kind = 'success') => {
    set({ toast: message, toastKind: kind, toastVisible: true });
    setTimeout(() => set({ toastVisible: false }), 2600);
  },
}));
