import { Plan, UWParams } from '@/lib/types';

export const defaultUWParams: UWParams = {
  bucket: 0.975,
  af: 1.013,
  comm: 0.03,
  rf: 1.043,
};

export const plans: Plan[] = [
  { id: 'med1', type: 'Medical', carrier: 'BCBS Texas', plan: 'PPO $500 80%', masterOrOpen: 'Master', erPct: 72, base: { eo: 877.94, es: 1905.58, ec: 1726.09, ef: 2764.25 } },
  { id: 'med2', type: 'Medical', carrier: 'BCBS Texas', plan: 'HDHP $3300 90%', masterOrOpen: 'Master', erPct: 81, base: { eo: 702.64, es: 1525.33, ec: 1381.26, ef: 2212.42 } },
  { id: 'den', type: 'Dental', carrier: 'Guardian', plan: 'PPO $1500', masterOrOpen: 'Open Mkt', erPct: 80, base: { eo: 29, es: 66.15, ec: 84, ef: 115.50 } },
  { id: 'vis', type: 'Vision', carrier: 'Guardian', plan: 'Base PPO', masterOrOpen: 'Open Mkt', erPct: 80, base: { eo: 6, es: 11.40, ec: 10.50, ef: 16.20 } },
];
