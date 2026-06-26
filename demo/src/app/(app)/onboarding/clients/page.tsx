'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ================================================================
   ClientSpace Clients — List Page
   All customer names are masked aliases.
   ================================================================ */

/* ── Types ── */

type ClientStatus = 'Active' | 'Onboarding' | 'Pending Setup';
type OnboardingStage = 'Deal Initiation' | 'Sales Handoff' | 'Data Collection' | 'System Config' | 'Testing' | 'First Payroll';

interface ClientSpaceClient {
  id: string;
  clientSpaceId: string;
  name: string;
  status: ClientStatus;
  pmName: string;
  paName: string;
  onboardingStage: OnboardingStage;
  employeeCount: number;
  effectiveDate: string;
  lastSynced: string;
  csaId: string | null; // null = no CSA uploaded yet
}

/* ── Mock data ── */

const CLIENTS: ClientSpaceClient[] = [
  { id: 'cli-1', clientSpaceId: 'CS-CLI-4521', name: 'Acme Corp', status: 'Active', pmName: 'Dana Whitfield', paName: 'Sam Cho', onboardingStage: 'System Config', employeeCount: 38, effectiveDate: '07/01/2026', lastSynced: '2026-06-26T08:12:00Z', csaId: 'CSA-2026-0847' },
  { id: 'cli-2', clientSpaceId: 'CS-CLI-4522', name: 'TechStart LLC', status: 'Onboarding', pmName: 'Marcus Reyes', paName: 'Lena Ortiz', onboardingStage: 'Data Collection', employeeCount: 110, effectiveDate: '08/01/2026', lastSynced: '2026-06-26T07:45:00Z', csaId: 'CSA-2026-0851' },
  { id: 'cli-3', clientSpaceId: 'CS-CLI-4523', name: 'Summit Services Inc', status: 'Active', pmName: 'Priya Nair', paName: 'Sam Cho', onboardingStage: 'First Payroll', employeeCount: 45, effectiveDate: '06/01/2026', lastSynced: '2026-06-26T06:30:00Z', csaId: 'CSA-2026-0839' },
  { id: 'cli-4', clientSpaceId: 'CS-CLI-4524', name: 'Greenfield Partners', status: 'Onboarding', pmName: 'Dana Whitfield', paName: 'Lena Ortiz', onboardingStage: 'Sales Handoff', employeeCount: 22, effectiveDate: '09/01/2026', lastSynced: '2026-06-26T05:15:00Z', csaId: null },
  { id: 'cli-5', clientSpaceId: 'CS-CLI-4525', name: 'Horizon Manufacturing', status: 'Pending Setup', pmName: 'Marcus Reyes', paName: 'Sam Cho', onboardingStage: 'Deal Initiation', employeeCount: 89, effectiveDate: '10/01/2026', lastSynced: '2026-06-25T22:00:00Z', csaId: null },
  { id: 'cli-6', clientSpaceId: 'CS-CLI-4526', name: 'BrightPath Solutions', status: 'Active', pmName: 'Priya Nair', paName: 'Lena Ortiz', onboardingStage: 'Testing', employeeCount: 67, effectiveDate: '07/15/2026', lastSynced: '2026-06-26T08:00:00Z', csaId: 'CSA-2026-0850' },
  { id: 'cli-7', clientSpaceId: 'CS-CLI-4527', name: 'Atlas Logistics', status: 'Onboarding', pmName: 'Dana Whitfield', paName: 'Sam Cho', onboardingStage: 'System Config', employeeCount: 156, effectiveDate: '08/15/2026', lastSynced: '2026-06-26T07:20:00Z', csaId: 'CSA-2026-0848' },
  { id: 'cli-8', clientSpaceId: 'CS-CLI-4528', name: 'Pinnacle Staffing', status: 'Active', pmName: 'Marcus Reyes', paName: 'Lena Ortiz', onboardingStage: 'First Payroll', employeeCount: 34, effectiveDate: '06/15/2026', lastSynced: '2026-06-26T06:10:00Z', csaId: 'CSA-2026-0844' },
];

