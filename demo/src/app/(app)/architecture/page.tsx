'use client';

import { useState, useEffect } from 'react';
import { PageSkeleton } from '@/components/shared/Skeleton';

type Tab = 'journey' | 'dataflow' | 'governance' | 'components';

const journeySteps = [
  { title: 'Client Intake', desc: 'Account Manager uploads census, invoices, and SBCs to seed the CAP.' },
  { title: 'AI Extraction', desc: 'Documents processed with AI to extract plan data, rates, and demographics.' },
  { title: 'Completeness Gate', desc: 'Pre-build check ensures all required fields are present or flagged.' },
  { title: 'CAP Assembly', desc: 'Three-source fusion: library + extraction + underwriting → provenance-tagged draft.' },
  { title: 'Plan Design & Rates', desc: 'Rate formula applied: Billed = Base × Bucket × AF × (1+Comm) × RF.' },
  { title: 'Validation & Readiness', desc: 'Real-time validation against Prism configs and carrier rate tables.' },
  { title: 'Collaboration & Approval', desc: 'Multi-role review: AM → Coordinator QC → internal approval.' },
  { title: 'Booklet Generation', desc: 'Auto-generated from CAP data using F7 templates. Always in sync.' },
  { title: 'Client Sign-off', desc: 'DocuSign e-signature routing with status tracking.' },
  { title: 'Prism Write-back', desc: 'Structured payload pushed to PrismHR for client setup. Loop closed.' },
];

const dataflowCards = [
  { title: 'PrismHR', accent: '#C60C30', body: 'System of record. Inbound: master plans, carrier rates, client records. Outbound: approved CAP config write-back.' },
  { title: 'ClientSpace', accent: '#0074B8', body: 'Workflow engine. CAP lifecycle events → case creation, approval routing, audit trail.' },
  { title: 'WorkSight', accent: '#1A7A4A', body: 'Enrollment portal. Receives plan/rate data for portal configuration.' },
  { title: 'DocuSign', accent: '#B0690A', body: 'E-signature. Booklet envelope routing, signer status callbacks.' },
];

const governanceCards = [
  { title: 'PHI — Protected Health Info', accent: '#C60C30', body: 'Census demographics, enrollment details, medical plan selections. Field-level access controls.' },
  { title: 'PII — Personal Identifiers', accent: '#B0690A', body: 'SSN, DOB, addresses, compensation. Encrypted at rest, masked in UI, never sent to LLM.' },
  { title: 'Financial / Rate Data', accent: '#0074B8', body: 'Carrier rates, pricing factors, contribution amounts. Versioned, auditable, SOX-controlled.' },
  { title: 'Configuration', accent: '#1A7A4A', body: 'Templates, vocabularies, validation rules, roles. G&A-managed, effective-dated, approval-gated.' },
];

const componentCards = [
  { title: 'CAP Service', body: 'Aggregate root. Lifecycle state machine, versioning, orchestration.' },
  { title: 'Plan Config Service', body: 'Manages plan selections, tier rates, contribution modeling.' },
  { title: 'Validation Service', body: 'Rules engine. Completeness, source-data, cross-field checks.' },
  { title: 'Renewal Service', body: 'Year-over-year diff, plan-code migration, drift detection.' },
  { title: 'Document Service', body: 'Template binding, PDF rendering, booklet versioning.' },
  { title: 'E-Sign Service', body: 'DocuSign integration. Envelope management, signer routing.' },
  { title: 'Sync Service', body: 'PrismHR connection. Delta sync, change capture, version history.' },
  { title: 'Notification Service', body: 'Queue management, role-based alerts, email triggers.' },
];

const tabs: { key: Tab; label: string }[] = [
  { key: 'journey', label: 'User Journey' },
  { key: 'dataflow', label: 'Data Flow' },
  { key: 'governance', label: 'Governance' },
  { key: 'components', label: 'Components' },
];

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<Tab>('journey');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div style={{ padding: '20px 24px 48px', maxWidth: 1280 }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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

      {/* Journey tab */}
      {activeTab === 'journey' && (
        <div>
          {journeySteps.map((step, i) => (
            <div
              key={step.title}
              style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C60C30', color: '#fff', fontSize: 'var(--type-label)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>
                  {step.title}
                </div>
                <p style={{ fontSize: 'var(--type-body)', color: '#374151', marginTop: 2 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Flow tab */}
      {activeTab === 'dataflow' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {dataflowCards.map((card) => (
            <div
              key={card.title}
              style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 14, borderLeft: `4px solid ${card.accent}` }}
            >
              <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>
                {card.title}
              </div>
              <p style={{ fontSize: 'var(--type-body)', color: '#374151', lineHeight: 1.6, marginTop: 4 }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Governance tab */}
      {activeTab === 'governance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {governanceCards.map((card) => (
            <div
              key={card.title}
              style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 14, borderLeft: `4px solid ${card.accent}` }}
            >
              <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>
                {card.title}
              </div>
              <p style={{ fontSize: 'var(--type-body)', color: '#374151', lineHeight: 1.6, marginTop: 4 }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Components tab */}
      {activeTab === 'components' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {componentCards.map((card) => (
            <div
              key={card.title}
              style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 14, borderLeft: '4px solid #C60C30' }}
            >
              <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D' }}>
                {card.title}
              </div>
              <p style={{ fontSize: 'var(--type-body)', color: '#374151', lineHeight: 1.6, marginTop: 4 }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
