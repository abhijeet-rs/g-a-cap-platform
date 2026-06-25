'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';
import { adminTabs } from '@/data/adminContent';
import { roles } from '@/data/roles';
import { clients } from '@/data/clients';
import { PageSkeleton } from '@/components/shared/Skeleton';
import type { Role, Permission } from '@/lib/types';

const ALL_PERMISSIONS: Permission[] = ['create', 'edit', 'approve', 'publish', 'esign', 'admin'];

const permDescriptions: Record<Permission, string> = {
  create: 'Create new CAPs and plans',
  edit: 'Edit existing CAP data and fields',
  approve: 'Approve CAPs for publishing',
  publish: 'Publish finalized CAPs',
  esign: 'Send and sign via DocuSign',
  admin: 'Full admin console access',
};

/* ---- expanded-card detail data ---- */
const expandedDetails: Record<string, React.ReactNode> = {
  /* Connections */
  PrismHR: (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Field Mapping</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Prism Field</th>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Platform Field</th>
        </tr></thead>
        <tbody>
          {[['clientId','client.prismId'],['planCode','plan.carrierId'],['eeRate','tierRates.eo'],['erRate','contribution.erPct'],['effDate','plan.effectiveDate']].map(([a,b])=>(
            <tr key={a} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#5A45C7' }}>{a}</td>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#1A7A4A' }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  ClientSpace: (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Field Mapping</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>CS Field</th>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Platform Field</th>
        </tr></thead>
        <tbody>
          {[['census','census.employees[]'],['csaDoc','intake.csa'],['signedCAP','documents.cap'],['contract','contract.details'],['auditLog','audit.entries']].map(([a,b])=>(
            <tr key={a} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#5A45C7' }}>{a}</td>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#1A7A4A' }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  WorkSight: (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Field Mapping</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>WS Field</th>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Platform Field</th>
        </tr></thead>
        <tbody>
          {[['enrollPlan','plan.id'],['rateTable','tierRates.*'],['portalConfig','enrollment.config'],['eligibility','class.type']].map(([a,b])=>(
            <tr key={a} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#5A45C7' }}>{a}</td>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#1A7A4A' }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  DocuSign: (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Field Mapping</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>DS Field</th>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Platform Field</th>
        </tr></thead>
        <tbody>
          {[['envelopeId','esign.envelopeId'],['signerStatus','esign.signerStatus'],['completedAt','esign.completedDate'],['templateId','template.docusignRef']].map(([a,b])=>(
            <tr key={a} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#5A45C7' }}>{a}</td>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#1A7A4A' }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  'Carrier Underwriting': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Field Mapping</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Upload Field</th>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Platform Field</th>
        </tr></thead>
        <tbody>
          {[['sbcDoc','uw.sbcDocument'],['rateSheet','uw.carrierRates'],['factors','uw.riskFactors'],['confidence','uw.extractConfidence']].map(([a,b])=>(
            <tr key={a} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#5A45C7' }}>{a}</td>
              <td style={{ padding: '3px 6px', fontFamily: 'monospace', color: '#1A7A4A' }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  /* Master Plans */
  'Plan Catalog': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Sample Rate Table</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Tier</th>
          <th style={{ textAlign: 'right', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Rate</th>
        </tr></thead>
        <tbody>
          {[['EO','$624.18'],['ES','$1,310.78'],['EC','$1,123.52'],['EF','$1,810.12']].map(([t,r])=>(
            <tr key={t} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px' }}>{t}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  'BCBS Texas': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>PPO $500 80% Tier Rates</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Tier</th>
          <th style={{ textAlign: 'right', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Rate</th>
        </tr></thead>
        <tbody>
          {[['EO','$654.32'],['ES','$1,373.07'],['EC','$1,176.77'],['EF','$1,897.55']].map(([t,r])=>(
            <tr key={t} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px' }}>{t}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  'Cigna National': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>OAP Tier Rates</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Tier</th>
          <th style={{ textAlign: 'right', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Rate</th>
        </tr></thead>
        <tbody>
          {[['EO','$589.44'],['ES','$1,237.82'],['EC','$1,060.99'],['EF','$1,709.37']].map(([t,r])=>(
            <tr key={t} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px' }}>{t}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  Guardian: (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Dental PPO Tier Rates</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Tier</th>
          <th style={{ textAlign: 'right', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Rate</th>
        </tr></thead>
        <tbody>
          {[['EO','$42.10'],['ES','$84.20'],['EC','$88.41'],['EF','$126.30']].map(([t,r])=>(
            <tr key={t} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px' }}>{t}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  'Unum / Northwestern': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Life/AD&D Rate per $1,000</div>
      <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid #E4E8ED' }}>
          <th style={{ textAlign: 'left', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Age Band</th>
          <th style={{ textAlign: 'right', padding: '3px 6px', color: '#374151', fontWeight: 600, fontSize: 8 }}>Rate</th>
        </tr></thead>
        <tbody>
          {[['<30','$0.084'],['30-39','$0.098'],['40-49','$0.152'],['50-59','$0.284']].map(([t,r])=>(
            <tr key={t} style={{ borderBottom: '1px solid #F4F6F8' }}>
              <td style={{ padding: '3px 6px' }}>{t}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  /* Pricing Stack */
  'Rate Formula': (
    <div style={{ padding: '6px 8px', background: '#F8F4FF', borderRadius: 6, fontFamily: 'monospace', fontSize: 'var(--type-body-sm)', color: '#5A45C7', lineHeight: 1.8 }}>
      <div>Billed = $624.18 x 1.020 x 1.015 x (1 + 0.03) x 1.000</div>
      <div>Billed = $624.18 x 1.020 x 1.015 x 1.030 x 1.000</div>
      <div style={{ fontWeight: 600, marginTop: 2 }}>Billed = <span style={{ color: '#C60C30' }}>$665.89</span></div>
    </div>
  ),
  'Bucket Definitions': (
    <div style={{ padding: '6px 8px', background: '#FFF5F5', borderRadius: 6, fontFamily: 'monospace', fontSize: 'var(--type-body-sm)', color: '#C60C30', lineHeight: 1.8 }}>
      <div>BCBSTX Bucket A: 0.950</div>
      <div>BCBSTX Bucket B: 1.000</div>
      <div>BCBSTX Bucket C: 1.050</div>
      <div>BCBSTX Bucket D: 1.100</div>
    </div>
  ),
  'Admin Factor Tables': (
    <div style={{ padding: '6px 8px', background: '#F0F7FF', borderRadius: 6, fontFamily: 'monospace', fontSize: 'var(--type-body-sm)', color: '#0074B8', lineHeight: 1.8 }}>
      <div>Standard: 1.015 (eff 01/01/2026)</div>
      <div>Preferred: 1.010 (eff 01/01/2026)</div>
      <div>Premium: 1.005 (eff 01/01/2026)</div>
      <div>Override: 1.025 (eff 07/01/2025)</div>
    </div>
  ),
  'Commission Schedules': (
    <div style={{ padding: '6px 8px', background: '#F0FFF5', borderRadius: 6, fontFamily: 'monospace', fontSize: 'var(--type-body-sm)', color: '#1A7A4A', lineHeight: 1.8 }}>
      <div>GAB: 0.020 (2.0%)</div>
      <div>OB-Friendly: 0.030 (3.0%)</div>
      <div>OB: 0.040 (4.0%)</div>
      <div>Deduct & Credit: 0.050 (5.0%)</div>
    </div>
  ),
  /* Templates */
  'ER Confirmation': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Merge Fields</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {['{{client.name}}','{{plan.name}}','{{tierRates.eo}}','{{erContrib.pct}}','{{effDate}}','{{broker.name}}'].map(f=>(
          <span key={f} style={{ fontSize: 'var(--type-body-sm)', fontFamily: 'monospace', background: '#FFF5F5', color: '#C60C30', padding: '2px 6px', borderRadius: 4 }}>{f}</span>
        ))}
      </div>
    </div>
  ),
  'EE SRA (English)': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Merge Fields</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {['{{ee.name}}','{{plan.options[]}}','{{deduction.ppd}}','{{coverage.tier}}','{{effDate}}'].map(f=>(
          <span key={f} style={{ fontSize: 'var(--type-body-sm)', fontFamily: 'monospace', background: '#F0F7FF', color: '#0074B8', padding: '2px 6px', borderRadius: 4 }}>{f}</span>
        ))}
      </div>
    </div>
  ),
  'EE SRA (Spanish)': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Merge Fields</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {['{{ee.nombre}}','{{plan.opciones[]}}','{{deduccion.ppd}}','{{cobertura.nivel}}','{{fechaEfectiva}}'].map(f=>(
          <span key={f} style={{ fontSize: 'var(--type-body-sm)', fontFamily: 'monospace', background: '#F0F7FF', color: '#0074B8', padding: '2px 6px', borderRadius: 4 }}>{f}</span>
        ))}
      </div>
    </div>
  ),
  'Benefits Booklet': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Merge Fields</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {['{{client.name}}','{{plans[]}}','{{rates[]}}','{{contrib.strategy}}','{{booklet.sections[]}}','{{signature.block}}'].map(f=>(
          <span key={f} style={{ fontSize: 'var(--type-body-sm)', fontFamily: 'monospace', background: '#F0FFF5', color: '#1A7A4A', padding: '2px 6px', borderRadius: 4 }}>{f}</span>
        ))}
      </div>
    </div>
  ),
  'Prism Handoff Payload': (
    <div>
      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Merge Fields</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {['{{prism.clientId}}','{{prism.plans[]}}','{{prism.rates[]}}','{{prism.classes[]}}','{{prism.deductions}}'].map(f=>(
          <span key={f} style={{ fontSize: 'var(--type-body-sm)', fontFamily: 'monospace', background: '#F8F4FF', color: '#5A45C7', padding: '2px 6px', borderRadius: 4 }}>{f}</span>
        ))}
      </div>
    </div>
  ),
  /* Validation */
  'Completeness Rules': (
    <div style={{ padding: '6px 8px', background: '#FFF5F5', borderRadius: 6, fontFamily: 'monospace', fontSize: 'var(--type-body-sm)', color: '#374151', lineHeight: 2 }}>
      <div>{`{ "rule": "REQ_MEDICAL", "severity": "error", "check": "plans.medical.length >= 1" }`}</div>
      <div>{`{ "rule": "REQ_CONTACT", "severity": "error", "check": "client.contact != null" }`}</div>
      <div>{`{ "rule": "REQ_UW", "severity": "error", "check": "uw.bucket && uw.af && uw.comm" }`}</div>
    </div>
  ),
  'Source-Data Validation': (
    <div style={{ padding: '6px 8px', background: '#F0F7FF', borderRadius: 6, fontFamily: 'monospace', fontSize: 'var(--type-body-sm)', color: '#374151', lineHeight: 2 }}>
      <div>{`{ "rule": "RATE_MATCH", "check": "plan.rate == master.rate * uw.bucket * uw.af" }`}</div>
      <div>{`{ "rule": "TIER_COMPLETE", "check": "plan.tiers == ['EO','ES','EC','EF']" }`}</div>
    </div>
  ),
  'Cross-Field Consistency': (
    <div style={{ padding: '6px 8px', background: '#F0FFF5', borderRadius: 6, fontFamily: 'monospace', fontSize: 'var(--type-body-sm)', color: '#374151', lineHeight: 2 }}>
      <div>{`{ "rule": "ER_EE_TOTAL", "check": "er.amount + ee.amount == total.premium" }`}</div>
      <div>{`{ "rule": "ACA_AFFORD", "check": "ee.eo.rate <= params.acaThreshold" }`}</div>
    </div>
  ),
  'Audit Gates': (
    <div style={{ padding: '6px 8px', background: '#FFF8F0', borderRadius: 6, fontFamily: 'monospace', fontSize: 'var(--type-body-sm)', color: '#374151', lineHeight: 2 }}>
      <div>{`{ "gate": "HANDOFF_BLOCK", "condition": "errors.length == 0" }`}</div>
      <div>{`{ "gate": "DRIFT_BLOCK", "condition": "drift.unresolved == 0" }`}</div>
    </div>
  ),
};

/* ---- version history data ---- */
const versionBadges: Record<string, string[]> = {
  'ER Confirmation': ['v1', 'v2', 'v3'],
  'EE SRA (English)': ['v1', 'v2'],
  'EE SRA (Spanish)': ['v1', 'v2'],
  'Benefits Booklet': ['v1', 'v2', 'v3', 'v4'],
  'Prism Handoff Payload': ['v1'],
  'Rate Formula': ['v1', 'v2', 'v3'],
  'Bucket Definitions': ['v1', 'v2'],
  'Admin Factor Tables': ['v1', 'v2'],
  'Commission Schedules': ['v1', 'v2', 'v3'],
};

/* ---- sync overlay steps ---- */
const syncSteps = [
  { label: 'Authenticating with PrismHR API...', ms: 600 },
  { label: 'Fetching master plan catalog...', ms: 900 },
  { label: 'Delta detection on rate tables...', ms: 700 },
  { label: 'Syncing 42 rate changes...', ms: 1100 },
  { label: 'Validating data integrity...', ms: 500 },
  { label: 'Sync complete - 847 total syncs', ms: 400 },
];

/* ---- Master Plans browse data ---- */
const samplePlans = [
  { id: 'MP-001', carrier: 'BCBS Texas', plan: 'PPO $500 80%', type: 'Medical', eoRate: '$654.32', status: 'Active' },
  { id: 'MP-002', carrier: 'BCBS Texas', plan: 'HDHP $3300 90%', type: 'Medical', eoRate: '$512.10', status: 'Active' },
  { id: 'MP-003', carrier: 'Cigna National', plan: 'OAP $500', type: 'Medical', eoRate: '$589.44', status: 'Active' },
  { id: 'MP-004', carrier: 'Guardian', plan: 'Dental PPO $1500', type: 'Dental', eoRate: '$42.10', status: 'Active' },
  { id: 'MP-005', carrier: 'Unum', plan: 'Basic Life 1x', type: 'Life', eoRate: '$0.084/k', status: 'Active' },
];

/* ---- Vocabulary items ---- */
const defaultClassTypes = ['All Eligible', 'Hourly', 'Salaried', 'Management', 'Owners Only', 'Part-Time Eligible'];

/* ---- Client Data helpers ---- */
const clientStatusMeta: Record<string, [string, string, string]> = {
  draft: ['#5B6770', '#F4F6F8', 'Draft'],
  in_review: ['#0074B8', '#F0F7FF', 'In Review'],
  approved: ['#5A45C7', '#F8F6FE', 'Approved'],
  published: ['#1A7A4A', '#E8F5E9', 'Published'],
  signed: ['#B0690A', '#FBF0DD', 'Signed'],
};
const renewalUrgencyColor = (days: number) => (days < 20 ? '#C60C30' : days < 40 ? '#B0690A' : '#1A7A4A');

/* ---- Template preview content ---- */
const templatePreviews: Record<string, string> = {
  'ER Confirmation': 'Dear [Client Name],\n\nThis confirms your benefits selection for the plan year beginning [Effective Date].\n\nSelected Plans:\n- Medical: [Plan Name] — EO Rate: [EO Rate]\n- Employer Contribution: [ER %]\n\nPlease review and sign via DocuSign.\n\nBest regards,\nG&A Partners Benefits Team',
  'EE SRA (English)': 'EMPLOYEE BENEFITS ENROLLMENT FORM\nSalary Redirection Agreement\n\nEmployee: [Name]\nCoverage Tier: [Tier]\nPer-Pay-Period Deduction: [PPD]\n\nI authorize the above deduction from my pay.\n\nSignature: _______________\nDate: _______________',
  'EE SRA (Spanish)': 'FORMULARIO DE INSCRIPCION DE BENEFICIOS\nAcuerdo de Redireccion Salarial\n\nEmpleado: [Nombre]\nNivel de Cobertura: [Nivel]\nDeduccion por Periodo de Pago: [PPD]\n\nAutorizo la deduccion indicada.\n\nFirma: _______________\nFecha: _______________',
  'Benefits Booklet': 'G&A PARTNERS BENEFITS BOOKLET\n\nClient: [Client Name]\nPlan Year: [Year]\n\nTable of Contents:\n1. Medical Plans\n2. Dental & Vision\n3. Life & Disability\n4. Contribution Summary\n5. Enrollment Instructions\n\n[Auto-generated from CAP data]',
  'Prism Handoff Payload': '{\n  "clientId": "[Prism Client ID]",\n  "plans": [...],\n  "rates": [...],\n  "classes": [...],\n  "deductions": {...}\n}',
};

function AdminPageInner() {
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [metricTooltip, setMetricTooltip] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [lastSynced, setLastSynced] = useState<Record<string, string>>({
    PrismHR: '2 min ago',
    ClientSpace: '14 min ago',
    WorkSight: '1 hr ago',
    DocuSign: '3 hr ago',
    'Carrier Underwriting': 'Manual',
  });
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [addedRules, setAddedRules] = useState<string[]>([]);
  const [ruleSavedToast, setRuleSavedToast] = useState<string | null>(null);

  /* ---- Roles tab state ---- */
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const switchRole = useAuthStore((s) => s.switchRole);
  const currentRole = useAuthStore((s) => s.role);
  const [roleSwitchFeedback, setRoleSwitchFeedback] = useState<string | null>(null);

  /* ---- Master Plans browse state ---- */
  const [showBrowsePlans, setShowBrowsePlans] = useState(false);

  /* ---- Pricing Stack calculator state ---- */
  const [pricingBase, setPricingBase] = useState('624.18');
  const [pricingBucket, setPricingBucket] = useState('1.020');
  const [pricingAF, setPricingAF] = useState('1.015');
  const [pricingComm, setPricingComm] = useState('0.03');
  const [pricingRF, setPricingRF] = useState('1.000');
  const [pricingResult, setPricingResult] = useState<string | null>(null);

  /* ---- Parameters state ---- */
  const [acaThreshold, setAcaThreshold] = useState('129.90');
  const [acaSaved, setAcaSaved] = useState(false);

  /* ---- Vocabularies state ---- */
  const [vocabDropdownOpen, setVocabDropdownOpen] = useState(false);
  const [classTypes, setClassTypes] = useState<string[]>(defaultClassTypes);
  const [newVocabItem, setNewVocabItem] = useState('');

  /* ---- Templates preview state ---- */
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState(false);

  /* ---- Admin search/filter state ---- */
  const [adminSearch, setAdminSearch] = useState('');

  /* ---- Second-approver modal state ---- */
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalToast, setApprovalToast] = useState(false);

  /* ---- Add User toast ---- */
  const [addUserToast, setAddUserToast] = useState(false);

  /* ---- UW Intake file upload state ---- */
  const [uwFiles, setUwFiles] = useState<string[]>([]);
  const [uwDragOver, setUwDragOver] = useState(false);
  const uwFileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const activeTab = useAdminStore((s) => s.activeTab);
  const setTab = useAdminStore((s) => s.setTab);

  /* read ?tab= query param on mount */
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && adminTabs.some((t) => t.key === tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams, setTab]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const toggleCard = useCallback((key: string) => {
    setExpanded((e) => ({ ...e, [key]: !e[key] }));
  }, []);

  /* sync simulation */
  const runSync = useCallback(() => {
    setSyncing(true);
    setSyncStep(0);
    let step = 0;
    const advance = () => {
      if (step < syncSteps.length - 1) {
        step++;
        setSyncStep(step);
        setTimeout(advance, syncSteps[step].ms);
      } else {
        setTimeout(() => {
          setSyncing(false);
          setLastSynced((prev) => ({ ...prev, PrismHR: 'Just now' }));
        }, 600);
      }
    };
    setTimeout(advance, syncSteps[0].ms);
  }, []);

  /* pricing calculator */
  const calculatePricing = useCallback(() => {
    const base = parseFloat(pricingBase) || 0;
    const bucket = parseFloat(pricingBucket) || 0;
    const af = parseFloat(pricingAF) || 0;
    const comm = parseFloat(pricingComm) || 0;
    const rf = parseFloat(pricingRF) || 0;
    const result = base * bucket * af * (1 + comm) * rf;
    setPricingResult(result.toFixed(2));
  }, [pricingBase, pricingBucket, pricingAF, pricingComm, pricingRF]);

  const currentTab = adminTabs.find((t) => t.key === activeTab) ?? adminTabs[0];

  if (loading) return <PageSkeleton />;

  /* ---- Roles tab: full user persona management ---- */
  const rolesOrder: Role[] = ['am', 'ae', 'coord', 'analyst', 'gab', 'admin'];

  const renderRolesTab = () => (
    <div>
      {/* Metrics row */}
      {currentTab.metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          {currentTab.metrics.map((metric) => (
            <div
              key={metric.label}
              onClick={() => setMetricTooltip(metricTooltip === metric.label ? null : metric.label)}
              style={{
                background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 10, textAlign: 'center',
                borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: metric.color,
                cursor: 'pointer', position: 'relative', transition: 'box-shadow .15s',
                boxShadow: metricTooltip === metric.label ? 'var(--shadow-md)' : 'none',
              }}
            >
              <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>{metric.value}</div>
              <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151', fontWeight: 600 }}>{metric.label}</div>
              {metricTooltip === metric.label && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginTop: 6, background: '#1B2D3D', color: '#fff', fontSize: 'var(--type-body-sm)', padding: '6px 10px',
                  borderRadius: 6, whiteSpace: 'nowrap', zIndex: 10,
                }}>
                  {metric.label}: {metric.value} (updated live)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* User Personas Table */}
      <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #E4E8ED' }}>
          <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D' }}>User Personas</div>
          <button
            onClick={() => {
              setAddUserToast(true);
              setTimeout(() => setAddUserToast(false), 3000);
            }}
            style={{
              height: 28, padding: '0 12px', borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
              cursor: 'pointer', background: '#1A7A4A', color: '#fff', border: 'none',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#15663D'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1A7A4A'; }}
          >
            + Add User
          </button>
        </div>

        <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E4E8ED' }}>
              <th style={{ textAlign: 'left', padding: '8px 14px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '8px 14px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '8px 10px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '8px 10px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Permissions</th>
              <th style={{ textAlign: 'right', padding: '8px 14px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rolesOrder.map((roleKey) => {
              const info = roles[roleKey];
              const isCurrentRole = currentRole === roleKey;
              return (
                <tr
                  key={roleKey}
                  style={{
                    borderBottom: '1px solid #F4F6F8',
                    background: isCurrentRole ? '#F0F7FF' : 'transparent',
                  }}
                >
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1B2D3D' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--type-body-sm)', fontWeight: 700, color: '#fff', background: info.color, flexShrink: 0,
                      }}>
                        {info.short}
                      </div>
                      <span style={{ fontSize: 'var(--type-body-sm)' }}>
                        {info.name}
                        {isCurrentRole && (
                          <span style={{ fontSize: 8, color: '#0074B8', fontWeight: 600, marginLeft: 6, background: '#E7F1FA', padding: '1px 5px', borderRadius: 4 }}>
                            ACTIVE
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 'var(--type-body-sm)', fontFamily: 'monospace', color: '#374151' }}>{info.email}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{
                      fontSize: 'var(--type-badge)', fontWeight: 600, padding: '3px 8px', borderRadius: 9999,
                      color: info.color, background: info.color + '14',
                    }}>
                      {info.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {ALL_PERMISSIONS.map((perm) => (
                        <span
                          key={perm}
                          title={perm}
                          style={{
                            width: 10, height: 10, borderRadius: '50%', display: 'inline-block',
                            background: info.permissions.includes(perm) ? info.color : '#E4E8ED',
                          }}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setViewingRole(viewingRole === roleKey ? null : roleKey)}
                        style={{
                          height: 24, padding: '0 10px', borderRadius: 5, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                          cursor: 'pointer', background: viewingRole === roleKey ? '#13212C' : '#F4F6F8',
                          color: viewingRole === roleKey ? '#fff' : '#1B2D3D',
                          border: viewingRole === roleKey ? 'none' : '1px solid #E4E8ED',
                        }}
                      >
                        {viewingRole === roleKey ? 'Close' : 'View'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Permissions legend */}
        <div style={{ padding: '8px 14px', borderTop: '1px solid #E4E8ED', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--type-table-header)', color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Permissions:</span>
          {ALL_PERMISSIONS.map((p) => (
            <span key={p} style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>{p}</span>
          ))}
        </div>
      </div>

      {/* Role Detail Panel */}
      {viewingRole && (() => {
        const info = roles[viewingRole];
        return (
          <div style={{
            background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
            borderLeft: `4px solid ${info.color}`, padding: 18, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#fff', background: info.color,
                }}>
                  {info.short}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D' }}>{info.name}</div>
                  <div style={{ fontSize: 'var(--type-body)', color: '#374151' }}>{info.label}</div>
                  <div style={{ fontSize: 'var(--type-body-sm)', fontFamily: 'monospace', color: '#374151', marginTop: 2 }}>{info.email}</div>
                </div>
              </div>
              <button
                onClick={() => setViewingRole(null)}
                style={{
                  width: 24, height: 24, borderRadius: 6, border: '1px solid #E4E8ED',
                  background: '#F4F6F8', cursor: 'pointer', fontSize: 'var(--type-body-sm)', color: '#374151',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                x
              </button>
            </div>

            <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Permissions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
              {ALL_PERMISSIONS.map((perm) => {
                const has = info.permissions.includes(perm);
                return (
                  <div
                    key={perm}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
                      borderRadius: 6, background: has ? info.color + '08' : '#F8F9FA',
                    }}
                  >
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 700,
                      background: has ? info.color : '#E4E8ED',
                      color: has ? '#fff' : '#374151',
                    }}>
                      {has ? '✓' : '−'}
                    </span>
                    <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: has ? '#1B2D3D' : '#374151', minWidth: 60 }}>{perm}</span>
                    <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>{permDescriptions[perm]}</span>
                  </div>
                );
              })}
            </div>

            {roleSwitchFeedback === viewingRole ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                background: '#E8F5E9', borderRadius: 6, fontSize: 'var(--type-body-sm)', color: '#1A7A4A', fontWeight: 600,
              }}>
                Switched to {info.name} ({info.label})
              </div>
            ) : (
              <button
                onClick={() => {
                  switchRole(viewingRole);
                  setRoleSwitchFeedback(viewingRole);
                  setTimeout(() => setRoleSwitchFeedback(null), 3000);
                }}
                disabled={currentRole === viewingRole}
                style={{
                  height: 32, padding: '0 18px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                  cursor: currentRole === viewingRole ? 'not-allowed' : 'pointer',
                  background: currentRole === viewingRole ? '#E4E8ED' : info.color,
                  color: currentRole === viewingRole ? '#374151' : '#fff',
                  border: 'none',
                }}
              >
                {currentRole === viewingRole ? 'Already Active' : `Switch to ${info.name}`}
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );

  return (
    <div style={{ padding: '20px 24px 48px', maxWidth: 1280, position: 'relative' }}>
      {/* Sync overlay */}
      {syncing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(19,33,44,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px 36px', width: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D', marginBottom: 16 }}>PrismHR Sync</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', marginBottom: 16 }}>
              {syncSteps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--type-body-sm)' }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--type-body-sm)', flexShrink: 0,
                    background: i < syncStep ? '#E8F5E9' : i === syncStep ? '#E7F1FA' : '#F4F6F8',
                    color: i < syncStep ? '#1A7A4A' : i === syncStep ? '#0074B8' : '#374151',
                  }}>
                    {i < syncStep ? '✓' : i === syncStep ? '●' : '○'}
                  </span>
                  <span style={{ color: i <= syncStep ? '#1B2D3D' : '#374151', fontWeight: i === syncStep ? 600 : 400 }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ height: 4, borderRadius: 2, background: '#E4E8ED', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: '#0074B8', transition: 'width .3s', width: `${((syncStep + 1) / syncSteps.length) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Template preview modal */}
      {previewTemplate && (
        <div
          onClick={() => setPreviewTemplate(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(19,33,44,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 14, padding: '24px 28px', width: 520, maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D' }}>Preview: {previewTemplate}</div>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{
                  width: 28, height: 28, borderRadius: 7, border: '1px solid #E4E8ED',
                  background: '#F4F6F8', cursor: 'pointer', fontSize: 'var(--type-body-sm)', color: '#374151',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                x
              </button>
            </div>
            <pre style={{
              background: '#F8F9FA', border: '1px solid #E4E8ED', borderRadius: 8,
              padding: 16, fontSize: 'var(--type-body-sm)', color: '#1B2D3D', whiteSpace: 'pre-wrap',
              fontFamily: 'monospace', lineHeight: 1.7,
            }}>
              {templatePreviews[previewTemplate] || 'No preview available for this template.'}
            </pre>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{
                  height: 30, padding: '0 16px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                  cursor: 'pointer', background: '#F4F6F8', color: '#374151', border: '1px solid #E4E8ED',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPreviewTemplate(null);
                  setDownloadToast(true);
                  setTimeout(() => setDownloadToast(false), 3000);
                }}
                style={{
                  height: 30, padding: '0 16px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                  cursor: 'pointer', background: '#0074B8', color: '#fff', border: 'none',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#005F94'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0074B8'; }}
              >
                Download .docx
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second-approver confirmation modal */}
      {showApprovalModal && (
        <div
          onClick={() => setShowApprovalModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(19,33,44,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 14, padding: '28px 32px', width: 440,
              textAlign: 'center',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: '#FBF0DD',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 'var(--type-section-title)',
            }}>
              &#x26A0;
            </div>
            <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D', marginBottom: 8 }}>
              Second Approver Required
            </div>
            <p style={{ fontSize: 'var(--type-body)', color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>
              This change affects pricing on all active deals. A second approver is required before it can take effect.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowApprovalModal(false)}
                style={{
                  height: 34, padding: '0 20px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                  cursor: 'pointer', background: '#F4F6F8', color: '#374151',
                  border: '1px solid #E4E8ED',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalToast(true);
                  if (activeTab === 'parameters') setAcaSaved(true);
                  setTimeout(() => setApprovalToast(false), 4000);
                }}
                style={{
                  height: 34, padding: '0 20px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                  cursor: 'pointer', background: '#C60C30', color: '#fff', border: 'none',
                }}
              >
                Request Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval toast */}
      {approvalToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
          background: '#1B2D3D', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontSize: 'var(--type-body-sm)', fontWeight: 600,
          boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#1A7A4A', fontSize: 'var(--type-body-sm)' }}>&#x2713;</span>
          Approval requested from GAB Manager
        </div>
      )}

      {/* Download toast */}
      {downloadToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
          background: '#1B2D3D', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontSize: 'var(--type-body-sm)', fontWeight: 600,
          boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#1A7A4A', fontSize: 'var(--type-body-sm)' }}>&#x2713;</span>
          Template downloaded
        </div>
      )}

      {/* Add User toast */}
      {addUserToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
          background: '#1B2D3D', color: '#fff', padding: '12px 20px',
          borderRadius: 10, fontSize: 'var(--type-body-sm)', fontWeight: 600,
          boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#0074B8', fontSize: 'var(--type-body-sm)' }}>&#x2139;</span>
          User provisioning is managed via SSO in production
        </div>
      )}

      <p style={{ fontSize: 'var(--type-body)', color: '#374151', marginBottom: 12 }}>
        The Data Repository is the single, central home for everything a CAP draws on — the
        <strong> foundational data</strong> shared across every client, and the
        <strong> client-specific data</strong> synced per client. No more copy-pasting from a template.
      </p>

      {/* Foundational vs Client-specific framing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          {
            accent: '#5A45C7',
            label: 'Foundational data',
            sub: 'Shared across all CAPs · synced or G&A-managed',
            items: ['Master Plans', 'Carrier Rates', 'Pricing Stack', 'Parameters', 'Vocabularies', 'Templates', 'Validation'],
          },
          {
            accent: '#0074B8',
            label: 'Client-specific data',
            sub: 'Synced per client · from Prism & ClientSpace',
            items: ['Client Profiles', 'Renewal Radar', 'Prior-Year CAPs', 'Census & Eligibility', 'Documents & Contracts'],
          },
        ].map((group) => (
          <div
            key={group.label}
            style={{
              background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
              borderTop: `3px solid ${group.accent}`, padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>{group.label}</div>
            <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginBottom: 8 }}>{group.sub}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {group.items.map((item) => (
                <span key={item} style={{
                  fontSize: 'var(--type-body-sm)', fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                  color: group.accent, background: group.accent + '12',
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
        {adminTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            style={{
              height: 30,
              padding: '0 12px',
              borderRadius: 7,
              fontSize: 'var(--type-body-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === tab.key ? '#13212C' : '#fff',
              color: activeTab === tab.key ? '#fff' : '#1B2D3D',
              border: activeTab === tab.key ? '1px solid #13212C' : '1px solid #E4E8ED',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--type-body-sm)', color: '#374151', pointerEvents: 'none' }}>&#x1F50D;</span>
        <input
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
          placeholder="Search cards..."
          style={{
            width: '100%',
            height: 30,
            paddingLeft: 30,
            paddingRight: 10,
            border: '1px solid #E4E8ED',
            borderRadius: 7,
            fontSize: 'var(--type-body-sm)',
            outline: 'none',
            background: '#fff',
            boxSizing: 'border-box',
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: '#1B2D3D',
          }}
        />
      </div>

      {/* ===== F9 Roles tab: completely custom rendering ===== */}
      {activeTab === 'roles' ? renderRolesTab() : (
        <>
          {/* Metrics */}
          {currentTab.metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {currentTab.metrics.map((metric) => (
                <div
                  key={metric.label}
                  onClick={() => setMetricTooltip(metricTooltip === metric.label ? null : metric.label)}
                  style={{
                    background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 10, textAlign: 'center',
                    borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: metric.color,
                    cursor: 'pointer', position: 'relative', transition: 'box-shadow .15s',
                    boxShadow: metricTooltip === metric.label ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151', fontWeight: 600 }}>
                    {metric.label}
                  </div>
                  {metricTooltip === metric.label && (
                    <div style={{
                      position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                      marginTop: 6, background: '#1B2D3D', color: '#fff', fontSize: 'var(--type-body-sm)', padding: '6px 10px',
                      borderRadius: 6, whiteSpace: 'nowrap', zIndex: 10,
                    }}>
                      {metric.label}: {metric.value} (updated live)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Rule button for Validation tab */}
          {activeTab === 'validation' && (
            <div style={{ marginBottom: 12 }}>
              {!showAddRule ? (
                <button
                  onClick={() => setShowAddRule(true)}
                  style={{
                    height: 30, padding: '0 14px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                    cursor: 'pointer', background: '#1A7A4A', color: '#fff', border: 'none',
                  }}
                >
                  + Add Rule
                </button>
              ) : (
                <div style={{
                  background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 14,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <input
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="Rule name (e.g. REQ_BROKER_NPN)"
                    style={{
                      flex: 1, height: 28, padding: '0 10px', borderRadius: 6,
                      border: '1px solid #E4E8ED', fontSize: 'var(--type-body-sm)', outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newRuleName.trim()) {
                        setAddedRules((prev) => [...prev, newRuleName.trim()]);
                        setRuleSavedToast(newRuleName.trim());
                        setTimeout(() => setRuleSavedToast(null), 3000);
                      }
                      setShowAddRule(false);
                      setNewRuleName('');
                    }}
                    style={{
                      height: 28, padding: '0 12px', borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                      cursor: newRuleName.trim() ? 'pointer' : 'not-allowed',
                      background: newRuleName.trim() ? '#1A7A4A' : '#374151',
                      color: '#fff', border: 'none',
                      transition: 'background .15s',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowAddRule(false); setNewRuleName(''); }}
                    style={{
                      height: 28, padding: '0 12px', borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                      cursor: 'pointer', background: '#F4F6F8', color: '#374151', border: '1px solid #E4E8ED',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rule saved toast */}
          {ruleSavedToast && (
            <div style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
              background: '#1B2D3D', color: '#fff', padding: '12px 20px',
              borderRadius: 10, fontSize: 'var(--type-body-sm)', fontWeight: 600,
              boxShadow: 'var(--shadow-md)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: '#1A7A4A', fontSize: 'var(--type-body-sm)' }}>&#x2713;</span>
              Rule &ldquo;{ruleSavedToast}&rdquo; added
            </div>
          )}

          {/* Custom rules display */}
          {activeTab === 'validation' && addedRules.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {addedRules.map((rule, i) => (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
                  padding: '10px 16px', marginBottom: 4, borderLeft: '4px solid #1A7A4A',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 'var(--type-body-sm)', color: '#1A7A4A', fontWeight: 600 }}>&#x2713;</span>
                    <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D' }}>{rule}</span>
                    <span style={{ fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 9999, color: '#1A7A4A', background: '#E4F2EA' }}>Custom</span>
                  </div>
                  <button
                    onClick={() => setAddedRules((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{
                      width: 20, height: 20, borderRadius: 4, border: '1px solid #E4E8ED',
                      background: '#fff', cursor: 'pointer', fontSize: 'var(--type-body-sm)', color: '#C60C30',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Client Data: central per-client record table */}
          {activeTab === 'clientData' && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #E4E8ED' }}>
                  <div>
                    <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D' }}>Client-Specific Data</div>
                    <div style={{ fontSize: 'var(--type-body)', color: '#374151' }}>
                      Per-client records synced into the repository · {clients.length} clients
                    </div>
                  </div>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                    color: '#1A7A4A', background: '#E8F5E9', padding: '4px 10px', borderRadius: 9999,
                  }}>
                    <span style={{ color: '#1A7A4A' }}>●</span> Prism + ClientSpace · synced 2 min ago
                  </span>
                </div>
                <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E4E8ED' }}>
                      {['Client', 'Prism ID', 'Tier', 'WSEs', 'Renewal', 'Owner', 'CAP Status'].map((h) => (
                        <th key={h} style={{ textAlign: h === 'WSEs' ? 'right' : 'left', padding: '8px 14px', color: '#374151', fontWeight: 600, fontSize: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...clients].sort((a, b) => a.urgDays - b.urgDays).map((c) => {
                      const [fg, bg, label] = clientStatusMeta[c.status] ?? ['#5B6770', '#F4F6F8', c.status];
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid #F4F6F8' }}>
                          <td style={{ padding: '9px 14px', color: '#1B2D3D', fontWeight: 600 }}>{c.name}</td>
                          <td style={{ padding: '9px 14px', fontFamily: 'monospace', color: '#5A45C7' }}>{c.prism}</td>
                          <td style={{ padding: '9px 14px', color: '#374151' }}>{c.tier}</td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'monospace', color: '#1B2D3D' }}>{c.wse}</td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ color: '#1B2D3D', fontWeight: 600 }}>{c.renewMon} {c.renewDay}</span>
                            <span style={{ color: renewalUrgencyColor(c.urgDays), marginLeft: 6 }}>· {c.urgDays}d</span>
                          </td>
                          <td style={{ padding: '9px 14px', color: '#374151' }}>{c.owner}</td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ fontSize: 8, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, color: fg, background: bg }}>{label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Connection Health Banner */}
          {activeTab === 'connections' && (
            <div style={{
              background: '#F0FFF5', border: '1px solid #C6F0D4', borderRadius: 10,
              padding: '14px 18px', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#1A7A4A', fontSize: 'var(--type-body-sm)' }}>{'●'}</span>
                <span style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1A7A4A' }}>All Systems Operational</span>
              </div>
              <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginBottom: 8 }}>
                5 connections active {'·'} Last sync 2 min ago
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {['PrismHR', 'ClientSpace', 'WorkSight', 'DocuSign', 'Carrier UW'].map((name) => (
                  <span key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D' }}>
                    <span style={{ color: '#1A7A4A', fontSize: 'var(--type-body-sm)' }}>{'●'}</span>
                    {name}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 8, fontStyle: 'italic' }}>
                Detailed connection management is available on the Integrations page.
              </div>
            </div>
          )}

          {/* F3 Master Plans: Browse Plans section */}
          {activeTab === 'masterPlans' && (
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setShowBrowsePlans(!showBrowsePlans)}
                style={{
                  height: 30, padding: '0 14px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                  cursor: 'pointer', background: showBrowsePlans ? '#13212C' : '#0074B8',
                  color: '#fff', border: 'none', marginBottom: showBrowsePlans ? 8 : 0,
                }}
              >
                {showBrowsePlans ? '▾  Hide Plan Browser' : '▸  Browse Plans'}
              </button>
              {showBrowsePlans && (
                <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: 'var(--type-body-sm)', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E4E8ED' }}>
                        {['ID', 'Carrier', 'Plan', 'Type', 'EO Rate', 'Status'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '7px 12px', color: '#374151', fontWeight: 600, fontSize: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {samplePlans.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F4F6F8' }}>
                          <td style={{ padding: '7px 12px', fontFamily: 'monospace', color: '#5A45C7', fontWeight: 600 }}>{p.id}</td>
                          <td style={{ padding: '7px 12px', color: '#1B2D3D' }}>{p.carrier}</td>
                          <td style={{ padding: '7px 12px', color: '#1B2D3D', fontWeight: 600 }}>{p.plan}</td>
                          <td style={{ padding: '7px 12px' }}>
                            <span style={{
                              fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 9999,
                              color: p.type === 'Medical' ? '#C60C30' : p.type === 'Dental' ? '#1A7A4A' : '#B0690A',
                              background: p.type === 'Medical' ? '#FFF5F5' : p.type === 'Dental' ? '#F0FFF5' : '#FFF8F0',
                            }}>{p.type}</span>
                          </td>
                          <td style={{ padding: '7px 12px', fontFamily: 'monospace', color: '#1B2D3D' }}>{p.eoRate}</td>
                          <td style={{ padding: '7px 12px' }}>
                            <span style={{ fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 9999, color: '#1A7A4A', background: '#E8F5E9' }}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* F4 Pricing Stack: Calculator */}
          {activeTab === 'pricingStack' && (
            <div style={{
              background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
              padding: 16, marginBottom: 12,
            }}>
              <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D', marginBottom: 10 }}>Rate Calculator</div>
              <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginBottom: 10 }}>
                Billed = Base x Bucket x AF x (1 + Comm) x RF
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 10 }}>
                {[
                  { label: 'Base Rate', value: pricingBase, set: setPricingBase },
                  { label: 'Bucket', value: pricingBucket, set: setPricingBucket },
                  { label: 'Admin Factor', value: pricingAF, set: setPricingAF },
                  { label: 'Commission', value: pricingComm, set: setPricingComm },
                  { label: 'Risk Factor', value: pricingRF, set: setPricingRF },
                ].map((f) => (
                  <div key={f.label}>
                    <div style={{ fontSize: 8, fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{f.label}</div>
                    <input
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      style={{
                        width: '100%', height: 30, padding: '0 8px', borderRadius: 6,
                        border: '1px solid #E4E8ED', fontSize: 'var(--type-body-sm)', fontFamily: 'monospace',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={calculatePricing}
                  style={{
                    height: 30, padding: '0 18px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                    cursor: 'pointer', background: '#5A45C7', color: '#fff', border: 'none',
                  }}
                >
                  Calculate
                </button>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  style={{
                    height: 30, padding: '0 18px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                    cursor: 'pointer', background: '#C60C30', color: '#fff', border: 'none',
                  }}
                >
                  Save
                </button>
                {pricingResult && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>Billed Rate:</span>
                    <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, fontFamily: 'monospace', color: '#C60C30' }}>${pricingResult}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* F5 Parameters: ACA threshold editor */}
          {activeTab === 'parameters' && (
            <div style={{
              background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
              padding: 16, marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>ACA Affordability Threshold</span>
                <span style={{ fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 9999, color: '#C60C30', background: '#FFF5F5' }}>2026</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 'var(--type-body)', color: '#374151' }}>$/month:</span>
                <input
                  value={acaThreshold}
                  onChange={(e) => { setAcaThreshold(e.target.value); setAcaSaved(false); }}
                  style={{
                    width: 100, height: 30, padding: '0 8px', borderRadius: 6,
                    border: '1px solid #E4E8ED', fontSize: 'var(--type-body-sm)', fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => setShowApprovalModal(true)}
                  style={{
                    height: 30, padding: '0 14px', borderRadius: 7, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                    cursor: 'pointer', background: '#1A7A4A', color: '#fff', border: 'none',
                  }}
                >
                  Save
                </button>
                {acaSaved && (
                  <span style={{ fontSize: 'var(--type-body-sm)', color: '#1A7A4A', fontWeight: 600 }}>Saved</span>
                )}
              </div>
              <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginTop: 6 }}>
                Used in validation: min EE-only contribution must be {'<'} ${acaThreshold}/month
              </div>
            </div>
          )}

          {/* F6 Vocabularies: Class Types dropdown */}
          {activeTab === 'vocabularies' && (
            <div style={{
              background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
              padding: 16, marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>Class Types Vocabulary</div>
                <button
                  onClick={() => setVocabDropdownOpen(!vocabDropdownOpen)}
                  style={{
                    height: 28, padding: '0 12px', borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                    cursor: 'pointer', background: vocabDropdownOpen ? '#13212C' : '#F4F6F8',
                    color: vocabDropdownOpen ? '#fff' : '#1B2D3D',
                    border: vocabDropdownOpen ? 'none' : '1px solid #E4E8ED',
                  }}
                >
                  {vocabDropdownOpen ? 'Collapse' : 'Manage Items'}
                </button>
              </div>
              {vocabDropdownOpen && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                    {classTypes.map((item) => (
                      <div
                        key={item}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 10px', background: '#F8F9FA', borderRadius: 6,
                        }}
                      >
                        <span style={{ fontSize: 'var(--type-body-sm)', color: '#1B2D3D' }}>{item}</span>
                        <button
                          onClick={() => setClassTypes((prev) => prev.filter((i) => i !== item))}
                          style={{
                            width: 20, height: 20, borderRadius: 4, border: '1px solid #E4E8ED',
                            background: '#fff', cursor: 'pointer', fontSize: 'var(--type-body-sm)', color: '#C60C30',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={newVocabItem}
                      onChange={(e) => setNewVocabItem(e.target.value)}
                      placeholder="Add new class type..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newVocabItem.trim()) {
                          setClassTypes((prev) => [...prev, newVocabItem.trim()]);
                          setNewVocabItem('');
                        }
                      }}
                      style={{
                        flex: 1, height: 28, padding: '0 10px', borderRadius: 6,
                        border: '1px solid #E4E8ED', fontSize: 'var(--type-body-sm)', outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newVocabItem.trim()) {
                          setClassTypes((prev) => [...prev, newVocabItem.trim()]);
                          setNewVocabItem('');
                        }
                      }}
                      style={{
                        height: 28, padding: '0 12px', borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                        cursor: 'pointer', background: '#0074B8', color: '#fff', border: 'none',
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* F10 UW Intake: File upload area */}
          {activeTab === 'uwIntake' && (
            <div style={{
              background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
              padding: 16, marginBottom: 12,
            }}>
              <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D', marginBottom: 10 }}>Upload Documents</div>
              <div
                onDragOver={(e) => { e.preventDefault(); setUwDragOver(true); }}
                onDragLeave={() => setUwDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setUwDragOver(false);
                  const files = Array.from(e.dataTransfer.files);
                  setUwFiles((prev) => [...prev, ...files.map((f) => f.name)]);
                }}
                onClick={() => uwFileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${uwDragOver ? '#0074B8' : '#E4E8ED'}`,
                  borderRadius: 10, padding: '24px 16px', textAlign: 'center',
                  cursor: 'pointer', background: uwDragOver ? '#F0F7FF' : '#FAFBFC',
                  transition: 'all .15s',
                }}
              >
                <input
                  ref={uwFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.csv,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      setUwFiles((prev) => [...prev, ...files.map((f) => f.name)]);
                    }
                  }}
                />
                <div style={{ fontSize: 22, color: '#374151', marginBottom: 6 }}>{'⇧'}</div>
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D' }}>
                  Drop SBCs, carrier invoices, or UW output here
                </div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 4 }}>
                  Supports PDF, Excel, CSV, PNG, JPG
                </div>
              </div>
              {uwFiles.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>
                    Uploaded Files ({uwFiles.length})
                  </div>
                  {uwFiles.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 10px', background: '#F8F9FA', borderRadius: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 'var(--type-body-sm)', color: '#0074B8' }}>{'⬤'}</span>
                        <span style={{ fontSize: 'var(--type-body-sm)', color: '#1B2D3D' }}>{file}</span>
                      </div>
                      <button
                        onClick={() => setUwFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        style={{
                          width: 20, height: 20, borderRadius: 4, border: '1px solid #E4E8ED',
                          background: '#fff', cursor: 'pointer', fontSize: 'var(--type-body-sm)', color: '#C60C30',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentTab.cards.filter((c) =>
              !adminSearch || c.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
              c.body.toLowerCase().includes(adminSearch.toLowerCase())
            ).map((card) => {
              const isExpanded = expanded[card.title] ?? false;
              const hasDetail = !!expandedDetails[card.title];
              const versions = versionBadges[card.title];

              return (
                <div
                  key={card.title}
                  onMouseEnter={(e) => { if (hasDetail) (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  style={{
                    background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10,
                    padding: '14px 16px', borderLeft: `4px solid ${card.accentColor}`,
                    transition: 'box-shadow .15s',
                  }}
                >
                  <div
                    onClick={() => hasDetail && toggleCard(card.title)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: hasDetail ? 'pointer' : 'default' }}
                  >
                    {hasDetail && (
                      <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151', width: 12, flexShrink: 0 }}>
                        {isExpanded ? '▾' : '▸'}
                      </span>
                    )}
                    <span style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>
                      {card.title}
                    </span>
                    {card.badge && (
                      <span
                        style={{
                          fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 9999,
                          color: card.accentColor, backgroundColor: card.accentColor + '14',
                        }}
                      >
                        {card.badge}
                      </span>
                    )}
                    {versions && (
                      <div style={{ display: 'flex', gap: 3, marginLeft: 4 }}>
                        {versions.map((v) => (
                          <span key={v} style={{
                            fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 3,
                            background: v === versions[versions.length - 1] ? card.accentColor + '1A' : '#F4F6F8',
                            color: v === versions[versions.length - 1] ? card.accentColor : '#374151',
                          }}>
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Re-sync button for PrismHR */}
                    {card.title === 'PrismHR' && activeTab === 'connections' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); runSync(); }}
                        style={{
                          marginLeft: 'auto', height: 22, padding: '0 10px', borderRadius: 5,
                          fontSize: 'var(--type-body-sm)', fontWeight: 600, cursor: 'pointer',
                          background: '#C60C30', color: '#fff', border: 'none',
                        }}
                      >
                        Re-sync Now
                      </button>
                    )}
                    {/* Preview button for Templates */}
                    {activeTab === 'templates' && templatePreviews[card.title] && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(card.title); }}
                        style={{
                          marginLeft: 'auto', height: 22, padding: '0 10px', borderRadius: 5,
                          fontSize: 'var(--type-body-sm)', fontWeight: 600, cursor: 'pointer',
                          background: '#0074B8', color: '#fff', border: 'none',
                        }}
                      >
                        Preview
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 'var(--type-body-lg)', color: '#374151', lineHeight: 1.6, marginTop: 4 }}>
                    {card.body}
                  </p>

                  {/* Last synced for connection cards */}
                  {activeTab === 'connections' && lastSynced[card.title] && (
                    <div style={{ fontSize: 'var(--type-caption)', color: '#374151', marginTop: 4 }}>
                      Last synced: {lastSynced[card.title]}
                    </div>
                  )}

                  {/* Expanded detail */}
                  {isExpanded && expandedDetails[card.title] && (
                    <div style={{
                      marginTop: 10, paddingTop: 10, borderTop: '1px dashed #E4E8ED',
                    }}>
                      {expandedDetails[card.title]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminPageInner />
    </Suspense>
  );
}
