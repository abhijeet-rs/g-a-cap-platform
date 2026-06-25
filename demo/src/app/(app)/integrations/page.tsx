'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSyncStore } from '@/stores/syncStore';
import { useUIStore } from '@/stores/uiStore';
import { syncSequences } from '@/data/syncSequences';
import { PageSkeleton } from '@/components/shared/Skeleton';

/* ------------------------------------------------------------------ */
/*  Connection data                                                    */
/* ------------------------------------------------------------------ */

interface SyncLogEntry {
  date: string;
  records: number;
  status: 'success' | 'warning' | 'error';
  message: string;
}

interface FieldMapping {
  from: string;
  to: string;
}

interface Connection {
  name: string;
  status: 'connected' | 'disconnected';
  syncs: number;
  lastSync: string;
  description: string;
  color: string;
  fieldMappings?: FieldMapping[];
  syncLog?: SyncLogEntry[];
}

const connectionsData: Connection[] = [
  {
    name: 'PrismHR',
    status: 'connected',
    syncs: 847,
    lastSync: '2 min ago',
    description: 'System of record for plan configurations, carrier rates, enrollments, and payroll execution.',
    color: '#C60C30',
    fieldMappings: [
      { from: 'BenefitService.getClientBenefitPlans', to: 'plan.lineup[] → R2 Pre-fill' },
      { from: 'BenefitService.getClientBenefitPlanSetupDetails', to: 'plan.config{rates,tiers,classes} → R2, R4' },
      { from: 'BenefitService.getBenefitPlanList', to: 'masterPlan.catalog[] → F3 Library' },
      { from: 'BenefitService.getGroupBenefitRates', to: 'tierRate{eo,es,ec,ef} → NB4 Rates' },
      { from: 'BenefitService.getGroupBenefitTypes', to: 'benefitType[] → NB5 Validation' },
      { from: 'BenefitService.getActiveBenefitPlans', to: 'enrollment.active[] → Census' },
      { from: 'BenefitService.getEmployeePremium', to: 'billing.rate{} → Deduction Audit' },
      { from: 'BenefitService.getFlexPlans', to: 'taxPlan{fsa,hsa} → NB4 Tax Plans' },
      { from: 'BenefitService.getBenefitRule', to: 'eligibility.rule{} → F8 Validation' },
      { from: 'BenefitService.getEnrollInputList', to: 'enroll.required[] → NB9 Pre-check' },
      { from: 'BenefitService.setClientBenefitPlanSetupDetails', to: 'prism.planConfig ← NB9 Write-back' },
      { from: 'BenefitService.setGroupBenefitBillingRates', to: 'prism.billingRates ← NB9 Write-back' },
      { from: 'BenefitService.setGroupBenefitPremiumRates', to: 'prism.premiumRates ← NB9 Write-back' },
      { from: 'BenefitService.setBenefitRule', to: 'prism.eligibility ← NB9 Write-back' },
      { from: 'BenefitService.enrollBenefit', to: 'prism.enrollment ← NB9 per-WSE' },
      { from: 'BenefitService.setDependent', to: 'prism.dependent ← NB9 per-WSE' },
      { from: 'BenefitService.setFlexPlan', to: 'prism.fsa/hsa ← NB9 Write-back' },
      { from: 'BenefitService.getBenefitConfirmationList', to: 'confirm.ids[] → NB9 Verify' },
      { from: 'ClientMasterService.getClientInfo', to: 'client{name,id,type} → Lookup' },
      { from: 'ClientMasterService.getClientLocations', to: 'location[] → Setup' },
      { from: 'ClientMasterService.addBillPending', to: 'prism.billing ← Config' },
      { from: 'EmployeeService.getEmployeeInfo', to: 'employee{demo,status,pay} → Census' },
      { from: 'EmployeeService.getDependents', to: 'dependent[] → Enrollment' },
      { from: 'EmployeeService.benefitPlanSetWaive', to: 'prism.waiver ← NB9 per-WSE' },
      { from: 'EmployeeService.setHSA', to: 'prism.hsa ← NB9 Write-back' },
      { from: 'PayrollService.getDeductionRegister', to: 'deduction.register → Audit' },
      { from: 'DeductionService.getDeductionCodes', to: 'deduction.codes → Mapping' },
    ],
    syncLog: [
      { date: 'Jun 21, 2:30 PM', records: 42, status: 'success', message: '42 plans synced, 0 errors' },
      { date: 'Jun 20, 2:30 PM', records: 42, status: 'success', message: '42 plans synced, 0 errors' },
      { date: 'Jun 19, 2:30 PM', records: 41, status: 'warning', message: '41 plans synced, 1 warning (rate mismatch on Guardian dental)' },
    ],
  },
  {
    name: 'ClientSpace',
    status: 'connected',
    syncs: 234,
    lastSync: '14 min ago',
    description: 'System of record for client documentation and contract details. Source for client census and CSA input; on sign-off the approved CAP, booklet, and contract sync back here.',
    color: '#0074B8',
    fieldMappings: [
      { from: 'GET /api/census/{clientId}', to: 'census.employees[] → Source for CAP (no manual upload)' },
      { from: 'GET /api/clients/{clientId}/csa', to: 'csa.document → New-business intake' },
      { from: 'GET /api/clients/{clientId}', to: 'client.profile{contacts,locations} → Lookup' },
      { from: 'PUT /api/documents/{clientId}', to: 'signedCAP + booklet → System of record (post sign-off)' },
      { from: 'PUT /api/contracts/{clientId}', to: 'contract.details → Approved terms write-back' },
      { from: 'GET /api/commissions/{clientId}', to: 'commission.schedule → Broker tracking' },
      { from: 'POST /api/cases', to: 'workflow.case → Auto-create on CAP intake (NB1)' },
      { from: 'PUT /api/cases/{id}/status', to: 'lifecycle.stage → Advance on submit/approve/sign' },
      { from: 'GET /api/audit/{caseId}', to: 'audit.trail → SOX-compliant event log' },
    ],
    syncLog: [
      { date: 'Jun 21, 2:16 PM', records: 18, status: 'success', message: '18 client documents & contracts synced, 0 errors' },
      { date: 'Jun 20, 11:45 AM', records: 22, status: 'success', message: '22 census pulls + case updates, 0 errors' },
      { date: 'Jun 19, 3:10 PM', records: 19, status: 'success', message: '19 documents updated, 0 errors' },
    ],
  },
  {
    name: 'WorkSight',
    status: 'connected',
    syncs: 156,
    lastSync: '1 hr ago',
    description: 'Client-facing enrollment portal. Receives plan/rate data from approved CAPs.',
    color: '#1A7A4A',
    fieldMappings: [
      { from: 'ws.enrollPlan', to: 'plan.id' },
      { from: 'ws.rateTable', to: 'tierRates.*' },
      { from: 'ws.portalConfig', to: 'enrollment.config' },
      { from: 'ws.eligibility', to: 'class.type' },
    ],
    syncLog: [
      { date: 'Jun 21, 1:30 PM', records: 8, status: 'success', message: '8 portal configs pushed, 0 errors' },
      { date: 'Jun 20, 1:30 PM', records: 12, status: 'success', message: '12 portal configs pushed, 0 errors' },
      { date: 'Jun 18, 1:30 PM', records: 7, status: 'warning', message: '7 pushed, 1 warning (stale eligibility class)' },
    ],
  },
  {
    name: 'DocuSign',
    status: 'connected',
    syncs: 89,
    lastSync: '3 hr ago',
    description: 'E-signature routing for benefits booklet and CAP confirmation.',
    color: '#B0690A',
    fieldMappings: [
      { from: 'ds.envelopeId', to: 'esign.envelopeId' },
      { from: 'ds.signerStatus', to: 'esign.signerStatus' },
      { from: 'ds.completedAt', to: 'esign.completedDate' },
      { from: 'ds.templateId', to: 'template.docusignRef' },
    ],
    syncLog: [
      { date: 'Jun 21, 11:20 AM', records: 3, status: 'success', message: '3 envelopes sent, 0 errors' },
      { date: 'Jun 20, 4:15 PM', records: 5, status: 'success', message: '5 envelopes sent, 0 errors' },
      { date: 'Jun 19, 9:00 AM', records: 2, status: 'success', message: '2 envelopes sent, 0 errors' },
    ],
  },
  {
    name: 'Carrier Underwriting',
    status: 'connected',
    syncs: 0,
    lastSync: 'Never',
    description: 'Document upload + AI extraction path. No direct API -- factors enter via upload.',
    color: '#5A45C7',
    fieldMappings: [
      { from: 'upload.sbcDoc', to: 'uw.sbcDocument' },
      { from: 'upload.rateSheet', to: 'uw.carrierRates' },
      { from: 'upload.factors', to: 'uw.riskFactors' },
      { from: 'upload.confidence', to: 'uw.extractConfidence' },
    ],
    syncLog: [
      { date: 'Jun 20, 10:00 AM', records: 1, status: 'success', message: '1 document uploaded, extraction confidence 94%' },
      { date: 'Jun 18, 2:30 PM', records: 2, status: 'warning', message: '2 documents uploaded, 1 low-confidence extraction (67%)' },
      { date: 'Jun 15, 11:00 AM', records: 1, status: 'success', message: '1 document uploaded, extraction confidence 98%' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Core syncs — the 3 live system syncs that keep the platform in     */
/*  lockstep. Foregrounded in the hero band above the full list.       */
/* ------------------------------------------------------------------ */

const coreSyncNames = ['PrismHR', 'ClientSpace', 'DocuSign'];

const coreSyncMeta: Record<string, { role: string; direction: string; flow: string }> = {
  PrismHR: { role: 'Plans · rates · enrollments', direction: 'Bi-directional', flow: 'System of record ⇄ CAP' },
  ClientSpace: { role: 'Documents · contracts · census', direction: 'Bi-directional', flow: 'Census in · signed CAP & contract out' },
  DocuSign: { role: 'Booklet e-signature', direction: 'Outbound', flow: 'CAP → Client sign-off' },
};

/* ------------------------------------------------------------------ */
/*  PrismHR re-sync steps (used with useSyncStore)                     */
/* ------------------------------------------------------------------ */

const prismReSyncSteps = [
  { label: 'Authenticating with PrismHR API', api: 'POST /api/prism/auth', ms: 600 },
  { label: 'Fetching master plan catalog', api: 'GET /api/prism/plans', ms: 900 },
  { label: 'Delta detection on rate tables', api: 'POST /api/prism/rates/diff', ms: 700 },
  { label: 'Syncing 42 rate changes', api: 'PUT /api/prism/rates/sync', ms: 1100 },
  { label: 'Validating data integrity', api: 'POST /api/validate/prism', ms: 500 },
  { label: 'Sync complete - 847 total syncs', api: 'PATCH /api/prism/meta', ms: 400 },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [configOpen, setConfigOpen] = useState<Record<string, boolean>>({});
  const [lastSynced, setLastSynced] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, 'idle' | 'testing' | 'done'>>({});

  // Config form state
  const [prismSchedule, setPrismSchedule] = useState('nightly');
  const [prismDelta, setPrismDelta] = useState(true);
  const [prismWebhook, setPrismWebhook] = useState('https://hooks.ga-cap.io/prism/sync');
  const [csTemplate, setCsTemplate] = useState('new-business-standard');
  const [csWorkflow, setCsWorkflow] = useState('auto-advance');
  const [dsTemplateId, setDsTemplateId] = useState('TMPL-9f3c-4a2b');
  const [dsSignerRouting, setDsSignerRouting] = useState('broker-first');
  const [wsPortalSync, setWsPortalSync] = useState(true);
  const [cuwFormats, setCuwFormats] = useState('PDF, XLSX, CSV');

  const syncStore = useSyncStore();
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Initialize lastSynced from data
  useEffect(() => {
    const initial: Record<string, string> = {};
    connectionsData.forEach((c) => {
      initial[c.name] = c.lastSync;
    });
    setLastSynced(initial);
  }, []);

  const toggleConfig = useCallback((name: string) => {
    setConfigOpen((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleReSync = useCallback(() => {
    syncStore.show('PrismHR Re-sync', prismReSyncSteps, () => {
      setLastSynced((prev) => ({ ...prev, PrismHR: 'Just now' }));
      showToast('PrismHR sync completed - 42 plans synced', 'success');
    });
  }, [syncStore, showToast]);

  const handleTestConnection = useCallback((name: string) => {
    setTestingConnection((prev) => ({ ...prev, [name]: 'testing' }));
    setTimeout(() => {
      setTestingConnection((prev) => ({ ...prev, [name]: 'done' }));
      showToast(`${name} connection verified`, 'success');
      setTimeout(() => {
        setTestingConnection((prev) => ({ ...prev, [name]: 'idle' }));
      }, 2000);
    }, 1000);
  }, [showToast]);

  if (loading) return <PageSkeleton />;

  const totalSyncs = connectionsData.reduce((sum, c) => sum + c.syncs, 0);

  return (
    <div style={{ padding: '20px 24px 48px', maxWidth: 1280 }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D', margin: 0 }}>
          Integrations Hub
        </h1>
        <p style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 4, marginBottom: 0 }}>
          Three live syncs keep the CAP platform in lockstep with PrismHR, ClientSpace, and DocuSign — plus supporting connections.
        </p>
      </div>

      {/* Core Syncs hero — the 3 live system syncs */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 'var(--type-table-header)', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Active Syncs
          </span>
          <span style={{ fontSize: 'var(--type-body)', color: '#374151' }}>
            3 live system syncs keeping the platform in lockstep
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {coreSyncNames.map((name) => {
            const conn = connectionsData.find((c) => c.name === name)!;
            const meta = coreSyncMeta[name];
            const currentLastSync = lastSynced[name] || conn.lastSync;
            return (
              <div
                key={name}
                style={{
                  background: '#fff',
                  border: '1px solid #E4E8ED',
                  borderRadius: 12,
                  borderTop: `3px solid ${conn.color}`,
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    width: 9, height: 9, borderRadius: '50%', background: conn.color,
                    boxShadow: `0 0 0 0 ${conn.color}`, animation: 'syncPulse 1.6s ease-out infinite', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D' }}>{conn.name}</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px',
                    borderRadius: 9999, color: conn.color, background: conn.color + '14',
                  }}>
                    Syncing
                  </span>
                </div>
                <div style={{ fontSize: 'var(--type-body-lg)', fontWeight: 600, color: '#1B2D3D', marginBottom: 2 }}>
                  {meta.role}
                </div>
                <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginBottom: 10 }}>
                  {meta.flow}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F2F5', paddingTop: 8 }}>
                  <span style={{ fontSize: 'var(--type-body)', color: '#374151' }}>
                    <span style={{ fontWeight: 700, color: '#1B2D3D' }}>{conn.syncs.toLocaleString()}</span> syncs
                  </span>
                  <span style={{ fontSize: 'var(--type-body)', color: '#374151' }}>{meta.direction}</span>
                  <span style={{ fontSize: 'var(--type-body)', color: '#1A7A4A', fontWeight: 600 }}>{currentLastSync}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        background: '#F0FFF5',
        border: '1px solid #C6F0D4',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#1A7A4A', fontSize: 'var(--type-body-lg)' }}>●</span>
            <span style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1A7A4A' }}>All Systems Operational</span>
          </div>
          <div style={{ fontSize: 'var(--type-body)', color: '#374151' }}>
            3 core syncs &middot; 2 supporting connections &middot; {totalSyncs.toLocaleString()} total syncs &middot; Last sync {lastSynced['PrismHR'] || '2 min ago'}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
          {connectionsData.map((c) => (
            <span key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--type-body)', fontWeight: 600, color: '#1B2D3D' }}>
              <span style={{ color: c.status === 'connected' ? '#1A7A4A' : '#C60C30', fontSize: 'var(--type-body-lg)' }}>●</span>
              {c.name === 'Carrier Underwriting' ? 'Carrier UW' : c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Connection Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {connectionsData.map((conn) => {
          const isConfigOpen = configOpen[conn.name] ?? false;
          const testState = testingConnection[conn.name] || 'idle';
          const currentLastSync = lastSynced[conn.name] || conn.lastSync;

          return (
            <div
              key={conn.name}
              style={{
                background: '#fff',
                border: '1px solid #E4E8ED',
                borderRadius: 12,
                borderLeft: `4px solid ${conn.color}`,
                overflow: 'hidden',
              }}
            >
              {/* Card Header — entire row is clickable */}
              <div
                onClick={() => setExpanded(prev => ({ ...prev, [conn.name]: !prev[conn.name] }))}
                style={{ padding: '14px 20px', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 'var(--type-body-lg)', color: '#374151', flexShrink: 0,
                    transform: expanded[conn.name] ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease', display: 'inline-block',
                  }}>▶</span>
                  <span style={{ color: '#1A7A4A', fontSize: 'var(--type-body-lg)' }}>●</span>
                  <span style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D' }}>{conn.name}</span>
                  <span style={{ fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: '#E8F5E9', color: '#1A7A4A' }}>Connected</span>
                  <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151' }}>&middot; {conn.syncs.toLocaleString()} syncs</span>
                  <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151' }}>&middot; Last sync: {currentLastSync}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleTestConnection(conn.name)}
                      disabled={testState === 'testing'}
                      style={{
                        height: 28, padding: '0 12px', borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                        cursor: testState === 'testing' ? 'default' : 'pointer',
                        background: testState === 'done' ? '#E8F5E9' : '#F4F6F8',
                        color: testState === 'done' ? '#1A7A4A' : '#1B2D3D',
                        border: '1px solid ' + (testState === 'done' ? '#C6F0D4' : '#E4E8ED'),
                        display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s',
                      }}
                    >
                      {testState === 'testing' && (
                        <span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid #E4E8ED', borderTopColor: '#0074B8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      )}
                      {testState === 'done' && <span style={{ fontSize: 'var(--type-body-sm)' }}>✓</span>}
                      {testState === 'testing' ? 'Testing...' : testState === 'done' ? 'Connected' : 'Test Connection'}
                    </button>
                    {conn.name === 'PrismHR' && (
                      <button
                        onClick={() => handleReSync()}
                        style={{ height: 28, padding: '0 14px', borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600, cursor: 'pointer', background: conn.color, color: '#fff', border: 'none' }}
                      >
                        Re-sync
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 'var(--type-body)', color: '#374151', marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
                  {conn.description}
                </p>
              </div>

              {/* Content area - collapsible accordion */}
              {expanded[conn.name] && <>
              {/* Sync Settings + Field Mapping side by side (PrismHR) or field mapping only */}
              <div style={{ padding: '12px 20px 16px' }}>
                {conn.name === 'PrismHR' ? (
                  /* PrismHR: Sync Settings + Field Mapping side by side */
                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, marginBottom: 14 }}>
                    {/* Sync Settings */}
                    <div style={{
                      background: '#FAFBFC',
                      border: '1px solid #E4E8ED',
                      borderRadius: 8,
                      padding: '12px 14px',
                    }}>
                      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                        Sync Settings
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 'var(--type-body)', color: '#1B2D3D', fontWeight: 500 }}>Schedule</span>
                          <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151', fontWeight: 600 }}>Nightly</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 'var(--type-body)', color: '#1B2D3D', fontWeight: 500 }}>Last run</span>
                          <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151', fontWeight: 600 }}>{currentLastSync}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 'var(--type-body)', color: '#1B2D3D', fontWeight: 500 }}>Delta sync</span>
                          <span style={{
                            fontSize: 'var(--type-badge)',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: '#E8F5E9',
                            color: '#1A7A4A',
                          }}>
                            On
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 'var(--type-body)', color: '#1B2D3D', fontWeight: 500 }}>Records</span>
                          <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151', fontWeight: 600 }}>{conn.syncs.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => toggleConfig(conn.name)}
                          style={{
                            marginTop: 4,
                            height: 28,
                            borderRadius: 6,
                            fontSize: 'var(--type-body-sm)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: '#fff',
                            color: '#1B2D3D',
                            border: '1px solid #E4E8ED',
                            width: '100%',
                          }}
                        >
                          {isConfigOpen ? 'Close Config' : 'Configure'}
                        </button>
                      </div>
                    </div>

                    {/* Field Mapping */}
                    <div style={{
                      background: '#FAFBFC',
                      border: '1px solid #E4E8ED',
                      borderRadius: 8,
                      padding: '12px 14px',
                    }}>
                      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                        Field Mapping
                      </div>
                      <table style={{ width: '100%', fontSize: 'var(--type-body)', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #E4E8ED' }}>
                            <th style={{ textAlign: 'left', padding: '4px 8px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)' }}>Prism Field</th>
                            <th style={{ textAlign: 'center', padding: '4px 0', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)', width: 30 }}></th>
                            <th style={{ textAlign: 'left', padding: '4px 8px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)' }}>Platform Field</th>
                          </tr>
                        </thead>
                        <tbody>
                          {conn.fieldMappings!.map((m) => (
                            <tr key={m.from} style={{ borderBottom: '1px solid #F4F6F8' }}>
                              <td style={{ padding: '4px 8px', fontFamily: 'monospace', color: conn.color, fontSize: 'var(--type-body-lg)' }}>{m.from}</td>
                              <td style={{ padding: '4px 0', textAlign: 'center', color: '#374151', fontSize: 'var(--type-body-lg)' }}>→</td>
                              <td style={{ padding: '4px 8px', fontFamily: 'monospace', color: '#1A7A4A', fontSize: 'var(--type-body-lg)' }}>{m.to}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Other connections: Field Mapping + Configure button */
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    {conn.fieldMappings && (
                      <div style={{
                        background: '#FAFBFC',
                        border: '1px solid #E4E8ED',
                        borderRadius: 8,
                        padding: '12px 14px',
                        flex: 1,
                      }}>
                        <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                          Field Mapping
                        </div>
                        <table style={{ width: '100%', fontSize: 'var(--type-body)', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #E4E8ED' }}>
                              <th style={{ textAlign: 'left', padding: '4px 8px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)' }}>Source</th>
                              <th style={{ textAlign: 'center', padding: '4px 0', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)', width: 30 }}></th>
                              <th style={{ textAlign: 'left', padding: '4px 8px', color: '#374151', fontWeight: 600, fontSize: 'var(--type-table-header)' }}>Platform</th>
                            </tr>
                          </thead>
                          <tbody>
                            {conn.fieldMappings.map((m) => (
                              <tr key={m.from} style={{ borderBottom: '1px solid #F4F6F8' }}>
                                <td style={{ padding: '4px 8px', fontFamily: 'monospace', color: conn.color, fontSize: 'var(--type-body-lg)' }}>{m.from}</td>
                                <td style={{ padding: '4px 0', textAlign: 'center', color: '#374151', fontSize: 'var(--type-body-lg)' }}>→</td>
                                <td style={{ padding: '4px 8px', fontFamily: 'monospace', color: '#1A7A4A', fontSize: 'var(--type-body-lg)' }}>{m.to}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                      <div style={{
                        background: '#FAFBFC',
                        border: '1px solid #E4E8ED',
                        borderRadius: 8,
                        padding: '12px 14px',
                        flex: 1,
                      }}>
                        <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                          Quick Info
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151' }}>Total syncs</span>
                            <span style={{ fontSize: 'var(--type-body-lg)', fontWeight: 600, color: '#1B2D3D' }}>{conn.syncs}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151' }}>Status</span>
                            <span style={{ fontSize: 'var(--type-body-lg)', fontWeight: 600, color: '#1A7A4A' }}>Active</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 'var(--type-body-lg)', color: '#374151' }}>Last sync</span>
                            <span style={{ fontSize: 'var(--type-body-lg)', fontWeight: 600, color: '#1B2D3D' }}>{currentLastSync}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleConfig(conn.name)}
                          style={{
                            marginTop: 10,
                            height: 28,
                            borderRadius: 6,
                            fontSize: 'var(--type-body-sm)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: '#fff',
                            color: '#1B2D3D',
                            border: '1px solid #E4E8ED',
                            width: '100%',
                          }}
                        >
                          {isConfigOpen ? 'Close Config' : 'Configure'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inline Configure Panel */}
                {isConfigOpen && (
                  <div style={{
                    background: '#FAFBFC',
                    border: '1px solid #E4E8ED',
                    borderRadius: 8,
                    padding: '16px 18px',
                    marginBottom: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 700, color: '#1B2D3D', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Configuration — {conn.name}
                      </div>
                      <button
                        onClick={() => {
                          toggleConfig(conn.name);
                          showToast(`${conn.name} configuration saved`, 'success');
                        }}
                        style={{
                          height: 26,
                          padding: '0 14px',
                          borderRadius: 6,
                          fontSize: 'var(--type-body-sm)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: conn.color,
                          color: '#fff',
                          border: 'none',
                        }}
                      >
                        Save Changes
                      </button>
                    </div>

                    {conn.name === 'PrismHR' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Sync Schedule
                          </label>
                          <select
                            value={prismSchedule}
                            onChange={(e) => setPrismSchedule(e.target.value)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid #E4E8ED',
                              padding: '0 8px',
                              fontSize: 'var(--type-body-sm)',
                              color: '#1B2D3D',
                              background: '#fff',
                              outline: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="nightly">Nightly (2:30 AM CT)</option>
                            <option value="hourly">Hourly</option>
                            <option value="manual">Manual Only</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Delta Sync
                          </label>
                          <button
                            onClick={() => setPrismDelta(!prismDelta)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid ' + (prismDelta ? '#C6F0D4' : '#E4E8ED'),
                              padding: '0 10px',
                              fontSize: 'var(--type-body-sm)',
                              fontWeight: 600,
                              color: prismDelta ? '#1A7A4A' : '#374151',
                              background: prismDelta ? '#E8F5E9' : '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span style={{
                              width: 14,
                              height: 14,
                              borderRadius: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 'var(--type-body-sm)',
                              background: prismDelta ? '#1A7A4A' : '#E4E8ED',
                              color: '#fff',
                            }}>
                              {prismDelta ? '✓' : ''}
                            </span>
                            {prismDelta ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Webhook URL
                          </label>
                          <input
                            value={prismWebhook}
                            onChange={(e) => setPrismWebhook(e.target.value)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid #E4E8ED',
                              padding: '0 10px',
                              fontSize: 'var(--type-body-sm)',
                              fontFamily: 'monospace',
                              color: '#1B2D3D',
                              background: '#fff',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {conn.name === 'ClientSpace' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Case Template
                          </label>
                          <select
                            value={csTemplate}
                            onChange={(e) => setCsTemplate(e.target.value)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid #E4E8ED',
                              padding: '0 8px',
                              fontSize: 'var(--type-body-sm)',
                              color: '#1B2D3D',
                              background: '#fff',
                              outline: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="new-business-standard">New Business - Standard</option>
                            <option value="new-business-express">New Business - Express</option>
                            <option value="renewal-standard">Renewal - Standard</option>
                            <option value="renewal-complex">Renewal - Complex</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Workflow Mapping
                          </label>
                          <select
                            value={csWorkflow}
                            onChange={(e) => setCsWorkflow(e.target.value)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid #E4E8ED',
                              padding: '0 8px',
                              fontSize: 'var(--type-body-sm)',
                              color: '#1B2D3D',
                              background: '#fff',
                              outline: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="auto-advance">Auto-advance on approval</option>
                            <option value="manual-advance">Manual advance</option>
                            <option value="hybrid">Hybrid (auto for NB, manual for renewal)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {conn.name === 'DocuSign' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Template ID
                          </label>
                          <input
                            value={dsTemplateId}
                            onChange={(e) => setDsTemplateId(e.target.value)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid #E4E8ED',
                              padding: '0 10px',
                              fontSize: 'var(--type-body-sm)',
                              fontFamily: 'monospace',
                              color: '#1B2D3D',
                              background: '#fff',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Signer Routing
                          </label>
                          <select
                            value={dsSignerRouting}
                            onChange={(e) => setDsSignerRouting(e.target.value)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid #E4E8ED',
                              padding: '0 8px',
                              fontSize: 'var(--type-body-sm)',
                              color: '#1B2D3D',
                              background: '#fff',
                              outline: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="broker-first">Broker → Client → G&A</option>
                            <option value="client-first">Client → Broker → G&A</option>
                            <option value="parallel">All signers in parallel</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {conn.name === 'WorkSight' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 300 }}>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Portal Sync
                          </label>
                          <button
                            onClick={() => setWsPortalSync(!wsPortalSync)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid ' + (wsPortalSync ? '#C6F0D4' : '#E4E8ED'),
                              padding: '0 10px',
                              fontSize: 'var(--type-body-sm)',
                              fontWeight: 600,
                              color: wsPortalSync ? '#1A7A4A' : '#374151',
                              background: wsPortalSync ? '#E8F5E9' : '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span style={{
                              width: 14,
                              height: 14,
                              borderRadius: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 'var(--type-body-sm)',
                              background: wsPortalSync ? '#1A7A4A' : '#E4E8ED',
                              color: '#fff',
                            }}>
                              {wsPortalSync ? '✓' : ''}
                            </span>
                            {wsPortalSync ? 'Auto-sync on CAP approval' : 'Manual push only'}
                          </button>
                        </div>
                      </div>
                    )}

                    {conn.name === 'Carrier Underwriting' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 400 }}>
                        <div>
                          <label style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                            Accepted Upload Formats
                          </label>
                          <input
                            value={cuwFormats}
                            onChange={(e) => setCuwFormats(e.target.value)}
                            style={{
                              width: '100%',
                              height: 32,
                              borderRadius: 6,
                              border: '1px solid #E4E8ED',
                              padding: '0 10px',
                              fontSize: 'var(--type-body-sm)',
                              color: '#1B2D3D',
                              background: '#fff',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          <div style={{ fontSize: 'var(--type-body)', color: '#374151', marginTop: 4 }}>
                            Comma-separated list of file extensions. AI extraction supports PDF and XLSX natively.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sync Log */}
                {conn.syncLog && (
                  <div>
                    <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                      Sync Log
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {conn.syncLog.map((entry, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: entry.status === 'warning' ? '#FFFBF0' : '#FAFBFC',
                            border: '1px solid ' + (entry.status === 'warning' ? '#FFE4B5' : '#F0F2F5'),
                            fontSize: 'var(--type-body-lg)',
                          }}
                        >
                          <span style={{
                            color: entry.status === 'success' ? '#1A7A4A' : entry.status === 'warning' ? '#B0690A' : '#C60C30',
                            fontSize: 'var(--type-body)',
                            flexShrink: 0,
                          }}>
                            {entry.status === 'success' ? '✓' : entry.status === 'warning' ? '⚠' : '✕'}
                          </span>
                          <span style={{ color: '#374151', fontWeight: 500, minWidth: 110, flexShrink: 0 }}>
                            {entry.date}
                          </span>
                          <span style={{ color: '#1B2D3D' }}>
                            {entry.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </>}
            </div>
          );
        })}
      </div>

      {/* Spinner keyframe injection */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes syncPulse {
          0%   { box-shadow: 0 0 0 0 rgba(26,122,74,0.45); }
          70%  { box-shadow: 0 0 0 6px rgba(26,122,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(26,122,74,0); }
        }
      `}</style>
    </div>
  );
}