/* ── Status metadata ── */

const STATUS_META: Record<ClientStatus, { fg: string; bg: string }> = {
  Active: { fg: '#1A7A4A', bg: '#E4F2EA' },
  Onboarding: { fg: '#0074B8', bg: '#E7F1FA' },
  'Pending Setup': { fg: '#B0690A', bg: '#FBF0DD' },
};

const STAGE_META: Record<OnboardingStage, { fg: string; bg: string; icon: string }> = {
  'Deal Initiation': { fg: '#5B6770', bg: '#F1F3F5', icon: 'fa-handshake' },
  'Sales Handoff': { fg: '#5A45C7', bg: '#F8F6FE', icon: 'fa-people-arrows' },
  'Data Collection': { fg: '#0074B8', bg: '#E7F1FA', icon: 'fa-folder-open' },
  'System Config': { fg: '#B0690A', bg: '#FBF0DD', icon: 'fa-gears' },
  'Testing': { fg: '#1A7A4A', bg: '#E4F2EA', icon: 'fa-vial' },
  'First Payroll': { fg: '#C60C30', bg: '#FDECEF', icon: 'fa-money-check-dollar' },
};

/* ── Helpers ── */

function formatSyncTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

/* ── Inline badge ── */

function Badge({ label, fg, bg, style }: { label: string; fg: string; bg: string; style?: React.CSSProperties }) {
  return (
    <span style={{
      fontSize: 'var(--type-badge)', fontWeight: 600, borderRadius: 6,
      padding: '2px 8px', color: fg, background: bg,
      display: 'inline-flex', alignItems: 'center', height: 22,
      whiteSpace: 'nowrap', lineHeight: 1,
      ...style,
    }}>{label}</span>
  );
}

/* ================================================================
   Page Component
   ================================================================ */

