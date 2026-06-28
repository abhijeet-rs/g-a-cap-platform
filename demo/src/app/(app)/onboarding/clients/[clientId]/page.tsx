'use client';

import { useState, use } from 'react';
import Link from 'next/link';

/* ================================================================
   ClientSpace Client Detail — PM/PA Review + Validation
   All customer names are masked aliases.
   ================================================================ */

/* ── Types ── */

type ClientStatus = 'Active' | 'Onboarding' | 'Pending Setup';
type TabKey = 'pm' | 'pa' | 'all' | 'validation' | 'handoff';

interface ClientDetail {
  id: string;
  clientSpaceId: string;
  name: string;
  status: ClientStatus;
  pmName: string;
  paName: string;
  onboardingStage: string;
  employeeCount: number;
  effectiveDate: string;
  lastSynced: string;
  csaId: string | null;
}

interface FieldRow {
  field: string;
  csaValue: string | null; // null = pending CSA upload
  clientSpaceValue: string;
  category: string;
  role: 'pm' | 'pa' | 'both';
}

type MatchStatus = 'match' | 'mismatch' | 'pending' | 'missing';

interface ValidationRow {
  field: string;
  csaValue: string | null;
  clientSpaceValue: string;
  status: MatchStatus;
}

/* ── Client mock data ── */

const CLIENTS: Record<string, ClientDetail> = {
  'cli-1': { id: 'cli-1', clientSpaceId: 'CS-CLI-4521', name: 'Acme Corp', status: 'Active', pmName: 'Dana Whitfield', paName: 'Sam Cho', onboardingStage: 'System Config', employeeCount: 38, effectiveDate: '07/01/2026', lastSynced: '2026-06-26T08:12:00Z', csaId: 'CSA-2026-0847' },
  'cli-2': { id: 'cli-2', clientSpaceId: 'CS-CLI-4522', name: 'TechStart LLC', status: 'Onboarding', pmName: 'Marcus Reyes', paName: 'Lena Ortiz', onboardingStage: 'Data Collection', employeeCount: 110, effectiveDate: '08/01/2026', lastSynced: '2026-06-26T07:45:00Z', csaId: 'CSA-2026-0851' },
  'cli-3': { id: 'cli-3', clientSpaceId: 'CS-CLI-4523', name: 'Summit Services Inc', status: 'Active', pmName: 'Priya Nair', paName: 'Sam Cho', onboardingStage: 'First Payroll', employeeCount: 45, effectiveDate: '06/01/2026', lastSynced: '2026-06-26T06:30:00Z', csaId: 'CSA-2026-0839' },
  'cli-4': { id: 'cli-4', clientSpaceId: 'CS-CLI-4524', name: 'Greenfield Partners', status: 'Onboarding', pmName: 'Dana Whitfield', paName: 'Lena Ortiz', onboardingStage: 'Sales Handoff', employeeCount: 22, effectiveDate: '09/01/2026', lastSynced: '2026-06-26T05:15:00Z', csaId: null },
  'cli-5': { id: 'cli-5', clientSpaceId: 'CS-CLI-4525', name: 'Horizon Manufacturing', status: 'Pending Setup', pmName: 'Marcus Reyes', paName: 'Sam Cho', onboardingStage: 'Deal Initiation', employeeCount: 89, effectiveDate: '10/01/2026', lastSynced: '2026-06-25T22:00:00Z', csaId: null },
  'cli-6': { id: 'cli-6', clientSpaceId: 'CS-CLI-4526', name: 'BrightPath Solutions', status: 'Active', pmName: 'Priya Nair', paName: 'Lena Ortiz', onboardingStage: 'Testing', employeeCount: 67, effectiveDate: '07/15/2026', lastSynced: '2026-06-26T08:00:00Z', csaId: 'CSA-2026-0850' },
  'cli-7': { id: 'cli-7', clientSpaceId: 'CS-CLI-4527', name: 'Atlas Logistics', status: 'Onboarding', pmName: 'Dana Whitfield', paName: 'Sam Cho', onboardingStage: 'System Config', employeeCount: 156, effectiveDate: '08/15/2026', lastSynced: '2026-06-26T07:20:00Z', csaId: 'CSA-2026-0848' },
  'cli-8': { id: 'cli-8', clientSpaceId: 'CS-CLI-4528', name: 'Pinnacle Staffing', status: 'Active', pmName: 'Marcus Reyes', paName: 'Lena Ortiz', onboardingStage: 'First Payroll', employeeCount: 34, effectiveDate: '06/15/2026', lastSynced: '2026-06-26T06:10:00Z', csaId: 'CSA-2026-0844' },
};

/* ── Field data for Acme Corp (cli-1) — other clients use generic data ── */

