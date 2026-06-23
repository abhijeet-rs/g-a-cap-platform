'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRenewalStore } from '@/stores/renewalStore';
import { useSyncStore } from '@/stores/syncStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { syncSequences } from '@/data/syncSequences';
import { clients } from '@/data/clients';
import DataCurrencyBanner from '@/components/renewal/DataCurrencyBanner';
import RenewalHeader from '@/components/renewal/RenewalHeader';
import DiffTable from '@/components/renewal/DiffTable';
import { PageSkeleton } from '@/components/shared/Skeleton';

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

type RenewalStep = 'prefill' | 'drift' | 'documents' | 'diff' | 'readiness' | 'booklet' | 'handoff';

const renewalSteps: { key: RenewalStep; label: string }[] = [
  { key: 'prefill', label: 'R2 · Pre-fill' },
  { key: 'drift', label: 'R4 · Data Currency' },
  { key: 'documents', label: 'R3 · Doc Updates' },
  { key: 'diff', label: 'R5 · Renewal Diff' },
  { key: 'readiness', label: 'R6 · Readiness' },
  { key: 'booklet', label: 'R7 · Booklet' },
  { key: 'handoff', label: 'R9 · Handoff' },
];

type RenewalStatus = 'not_started' | 'in_progress' | 'approved';

interface RenewalQueueItem {
  id: string;
  name: string;
  prism: string;
  tier: string;
  wse: number;
  owner: string;
  urgDays: number;
  renewDay: string;
  renewMon: string;
  renewalStatus: RenewalStatus;
}

/* Map client status to renewal workflow status */
function toRenewalStatus(status: string): RenewalStatus {
  if (status === 'approved' || status === 'signed' || status === 'published') return 'approved';
  if (status === 'in_review') return 'in_progress';
  return 'not_started';
}

/* Build renewal queue from clients data, filter urgDays <= 95, sort by urgency */
const renewalQueue: RenewalQueueItem[] = clients
  .filter((c) => c.urgDays <= 95)
  .sort((a, b) => a.urgDays - b.urgDays)
  .map((c) => ({
    id: c.id,
    name: c.name,
    prism: c.prism,
    tier: c.tier,
    wse: c.wse,
    owner: c.owner,
    urgDays: c.urgDays,
    renewDay: c.renewDay,
    renewMon: c.renewMon,
    renewalStatus: toRenewalStatus(c.status),
  }));

const statusBadgeMap: Record<RenewalStatus, { label: string; bg: string; fg: string }> = {
  not_started: { label: 'Not Started', bg: '#EDF0F3', fg: '#64707A' },
  in_progress: { label: 'In Progress', bg: '#FBF0DD', fg: '#B0690A' },
  approved:    { label: 'Approved',    bg: '#E4F2EA', fg: '#1A7A4A' },
};

/* Urgency color thresholds */
function urgencyColor(days: number): string {
  if (days <= 21) return '#C60C30';
  if (days <= 45) return '#B0690A';
  if (days <= 70) return '#0074B8';
  return '#1A7A4A';
}

/* ------------------------------------------------------------------ */
/*  Per-client static demo data for richer tabs                        */
/* ------------------------------------------------------------------ */

interface ClientRenewalData {
  carrier: string;
  effDate: string;
  contribStrategy: string;
  planLineup: string[];
  priorWSE: number;
  currentWSE: number;
  medicalIncrease: string;
  planCrosswalk: { old: string; new: string; plan: string }[];
  dataCurrency: { module: string; pinned: string; current: string; outdated: boolean }[];
  readinessGates: { label: string; passed: boolean }[];
  bookletHistory: { year: string; status: string; signed: string; version: string }[];
  prismPayload: { field: string; value: string }[];
}

