import { create } from 'zustand';
import { ContribStrategy } from '@/lib/types';
import { useDataStore } from './dataStore';

export interface UploadedFile {
  name: string;
  size: number; // bytes
}

interface NewBusinessState {
  mode: 'new' | 'renewal';
  clientId: string | null;
  clientName: string;
  started: boolean;
  step: number;
  company: string;
  planYear: string;
  eeCount: string;
  effMonth: string;
  carrier: string;
  uploadedFiles: UploadedFile[];
  contribStrategy: ContribStrategy;
  erPct: number;
  submitted: boolean;
  assemblyFields: Record<string, string>;
  confirmedFields: Record<string, boolean>;
  dentalRateAccepted: boolean;
  dismissedWarnings: string[];
  startNew: () => void;
  startRenewal: (clientId: string, clientName: string) => void;
  backToLanding: () => void;
  next: () => void;
  prev: () => void;
  goStep: (s: number) => void;
  setCompany: (v: string) => void;
  setPlanYear: (v: string) => void;
  setEeCount: (v: string) => void;
  setEffMonth: (v: string) => void;
  setCarrier: (v: string) => void;
  addUpload: (name: string, size?: number) => void;
  removeUpload: (filename: string) => void;
  setContribStrategy: (s: ContribStrategy) => void;
  setErPct: (p: number) => void;
  setSubmitted: (v: boolean) => void;
  setAssemblyField: (key: string, value: string) => void;
  confirmField: (key: string) => void;
  acceptDentalRate: () => void;
  dismissWarning: (label: string) => void;
  reset: () => void;
}