const ACME_FIELDS: FieldRow[] = [
  // PM: General Information
  { field: 'Organization Name', csaValue: 'Tsiro Real Estate Management, LLC', clientSpaceValue: 'Tsiro Real Estate Management, LLC', category: 'General Information', role: 'pm' },
  { field: 'Contract Type', csaValue: 'PEO - Full Service', clientSpaceValue: 'PEO - Full Service', category: 'General Information', role: 'pm' },
  { field: 'Number of Employees', csaValue: '38', clientSpaceValue: '35', category: 'General Information', role: 'pm' },
  { field: 'Decision Maker', csaValue: 'Jordan Mitchell, CEO', clientSpaceValue: 'Jordan Mitchell, CEO', category: 'General Information', role: 'pm' },
  { field: 'Client Onboarding Contact', csaValue: 'Sarah Chen, HR Director', clientSpaceValue: 'Sarah Chen, HR Director', category: 'General Information', role: 'pm' },
  { field: 'Current Payroll Vendor', csaValue: 'ADP TotalSource', clientSpaceValue: 'ADP TotalSource', category: 'General Information', role: 'pm' },
  { field: 'Current Vendor Relationship', csaValue: '3 years', clientSpaceValue: '3 years', category: 'General Information', role: 'pm' },
  { field: 'Broker Referred', csaValue: 'Yes', clientSpaceValue: 'Yes', category: 'General Information', role: 'pm' },
  { field: 'Broker Name', csaValue: 'National Benefits Group', clientSpaceValue: 'National Benefits Group', category: 'General Information', role: 'pm' },

  // PM: Contract & Dates
  { field: 'Effective Date', csaValue: '07/01/2026', clientSpaceValue: '08/01/2026', category: 'Contract & Dates', role: 'pm' },
  { field: 'Contract Term', csaValue: 'One (1) Year', clientSpaceValue: 'One (1) Year', category: 'Contract & Dates', role: 'pm' },
  { field: 'Client Status', csaValue: 'Active', clientSpaceValue: 'Active', category: 'Contract & Dates', role: 'pm' },

  // PM: Services
  { field: 'Services Included', csaValue: 'Payroll, Benefits Admin, WC', clientSpaceValue: 'Payroll, Benefits Admin, WC', category: 'Services', role: 'pm' },
  { field: 'State of Operation', csaValue: 'Connecticut', clientSpaceValue: 'Connecticut', category: 'Services', role: 'pm' },

  // PM: Onboarding
  { field: 'Onboarding Project Manager', csaValue: null, clientSpaceValue: 'Dana Whitfield', category: 'Onboarding', role: 'pm' },
  { field: 'CPEO Client', csaValue: 'Yes', clientSpaceValue: 'Yes', category: 'Onboarding', role: 'pm' },

  // PA: Fee Structure
  { field: 'Admin Fee / PEPM Fee', csaValue: '$125.00 PEPM', clientSpaceValue: '$120.00 PEPM', category: 'Fee Structure', role: 'pa' },
  { field: 'Implementation Fee', csaValue: '$2,500 one-time', clientSpaceValue: '$2,500 one-time', category: 'Fee Structure', role: 'pa' },
  { field: 'Off-cycle Payroll Fee', csaValue: '$75.00 per run', clientSpaceValue: '$75.00 per run', category: 'Fee Structure', role: 'pa' },
  { field: 'Cyber Insurance Fee', csaValue: '$4.50 PEPM', clientSpaceValue: '$4.50 PEPM', category: 'Fee Structure', role: 'pa' },

  // PA: Tax & Compliance
  { field: 'SUTA Coverage', csaValue: 'Client Rate CR%', clientSpaceValue: 'Standard', category: 'Tax & Compliance', role: 'pa' },
  { field: 'WC Codes', csaValue: 'CT 5606, CT 9012', clientSpaceValue: 'CT 5606, CT 9012', category: 'Tax & Compliance', role: 'pa' },
  { field: 'Workers Compensation Rates', csaValue: '$2.14 / $100 payroll', clientSpaceValue: '$2.14 / $100 payroll', category: 'Tax & Compliance', role: 'pa' },
  { field: 'FICA Rate', csaValue: '7.65%', clientSpaceValue: '7.65%', category: 'Tax & Compliance', role: 'pa' },
  { field: 'FUTA Rate', csaValue: '0.60%', clientSpaceValue: '0.60%', category: 'Tax & Compliance', role: 'pa' },
  { field: 'Tax Classification', csaValue: 'S-Corporation', clientSpaceValue: 'S-Corporation', category: 'Tax & Compliance', role: 'pa' },

  // PA: Payroll
  { field: 'Pay Frequency', csaValue: 'Bi-weekly', clientSpaceValue: 'Bi-weekly', category: 'Payroll', role: 'pa' },
  { field: 'First Payroll Date', csaValue: '07/10/2026', clientSpaceValue: '07/10/2026', category: 'Payroll', role: 'pa' },
  { field: 'Pay Period Begin/End Date', csaValue: '06/29/2026 - 07/10/2026', clientSpaceValue: '06/29/2026 - 07/10/2026', category: 'Payroll', role: 'pa' },
  { field: 'Payroll Submission Deadline', csaValue: '2 business days prior', clientSpaceValue: '2 business days prior', category: 'Payroll', role: 'pa' },
  { field: 'Payroll Approval Deadline', csaValue: '1 business day prior', clientSpaceValue: '1 business day prior', category: 'Payroll', role: 'pa' },
  { field: 'Expedited Service Fee', csaValue: '$150.00', clientSpaceValue: '$150.00', category: 'Payroll', role: 'pa' },
  { field: 'Billing Frequency', csaValue: 'Monthly', clientSpaceValue: 'Bi-weekly', category: 'Payroll', role: 'pa' },

  // PA: Benefits
  { field: 'Offer Benefits', csaValue: 'Yes', clientSpaceValue: 'Yes', category: 'Benefits', role: 'pa' },
  { field: 'Plan Sponsors', csaValue: 'Employer + Voluntary', clientSpaceValue: 'Employer + Voluntary', category: 'Benefits', role: 'pa' },
  { field: 'Benefit Effective Date', csaValue: 'First of month following 30-day waiting period', clientSpaceValue: 'First of month following 30-day waiting period', category: 'Benefits', role: 'pa' },
  { field: 'Medical Carrier', csaValue: 'Anthem Blue Cross', clientSpaceValue: 'Anthem Blue Cross', category: 'Benefits', role: 'pa' },
  { field: 'Offer Retirement Plan', csaValue: 'Yes', clientSpaceValue: 'Yes', category: 'Benefits', role: 'pa' },
  { field: 'Retirement Plan Carrier', csaValue: 'Transamerica', clientSpaceValue: 'Transamerica', category: 'Benefits', role: 'pa' },
];

