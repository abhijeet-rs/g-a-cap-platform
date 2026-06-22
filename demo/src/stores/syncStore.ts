import { create } from 'zustand';
import { SyncStep } from '@/lib/types';

interface SyncState {
  active: boolean;
  title: string;
  steps: (SyncStep & { status: 'pending' | 'running' | 'done' })[];
  show: (title: string, steps: SyncStep[], onDone?: () => void) => void;
  close: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  active: false,
  title: '',
  steps: [],
  show: (title, steps, onDone) => {
    const stepsWithStatus = steps.map(s => ({ ...s, status: 'pending' as const }));
    set({ active: true, title, steps: stepsWithStatus });
    let i = 0;
    const runStep = () => {
      if (i >= steps.length) {
        setTimeout(() => {
          set({ active: false });
          onDone?.();
        }, 600);
        return;
      }
      set(s => ({
        steps: s.steps.map((st, idx) => idx === i ? { ...st, status: 'running' } : st),
      }));
      setTimeout(() => {
        set(s => ({
          steps: s.steps.map((st, idx) => idx === i ? { ...st, status: 'done' } : st),
        }));
        i++;
        runStep();
      }, steps[i].ms);
    };
    runStep();
  },
  close: () => set({ active: false }),
}));
