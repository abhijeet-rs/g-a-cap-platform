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

const gridCols = 'minmax(140px,2fr) 56px 48px 100px 110px 82px 100px';

const selectStyle: React.CSSProperties = {
  height: 30, padding: '0 28px 0 10px', border: '1px solid #E4E8ED',
  borderRadius: 7, fontSize: 11, fontWeight: 600, color: '#1B2D3D',
  background: '#fff', cursor: 'pointer', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2398A1A8'/%3E%3C/svg%3E")`,
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
    <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #EEF1F4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Client Approved Plans</div>
          <span style={{ fontSize: 10, color: '#98A1A8' }}>{filtered.length}/{clients.length}</span>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 30, width: 220, border: '1px solid #E4E8ED', borderRadius: 7,
            padding: '0 9px', background: '#FBFCFD',
          }}>
            <span style={{ color: '#98A1A8', fontSize: 12 }}>&#x2315;</span>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, ID..."
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 11, color: '#1B2D3D' }}
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
        background: '#FAFBFC', borderBottom: '1px solid #EEF1F4',
      }}>
        {columnDefs.map((col, i) => (
          <div key={col.label || i} style={{
            padding: col.label === 'Client' ? '7px 16px' : '7px 6px',
            fontSize: 9, fontWeight: 600,
            color: '#98A1A8', textTransform: 'uppercase', letterSpacing: 0.5,
            ...(col.label === 'WSE' ? { textAlign: 'right' as const } : {}),
          }}>
            {col.key ? (
              <button
                onClick={() => handleSort(col.key!)}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 9, fontWeight: 600, color: sortKey === col.key ? '#1B2D3D' : '#98A1A8',
                  textTransform: 'uppercase', letterSpacing: 0.5, padding: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}
              >
                {col.label}
                {sortKey === col.key && (
                  <span style={{ fontSize: 8 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>
            ) : col.label}
          </div>
        ))}
      </div>

      {/* Table Rows */}
      {sorted.length === 0 ? (
        <div style={{ padding: '36px 16px', textAlign: 'center', fontSize: 12, color: '#64707A' }}>
          No matching CAPs found.
        </div>
      ) : sorted.map((c) => {
        const sm = statusMeta[c.status];
        return (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: gridCols,
            borderTop: '1px solid #EEF1F4', alignItems: 'center',
          }}>
            <div style={{ padding: '9px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 9, color: '#98A1A8', fontFamily: "'IBM Plex Mono', monospace" }}>{c.prism}</div>
            </div>
            <div style={{ padding: '9px 6px', fontSize: 10, fontWeight: 600, color: tierColors[c.tier] }}>{c.tier}</div>
            <div style={{ padding: '9px 6px', textAlign: 'right', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>{c.wse}</div>
            <div style={{ padding: '9px 6px', fontSize: 11, color: '#3B4A57' }}>{c.owner}</div>
            <div style={{ padding: '9px 6px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                height: 20, padding: '0 7px', borderRadius: 5,
                background: sm.bg, color: sm.fg, fontSize: 9, fontWeight: 600,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: sm.fg }} />
                {sm.label}
              </span>
            </div>
            <div style={{ padding: '9px 6px', fontSize: 10, color: '#3B4A57', fontFamily: "'IBM Plex Mono', monospace" }}>{c.eff}</div>
            <div style={{ padding: '9px 12px', textAlign: 'right' }}>
              <button
                onClick={() => handleAction(c.id, c.status)}
                style={{
                  height: 26, padding: '0 9px', border: '1px solid #E4E8ED',
                  borderRadius: 6, background: '#fff', color: '#1B2D3D',
                  fontSize: 10, fontWeight: 600, cursor: 'pointer',
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