/* ── Generate generic fields for non-Acme clients ── */

function getFieldsForClient(clientId: string, client: ClientDetail): FieldRow[] {
  if (clientId === 'cli-1') return ACME_FIELDS;

  const hasCsa = client.csaId !== null;
  const csaVal = (v: string) => hasCsa ? v : null;

  return [
    { field: 'Organization Name', csaValue: csaVal(client.name), clientSpaceValue: client.name, category: 'General Information', role: 'pm' },
    { field: 'Contract Type', csaValue: csaVal('PEO - Full Service'), clientSpaceValue: 'PEO - Full Service', category: 'General Information', role: 'pm' },
    { field: 'Number of Employees', csaValue: csaVal(String(client.employeeCount)), clientSpaceValue: String(client.employeeCount), category: 'General Information', role: 'pm' },
    { field: 'Decision Maker', csaValue: csaVal('Primary Contact'), clientSpaceValue: 'Primary Contact', category: 'General Information', role: 'pm' },
    { field: 'Client Onboarding Contact', csaValue: csaVal('HR Contact'), clientSpaceValue: 'HR Contact', category: 'General Information', role: 'pm' },
    { field: 'Current Payroll Vendor', csaValue: csaVal('Previous Provider'), clientSpaceValue: 'Previous Provider', category: 'General Information', role: 'pm' },
    { field: 'Current Vendor Relationship', csaValue: csaVal('2 years'), clientSpaceValue: '2 years', category: 'General Information', role: 'pm' },
    { field: 'Broker Referred', csaValue: csaVal('No'), clientSpaceValue: 'No', category: 'General Information', role: 'pm' },
    { field: 'Broker Name', csaValue: csaVal('N/A'), clientSpaceValue: 'N/A', category: 'General Information', role: 'pm' },
    { field: 'Effective Date', csaValue: csaVal(client.effectiveDate), clientSpaceValue: client.effectiveDate, category: 'Contract & Dates', role: 'pm' },
    { field: 'Contract Term', csaValue: csaVal('One (1) Year'), clientSpaceValue: 'One (1) Year', category: 'Contract & Dates', role: 'pm' },
    { field: 'Client Status', csaValue: csaVal(client.status), clientSpaceValue: client.status, category: 'Contract & Dates', role: 'pm' },
    { field: 'Services Included', csaValue: csaVal('Payroll, Benefits Admin, WC'), clientSpaceValue: 'Payroll, Benefits Admin, WC', category: 'Services', role: 'pm' },
    { field: 'State of Operation', csaValue: csaVal('Multi-state'), clientSpaceValue: 'Multi-state', category: 'Services', role: 'pm' },
    { field: 'Onboarding Project Manager', csaValue: null, clientSpaceValue: client.pmName, category: 'Onboarding', role: 'pm' },
    { field: 'CPEO Client', csaValue: csaVal('Yes'), clientSpaceValue: 'Yes', category: 'Onboarding', role: 'pm' },
    { field: 'Admin Fee / PEPM Fee', csaValue: csaVal('$110.00 PEPM'), clientSpaceValue: '$110.00 PEPM', category: 'Fee Structure', role: 'pa' },
    { field: 'Implementation Fee', csaValue: csaVal('$2,000 one-time'), clientSpaceValue: '$2,000 one-time', category: 'Fee Structure', role: 'pa' },
    { field: 'Off-cycle Payroll Fee', csaValue: csaVal('$75.00 per run'), clientSpaceValue: '$75.00 per run', category: 'Fee Structure', role: 'pa' },
    { field: 'Cyber Insurance Fee', csaValue: csaVal('$4.50 PEPM'), clientSpaceValue: '$4.50 PEPM', category: 'Fee Structure', role: 'pa' },
    { field: 'SUTA Coverage', csaValue: csaVal('Standard'), clientSpaceValue: 'Standard', category: 'Tax & Compliance', role: 'pa' },
    { field: 'WC Codes', csaValue: csaVal('8810, 8742'), clientSpaceValue: '8810, 8742', category: 'Tax & Compliance', role: 'pa' },
    { field: 'Workers Compensation Rates', csaValue: csaVal('$1.85 / $100 payroll'), clientSpaceValue: '$1.85 / $100 payroll', category: 'Tax & Compliance', role: 'pa' },
    { field: 'FICA Rate', csaValue: csaVal('7.65%'), clientSpaceValue: '7.65%', category: 'Tax & Compliance', role: 'pa' },
    { field: 'FUTA Rate', csaValue: csaVal('0.60%'), clientSpaceValue: '0.60%', category: 'Tax & Compliance', role: 'pa' },
    { field: 'Tax Classification', csaValue: csaVal('LLC'), clientSpaceValue: 'LLC', category: 'Tax & Compliance', role: 'pa' },
    { field: 'Pay Frequency', csaValue: csaVal('Bi-weekly'), clientSpaceValue: 'Bi-weekly', category: 'Payroll', role: 'pa' },
    { field: 'First Payroll Date', csaValue: csaVal(client.effectiveDate), clientSpaceValue: client.effectiveDate, category: 'Payroll', role: 'pa' },
    { field: 'Payroll Submission Deadline', csaValue: csaVal('2 business days prior'), clientSpaceValue: '2 business days prior', category: 'Payroll', role: 'pa' },
    { field: 'Payroll Approval Deadline', csaValue: csaVal('1 business day prior'), clientSpaceValue: '1 business day prior', category: 'Payroll', role: 'pa' },
    { field: 'Offer Benefits', csaValue: csaVal('Yes'), clientSpaceValue: 'Yes', category: 'Benefits', role: 'pa' },
    { field: 'Plan Sponsors', csaValue: csaVal('Employer'), clientSpaceValue: 'Employer', category: 'Benefits', role: 'pa' },
    { field: 'Benefit Effective Date', csaValue: csaVal('First of month following hire'), clientSpaceValue: 'First of month following hire', category: 'Benefits', role: 'pa' },
    { field: 'Medical Carrier', csaValue: csaVal('UnitedHealthcare'), clientSpaceValue: 'UnitedHealthcare', category: 'Benefits', role: 'pa' },
    { field: 'Offer Retirement Plan', csaValue: csaVal('No'), clientSpaceValue: 'No', category: 'Benefits', role: 'pa' },
    { field: 'Retirement Plan Carrier', csaValue: csaVal('N/A'), clientSpaceValue: 'N/A', category: 'Benefits', role: 'pa' },
  ];
}