const clientRenewalData: Record<string, ClientRenewalData> = {
  itafos: {
    carrier: 'BCBSTX',
    effDate: '2025-07-01',
    contribStrategy: 'Variable',
    planLineup: ['Medical PPO $500', 'Dental PPO $1500', 'Vision Base PPO'],
    priorWSE: 289,
    currentWSE: 298,
    medicalIncrease: '+5.3%',
    planCrosswalk: [
      { old: 'BCBS-PPO-500-2025', new: 'BCBS-PPO-500-2026', plan: 'Medical PPO $500' },
      { old: 'BCBS-DEN-1500-2025', new: 'BCBS-DEN-1500-2026', plan: 'Dental PPO $1500' },
      { old: 'VSP-BASE-2025', new: 'VSP-BASE-2026', plan: 'Vision Base PPO' },
    ],
    dataCurrency: [
      { module: 'Carrier Rates', pinned: '2025 v3', current: '2026 v1', outdated: true },
      { module: 'Pricing Stack', pinned: 'v3', current: 'v4', outdated: true },
      { module: 'ACA Threshold', pinned: '$129.90', current: '$129.90', outdated: false },
      { module: 'Templates', pinned: 'v3', current: 'v4', outdated: true },
    ],
    readinessGates: [
      { label: 'Renewal Increase Confirmed', passed: true },
      { label: 'Source-data validated', passed: true },
      { label: 'No unreconciled drift', passed: false },
      { label: 'No unresolved deltas', passed: false },
      { label: 'CAP fully populated', passed: true },
      { label: 'Booklet/CAP match', passed: true },
      { label: 'Contribution strategy confirmed', passed: true },
      { label: 'ACA affordability passed', passed: true },
    ],
    bookletHistory: [
      { year: '2026', status: 'Pending', signed: '—', version: 'v4 (current)' },
      { year: '2025', status: 'Signed', signed: 'Jun 15, 2025', version: 'v3' },
      { year: '2024', status: 'Signed', signed: 'Jul 1, 2024', version: 'v2' },
    ],
    prismPayload: [
      { field: 'Client ID', value: 'GA-2908' },
      { field: 'Plan Year', value: '2026' },
      { field: 'Effective Date', value: '07/01/2026' },
      { field: 'Medical Plan Code', value: 'BCBS-PPO-500-2026' },
      { field: 'Medical EE Premium', value: '$931.52' },
      { field: 'Medical Family Premium', value: '$2,933.04' },
      { field: 'Dental Plan Code', value: 'BCBS-DEN-1500-2026' },
      { field: 'Dental EE Premium', value: '$29.00' },
      { field: 'Vision Plan Code', value: 'VSP-BASE-2026' },
      { field: 'Vision EE Premium', value: '$6.00' },
      { field: 'Contribution Strategy', value: 'Variable' },
      { field: 'WSE Count', value: '298' },
    ],
  },
  sterling: {
    carrier: 'Aetna',
    effDate: '2025-07-01',
    contribStrategy: 'Flat Dollar',
    planLineup: ['Medical HMO $750', 'Dental DHMO'],
    priorWSE: 36,
    currentWSE: 38,
    medicalIncrease: '+7.1%',
    planCrosswalk: [
      { old: 'AET-HMO-750-2025', new: 'AET-HMO-750-2026', plan: 'Medical HMO $750' },
      { old: 'AET-DHMO-2025', new: 'AET-DHMO-2026', plan: 'Dental DHMO' },
    ],
    dataCurrency: [
      { module: 'Carrier Rates', pinned: '2025 v2', current: '2026 v1', outdated: true },
      { module: 'Pricing Stack', pinned: 'v3', current: 'v4', outdated: true },
      { module: 'ACA Threshold', pinned: '$129.90', current: '$129.90', outdated: false },
      { module: 'Templates', pinned: 'v3', current: 'v4', outdated: true },
    ],
    readinessGates: [
      { label: 'Renewal Increase Confirmed', passed: true },
      { label: 'Source-data validated', passed: true },
      { label: 'No unreconciled drift', passed: true },
      { label: 'No unresolved deltas', passed: true },
      { label: 'CAP fully populated', passed: true },
      { label: 'Booklet/CAP match', passed: true },
      { label: 'Contribution strategy confirmed', passed: true },
      { label: 'ACA affordability passed', passed: true },
    ],
    bookletHistory: [
      { year: '2026', status: 'Pending', signed: '—', version: 'v3 (current)' },
      { year: '2025', status: 'Signed', signed: 'Jun 20, 2025', version: 'v2' },
    ],
    prismPayload: [
      { field: 'Client ID', value: 'GA-10612' },
      { field: 'Plan Year', value: '2026' },
      { field: 'Effective Date', value: '07/01/2026' },
      { field: 'Medical Plan Code', value: 'AET-HMO-750-2026' },
      { field: 'Medical EE Premium', value: '$712.88' },
      { field: 'Dental Plan Code', value: 'AET-DHMO-2026' },
      { field: 'Dental EE Premium', value: '$18.50' },
      { field: 'Contribution Strategy', value: 'Flat Dollar' },
      { field: 'WSE Count', value: '38' },
    ],
  },
  harbor: {
    carrier: 'UnitedHealthcare',
    effDate: '2025-07-20',
    contribStrategy: 'Base Plan',
    planLineup: ['Medical PPO $1000', 'Dental PPO $2000', 'Vision Enhanced'],
    priorWSE: 84,
    currentWSE: 89,
    medicalIncrease: '+4.8%',
    planCrosswalk: [
      { old: 'UHC-PPO-1000-2025', new: 'UHC-PPO-1000-2026', plan: 'Medical PPO $1000' },
      { old: 'UHC-DEN-2000-2025', new: 'UHC-DEN-2000-2026', plan: 'Dental PPO $2000' },
      { old: 'VSP-ENH-2025', new: 'VSP-ENH-2026', plan: 'Vision Enhanced' },
    ],
    dataCurrency: [
      { module: 'Carrier Rates', pinned: '2025 v3', current: '2026 v1', outdated: true },
      { module: 'Pricing Stack', pinned: 'v3', current: 'v4', outdated: true },
      { module: 'ACA Threshold', pinned: '$129.90', current: '$129.90', outdated: false },
      { module: 'Templates', pinned: 'v3', current: 'v3', outdated: false },
    ],
    readinessGates: [
      { label: 'Renewal Increase Confirmed', passed: true },
      { label: 'Source-data validated', passed: true },
      { label: 'No unreconciled drift', passed: true },
      { label: 'No unresolved deltas', passed: false },
      { label: 'CAP fully populated', passed: true },
      { label: 'Booklet/CAP match', passed: false },
      { label: 'Contribution strategy confirmed', passed: true },
      { label: 'ACA affordability passed', passed: true },
    ],
    bookletHistory: [
      { year: '2026', status: 'Pending', signed: '—', version: 'v4 (current)' },
      { year: '2025', status: 'Signed', signed: 'Jul 10, 2025', version: 'v3' },
      { year: '2024', status: 'Signed', signed: 'Jul 5, 2024', version: 'v2' },
    ],
    prismPayload: [
      { field: 'Client ID', value: 'GA-10298' },
      { field: 'Plan Year', value: '2026' },
      { field: 'Effective Date', value: '07/20/2026' },
      { field: 'Medical Plan Code', value: 'UHC-PPO-1000-2026' },
      { field: 'Medical EE Premium', value: '$845.20' },
      { field: 'Dental Plan Code', value: 'UHC-DEN-2000-2026' },
      { field: 'Vision Plan Code', value: 'VSP-ENH-2026' },
      { field: 'Contribution Strategy', value: 'Base Plan' },
      { field: 'WSE Count', value: '89' },
    ],
  },
};

