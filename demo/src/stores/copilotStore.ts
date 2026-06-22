import { create } from 'zustand';
import { CopilotMessage } from '@/lib/types';
import { getCopilotResponse } from '@/data/copilotResponses';
import { useDataStore } from './dataStore';

interface CopilotState {
  open: boolean;
  input: string;
  messages: CopilotMessage[];
  initialized: boolean;
  toggle: () => void;
  setInput: (v: string) => void;
  send: () => void;
  ask: (query: string) => void;
  addSystemMessage: (content: string) => void;
}

const welcomeMessage: CopilotMessage = {
  role: 'system',
  content: 'I\'m your CAP Copilot — I can retrieve data, explain calculations, model contribution strategies, and help you navigate the platform. What would you like to know?',
  actions: [
    { label: 'What\'s blocking handoff?', query: 'What\'s blocking handoff?' },
    { label: 'Explain rate formula', query: 'Why is the PPO $500 EO rate $931.52?' },
  ],
};

export const useCopilotStore = create<CopilotState>((set, get) => ({
  open: false,
  input: '',
  messages: [],
  initialized: false,
  toggle: () => {
    const { open, initialized } = get();
    if (!open && !initialized) {
      set({ open: true, initialized: true, messages: [welcomeMessage] });
    } else {
      set({ open: !open });
    }
  },
  setInput: (input) => set({ input }),
  send: () => {
    const { input } = get();
    if (!input.trim()) return;
    get().ask(input.trim());
  },
  ask: (query) => {
    const userMsg: CopilotMessage = { role: 'user', content: query };
    set(s => ({ messages: [...s.messages, userMsg], input: '' }));
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `asked Copilot: "${query.length > 60 ? query.slice(0, 60) + '...' : query}"`,
      entity: 'copilot', entityId: 'copilot-session',
    });
    setTimeout(() => {
      const resp = getCopilotResponse(query);
      const agentMsg: CopilotMessage = {
        role: 'agent',
        content: resp.body,
        citation: resp.citation,
        proposedChange: resp.proposedChange,
      };
      set(s => ({ messages: [...s.messages, agentMsg] }));
      useDataStore.getState().addAudit({
        actor: 'CAP Copilot', actorType: 'system',
        action: `responded to query: "${query.length > 60 ? query.slice(0, 60) + '...' : query}"`,
        entity: 'copilot', entityId: 'copilot-session',
      });
    }, 800);
  },
  addSystemMessage: (content) => {
    const sysMsg: CopilotMessage = { role: 'system', content };
    set(s => ({ messages: [...s.messages, sysMsg] }));
  },
}));