/* ── Acme Corp validation data ── */

const ACME_VALIDATION: ValidationRow[] = [
  // Matches (12)
  { field: 'Organization Name', csaValue: 'Tsiro Real Estate Management, LLC', clientSpaceValue: 'Tsiro Real Estate Management, LLC', status: 'match' },
  { field: 'Contract Type', csaValue: 'PEO - Full Service', clientSpaceValue: 'PEO - Full Service', status: 'match' },
  { field: 'Decision Maker', csaValue: 'Jordan Mitchell, CEO', clientSpaceValue: 'Jordan Mitchell, CEO', status: 'match' },
  { field: 'Contract Term', csaValue: 'One (1) Year', clientSpaceValue: 'One (1) Year', status: 'match' },
  { field: 'Services Included', csaValue: 'Payroll, Benefits Admin, WC', clientSpaceValue: 'Payroll, Benefits Admin, WC', status: 'match' },
  { field: 'WC Codes', csaValue: 'CT 5606, CT 9012', clientSpaceValue: 'CT 5606, CT 9012', status: 'match' },
  { field: 'State of Operation', csaValue: 'Connecticut', clientSpaceValue: 'Connecticut', status: 'match' },
  { field: 'Broker Name', csaValue: 'National Benefits Group', clientSpaceValue: 'National Benefits Group', status: 'match' },
  { field: 'CPEO Client', csaValue: 'Yes', clientSpaceValue: 'Yes', status: 'match' },
  { field: 'Medical Carrier', csaValue: 'Anthem Blue Cross', clientSpaceValue: 'Anthem Blue Cross', status: 'match' },
  { field: 'Pay Frequency', csaValue: 'Bi-weekly', clientSpaceValue: 'Bi-weekly', status: 'match' },
  { field: 'Implementation Fee', csaValue: '$2,500 one-time', clientSpaceValue: '$2,500 one-time', status: 'match' },

  // Mismatches (5)
  { field: 'Number of Employees', csaValue: '38', clientSpaceValue: '35', status: 'mismatch' },
  { field: 'Effective Date', csaValue: '07/01/2026', clientSpaceValue: '08/01/2026', status: 'mismatch' },
  { field: 'SUTA Coverage', csaValue: 'Client Rate CR%', clientSpaceValue: 'Standard', status: 'mismatch' },
  { field: 'Admin Fee / PEPM Fee', csaValue: '$125.00 PEPM', clientSpaceValue: '$120.00 PEPM', status: 'mismatch' },
  { field: 'Billing Frequency', csaValue: 'Monthly', clientSpaceValue: 'Bi-weekly', status: 'mismatch' },

  // Missing from CSA (3)
  { field: 'Onboarding Project Manager', csaValue: null, clientSpaceValue: 'Dana Whitfield', status: 'missing' },
  { field: 'Client Onboarding Contact Email', csaValue: null, clientSpaceValue: 's.chen@acmecorp.com', status: 'missing' },
  { field: 'PrismHR Client Code', csaValue: null, clientSpaceValue: 'PH-ACM-2026', status: 'missing' },
];

/* ── Status metadata ── */