/* Fallback data generator for clients without explicit data */
function getClientData(clientId: string): ClientRenewalData {
  if (clientRenewalData[clientId]) return clientRenewalData[clientId];
  const client = renewalQueue.find((c) => c.id === clientId);
  return {
    carrier: 'BCBSTX',
    effDate: '2025-07-01',
    contribStrategy: 'Variable',
    planLineup: ['Medical PPO $500', 'Dental PPO $1000'],
    priorWSE: (client?.wse ?? 100) - 8,
    currentWSE: client?.wse ?? 100,
    medicalIncrease: '+4.5%',
    planCrosswalk: [
      { old: 'BCBS-PPO-500-2025', new: 'BCBS-PPO-500-2026', plan: 'Medical PPO $500' },
      { old: 'BCBS-DEN-1000-2025', new: 'BCBS-DEN-1000-2026', plan: 'Dental PPO $1000' },
    ],
    dataCurrency: [
      { module: 'Carrier Rates', pinned: '2025 v3', current: '2026 v1', outdated: true },
      { module: 'Pricing Stack', pinned: 'v3', current: 'v4', outdated: true },
      { module: 'ACA Threshold', pinned: '$129.90', current: '$129.90', outdated: false },
      { module: 'Templates', pinned: 'v3', current: 'v4', outdated: true },
    ],
    readinessGates: [
      { label: 'Renewal Increase Confirmed', passed: false },
      { label: 'Source-data validated', passed: true },
      { label: 'No unreconciled drift', passed: false },
      { label: 'No unresolved deltas', passed: false },
      { label: 'CAP fully populated', passed: false },
      { label: 'Booklet/CAP match', passed: false },
      { label: 'Contribution strategy confirmed', passed: false },
      { label: 'ACA affordability passed', passed: true },
    ],
    bookletHistory: [
      { year: '2026', status: 'Pending', signed: '—', version: 'v3 (current)' },
      { year: '2025', status: 'Signed', signed: 'Jun 20, 2025', version: 'v2' },
    ],
    prismPayload: [
      { field: 'Client ID', value: client?.prism ?? 'GA-0000' },
      { field: 'Plan Year', value: '2026' },
      { field: 'Effective Date', value: '07/01/2026' },
      { field: 'Medical Plan Code', value: 'BCBS-PPO-500-2026' },
      { field: 'WSE Count', value: String(client?.wse ?? 100) },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RenewalPage() {
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(renewalQueue[0]?.id ?? 'itafos');
  const [activeStep, setActiveStep] = useState<RenewalStep>('prefill');
  const [bookletGenerating, setBookletGenerating] = useState(false);
  const [handoffGenerated, setHandoffGenerated] = useState(false);

  /* ── R3 Doc Updates state ── */
  const [docFiles, setDocFiles] = useState<string[]>([]);
  const [docDragOver, setDocDragOver] = useState(false);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  interface DocDelta {
    field: string;
    baseline: string;
    proposed: string;
    hasChange: boolean;
    decision: 'pending' | 'accepted' | 'rejected';
  }

  const [docDeltas, setDocDeltas] = useState<DocDelta[]>([]);

  const mockDeltas: DocDelta[] = [
    { field: 'EE Headcount', baseline: '298', proposed: '312', hasChange: true, decision: 'pending' },
    { field: 'Dental EO Rate', baseline: '$27.50', proposed: '$29.00', hasChange: true, decision: 'pending' },
    { field: 'Medical Carrier', baseline: 'BCBS Texas', proposed: 'BCBS Texas', hasChange: false, decision: 'pending' },
    { field: 'Medical EO Rate', baseline: '$931.52', proposed: '$948.10', hasChange: true, decision: 'pending' },
  ];

  const handleDocUpload = (fileNames: string[]) => {
    setDocFiles((prev) => [...prev, ...fileNames]);
    setDocDeltas(mockDeltas);
  };

  const handleDeltaDecision = (index: number, decision: 'accepted' | 'rejected') => {
    setDocDeltas((prev) => prev.map((d, i) => i === index ? { ...d, decision } : d));
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const router = useRouter();
  const approve = useRenewalStore((s) => s.approve);
  const approved = useRenewalStore((s) => s.approved);
  const rebaseDone = useRenewalStore((s) => s.rebaseDone);
  const rebase = useRenewalStore((s) => s.rebase);
  const diffDecisions = useRenewalStore((s) => s.diffDecisions);
  const show = useSyncStore((s) => s.show);
  const showToast = useUIStore((s) => s.showToast);
  const can = useAuthStore((s) => s.can);

  const selectedClient = renewalQueue.find((c) => c.id === selectedClientId) ?? renewalQueue[0];
  const clientData = getClientData(selectedClientId);

  // Dynamic readiness gates — computed from actual user actions
  const allDiffsResolved = Object.keys(diffDecisions).length >= 3;
  const dynamicGates = clientData.readinessGates.map(g => {
    if (g.label === 'No unreconciled drift') return { ...g, passed: rebaseDone || g.passed };
    if (g.label === 'No unresolved deltas') return { ...g, passed: allDiffsResolved || g.passed };
    return g;
  });
  const allGatesPassed = dynamicGates.every(g => g.passed);

  const handleApprove = () => {
    const seq = syncSequences.renewalApprove;
    show(seq.title, seq.steps, () => {
      approve();
      showToast('Renewal CAP approved');
    });
  };

  const handleRebase = () => {
    rebase();
    const seq = syncSequences.rebaseData;
    show(seq.title, seq.steps, () => {
      showToast('Re-baselined onto 2026 data');
    });
  };

  const handleGenerateBooklet = () => {
    const seq = syncSequences.generateBooklet;
    show(seq.title, seq.steps, () => {
      setBookletGenerating(true);
      showToast('Benefits booklet generated');
    });
  };

  const handleGenerateHandoff = () => {
    setHandoffGenerated(true);
    showToast('Handoff payload generated', 'info');
  };

  const handleSubmitBenAdmin = () => {
    const seq = syncSequences.publishDownstream;
    show(seq.title, seq.steps, () => {
      showToast('Submitted to Ben Admin');
      router.push('/dashboard');
    });
  };

  if (loading) return <PageSkeleton />;

  /* Count upcoming renewals */
  const upcomingCount = renewalQueue.length;

  /* ── Shared styles ── */
  const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #E4E8ED',
    borderRadius: 10,
    padding: 16,
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: '#98A1A8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 8,
  };

  const monoStyle: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
  };

  const btnPrimary: React.CSSProperties = {
    height: 36,
    padding: '0 18px',
    background: '#C60C30',
    color: '#fff',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 12,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background .12s',
  };

  const btnSecondary: React.CSSProperties = {
    height: 36,
    padding: '0 18px',
    background: '#fff',
    color: '#C60C30',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 12,
    border: '1px solid #C60C30',
    cursor: 'pointer',
    transition: 'background .12s, color .12s',
  };

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 24px' }}>

      {/* ════════════ Page Header ════════════ */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#C60C30' }}>
              Renewal Management &middot; R1-R9
            </div>
            <div style={{ fontSize: 12, color: '#64707A', marginTop: 2 }}>
              {upcomingCount} upcoming renewal{upcomingCount !== 1 ? 's' : ''} &middot; Next 90 days
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, background: '#FDECEF', color: '#C60C30', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 10px' }}>
            Renewal Radar &middot; R1
          </span>
        </div>
      </div>

      {/* ════════════ Main Two-Column Layout ════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ──────── LEFT: Renewal Queue (R1 Radar) ──────── */}
        <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #E4E8ED' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Renewal Queue</h2>
            <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 2 }}>Sorted by urgency</div>
          </div>

          {renewalQueue.map((item) => {
            const isSelected = item.id === selectedClientId;
            const badge = statusBadgeMap[item.renewalStatus];
            const urgColor = urgencyColor(item.urgDays);

            return (
              <div
                key={item.id}
                onClick={() => { setSelectedClientId(item.id); setActiveStep('prefill'); setBookletGenerating(false); setHandoffGenerated(false); setDocFiles([]); setDocDeltas([]); }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#FAFBFC'; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #E4E8ED',
                  background: isSelected ? '#F5F7FA' : '#fff',
                  borderLeft: isSelected ? '3px solid #C60C30' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {/* Date badge */}
                  <div style={{
                    width: 40,
                    height: 44,
                    borderRadius: 6,
                    background: `${urgColor}12`,
                    border: `1px solid ${urgColor}30`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: urgColor, lineHeight: 1 }}>{item.renewDay}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: urgColor, textTransform: 'uppercase' }}>{item.renewMon}</div>
                  </div>

                  {/* Client info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 1 }}>
                      {item.prism}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 600,
                        borderRadius: 4,
                        padding: '1px 6px',
                        background: badge.bg,
                        color: badge.fg,
                      }}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize: 9, color: urgColor, fontWeight: 600 }}>
                        {item.urgDays}d
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ──────── RIGHT: Step-based Detail View ──────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Client header bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{selectedClient.name}</h1>
              <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 2 }}>
                {selectedClient.prism} &middot; {selectedClient.tier} &middot; {selectedClient.wse} WSE &middot; {selectedClient.owner}
              </div>
              {/* ClientSpace Case Reference */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 6, padding: '3px 10px', borderRadius: 5,
                background: '#F5F7FA', border: '1px solid #E4E8ED',
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#0074B8' }}>ClientSpace Case:</span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600,
                  color: '#1B2D3D',
                }}>CS-2026-R-{String(selectedClient.prism).replace('GA-', '').slice(0, 4)}</span>
                <span style={{ color: '#DCE2E8' }}>&middot;</span>
                <span style={{ fontSize: 10, color: '#64707A' }}>Renewal</span>
                <span style={{ color: '#DCE2E8' }}>&middot;</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#B0690A' }}>Open</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Medical increase card */}
              <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#B0690A' }}>{clientData.medicalIncrease}</div>
                <div style={{ fontSize: 9, color: '#98A1A8' }}>Medical YoY</div>
              </div>
              {/* Days remaining card */}
              <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: urgencyColor(selectedClient.urgDays) }}>{selectedClient.urgDays}d</div>
                <div style={{ fontSize: 9, color: '#98A1A8' }}>Until Renewal</div>
              </div>
              {approved && (
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, background: '#E4F2EA', color: '#1A7A4A', fontSize: 10, fontWeight: 600, borderRadius: 6, padding: '0 10px' }}>
                  Approved
                </span>
              )}
            </div>
          </div>

          {/* ── Step Tab Bar ── */}
          <div style={{
            display: 'flex',
            gap: 0,
            borderBottom: '2px solid #E4E8ED',
            marginBottom: 16,
          }}>
            {renewalSteps.map((step) => {
              const isActive = step.key === activeStep;
              return (
                <button
                  key={step.key}
                  onClick={() => setActiveStep(step.key)}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#1B2D3D'; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#64707A'; }}
                  style={{
                    padding: '10px 16px',
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#C60C30' : '#64707A',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #C60C30' : '2px solid transparent',
                    marginBottom: -2,
                    cursor: 'pointer',
                    transition: 'color 0.15s, border-color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </button>
              );
            })}
          </div>

          {/* ════════ Tab Content ════════ */}

          {/* ── R2 PRE-FILL TAB ── */}
          {activeStep === 'prefill' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Pre-fill Summary */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Pre-fill Summary</h2>
                <p style={{ fontSize: 11, color: '#64707A', marginBottom: 16, lineHeight: 1.5 }}>
                  Baseline carried forward from prior plan year and Prism client record. Review the pre-filled values below before starting the renewal diff.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                  {/* Prior-year CAP info */}
                  <div style={{ background: '#FAFBFC', borderRadius: 8, padding: 14, border: '1px solid #EEF1F4' }}>
                    <div style={sectionLabelStyle}>Prior-Year CAP</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#98A1A8' }}>Plan Lineup</div>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{clientData.planLineup.join(', ')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#98A1A8' }}>Contribution Strategy</div>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{clientData.contribStrategy}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#98A1A8' }}>Prior WSE Count</div>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{clientData.priorWSE}</div>
                      </div>
                    </div>
                  </div>

                  {/* Prism client record */}
                  <div style={{ background: '#FAFBFC', borderRadius: 8, padding: 14, border: '1px solid #EEF1F4' }}>
                    <div style={sectionLabelStyle}>Prism Client Record</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#98A1A8' }}>Carrier</div>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{clientData.carrier}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#98A1A8' }}>Effective Date</div>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{clientData.effDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#98A1A8' }}>Current WSE Count</div>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{clientData.currentWSE}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan-Code Crosswalk */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Plan-Code Crosswalk Migration</h2>
                <div style={{ background: '#FAFBFC', borderRadius: 8, border: '1px solid #EEF1F4', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', padding: '8px 14px', borderBottom: '1px solid #EEF1F4' }}>
                    <div style={sectionLabelStyle}>Old Code</div>
                    <div style={sectionLabelStyle}>New Code</div>
                    <div style={sectionLabelStyle}>Plan</div>
                  </div>
                  {clientData.planCrosswalk.map((row, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1.2fr 1fr',
                      padding: '8px 14px',
                      borderBottom: i < clientData.planCrosswalk.length - 1 ? '1px solid #EEF1F4' : 'none',
                      alignItems: 'center',
                    }}>
                      <div style={{ ...monoStyle, color: '#98A1A8', textDecoration: 'line-through' }}>{row.old}</div>
                      <div style={{ ...monoStyle, color: '#1A7A4A', fontWeight: 600 }}>{row.new}</div>
                      <div style={{ fontSize: 11 }}>{row.plan}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Renewal button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setActiveStep('diff')}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#A80A28'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#C60C30'; }}
                  style={btnPrimary}
                >
                  Start Renewal &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ── R4 DATA CURRENCY TAB ── */}
          {activeStep === 'drift' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Existing DataCurrencyBanner */}
              {selectedClientId === 'itafos' && <DataCurrencyBanner />}

              {/* Expanded version comparison */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Data Currency &middot; Version Comparison</h2>
                <p style={{ fontSize: 11, color: '#64707A', marginBottom: 14 }}>
                  {rebaseDone
                    ? 'All modules have been re-baselined onto current data.'
                    : 'This renewal is based on 2025 master data. 2026 data is available for some modules.'}
                </p>

                {/* Banner */}
                {!rebaseDone && (
                  <div style={{ background: '#FBF0DD', border: '1px solid #F0DDB5', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#B0690A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: 11 }}>&#x26A0;</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#B0690A', fontWeight: 500 }}>
                      Based on 2025 master data. 2026 available.
                    </span>
                  </div>
                )}

                {/* Version table */}
                <div style={{ background: '#FAFBFC', borderRadius: 8, border: '1px solid #EEF1F4', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', padding: '8px 14px', borderBottom: '1px solid #EEF1F4' }}>
                    <div style={sectionLabelStyle}>Module</div>
                    <div style={sectionLabelStyle}>Pinned</div>
                    <div style={sectionLabelStyle}>Current</div>
                    <div style={sectionLabelStyle}>Status</div>
                  </div>
                  {clientData.dataCurrency.map((row, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 1fr 100px',
                      padding: '8px 14px',
                      borderBottom: i < clientData.dataCurrency.length - 1 ? '1px solid #EEF1F4' : 'none',
                      alignItems: 'center',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 500 }}>{row.module}</div>
                      <div style={monoStyle}>{row.pinned}</div>
                      <div style={{ ...monoStyle, fontWeight: row.outdated && !rebaseDone ? 600 : 400 }}>{row.current}</div>
                      <div>
                        {row.outdated && !rebaseDone ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 9, fontWeight: 600, color: '#B0690A', background: '#FBF0DD', borderRadius: 4, padding: '2px 7px' }}>
                            &#x26A0; Outdated
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 9, fontWeight: 600, color: '#1A7A4A', background: '#E4F2EA', borderRadius: 4, padding: '2px 7px' }}>
                            &#x2713; Current
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bring Up to Date button */}
              {!rebaseDone && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleRebase} style={btnPrimary}>
                    Bring Up to Date &rarr;
                  </button>
                </div>
              )}
              {rebaseDone && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#1A7A4A', fontWeight: 600 }}>&#x2713; All modules current</span>
                </div>
              )}
            </div>
          )}

          {/* ── R3 DOC UPDATES TAB ── */}
          {activeStep === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Upload Area */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Document Upload</h2>
                <p style={{ fontSize: 11, color: '#64707A', marginBottom: 14, lineHeight: 1.5 }}>
                  Upload renewal documents (carrier letters, census updates, rate sheets) to extract proposed changes against the baseline.
                </p>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDocDragOver(true); }}
                  onDragLeave={() => setDocDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDocDragOver(false);
                    const files = Array.from(e.dataTransfer.files);
                    handleDocUpload(files.map((f) => f.name));
                  }}
                  onClick={() => docFileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${docDragOver ? '#0074B8' : '#E4E8ED'}`,
                    borderRadius: 10,
                    padding: '28px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: docDragOver ? '#F0F7FF' : '#FAFBFC',
                    transition: 'all .15s',
                  }}
                >
                  <input
                    ref={docFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.xlsx,.csv,.png,.jpg,.jpeg,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files) {
                        handleDocUpload(Array.from(e.target.files).map((f) => f.name));
                      }
                    }}
                  />
                  <div style={{ fontSize: 22, color: '#98A1A8', marginBottom: 6 }}>&#x21E7;</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1B2D3D' }}>
                    Drop carrier letters, census updates, or rate sheets here
                  </div>
                  <div style={{ fontSize: 9, color: '#98A1A8', marginTop: 4 }}>
                    Supports PDF, Excel, CSV, Word, PNG, JPG
                  </div>
                </div>

                {/* Uploaded files list */}
                {docFiles.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ ...sectionLabelStyle, marginBottom: 2 }}>
                      Uploaded Files ({docFiles.length})
                    </div>
                    {docFiles.map((file, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#F8F9FA',
                          borderRadius: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: '#0074B8' }}>&#x2B24;</span>
                          <span style={{ fontSize: 10, color: '#1B2D3D' }}>{file}</span>
                        </div>
                        <button
                          onClick={() => setDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          style={{
                            width: 20, height: 20, borderRadius: 4, border: '1px solid #E4E8ED',
                            background: '#fff', cursor: 'pointer', fontSize: 10, color: '#C60C30',
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

              {/* Proposed Deltas Table */}
              {docDeltas.length > 0 && (
                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Proposed Deltas from Uploaded Documents</h2>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', height: 20,
                      background: '#FBF0DD', color: '#B0690A', fontSize: 9, fontWeight: 600,
                      borderRadius: 4, padding: '0 8px',
                    }}>
                      {docDeltas.filter((d) => d.decision === 'pending' && d.hasChange).length} pending
                    </span>
                  </div>

                  <div style={{ background: '#FAFBFC', borderRadius: 8, border: '1px solid #EEF1F4', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 1fr 120px',
                      padding: '8px 14px',
                      borderBottom: '1px solid #EEF1F4',
                    }}>
                      <div style={sectionLabelStyle}>Field</div>
                      <div style={sectionLabelStyle}>Baseline</div>
                      <div style={sectionLabelStyle}>Proposed</div>
                      <div style={sectionLabelStyle}>Action</div>
                    </div>

                    {/* Rows */}
                    {docDeltas.map((delta, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.5fr 1fr 1fr 120px',
                          padding: '10px 14px',
                          borderBottom: i < docDeltas.length - 1 ? '1px solid #EEF1F4' : 'none',
                          alignItems: 'center',
                          background: delta.decision === 'accepted' ? '#F0FFF5' : delta.decision === 'rejected' ? '#FFF5F5' : 'transparent',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{delta.field}</div>
                        <div style={{ ...monoStyle, fontSize: 11, color: '#64707A' }}>{delta.baseline}</div>
                        <div style={{
                          ...monoStyle, fontSize: 11,
                          fontWeight: delta.hasChange ? 600 : 400,
                          color: delta.hasChange ? '#B0690A' : '#98A1A8',
                        }}>
                          {delta.proposed}
                        </div>
                        <div>
                          {!delta.hasChange ? (
                            <span style={{ fontSize: 9, color: '#98A1A8', fontWeight: 500 }}>No change</span>
                          ) : delta.decision === 'pending' ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => handleDeltaDecision(i, 'accepted')}
                                style={{
                                  height: 22, padding: '0 8px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                                  cursor: 'pointer', background: '#E4F2EA', color: '#1A7A4A', border: '1px solid #C6F0D4',
                                }}
                              >
                                &#x2713; Accept
                              </button>
                              <button
                                onClick={() => handleDeltaDecision(i, 'rejected')}
                                style={{
                                  height: 22, padding: '0 8px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                                  cursor: 'pointer', background: '#FEF2F2', color: '#C60C30', border: '1px solid #FDECEF',
                                }}
                              >
                                &#x2715; Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{
                              fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                              background: delta.decision === 'accepted' ? '#E4F2EA' : '#FEF2F2',
                              color: delta.decision === 'accepted' ? '#1A7A4A' : '#C60C30',
                            }}>
                              {delta.decision === 'accepted' ? '✓ Accepted' : '✕ Rejected'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <div>
                      <span style={{ fontSize: 10, color: '#98A1A8' }}>Accepted</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A7A4A' }}>
                        {docDeltas.filter((d) => d.decision === 'accepted').length}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: '#98A1A8' }}>Rejected</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#C60C30' }}>
                        {docDeltas.filter((d) => d.decision === 'rejected').length}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: '#98A1A8' }}>Pending</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#B0690A' }}>
                        {docDeltas.filter((d) => d.decision === 'pending' && d.hasChange).length}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: '#98A1A8' }}>No Change</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#98A1A8' }}>
                        {docDeltas.filter((d) => !d.hasChange).length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setActiveStep('diff')}
                  style={btnPrimary}
                >
                  Continue to Renewal Diff &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ── R5 RENEWAL DIFF TAB ── */}
          {activeStep === 'diff' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Embed existing DataCurrencyBanner for context */}
              {selectedClientId === 'itafos' && <DataCurrencyBanner />}

              {/* Embed existing RenewalHeader */}
              <RenewalHeader />

              {/* Embed existing DiffTable with legend and accept/flag */}
              <DiffTable />

              {/* Navigation to readiness */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setActiveStep('readiness')}
                  style={btnPrimary}
                >
                  Continue to Readiness &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ── R6 READINESS TAB ── */}
          {activeStep === 'readiness' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={cardStyle}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Renewal Readiness Gates</h2>
                <p style={{ fontSize: 11, color: '#64707A', marginBottom: 14 }}>
                  All gates must pass before the renewal can be approved and routed for signature.
                </p>

                {/* Readiness progress bar */}
                {(() => {
                  const gates = dynamicGates;
                  const passedCount = gates.filter((g) => g.passed).length;
                  const pct = Math.round((passedCount / gates.length) * 100);
                  return (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#64707A' }}>{passedCount}/{gates.length} gates passed</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: pct === 100 ? '#1A7A4A' : '#B0690A' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: '#EDF0F3', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: pct === 100 ? '#1A7A4A' : '#B0690A',
                          borderRadius: 3,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  );
                })()}

                {/* Gate list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {dynamicGates.map((gate, i) => {
                    const fixTarget: Record<string, { tab: RenewalStep; hint: string }> = {
                      'No unreconciled drift': { tab: 'drift', hint: 'Go to R4 · Data Currency and click "Bring Up to Date"' },
                      'No unresolved deltas': { tab: 'diff', hint: 'Go to R5 · Renewal Diff and accept or flag all pending items' },
                    };
                    const fix = !gate.passed ? fixTarget[gate.label] : null;

                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 0',
                        borderTop: i > 0 ? '1px solid #EEF1F4' : 'none',
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, flexShrink: 0,
                          background: gate.passed ? '#E4F2EA' : '#FEF2F2',
                          color: gate.passed ? '#1A7A4A' : '#C60C30',
                        }}>
                          {gate.passed ? '✓' : '✗'}
                        </div>
                        <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: gate.passed ? '#2D3339' : '#C60C30' }}>
                          {gate.label}
                          {fix && (
                            <span style={{ display: 'block', fontSize: 10, fontWeight: 400, color: '#98A1A8', marginTop: 2 }}>
                              {fix.hint}
                            </span>
                          )}
                        </span>
                        {fix && (
                          <button
                            onClick={() => setActiveStep(fix.tab)}
                            style={{
                              height: 26, padding: '0 10px', borderRadius: 6,
                              border: '1px solid #C60C30', background: '#fff',
                              color: '#C60C30', fontSize: 10, fontWeight: 600,
                              cursor: 'pointer', flexShrink: 0,
                            }}
                          >
                            Fix →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diff decisions summary */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Diff Resolution Summary</h2>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#98A1A8' }}>Accepted</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1A7A4A' }}>
                      {Object.values(diffDecisions).filter((d) => d === 'accept').length}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#98A1A8' }}>Flagged</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#C60C30' }}>
                      {Object.values(diffDecisions).filter((d) => d === 'reject').length}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#98A1A8' }}>Pending</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#B0690A' }}>
                      {4 - Object.keys(diffDecisions).length}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#98A1A8' }}>Data Rebased</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: rebaseDone ? '#1A7A4A' : '#98A1A8' }}>
                      {rebaseDone ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Approve Renewal button */}
              {(() => {
                const failedCount = dynamicGates.filter(g => !g.passed).length;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    {!allGatesPassed && (
                      <div style={{
                        background: '#FEF2F2', border: '1px solid rgba(198,12,48,.15)',
                        borderRadius: 8, padding: '8px 14px', fontSize: 11, color: '#C60C30',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <span style={{ fontWeight: 600 }}>⚠</span>
                        {failedCount} gate{failedCount > 1 ? 's' : ''} must pass before approval. Use the Fix buttons above to resolve.
                      </div>
                    )}
                    {can('approve') ? (
                      <button
                        onClick={handleApprove}
                        disabled={approved || !allGatesPassed}
                        style={{
                          ...btnPrimary,
                          opacity: (approved || !allGatesPassed) ? 0.5 : 1,
                          cursor: (approved || !allGatesPassed) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {approved ? 'Renewal Approved ✓' : !allGatesPassed ? `${failedCount} gates block approval` : 'Approve Renewal →'}
                      </button>
                    ) : (
                      <div style={{ height: 36, padding: '0 18px', display: 'flex', alignItems: 'center', fontSize: 11, color: '#98A1A8' }}>
                        Only AE, Manager, or Admin can approve
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── R7 BOOKLET TAB ── */}
          {activeStep === 'booklet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Booklet Preview */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Benefits Booklet Preview</h2>
                  {bookletGenerating && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, background: '#E4F2EA', color: '#1A7A4A', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 8px' }}>
                      Generated
                    </span>
                  )}
                </div>

                {/* Simulated booklet preview */}
                <div style={{
                  background: '#FAFBFC',
                  border: '1px solid #EEF1F4',
                  borderRadius: 8,
                  padding: 20,
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}>
                  {/* PDF icon */}
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: '#C60C30',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                  }}>
                    PDF
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3339' }}>
                    {selectedClient.name} &mdash; Benefits Booklet 2026
                  </div>
                  <div style={{ fontSize: 10, color: '#98A1A8' }}>
                    12 pages &middot; EN + ES &middot; {bookletGenerating ? 'v4 (latest)' : 'v3 (prior year)'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: '#64707A', background: '#EDF0F3', borderRadius: 4, padding: '3px 8px' }}>
                      Medical: {clientData.planLineup[0] ?? 'PPO $500'}
                    </div>
                    <div style={{ fontSize: 10, color: '#64707A', background: '#EDF0F3', borderRadius: 4, padding: '3px 8px' }}>
                      Dental: {clientData.planLineup[1] ?? 'PPO $1500'}
                    </div>
                    {clientData.planLineup[2] && (
                      <div style={{ fontSize: 10, color: '#64707A', background: '#EDF0F3', borderRadius: 4, padding: '3px 8px' }}>
                        Vision: {clientData.planLineup[2]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate button */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
                  <button onClick={handleGenerateBooklet} style={btnSecondary}>
                    {bookletGenerating ? 'Regenerate Booklet' : 'Generate Booklet'}
                  </button>
                </div>
              </div>

              {/* Annual Contract Management */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Annual Contract Management</h2>
                <p style={{ fontSize: 11, color: '#64707A', marginBottom: 12 }}>
                  Year-over-year sign-off history for this client.
                </p>

                <div style={{ background: '#FAFBFC', borderRadius: 8, border: '1px solid #EEF1F4', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr 120px', padding: '8px 14px', borderBottom: '1px solid #EEF1F4' }}>
                    <div style={sectionLabelStyle}>Plan Year</div>
                    <div style={sectionLabelStyle}>Status</div>
                    <div style={sectionLabelStyle}>Signed</div>
                    <div style={sectionLabelStyle}>Booklet Version</div>
                  </div>
                  {clientData.bookletHistory.map((row, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 100px 1fr 120px',
                      padding: '8px 14px',
                      borderBottom: i < clientData.bookletHistory.length - 1 ? '1px solid #EEF1F4' : 'none',
                      alignItems: 'center',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{row.year}</div>
                      <div>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 600,
                          borderRadius: 4,
                          padding: '2px 7px',
                          background: row.status === 'Signed' ? '#E4F2EA' : '#FBF0DD',
                          color: row.status === 'Signed' ? '#1A7A4A' : '#B0690A',
                        }}>
                          {row.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: row.signed === '—' ? '#98A1A8' : '#2D3339' }}>{row.signed}</div>
                      <div style={{ ...monoStyle, color: '#64707A' }}>{row.version}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route for Signature */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => router.push('/esign')}
                  style={btnPrimary}
                >
                  Route for Signature &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ── R9 HANDOFF TAB ── */}
          {activeStep === 'handoff' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Prism Write-back Payload Preview */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Prism Write-back Payload</h2>
                  <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, background: '#E7F1FA', color: '#0074B8', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 8px' }}>
                    PrismHR &middot; R9
                  </span>
                </div>

                <div style={{ background: '#FAFBFC', borderRadius: 8, border: '1px solid #EEF1F4', overflow: 'hidden' }}>
                  {clientData.prismPayload.map((row, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '180px 1fr',
                      padding: '8px 14px',
                      borderBottom: i < clientData.prismPayload.length - 1 ? '1px solid #EEF1F4' : 'none',
                      alignItems: 'center',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{row.field}</div>
                      <div style={{ ...monoStyle, fontWeight: 500 }}>{row.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
                  <button
                    onClick={handleGenerateHandoff}
                    disabled={handoffGenerated}
                    style={{
                      ...btnSecondary,
                      opacity: handoffGenerated ? 0.6 : 1,
                      cursor: handoffGenerated ? 'default' : 'pointer',
                    }}
                  >
                    {handoffGenerated ? 'Payload Generated' : 'Generate Handoff Payload'}
                  </button>
                </div>
              </div>

              {/* Ben Admin Handoff View */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Ben Admin Handoff</h2>
                  <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, background: '#F3EEFF', color: '#5A45C7', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 8px' }}>
                    WorkSight &middot; Enrollment
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div style={{ background: '#FAFBFC', borderRadius: 8, padding: 12, border: '1px solid #EEF1F4', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#98A1A8', textTransform: 'uppercase', marginBottom: 4 }}>Target System</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#5A45C7' }}>WorkSight</div>
                  </div>
                  <div style={{ background: '#FAFBFC', borderRadius: 8, padding: 12, border: '1px solid #EEF1F4', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#98A1A8', textTransform: 'uppercase', marginBottom: 4 }}>Sync Type</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Full Enrollment</div>
                  </div>
                  <div style={{ background: '#FAFBFC', borderRadius: 8, padding: 12, border: '1px solid #EEF1F4', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#98A1A8', textTransform: 'uppercase', marginBottom: 4 }}>WSE Count</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{clientData.currentWSE}</div>
                  </div>
                </div>

                {/* Downstream systems checklist */}
                <div style={sectionLabelStyle}>Downstream Systems</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { system: 'PrismHR Client Config', action: 'Write benefit elections', ready: handoffGenerated },
                    { system: 'WorkSight Enrollment Portal', action: 'Sync plan options + rates', ready: handoffGenerated },
                    { system: 'ClientSpace Case', action: 'Update case status', ready: true },
                    { system: 'Payroll Deduction Audit', action: 'Trigger audit job', ready: handoffGenerated },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 0',
                      borderTop: i > 0 ? '1px solid #EEF1F4' : 'none',
                    }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        flexShrink: 0,
                        background: item.ready ? '#E4F2EA' : '#EDF0F3',
                        color: item.ready ? '#1A7A4A' : '#98A1A8',
                      }}>
                        {item.ready ? '✓' : '·'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{item.system}</div>
                        <div style={{ fontSize: 10, color: '#98A1A8' }}>{item.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit to Ben Admin */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={handleSubmitBenAdmin}
                  disabled={!handoffGenerated}
                  style={{
                    ...btnPrimary,
                    background: handoffGenerated ? '#5A45C7' : '#DCE2E8',
                    cursor: handoffGenerated ? 'pointer' : 'default',
                  }}
                >
                  Submit to Ben Admin &rarr;
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
