'use client';

import { useState } from 'react';
import { useClientStore } from '@/stores/clientStore';
import { statusMeta, tierColors } from '@/data/statusMeta';
import { clients } from '@/data/clients';
import { Status, Tier } from '@/lib/types';
import { useRouter } from 'next/navigation';

const statusFilters: (Status | 'all')[] = ['all', 'draft', 'in_review', 'approved', 'signed', 'published'];
const tierFilters: (Tier | 'all')[] = ['all', 'Platinum', 'Gold', 'Silver', 'Bronze'];

const statusFilterLabels: Record<string, string> = {
  all: 'All Statuses', draft: 'Draft', in_review: 'In Review', approved: 'Approved', signed: 'Signed', published: 'Published',
};

const tierFilterLabels: Record<string, string> = {
  all: 'All Tiers', Platinum: 'Platinum', Gold: 'Gold', Silver: 'Silver', Bronze: 'Bronze',
};

function actionLabel(status: Status): string {
  if (status === 'draft') return 'Open';
  if (status === 'in_review') return 'Review';
  if (status === 'approved') return 'Sign-off';
  return 'View';
}

const statusBadgeColors: Record<Status, { bg: string; fg: string }> = {
  draft: { bg: '#F3F4F6', fg: '#6B7280' },
  in_review: { bg: '#DBEAFE', fg: '#1D4ED8' },
  approved: { bg: '#D1FAE5', fg: '#065F46' },
  signed: { bg: '#FEF3C7', fg: '#92400E' },
  published: { bg: '#D1FAE5', fg: '#065F46' },
};

const gridCols = '2.5fr 0.7fr 0.5fr 1.2fr 1fr 1fr 0.7fr';

const selectStyle: React.CSSProperties = {
  height: 32, padding: '0 28px 0 10px', border: '1px solid #E5E7EB',
  borderRadius: 6, fontSize: 'var(--type-label)', fontWeight: 500, color: '#374151',
  background: '#fff', cursor: 'pointer', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239CA3AF'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
};

type SortKey = 'name' | 'tier' | 'wse' | 'owner' | 'status' | 'eff';

const columnDefs: { label: string; key: SortKey | null }[] = [
  { label: 'Client', key: 'name' },
  { label: 'Tier', key: 'tier' },
  { label: 'WSE', key: 'wse' },
  { label: 'Owner', key: 'owner' },
  { label: 'Status', key: 'status' },
  { label: 'Effective', key: 'eff' },
  { label: '', key: null },
];