export const useNewBusinessStore = create<NewBusinessState>((set, get) => ({
  mode: 'new',
  clientId: null,
  clientName: '',
  started: false,
  step: 1,
  company: 'Itafos Conda',
  planYear: '2026',
  eeCount: '298',
  effMonth: 'July',
  carrier: 'BCBS Texas',
  uploadedFiles: [
    { name: 'Census_Itafos_2026.xlsx', size: 245760 },
    { name: 'BCBSTX_Invoice_Q2.pdf', size: 1482752 },
    { name: 'Current_SBC_Medical.pdf', size: 892416 },
  ],
  contribStrategy: 'variable',
  erPct: 72,
  submitted: false,
  assemblyFields: {
    'Company Info__Company Name': 'Itafos Conda',
    'Company Info__Plan Year': '2026',
    'Company Info__Medical Carrier': 'BCBS Texas',
    'Company Info__EE Count': '298',
    'Company Info__Corp Type': 'C-Corp',
    'Company Info__Client Contact': '',
    'Underwriting__Bucket': '',
    'Underwriting__Admin Factor': '',
    'Underwriting__Commission': '0.03',
    'Underwriting__Risk Factor': '',
    'Underwriting__Multiplier': '',
    'Products__Medical': 'BCBSTX PPO $500',
    'Products__Dental': 'Guardian PPO $1500',
    'Products__Vision': 'Guardian Base PPO',
    'Products__Life / Vol': '',
  },
  confirmedFields: {},
  dentalRateAccepted: false,
  dismissedWarnings: [],
  startNew: () => {
    set({ mode: 'new', started: true, step: 1, clientId: null, clientName: '' });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: 'started a new client CAP',
      entity: 'cap', entityId: 'cap-itafos-2026',
    });
  },
  startRenewal: (clientId, clientName) => {
    set({ mode: 'renewal', started: true, step: 1, clientId, clientName, company: clientName });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `started renewal CAP for "${clientName}"`,
      entity: 'cap', entityId: `cap-${clientId}-2026`,
    });
  },
  backToLanding: () => {
    set({ started: false });
  },
  next: () => {
    const prev = get().step;
    set(s => ({ step: Math.min(s.step + 1, 6) }));
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `advanced from step ${prev} to step ${get().step}`,
      entity: 'cap', entityId: 'cap-itafos-2026',
    });
  },
  prev: () => {
    const prev = get().step;
    set(s => ({ step: Math.max(s.step - 1, 1) }));
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `went back from step ${prev} to step ${get().step}`,
      entity: 'cap', entityId: 'cap-itafos-2026',
    });
  },
  goStep: (step) => {
    const prev = get().step;
    set({ step });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `jumped from step ${prev} to step ${step}`,
      entity: 'cap', entityId: 'cap-itafos-2026',
    });
  },
  setCompany: (company) => {
    const prev = get().company;
    set({ company });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `changed company from "${prev}" to "${company}"`,
      entity: 'cap', entityId: 'cap-itafos-2026',
      before: prev, after: company,
    });
  },
  setPlanYear: (planYear) => {
    const prev = get().planYear;
    set({ planYear });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `changed plan year from "${prev}" to "${planYear}"`,
      entity: 'cap', entityId: 'cap-itafos-2026',
      before: prev, after: planYear,
    });
  },
  setEeCount: (eeCount) => {
    const prev = get().eeCount;
    set({ eeCount });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `changed employee count from "${prev}" to "${eeCount}"`,
      entity: 'cap', entityId: 'cap-itafos-2026',
      before: prev, after: eeCount,
    });
  },
  setEffMonth: (effMonth) => {
    const prev = get().effMonth;
    set({ effMonth });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `changed effective month from "${prev}" to "${effMonth}"`,
      entity: 'cap', entityId: 'cap-itafos-2026',
      before: prev, after: effMonth,
    });
  },
  setCarrier: (carrier) => {
    const prev = get().carrier;
    set({ carrier });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `changed carrier from "${prev}" to "${carrier}"`,
      entity: 'cap', entityId: 'cap-itafos-2026',
      before: prev, after: carrier,
    });
  },
  addUpload: (name, size = 0) => {
    set(s => ({ uploadedFiles: [...s.uploadedFiles, { name, size }] }));
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `uploaded file "${name}"`,
      entity: 'cap', entityId: 'cap-itafos-2026',
    });
  },
  removeUpload: (filename) => {
    set(s => ({ uploadedFiles: s.uploadedFiles.filter(f => f.name !== filename) }));
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `removed file "${filename}"`,
      entity: 'cap', entityId: 'cap-itafos-2026',
    });
  },
  setContribStrategy: (contribStrategy) => {
    const prev = get().contribStrategy;
    set({ contribStrategy });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `changed contribution strategy from "${prev}" to "${contribStrategy}"`,
      entity: 'cap', entityId: 'cap-itafos-2026',
      before: prev, after: contribStrategy,
    });
  },
  setErPct: (erPct) => {
    const prev = get().erPct;
    set({ erPct });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: `changed ER% from ${prev}% to ${erPct}%`,
      entity: 'cap', entityId: 'cap-itafos-2026',
      before: String(prev), after: String(erPct),
    });
  },
  setSubmitted: (submitted) => {
    set({ submitted });
    if (submitted) {
      useDataStore.getState().addAudit({
        actor: 'Dana Whitfield', actorType: 'user',
        action: 'submitted CAP for review',
        entity: 'cap', entityId: 'cap-itafos-2026',
      });
    }
  },
  setAssemblyField: (key, value) => {
    set(s => ({ assemblyFields: { ...s.assemblyFields, [key]: value } }));
  },
  confirmField: (key) => {
    set(s => ({ confirmedFields: { ...s.confirmedFields, [key]: true } }));
  },
  acceptDentalRate: () => {
    set({ dentalRateAccepted: true });
    useDataStore.getState().addAudit({
      actor: 'Dana Whitfield', actorType: 'user',
      action: 'accepted carrier rate $27.50 for Dental EO (was $29.00)',
      entity: 'cap', entityId: 'cap-itafos-2026',
      before: '$29.00', after: '$27.50',
    });
  },
  dismissWarning: (label) => {
    set(s => ({ dismissedWarnings: [...s.dismissedWarnings, label] }));
  },
  reset: () => set({
    mode: 'new', clientId: null, clientName: '', started: false,
    step: 1, company: 'Itafos Conda', planYear: '2026', eeCount: '298',
    effMonth: 'July', carrier: 'BCBS Texas',
    uploadedFiles: [
      { name: 'Census_Itafos_2026.xlsx', size: 245760 },
      { name: 'BCBSTX_Invoice_Q2.pdf', size: 1482752 },
      { name: 'Current_SBC_Medical.pdf', size: 892416 },
    ],
    contribStrategy: 'variable', erPct: 72, submitted: false,
    confirmedFields: {}, dentalRateAccepted: false, dismissedWarnings: [],
    assemblyFields: {
      'Company Info__Company Name': 'Itafos Conda', 'Company Info__Plan Year': '2026',
      'Company Info__Medical Carrier': 'BCBS Texas', 'Company Info__EE Count': '298',
      'Company Info__Corp Type': 'C-Corp', 'Company Info__Client Contact': '',
      'Underwriting__Bucket': '', 'Underwriting__Admin Factor': '',
      'Underwriting__Commission': '0.03', 'Underwriting__Risk Factor': '',
      'Underwriting__Multiplier': '',
      'Products__Medical': 'BCBSTX PPO $500', 'Products__Dental': 'Guardian PPO $1500',
      'Products__Vision': 'Guardian Base PPO', 'Products__Life / Vol': '',
    },
  }),
}));
