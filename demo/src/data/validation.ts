import { ValidationGroup } from '@/lib/types';

export const validationGroups: ValidationGroup[] = [
  {
    title: 'Completeness (F8)',
    checks: [
      { label: 'All required fields populated', status: 'pass' },
      { label: 'At least one medical plan configured', status: 'pass' },
      { label: 'UW parameters complete', status: 'error', message: 'Bucket and Admin Factor still "Needs input"' },
    ],
  },
  {
    title: 'Source-Data Validation (F3 × F4)',
    checks: [
      { label: 'PPO $500 EO matches BCBSTX 2026', status: 'pass' },
      { label: 'HDHP $3300 matches BCBSTX 2026', status: 'pass' },
      { label: 'Dental EO matches carrier quote', status: 'error', message: '$29.00 ≠ Guardian TX 2026 $27.50' },
      { label: 'Open-market SBCs complete', status: 'warning', message: 'Vol Life SBC not uploaded' },
    ],
  },
  {
    title: 'Cross-Field Consistency',
    checks: [
      { label: 'ER + EE = Total', status: 'pass' },
      { label: 'ACA affordability (F5 threshold $129.90/mo)', status: 'pass' },
      { label: 'Booklet/CAP rates match', status: 'pass' },
    ],
  },
];
