import { ExtractionRow } from '@/lib/types';

export const extractionRows: ExtractionRow[] = [
  { field: 'Company Name', value: 'Itafos Conda', confidence: 95, source: 'Upload' },
  { field: 'Medical Carrier', value: 'BCBS Texas', confidence: 98, source: 'Upload' },
  { field: 'PPO $500 EO Rate', value: '$877.94', confidence: 92, source: 'Invoice' },
  { field: 'HDHP $3300 EO Rate', value: '$702.64', confidence: 89, source: 'Invoice' },
  { field: 'Dental EO Rate', value: '$29.00', confidence: 94, source: 'SBC' },
  { field: 'Vision EO Rate', value: '$6.00', confidence: 97, source: 'SBC' },
  { field: 'EE Count', value: '298', confidence: 97, source: 'Census' },
  { field: 'Bucket', value: '—', confidence: 0, source: 'Needs input' },
  { field: 'Admin Factor', value: '—', confidence: 0, source: 'Needs input' },
];
