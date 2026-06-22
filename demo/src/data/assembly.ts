import { AssemblySection } from '@/lib/types';

// syncSource: which Prism API or Foundation module this field can be refreshed from
// undefined = no sync available (manual entry only)
export interface SyncableField {
  label: string;
  value: string;
  provenance: 'library' | 'upload' | 'underwriting' | 'input';
  syncSource?: {
    system: string;        // e.g. 'PrismHR', 'F3', 'F4'
    api: string;           // e.g. 'ClientMasterService', 'BenefitPlanList'
    description: string;   // tooltip text
    simulatedValue?: string; // value returned by "sync"
  };
}

export interface SyncableAssemblySection {
  title: string;
  source: string;
  sourceColor: string;
  filled: number;
  total: number;
  fields: SyncableField[];
}

export const assemblySections: SyncableAssemblySection[] = [
  {
    title: 'Company Info', source: 'F6 · Vocabularies', sourceColor: '#0074B8',
    filled: 8, total: 12,
    fields: [
      { label: 'Company Name', value: 'Itafos Conda', provenance: 'upload' },
      { label: 'Plan Year', value: '2026', provenance: 'upload' },
      {
        label: 'Medical Carrier', value: 'BCBS Texas', provenance: 'library',
        syncSource: { system: 'PrismHR', api: 'ClientMasterService', description: 'Sync carrier from Prism client record', simulatedValue: 'BCBS Texas' },
      },
      {
        label: 'EE Count', value: '298', provenance: 'upload',
        syncSource: { system: 'PrismHR', api: 'EmployeeService', description: 'Refresh headcount from Prism census', simulatedValue: '302' },
      },
      { label: 'Corp Type', value: 'C-Corp', provenance: 'upload' },
      { label: 'Client Contact', value: '', provenance: 'input' },
    ],
  },
  {
    title: 'Underwriting', source: 'F4 · Pricing Stack', sourceColor: '#5A45C7',
    filled: 1, total: 5,
    fields: [
      {
        label: 'Bucket', value: '', provenance: 'input',
        syncSource: { system: 'PrismHR', api: 'Data for Lookups', description: 'Pull bucket from Prism client UW record', simulatedValue: '0.975' },
      },
      {
        label: 'Admin Factor', value: '', provenance: 'input',
        syncSource: { system: 'PrismHR', api: 'Data for Lookups', description: 'Pull admin factor from Prism client UW record', simulatedValue: '1.013' },
      },
      {
        label: 'Commission', value: '0.03', provenance: 'library',
        syncSource: { system: 'F4', api: 'Pricing Stack', description: 'Refresh default commission from F4', simulatedValue: '0.03' },
      },
      {
        label: 'Risk Factor', value: '', provenance: 'input',
        syncSource: { system: 'PrismHR', api: 'Data for Lookups', description: 'Pull risk factor from Prism client UW record', simulatedValue: '1.043' },
      },
      { label: 'Multiplier', value: '', provenance: 'input' },
    ],
  },
  {
    title: 'Products', source: 'F3 · Master Plans', sourceColor: '#0074B8',
    filled: 3, total: 4,
    fields: [
      {
        label: 'Medical', value: 'BCBSTX PPO $500', provenance: 'library',
        syncSource: { system: 'PrismHR', api: 'BenefitService.getClientBenefitPlans', description: 'Pull plan lineup from Prism', simulatedValue: 'BCBSTX PPO $500' },
      },
      { label: 'Dental', value: 'Guardian PPO $1500', provenance: 'upload' },
      { label: 'Vision', value: 'Guardian Base PPO', provenance: 'upload' },
      { label: 'Life / Vol', value: '', provenance: 'input' },
    ],
  },
];
