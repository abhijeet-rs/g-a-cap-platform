import { StatusMeta, Status, Tier } from '@/lib/types';

export const statusMeta: Record<Status, StatusMeta> = {
  draft: { label: 'Draft', bg: '#EDF0F3', fg: '#5B6770' },
  in_review: { label: 'In Review', bg: '#E7F1FA', fg: '#0074B8' },
  approved: { label: 'Approved', bg: '#E4F2EA', fg: '#1A7A4A' },
  signed: { label: 'Signed', bg: '#FBF0DD', fg: '#B0690A' },
  published: { label: 'Published', bg: '#E4F2EA', fg: '#1A7A4A' },
};

export const tierColors: Record<Tier, string> = {
  Platinum: '#3B4A57',
  Gold: '#B0690A',
  Silver: '#6B7680',
  Bronze: '#8A6240',
};