export default function ClientsPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ClientStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = CLIENTS.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.clientSpaceId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    all: CLIENTS.length,
    Active: CLIENTS.filter(c => c.status === 'Active').length,
    Onboarding: CLIENTS.filter(c => c.status === 'Onboarding').length,
    'Pending Setup': CLIENTS.filter(c => c.status === 'Pending Setup').length,
  };

  return (
    <div style={{ padding: '24px 24px 32px', minWidth: 900 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <i className="fa-solid fa-building" style={{ fontSize: 'var(--type-section-title)', color: '#0074B8' }} />
            <h1 style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              ClientSpace Clients
            </h1>
          </div>
          <p style={{ fontSize: 'var(--type-body)', color: 'var(--text-secondary)', margin: 0 }}>
            Clients synced from ClientSpace &mdash; select a client to upload and review CSA extraction
          </p>
        </div>
        <Link
          href="/onboarding/extract"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 8, border: 'none',
            background: '#2A8F60', color: '#fff',
            fontSize: 'var(--type-body-sm)', fontWeight: 600,
            textDecoration: 'none', cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(42,143,96,0.2)',
            transition: 'background 0.12s ease',
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 13 }} />
          Upload New CSA
        </Link>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', borderRadius: 8,
          border: '1px solid var(--border-primary)', background: '#fff',
          flex: '0 0 280px',
        }}>
          <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 12, color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)',
              width: '100%',
            }}
          />
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'Active', 'Onboarding', 'Pending Setup'] as const).map(status => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                  border: isActive ? '1.5px solid var(--text-primary)' : '1px solid var(--border-primary)',
                  background: isActive ? 'var(--bg-hover)' : '#fff',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 'var(--type-body-sm)', fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.12s ease',
                }}
              >
                {status === 'all' ? 'All' : status}
                <span style={{
                  fontSize: 'var(--type-badge)', fontWeight: 600,
                  background: isActive ? 'var(--text-primary)' : 'var(--bg-hover)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  padding: '0 5px', borderRadius: 4, height: 16,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {statusCounts[status]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sync indicator */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
          <i className="fa-solid fa-arrows-rotate" style={{ fontSize: 11 }} />
          Last sync: {formatSyncTime('2026-06-26T08:12:00Z')}
        </div>
      </div>

      {/* Client cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filteredClients.map(client => {
          const stMeta = STATUS_META[client.status];
          const stageMeta = STAGE_META[client.onboardingStage];
          const isHovered = hoveredCard === client.id;

          return (
            <Link
              key={client.id}
              href={`/onboarding/clients/${client.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onMouseEnter={() => setHoveredCard(client.id)}
              onMouseLeave={() => { setHoveredCard(null); setHoveredBtn(null); }}
            >
              <div style={{
                background: '#fff',
                border: `1px solid ${isHovered ? 'var(--text-tertiary)' : 'var(--border-primary)'}`,
                borderRadius: 12,
                padding: 20,
                boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.06)' : 'var(--shadow-xs)',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {/* Top row: name + status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <i className="fa-solid fa-building" style={{ fontSize: 14, color: '#0074B8', opacity: 0.7 }} />
                      <span style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {client.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {client.clientSpaceId}
                    </span>
                  </div>
                  <Badge label={client.status} fg={stMeta.fg} bg={stMeta.bg} />
                </div>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {/* PM */}
                  <div>
                    <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                      Project Manager
                    </div>
                    <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {client.pmName}
                    </div>
                  </div>
                  {/* PA */}
                  <div>
                    <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                      Payroll Analyst
                    </div>
                    <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {client.paName}
                    </div>
                  </div>
                  {/* Employees */}
                  <div>
                    <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                      Employees
                    </div>
                    <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {client.employeeCount}
                    </div>
                  </div>
                  {/* Effective Date */}
                  <div>
                    <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                      Effective Date
                    </div>
                    <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {client.effectiveDate}
                    </div>
                  </div>
                </div>

                {/* Stage badge + sync */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 'var(--type-badge)', fontWeight: 600, borderRadius: 6,
                      padding: '3px 10px', color: stageMeta.fg, background: stageMeta.bg,
                      height: 24, lineHeight: 1,
                    }}>
                      <i className={`fa-solid ${stageMeta.icon}`} style={{ fontSize: 10 }} />
                      {client.onboardingStage}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)' }}>
                    <i className="fa-solid fa-arrows-rotate" style={{ fontSize: 9, marginRight: 4 }} />
                    {formatSyncTime(client.lastSynced)}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-primary)', paddingTop: 12 }}>
                  <Link
                    href="/onboarding/extract"
                    onClick={e => e.stopPropagation()}
                    onMouseEnter={() => setHoveredBtn(`upload-${client.id}`)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 6,
                      background: hoveredBtn === `upload-${client.id}` ? '#238C55' : '#2A8F60',
                      color: '#fff',
                      fontSize: 'var(--type-body-sm)', fontWeight: 600,
                      textDecoration: 'none', border: 'none', cursor: 'pointer',
                      transition: 'background 0.12s ease',
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 11 }} />
                    Upload CSA
                  </Link>
                  {client.csaId && (
                    <Link
                      href={`/onboarding?csa=${client.csaId}`}
                      onClick={e => e.stopPropagation()}
                      onMouseEnter={() => setHoveredBtn(`view-${client.id}`)}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 6,
                        background: hoveredBtn === `view-${client.id}` ? 'var(--bg-hover)' : '#fff',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--type-body-sm)', fontWeight: 600,
                        textDecoration: 'none',
                        border: '1px solid var(--border-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <i className="fa-solid fa-file-lines" style={{ fontSize: 11 }} />
                      View Extraction
                    </Link>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredClients.length === 0 && (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 12,
        }}>
          <i className="fa-solid fa-building-circle-xmark" style={{ fontSize: 32, color: 'var(--text-tertiary)', marginBottom: 12 }} />
          <div style={{ fontSize: 'var(--type-body)', color: 'var(--text-secondary)', fontWeight: 600 }}>
            No clients match your filters
          </div>
          <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Try adjusting your search or status filter.
          </div>
        </div>
      )}
    </div>
  );
}