export default function ClientTable() {
  const router = useRouter();
  const { search, statusFilter, tierFilter, setSearch, setStatusFilter, setTierFilter, filteredClients } = useClientStore();
  const filtered = filteredClients();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'tier': cmp = a.tier.localeCompare(b.tier); break;
      case 'wse': cmp = a.wse - b.wse; break;
      case 'owner': cmp = a.owner.localeCompare(b.owner); break;
      case 'status': cmp = a.status.localeCompare(b.status); break;
      case 'eff': cmp = a.eff.localeCompare(b.eff); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleAction = (clientId: string, status: Status) => {
    if (status === 'draft') router.push(`/new-business?client=${clientId}`);
    else if (status === 'in_review') router.push(`/renewal?client=${clientId}`);
    else if (status === 'approved') router.push(`/esign?client=${clientId}`);
    else router.push(`/documents?client=${clientId}`);
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 12, overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#111827' }}>Client Approved Plans</div>
          <span style={{ fontSize: 'var(--type-label)', color: '#6B7280', fontWeight: 500 }}>{filtered.length}/{clients.length}</span>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 36, width: 240, borderRadius: 8,
            padding: '0 12px', background: '#F9FAFB',
            border: '1px solid #F3F4F6',
          }}>
            <span style={{ color: '#9CA3AF', fontSize: 'var(--type-body-sm)' }}>&#x2315;</span>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, ID..."
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 'var(--type-caption)', color: '#111827' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
            style={selectStyle}
          >
            {statusFilters.map(sf => (
              <option key={sf} value={sf}>{statusFilterLabels[sf]}</option>
            ))}
          </select>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as Tier | 'all')}
            style={selectStyle}
          >
            {tierFilters.map(tf => (
              <option key={tf} value={tf}>{tierFilterLabels[tf]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: gridCols,
        background: '#F9FAFB',
        position: 'sticky', top: 0, zIndex: 1,
      }}>
        {columnDefs.map((col, i) => (
          <div key={col.label || i} style={{
            padding: '10px 16px',
            fontSize: 'var(--type-table-header)', fontWeight: 600,
            color: sortKey === col.key ? '#111827' : '#6B7280',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            ...(col.label === 'WSE' ? { textAlign: 'right' as const } : {}),
          }}>
            {col.key ? (
              <button
                onClick={() => handleSort(col.key!)}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 'var(--type-table-header)', fontWeight: 600,
                  color: sortKey === col.key ? '#111827' : '#6B7280',
                  textTransform: 'uppercase', letterSpacing: '0.05em', padding: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                {col.label}
                {sortKey === col.key && (
                  <span style={{ fontSize: 8, color: '#111827' }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                )}
                {sortKey !== col.key && (
                  <span style={{ fontSize: 8, color: '#9CA3AF' }}>{'▲'}</span>
                )}
              </button>
            ) : col.label}
          </div>
        ))}
      </div>

      {/* Table Rows */}
      {sorted.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 'var(--type-body-sm)', color: '#6B7280' }}>
          No matching CAPs found.
        </div>
      ) : sorted.map((c) => {
        const badge = statusBadgeColors[c.status];
        const sm = statusMeta[c.status];
        return (
          <div key={c.id}
            onMouseEnter={() => setHoveredRowId(c.id)}
            onMouseLeave={() => setHoveredRowId(null)}
            style={{
              display: 'grid', gridTemplateColumns: gridCols,
              borderBottom: '1px solid #F3F4F6', alignItems: 'center',
              background: hoveredRowId === c.id ? '#F9FAFB' : 'transparent',
              transition: 'background 0.1s ease',
            }}>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#111827' }}>{c.name}</div>
              <div style={{ fontSize: 'var(--type-label)', color: '#9CA3AF', fontFamily: "'IBM Plex Mono', monospace" }}>{c.prism}</div>
            </div>
            <div style={{ padding: '12px 16px', fontSize: 'var(--type-caption)', fontWeight: 600, color: tierColors[c.tier] }}>{c.tier}</div>
            <div style={{ padding: '12px 16px', textAlign: 'right', fontSize: 'var(--type-caption)', fontFamily: "'IBM Plex Mono', monospace", color: '#374151' }}>{c.wse}</div>
            <div style={{ padding: '12px 16px', fontSize: 'var(--type-caption)', color: '#374151' }}>{c.owner}</div>
            <div style={{ padding: '12px 16px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                height: 22, padding: '0 8px', borderRadius: 10,
                background: badge.bg, color: badge.fg,
                fontSize: 'var(--type-badge)', fontWeight: 600,
              }}>
                {sm.label}
              </span>
            </div>
            <div style={{ padding: '12px 16px', fontSize: 'var(--type-caption)', color: '#374151', fontFamily: "'IBM Plex Mono', monospace" }}>{c.eff}</div>
            <div style={{ padding: '12px 16px', textAlign: 'right' }}>
              <button
                onClick={() => handleAction(c.id, c.status)}
                onMouseEnter={() => setHoveredBtn(c.id)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  height: 28, padding: '0 10px',
                  border: hoveredBtn === c.id ? '1px solid #111827' : '1px solid #E5E7EB',
                  borderRadius: 6, background: '#fff', color: '#374151',
                  fontSize: 'var(--type-badge)', fontWeight: 600, cursor: 'pointer',
                  transition: 'border-color 0.12s ease',
                }}
              >
                {actionLabel(c.status)}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
