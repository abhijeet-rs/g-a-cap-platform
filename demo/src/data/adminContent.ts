import { AdminCard } from '@/lib/types';

interface AdminTab {
  key: string;
  label: string;
  cards: AdminCard[];
  metrics?: { label: string; value: string; color: string }[];
}

export const adminTabs: AdminTab[] = [
  {
    key: 'connections', label: 'F2 · Connections',
    cards: [
      { title: 'PrismHR', body: 'System of record for plan configurations, carrier rates, enrollments. Continuous sync with delta detection and versioned rate tables.', accentColor: '#C60C30', badge: 'Connected · 847 syncs' },
      { title: 'ClientSpace', body: 'Workflow/case/audit engine. CAP lifecycle events create and advance cases. Benefits page export and commission tracking.', accentColor: '#0074B8', badge: 'Connected' },
      { title: 'WorkSight', body: 'Client-facing enrollment portal. Receives plan/rate data from approved CAPs for portal configuration.', accentColor: '#1A7A4A', badge: 'Connected' },
      { title: 'DocuSign', body: 'E-signature routing for benefits booklet and CAP confirmation. Envelope status callbacks.', accentColor: '#B0690A', badge: 'Connected' },
      { title: 'Carrier Underwriting', body: 'Document upload + AI extraction path (Hero/Gradient output). No direct API integration — factors enter via upload.', accentColor: '#5A45C7', badge: 'Upload-based' },
    ],
    metrics: [
      { label: 'Total Syncs', value: '847', color: '#C60C30' },
      { label: 'Last Sync', value: '2 min ago', color: '#0074B8' },
      { label: 'Connectors', value: '5', color: '#1A7A4A' },
      { label: 'Uptime', value: '99.97%', color: '#B0690A' },
    ],
  },
  {
    key: 'masterPlans', label: 'F3 · Master Plans',
    cards: [
      { title: 'Plan Catalog', body: 'Synced from PrismHR system-level master plans. Read-only with rate-change diff review before propagation.', accentColor: '#0074B8', badge: 'Prism · synced' },
      { title: 'BCBS Texas', body: 'PPO $500 80%, PPO $1000 70%, HDHP $3300 90%, HMO $500. 4 tier rates per plan (EO/ES/EC/EF).', accentColor: '#C60C30' },
      { title: 'Cigna National', body: 'OAP, PPO, HDHP variants. National network with regional rate tables.', accentColor: '#0074B8' },
      { title: 'Guardian', body: 'Dental PPO $1500, Vision Base PPO. Open-market with manual rate capture.', accentColor: '#1A7A4A' },
      { title: 'Unum / Northwestern', body: 'Life, AD&D, STD, LTD products. Volume-based and age-banded rate tables.', accentColor: '#B0690A' },
    ],
    metrics: [
      { label: 'Master Plans', value: '42', color: '#C60C30' },
      { label: 'Tier Rates', value: '168', color: '#0074B8' },
      { label: 'Carriers', value: '8', color: '#1A7A4A' },
      { label: 'Plan Year', value: '2026', color: '#B0690A' },
    ],
  },
  {
    key: 'pricingStack', label: 'F4 · Pricing Stack',
    cards: [
      { title: 'Rate Formula', body: 'Billed = Base × Bucket × AF × (1 + Comm) × RF. Central building blocks versioned by plan year. Per-CAP resolution at build time.', accentColor: '#5A45C7', badge: 'G&A-managed' },
      { title: 'Bucket Definitions', body: 'Per carrier, selects which base-rate band applies. BCBSTX: 0.950–1.100. Cigna: 0.980–1.050.', accentColor: '#C60C30' },
      { title: 'Admin Factor Tables', body: 'G&A overhead/margin multiplier. Versioned by effective date. Current range: 1.005–1.025.', accentColor: '#0074B8' },
      { title: 'Commission Schedules', body: 'Default commission values by handling type: GAB (0.02), OB-Friendly (0.03), OB (0.04), Deduct & Credit Only (0.05).', accentColor: '#1A7A4A' },
    ],
  },
  {
    key: 'parameters', label: 'F5 · Parameters',
    cards: [
      { title: 'ACA Affordability Threshold', body: 'Current: $129.90/month (2026). Updated annually. Used in affordability check: min EE-only contribution < threshold.', accentColor: '#C60C30', badge: '2026 · Active' },
      { title: 'Deduction Options', body: 'Annual deduction frequencies: 12 (monthly), 24 (semi-monthly), 26 (bi-weekly), 52 (weekly). Drives PPD calculation.', accentColor: '#0074B8' },
      { title: 'Fee Schedule', body: 'Rush Fee: $150 paper / $500 electronic. Change Fee: $150 / $250. MCHILD: $1,000 + $24 PEPY. WRAP: $500 opt-in.', accentColor: '#1A7A4A' },
    ],
  },
  {
    key: 'vocabularies', label: 'F6 · Vocabularies',
    cards: [
      { title: 'Class Types', body: 'All Eligible, Hourly, Salaried, Management, Owners Only, Part-Time Eligible. Deactivate without deleting.', accentColor: '#0074B8' },
      { title: 'Waiting Periods', body: '1st of month following: 30/60/90 days. Date of hire. No waiting period. Custom.', accentColor: '#C60C30' },
      { title: 'Entity Types', body: 'C-Corp, S-Corp, LLC, Partnership, Sole Proprietor, Non-Profit, Government.', accentColor: '#1A7A4A' },
      { title: 'Commission Handling', body: 'GAB, OB-Friendly, OB, Deduct & Credit Only.', accentColor: '#B0690A' },
      { title: 'HSA/FSA Options', body: 'Cadence: Monthly, Per-pay-period. Funding: Employer, Employee, Both. Rollover: Yes/No.', accentColor: '#5A45C7' },
    ],
  },
  {
    key: 'templates', label: 'F7 · Templates',
    cards: [
      { title: 'ER Confirmation', body: 'Benefits Selection Confirmation for employer. Merge fields: plan names, rates, contribution, effective date.', accentColor: '#C60C30', badge: 'v3 · Active' },
      { title: 'EE SRA (English)', body: 'Benefits Enrollment Form & Salary Redirection Agreement. Employee-facing with plan options and deductions.', accentColor: '#0074B8', badge: 'v2 · Active' },
      { title: 'EE SRA (Spanish)', body: 'Spanish-language version of the SRA. Same merge fields, localized content.', accentColor: '#0074B8', badge: 'v2 · Active' },
      { title: 'Benefits Booklet', body: 'Auto-generated client booklet routed for DocuSign signature. The primary deliverable artifact.', accentColor: '#1A7A4A', badge: 'v4 · Active' },
      { title: 'Prism Handoff Payload', body: 'Structured JSON payload for Ben Admin onboarding. Maps CAP data to Prism client-benefit model.', accentColor: '#5A45C7', badge: 'v1 · Active' },
    ],
  },
  {
    key: 'validation', label: 'F8 · Validation',
    cards: [
      { title: 'Completeness Rules', body: 'Required fields populated, at least one medical plan, UW parameters complete, client contact present.', accentColor: '#C60C30', badge: '12 rules' },
      { title: 'Source-Data Validation', body: 'Each plan rate validated against F3 carrier rate table × F4 risk factor. Mismatches raise specific, actionable errors.', accentColor: '#0074B8', badge: '8 rules' },
      { title: 'Cross-Field Consistency', body: 'ER + EE = Total, ACA affordability check (F5), booklet/CAP rates match, open-market SBCs complete.', accentColor: '#1A7A4A', badge: '6 rules' },
      { title: 'Audit Gates', body: 'Error-severity items block Ben Admin handoff. Warnings are advisory. Unreconciled drift and unresolved deltas block handoff.', accentColor: '#B0690A', badge: '4 gates' },
    ],
  },
  {
    key: 'roles', label: 'F9 · Roles',
    cards: [
      { title: 'Account Manager (AM)', body: 'Blue-legend fields. Primary inputs: plan selection, contribution strategy, seed info. Can create, edit, e-sign.', accentColor: '#C60C30' },
      { title: 'Account Executive (AE)', body: 'Blue-legend fields + approve. Oversight role for larger clients. Can approve CAPs without manager escalation.', accentColor: '#0074B8' },
      { title: 'Benefits Coordinator (BC)', body: 'Yellow-legend conditional fields. QC review, audit checklist, booklet/CAP match verification.', accentColor: '#5B6770' },
      { title: 'Benefits Analyst (BA)', body: 'Ben Admin team. Receives approved CAPs for Prism configuration. View-only on CAP platform.', accentColor: '#5B6770' },
      { title: 'GAB Manager (GM)', body: 'Green-legend shareable fields. Full lifecycle permissions including publish. Team oversight.', accentColor: '#1A7A4A' },
      { title: 'System Admin (SA)', body: 'Red-legend internal fields. All permissions including admin console access and role management.', accentColor: '#5A45C7' },
    ],
    metrics: [
      { label: 'Roles', value: '6', color: '#C60C30' },
      { label: 'Permissions', value: '6', color: '#0074B8' },
      { label: 'Field Classes', value: '4', color: '#1A7A4A' },
      { label: 'PHI Fields', value: '14', color: '#B0690A' },
    ],
  },
];