const STATUS_META: Record<ClientStatus, { fg: string; bg: string }> = {
  Active: { fg: '#1A7A4A', bg: '#E4F2EA' },
  Onboarding: { fg: '#0074B8', bg: '#E7F1FA' },
  'Pending Setup': { fg: '#B0690A', bg: '#FBF0DD' },
};

const MATCH_META: Record<MatchStatus, { label: string; fg: string; bg: string; icon: string }> = {
  match: { label: 'Match', fg: '#1A7A4A', bg: '#E4F2EA', icon: 'fa-circle-check' },
  mismatch: { label: 'Mismatch', fg: '#B0690A', bg: '#FBF0DD', icon: 'fa-triangle-exclamation' },
  pending: { label: 'Pending', fg: '#98A1A8', bg: '#F1F3F5', icon: 'fa-clock' },
  missing: { label: 'Missing', fg: '#5B6770', bg: '#F1F3F5', icon: 'fa-circle-minus' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'General Information': 'fa-building',
  'Contract & Dates': 'fa-file-contract',
  'Services': 'fa-concierge-bell',
  'Onboarding': 'fa-clipboard-list',
  'Fee Structure': 'fa-dollar-sign',
  'Tax & Compliance': 'fa-scale-balanced',
  'Payroll': 'fa-money-check-dollar',
  'Benefits': 'fa-heart-pulse',
};

/* ── Helpers ── */

function getMatchStatus(row: FieldRow): MatchStatus {
  if (row.csaValue === null) return 'pending';
  if (row.csaValue === row.clientSpaceValue) return 'match';
  return 'mismatch';
}

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

/* ── Tab definitions ── */

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'pm', label: 'PM Review', icon: 'fa-user-tie' },
  { key: 'pa', label: 'PA Review', icon: 'fa-calculator' },
  { key: 'all', label: 'All Fields', icon: 'fa-list' },
  { key: 'validation', label: 'ClientSpace Validation', icon: 'fa-code-compare' },
  { key: 'handoff', label: 'Handoff Data', icon: 'fa-database' },
];

/* ================================================================
   Field Table Component
   ================================================================ */

