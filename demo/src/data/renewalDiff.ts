import { DiffRow } from '@/lib/types';

export const renewalDiffRows: DiffRow[] = [
  { key: 'med_eo', plan: 'Medical · PPO $500', field: 'EE-only premium', prior: '$884.46', current: '$931.52', changed: true, changeType: 'client', delta: '+5.3%' },
  { key: 'med_fam', plan: 'Medical · PPO $500', field: 'Family premium', prior: '$2,790.40', current: '$2,933.04', changed: true, changeType: 'client', delta: '+5.1%' },
  { key: 'den_eo', plan: 'Dental · PPO $1500', field: 'EE-only premium', prior: '$27.50', current: '$29.00', changed: true, changeType: 'master', delta: '+5.5%' },
  { key: 'vis_eo', plan: 'Vision · Base PPO', field: 'EE-only premium', prior: '$6.00', current: '$6.00', changed: false },
];