function FieldTable({ fields, hoveredRow, setHoveredRow }: { fields: FieldRow[]; hoveredRow: string | null; setHoveredRow: (v: string | null) => void }) {
  const categories = Array.from(new Set(fields.map(f => f.category)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {categories.map(cat => {
        const catFields = fields.filter(f => f.category === cat);
        const catIcon = CATEGORY_ICONS[cat] || 'fa-folder';
        return (
          <div key={cat}>
            {/* Category header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 0', marginBottom: 4,
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <i className={`fa-solid ${catIcon}`} style={{ fontSize: 13, color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {cat}
              </span>
              <span style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                {catFields.length} fields
              </span>
            </div>

            {/* Table */}
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px',
                background: 'var(--bg-secondary)', padding: '8px 14px',
                fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                <div>Field</div>
                <div>CSA Extracted Value</div>
                <div>ClientSpace Value</div>
                <div style={{ textAlign: 'center' }}>Status</div>
              </div>

              {/* Rows */}
              {catFields.map((row, i) => {
                const status = getMatchStatus(row);
                const meta = MATCH_META[status];
                const rowKey = `${cat}-${row.field}`;
                return (
                  <div
                    key={rowKey}
                    onMouseEnter={() => setHoveredRow(rowKey)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px',
                      padding: '10px 14px', alignItems: 'center',
                      borderTop: i > 0 ? '1px solid var(--border-primary)' : 'none',
                      background: hoveredRow === rowKey ? 'var(--bg-secondary)' : '#fff',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {row.field}
                    </div>
                    <div style={{
                      fontSize: 'var(--type-body-sm)', color: row.csaValue ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      fontStyle: row.csaValue ? 'normal' : 'italic',
                    }}>
                      {row.csaValue || 'Pending CSA upload'}
                    </div>
                    <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)' }}>
                      {row.clientSpaceValue}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 'var(--type-badge)', fontWeight: 600,
                        color: meta.fg, background: meta.bg,
                        padding: '2px 8px', borderRadius: 6, height: 22,
                        lineHeight: 1,
                      }}>
                        {status === 'match' && <span style={{ fontSize: 11 }}>&#10003;</span>}
                        {status === 'mismatch' && <span style={{ fontSize: 11 }}>&#9888;</span>}
                        {status === 'pending' && <span style={{ fontSize: 9 }}>&mdash;</span>}
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   Validation Table Component
   ================================================================ */

function ValidationTable({ rows, hoveredRow, setHoveredRow }: { rows: ValidationRow[]; hoveredRow: string | null; setHoveredRow: (v: string | null) => void }) {
  const matches = rows.filter(r => r.status === 'match').length;
  const mismatches = rows.filter(r => r.status === 'mismatch').length;
  const missing = rows.filter(r => r.status === 'missing').length;

  return (
    <div>
      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 16, padding: '12px 16px',
        background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A7A4A' }} />
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{matches} Matches</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B0690A' }} />
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{mismatches} Mismatches</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#98A1A8' }} />
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{missing} Missing from CSA</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
          {rows.length} total fields compared
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 110px',
          background: 'var(--bg-secondary)', padding: '10px 16px',
          fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          <div>Field Name</div>
          <div>CSA Value</div>
          <div>ClientSpace Value</div>
          <div style={{ textAlign: 'center' }}>Status</div>
        </div>

        {/* Rows sorted: mismatches first, then missing, then matches */}
        {[...rows]
          .sort((a, b) => {
            const order: Record<MatchStatus, number> = { mismatch: 0, missing: 1, pending: 2, match: 3 };
            return order[a.status] - order[b.status];
          })
          .map((row, i) => {
            const meta = MATCH_META[row.status];
            const bgColor =
              row.status === 'match' ? '#F6FBF8' :
              row.status === 'mismatch' ? '#FFFBF5' :
              '#FAFAFA';
            const isHovered = hoveredRow === `val-${row.field}`;

            return (
              <div
                key={row.field}
                onMouseEnter={() => setHoveredRow(`val-${row.field}`)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 110px',
                  padding: '10px 16px', alignItems: 'center',
                  borderTop: '1px solid var(--border-primary)',
                  background: isHovered ? 'var(--bg-hover)' : bgColor,
                  transition: 'background 0.1s ease',
                }}
              >
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {row.field}
                </div>
                <div style={{
                  fontSize: 'var(--type-body-sm)',
                  color: row.csaValue ? (row.status === 'mismatch' ? '#B0690A' : 'var(--text-primary)') : 'var(--text-tertiary)',
                  fontWeight: row.status === 'mismatch' ? 600 : 400,
                  fontStyle: row.csaValue ? 'normal' : 'italic',
                }}>
                  {row.csaValue || 'Not in CSA'}
                </div>
                <div style={{
                  fontSize: 'var(--type-body-sm)',
                  color: row.status === 'mismatch' ? '#B0690A' : 'var(--text-primary)',
                  fontWeight: row.status === 'mismatch' ? 600 : 400,
                }}>
                  {row.clientSpaceValue}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 'var(--type-badge)', fontWeight: 600,
                    color: meta.fg, background: meta.bg,
                    padding: '2px 8px', borderRadius: 6, height: 22,
                    lineHeight: 1,
                  }}>
                    <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 10 }} />
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* ================================================================
   Handoff Data Tab Component
   ================================================================ */

type SyncStatus = 'synced' | 'pending' | 'needs-update';

const SYNC_STATUS_META: Record<SyncStatus, { label: string; fg: string; bg: string; icon: string }> = {
  synced: { label: 'Synced', fg: '#1A7A4A', bg: '#E4F2EA', icon: 'fa-circle-check' },
  pending: { label: 'Pending', fg: '#B0690A', bg: '#FBF0DD', icon: 'fa-clock' },
  'needs-update': { label: 'Needs Update', fg: '#5B6770', bg: '#F1F3F5', icon: 'fa-circle-exclamation' },
};

/* Categories to show in the Handoff Data tab (subset — no Onboarding) */
const HANDOFF_CATEGORIES = [
  'General Information',
  'Contract & Dates',
  'Services',
  'Fee Structure',
  'Tax & Compliance',
  'Payroll',
  'Benefits',
];

function getSyncStatus(field: string, category: string): SyncStatus {
  /* Mirror the mismatch / missing patterns visible in ACME_VALIDATION */
  const needsUpdate = [
    'Number of Employees', 'Effective Date', 'Admin Fee / PEPM Fee', 'Billing Frequency',
  ];
  const pending = ['SUTA Coverage'];
  if (needsUpdate.includes(field)) return 'needs-update';
  if (pending.includes(field)) return 'pending';
  return 'synced';
}

function HandoffDataTab({ client, fields }: { client: ClientDetail; fields: FieldRow[] }) {
  const handoffFields = fields.filter(f => HANDOFF_CATEGORIES.includes(f.category));
  const categories = HANDOFF_CATEGORIES.filter(cat => handoffFields.some(f => f.category === cat));

  const syncedCount = handoffFields.filter(f => getSyncStatus(f.field, f.category) === 'synced').length;
  const pendingCount = handoffFields.filter(f => getSyncStatus(f.field, f.category) === 'pending').length;
  const needsUpdateCount = handoffFields.filter(f => getSyncStatus(f.field, f.category) === 'needs-update').length;

  const lastSynced = new Date(client.lastSynced);
  const lastSyncedFormatted = lastSynced.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return (
    <div>
      {/* Header banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '16px 20px', marginBottom: 20,
        background: 'linear-gradient(135deg, #E7F1FA 0%, #EAF5F0 100%)',
        border: '1px solid #B8D8F0', borderRadius: 10,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: '#0074B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="fa-solid fa-database" style={{ fontSize: 18, color: '#fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: 'var(--text-primary)' }}>
              ClientSpace Handoff Page &mdash; Source of Truth
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 'var(--type-badge)', fontWeight: 600,
              color: '#0074B8', background: '#CCE5F6',
              padding: '2px 9px', borderRadius: 20, height: 22, lineHeight: 1,
            }}>
              <i className="fa-solid fa-rotate" style={{ fontSize: 9 }} />
              Last Synced: {lastSyncedFormatted}
            </span>
          </div>
          <p style={{
            margin: '4px 0 0', fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)', lineHeight: 1.5,
          }}>
            This data was pulled from the ClientSpace onboarding handoff page for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{client.name}</strong>{' '}
            and is used for cross-validation against the CSA.
          </p>
        </div>
      </div>

      {/* Sync summary bar */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20,
        padding: '12px 16px',
        background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A7A4A', flexShrink: 0 }} />
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {syncedCount} Synced
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B0690A', flexShrink: 0 }} />
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {pendingCount} Pending
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5B6770', flexShrink: 0 }} />
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {needsUpdateCount} Needs Update
          </span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
          {handoffFields.length} fields from ClientSpace handoff page
        </div>
      </div>

      {/* Data cards by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {categories.map(cat => {
          const catFields = handoffFields.filter(f => f.category === cat);
          const catIcon = CATEGORY_ICONS[cat] || 'fa-folder';
          return (
            <div key={cat}>
              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 0', marginBottom: 10,
                borderBottom: '1px solid var(--border-primary)',
              }}>
                <i className={`fa-solid ${catIcon}`} style={{ fontSize: 13, color: '#0074B8' }} />
                <span style={{
                  fontSize: 'var(--type-body-sm)', fontWeight: 700, color: 'var(--text-primary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {cat}
                </span>
                <span style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {catFields.length} fields
                </span>
              </div>

              {/* Cards grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 10,
              }}>
                {catFields.map(field => {
                  const syncSt = getSyncStatus(field.field, field.category);
                  const syncMeta = SYNC_STATUS_META[syncSt];
                  return (
                    <div
                      key={field.field}
                      style={{
                        background: '#fff',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        display: 'flex', flexDirection: 'column', gap: 6,
                      }}
                    >
                      {/* Field label */}
                      <div style={{
                        fontSize: 'var(--type-badge)', fontWeight: 600,
                        color: 'var(--text-tertiary)', textTransform: 'uppercase',
                        letterSpacing: '0.04em', lineHeight: 1.2,
                      }}>
                        {field.field}
                      </div>

                      {/* ClientSpace value */}
                      <div style={{
                        fontSize: 'var(--type-body)', fontWeight: 600,
                        color: 'var(--text-primary)', lineHeight: 1.35,
                        wordBreak: 'break-word',
                      }}>
                        {field.clientSpaceValue}
                      </div>

                      {/* Footer: source label + sync badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginTop: 2,
                      }}>
                        <span style={{
                          fontSize: 10, color: '#0074B8', fontWeight: 500,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <i className="fa-solid fa-database" style={{ fontSize: 9 }} />
                          ClientSpace
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10, fontWeight: 600,
                          color: syncMeta.fg, background: syncMeta.bg,
                          padding: '1px 7px', borderRadius: 5, height: 20, lineHeight: 1,
                        }}>
                          <i className={`fa-solid ${syncMeta.icon}`} style={{ fontSize: 8 }} />
                          {syncMeta.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Handoff Page Metadata section */}
      <div style={{
        marginTop: 28, padding: '16px 20px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
        borderRadius: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <i className="fa-solid fa-circle-info" style={{ fontSize: 13, color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Handoff Page Metadata
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px 24px',
        }}>
          {[
            { label: 'Source System', value: 'ClientSpace', icon: 'fa-database' },
            { label: 'Handoff Page ID', value: 'HP-2026-0847', icon: 'fa-fingerprint' },
            { label: 'Synced By', value: 'System (Auto)', icon: 'fa-robot' },
            { label: 'Sync Method', value: 'API Integration', icon: 'fa-plug' },
          ].map(meta => (
            <div key={meta.label}>
              <div style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 9 }} />
                {meta.label}
              </div>
              <div style={{
                fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)',
              }}>
                {meta.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Page Component
   ================================================================ */

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [activeTab, setActiveTab] = useState<TabKey>('pm');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const client = CLIENTS[clientId];

  /* Not found fallback */
  if (!client) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <i className="fa-solid fa-building-circle-xmark" style={{ fontSize: 40, color: 'var(--text-tertiary)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 'var(--type-section-title)', color: 'var(--text-primary)', marginBottom: 8 }}>Client not found</h2>
        <p style={{ fontSize: 'var(--type-body)', color: 'var(--text-secondary)', marginBottom: 20 }}>
          The client ID &ldquo;{clientId}&rdquo; does not exist in ClientSpace.
        </p>
        <Link href="/onboarding/clients" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8,
          background: 'var(--text-primary)', color: '#fff',
          fontSize: 'var(--type-body-sm)', fontWeight: 600,
          textDecoration: 'none',
        }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
          Back to Clients
        </Link>
      </div>
    );
  }

  const stMeta = STATUS_META[client.status];
  const fields = getFieldsForClient(clientId, client);
  const pmFields = fields.filter(f => f.role === 'pm');
  const paFields = fields.filter(f => f.role === 'pa');
  const isAcme = clientId === 'cli-1';
  const validationRows = isAcme ? ACME_VALIDATION : fields.map(f => ({
    field: f.field,
    csaValue: f.csaValue,
    clientSpaceValue: f.clientSpaceValue,
    status: getMatchStatus(f) as MatchStatus,
  }));

  return (
    <div style={{ padding: '24px 24px 32px', minWidth: 900 }}>
      {/* Back button */}
      <Link
        href="/onboarding/clients"
        onMouseEnter={() => setHoveredBtn('back')}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)',
          textDecoration: 'none', marginBottom: 16,
          padding: '4px 8px', borderRadius: 6,
          background: hoveredBtn === 'back' ? 'var(--bg-hover)' : 'transparent',
          transition: 'all 0.1s ease',
        }}
      >
        <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
        Back to Clients
      </Link>

      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <i className="fa-solid fa-building" style={{ fontSize: 'var(--type-section-title)', color: '#0074B8' }} />
            <h1 style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {client.name}
            </h1>
            <Badge label={client.status} fg={stMeta.fg} bg={stMeta.bg} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <span style={{
              fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {client.clientSpaceId}
            </span>
            <span style={{ color: 'var(--border-primary)' }}>|</span>
            <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
              PM: {client.pmName}
            </span>
            <span style={{ color: 'var(--border-primary)' }}>|</span>
            <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
              PA: {client.paName}
            </span>
            <span style={{ color: 'var(--border-primary)' }}>|</span>
            <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
              {client.employeeCount} employees
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Link
            href="/onboarding/extract"
            onMouseEnter={() => setHoveredBtn('upload')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, border: 'none',
              background: hoveredBtn === 'upload' ? '#238C55' : '#2A8F60',
              color: '#fff',
              fontSize: 'var(--type-body-sm)', fontWeight: 600,
              textDecoration: 'none', cursor: 'pointer',
              transition: 'background 0.12s ease',
            }}
          >
            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 12 }} />
            Upload CSA
          </Link>
          <Link
            href="/onboarding"
            onMouseEnter={() => setHoveredBtn('dashboard')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8,
              border: '1px solid var(--border-primary)',
              background: hoveredBtn === 'dashboard' ? 'var(--bg-hover)' : '#fff',
              color: 'var(--text-primary)',
              fontSize: 'var(--type-body-sm)', fontWeight: 600,
              textDecoration: 'none', cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            <i className="fa-solid fa-chart-line" style={{ fontSize: 12 }} />
            View in Dashboard
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 24,
        borderBottom: '2px solid var(--border-primary)',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              onMouseEnter={() => setHoveredBtn(`tab-${tab.key}`)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', cursor: 'pointer',
                border: 'none', borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
                marginBottom: -2,
                background: 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 'var(--type-body-sm)', fontWeight: isActive ? 700 : 500,
                transition: 'all 0.12s ease',
                opacity: hoveredBtn === `tab-${tab.key}` && !isActive ? 0.8 : 1,
              }}
            >
              <i className={`fa-solid ${tab.icon}`} style={{ fontSize: 12 }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{
        background: '#fff', border: '1px solid var(--border-primary)',
        borderRadius: 12, padding: 20,
        boxShadow: 'var(--shadow-xs)',
      }}>
        {activeTab === 'pm' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="fa-solid fa-user-tie" style={{ fontSize: 14, color: '#0074B8' }} />
              <span style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Project Manager Review
              </span>
              <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
                &mdash; {client.pmName}
              </span>
            </div>
            <FieldTable fields={pmFields} hoveredRow={hoveredRow} setHoveredRow={setHoveredRow} />
          </div>
        )}

        {activeTab === 'pa' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="fa-solid fa-calculator" style={{ fontSize: 14, color: '#5A45C7' }} />
              <span style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Payroll Analyst Review
              </span>
              <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
                &mdash; {client.paName}
              </span>
            </div>
            <FieldTable fields={paFields} hoveredRow={hoveredRow} setHoveredRow={setHoveredRow} />
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="fa-solid fa-list" style={{ fontSize: 14, color: 'var(--text-primary)' }} />
              <span style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: 'var(--text-primary)' }}>
                All Fields
              </span>
              <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
                &mdash; {fields.length} fields across {Array.from(new Set(fields.map(f => f.category))).length} categories
              </span>
            </div>
            <FieldTable fields={fields} hoveredRow={hoveredRow} setHoveredRow={setHoveredRow} />
          </div>
        )}

        {activeTab === 'validation' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="fa-solid fa-code-compare" style={{ fontSize: 14, color: '#B0690A' }} />
              <span style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: 'var(--text-primary)' }}>
                ClientSpace Validation
              </span>
              <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
                &mdash; CSA extracted values vs ClientSpace handoff page
              </span>
            </div>
            {!client.csaId ? (
              <div style={{
                padding: '32px 24px', textAlign: 'center',
                background: 'var(--bg-secondary)', borderRadius: 10,
              }}>
                <i className="fa-solid fa-file-circle-question" style={{ fontSize: 28, color: 'var(--text-tertiary)', marginBottom: 10 }} />
                <div style={{ fontSize: 'var(--type-body)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  No CSA uploaded yet
                </div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)', marginBottom: 16 }}>
                  Upload a Client Service Agreement to run validation against ClientSpace data.
                </div>
                <Link href="/onboarding/extract" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8,
                  background: '#2A8F60', color: '#fff',
                  fontSize: 'var(--type-body-sm)', fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 11 }} />
                  Upload CSA
                </Link>
              </div>
            ) : (
              <ValidationTable rows={validationRows} hoveredRow={hoveredRow} setHoveredRow={setHoveredRow} />
            )}
          </div>
        )}

        {activeTab === 'handoff' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="fa-solid fa-database" style={{ fontSize: 14, color: '#0074B8' }} />
              <span style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Handoff Data
              </span>
              <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
                &mdash; ClientSpace handoff page values (source of truth)
              </span>
            </div>
            <HandoffDataTab client={client} fields={fields} />
          </div>
        )}
      </div>
    </div>
  );
}
