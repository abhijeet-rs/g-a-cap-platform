'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEsignStore } from '@/stores/esignStore';
import { useSyncStore } from '@/stores/syncStore';
import { useUIStore } from '@/stores/uiStore';
import { syncSequences } from '@/data/syncSequences';
import { CardSkeleton } from '@/components/shared/Skeleton';
import { EsignState } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const envelopeContents = [
  { name: 'CAP Summary.pdf', color: '#C60C30' },
  { name: 'Benefits Booklet.pdf', color: '#0074B8' },
  { name: 'ER Confirmation.pdf', color: '#1A7A4A' },
];

interface QueueItem {
  id: string;
  client: string;
  prism: string;
  status: EsignState;
  type: string;
  daysOpen: number;
}

const signatureQueue: QueueItem[] = [
  { id: 'itafos', client: 'Itafos Conda', prism: 'GA-2908', status: 'ready', type: 'New Business', daysOpen: 0 },
  { id: 'brightline', client: 'Brightline Staffing', prism: 'GA-10337', status: 'sent', type: 'Renewal', daysOpen: 3 },
  { id: 'northgate', client: 'Northgate Mfg', prism: 'GA-10074', status: 'partial', type: 'Renewal', daysOpen: 7 },
  { id: 'harbor', client: 'Harbor Point Senior Living', prism: 'GA-10298', status: 'complete', type: 'New Business', daysOpen: 12 },
  { id: 'apex', client: 'Apex Auto Group', prism: 'GA-10157', status: 'sent', type: 'Renewal', daysOpen: 5 },
];

const statusBadgeMap: Record<EsignState, { label: string; bg: string; fg: string }> = {
  ready:    { label: 'Ready to Send',     bg: '#EDF0F3', fg: '#64707A' },
  sent:     { label: 'Awaiting Signature', bg: '#FBF0DD', fg: '#B0690A' },
  partial:  { label: 'Partially Signed',   bg: '#E7F1FA', fg: '#0074B8' },
  complete: { label: 'All Signed',         bg: '#E4F2EA', fg: '#1A7A4A' },
};

/* Static signer snapshots for non-Itafos queue items */
const staticSigners: Record<string, { role: string; name: string; org: string; status: 'signed' | 'pending' | 'waiting'; date?: string }[]> = {
  brightline: [
    { role: 'Account Manager', name: 'Jessica Park', org: 'G&A Partners', status: 'signed', date: 'Jun 18' },
    { role: 'Client Signer', name: 'Tom Nguyen, VP Ops', org: 'Brightline Staffing', status: 'pending' },
    { role: 'Account Executive', name: 'Sarah Mitchell', org: 'G&A Partners', status: 'waiting' },
  ],
  northgate: [
    { role: 'Account Manager', name: 'Chris Lambert', org: 'G&A Partners', status: 'signed', date: 'Jun 14' },
    { role: 'Client Signer', name: 'Karen Ortiz, CFO', org: 'Northgate Mfg', status: 'signed', date: 'Jun 17' },
    { role: 'Account Executive', name: 'David Chen', org: 'G&A Partners', status: 'pending' },
  ],
  harbor: [
    { role: 'Account Manager', name: 'Amy Rodriguez', org: 'G&A Partners', status: 'signed', date: 'Jun 9' },
    { role: 'Client Signer', name: 'Linda Bates, CEO', org: 'Harbor Point Senior Living', status: 'signed', date: 'Jun 11' },
    { role: 'Account Executive', name: 'Kevin Trask', org: 'G&A Partners', status: 'signed', date: 'Jun 12' },
  ],
  apex: [
    { role: 'Account Manager', name: 'Brian Wells', org: 'G&A Partners', status: 'signed', date: 'Jun 16' },
    { role: 'Client Signer', name: 'Mark Sullivan, Owner', org: 'Apex Auto Group', status: 'pending' },
    { role: 'Account Executive', name: 'Lisa Monroe', org: 'G&A Partners', status: 'waiting' },
  ],
};

/* Static timeline events for non-Itafos items */
const staticTimelines: Record<string, { completed: boolean; text: string }[]> = {
  brightline: [
    { completed: true, text: 'Envelope created — Jun 18, 9:45 AM' },
    { completed: true, text: 'Sent to Jessica Park (AM) — Jun 18, 9:46 AM' },
    { completed: true, text: 'Jessica Park signed — Jun 18, 10:12 AM' },
    { completed: true, text: 'Sent to Tom Nguyen (Client) — Jun 18, 10:13 AM' },
    { completed: false, text: 'Awaiting client signature...' },
  ],
  northgate: [
    { completed: true, text: 'Envelope created — Jun 14, 11:00 AM' },
    { completed: true, text: 'Sent to Chris Lambert (AM) — Jun 14, 11:01 AM' },
    { completed: true, text: 'Chris Lambert signed — Jun 14, 11:30 AM' },
    { completed: true, text: 'Sent to Karen Ortiz (Client) — Jun 14, 11:31 AM' },
    { completed: true, text: 'Karen Ortiz signed — Jun 17, 2:45 PM' },
    { completed: true, text: 'Sent to David Chen (AE) — Jun 17, 2:46 PM' },
    { completed: false, text: 'Awaiting AE countersign...' },
  ],
  harbor: [
    { completed: true, text: 'Envelope created — Jun 9, 8:15 AM' },
    { completed: true, text: 'Sent to Amy Rodriguez (AM) — Jun 9, 8:16 AM' },
    { completed: true, text: 'Amy Rodriguez signed — Jun 9, 9:00 AM' },
    { completed: true, text: 'Sent to Linda Bates (Client) — Jun 9, 9:01 AM' },
    { completed: true, text: 'Linda Bates signed — Jun 11, 3:30 PM' },
    { completed: true, text: 'Sent to Kevin Trask (AE) — Jun 11, 3:31 PM' },
    { completed: true, text: 'Kevin Trask signed — Jun 12, 10:05 AM' },
    { completed: true, text: 'Envelope completed — Jun 12, 10:05 AM' },
  ],
  apex: [
    { completed: true, text: 'Envelope created — Jun 16, 1:00 PM' },
    { completed: true, text: 'Sent to Brian Wells (AM) — Jun 16, 1:01 PM' },
    { completed: true, text: 'Brian Wells signed — Jun 16, 1:40 PM' },
    { completed: true, text: 'Sent to Mark Sullivan (Client) — Jun 16, 1:41 PM' },
    { completed: false, text: 'Awaiting client signature...' },
  ],
};

/* Static audit trails for non-Itafos items */
const staticAuditTrails: Record<string, { time: string; text: string }[]> = {
  brightline: [
    { time: 'Jun 18 9:45 AM', text: 'System created DocuSign envelope ENV-2026-0903' },
    { time: 'Jun 18 9:46 AM', text: 'System sent envelope to 3 signers' },
    { time: 'Jun 18 10:12 AM', text: 'Jessica Park (AM) signed envelope' },
    { time: '', text: 'Waiting for client signature...' },
  ],
  northgate: [
    { time: 'Jun 14 11:00 AM', text: 'System created DocuSign envelope ENV-2026-0851' },
    { time: 'Jun 14 11:01 AM', text: 'System sent envelope to 3 signers' },
    { time: 'Jun 14 11:30 AM', text: 'Chris Lambert (AM) signed envelope' },
    { time: 'Jun 17 2:45 PM', text: 'Karen Ortiz (Client) signed envelope' },
    { time: '', text: 'Waiting for AE countersign...' },
  ],
  harbor: [
    { time: 'Jun 9 8:15 AM', text: 'System created DocuSign envelope ENV-2026-0799' },
    { time: 'Jun 9 8:16 AM', text: 'System sent envelope to 3 signers' },
    { time: 'Jun 9 9:00 AM', text: 'Amy Rodriguez (AM) signed envelope' },
    { time: 'Jun 11 3:30 PM', text: 'Linda Bates (Client) signed envelope' },
    { time: 'Jun 12 10:05 AM', text: 'Kevin Trask (AE) signed envelope' },
    { time: 'Jun 12 10:05 AM', text: 'Envelope completed — all signatures collected' },
  ],
  apex: [
    { time: 'Jun 16 1:00 PM', text: 'System created DocuSign envelope ENV-2026-0882' },
    { time: 'Jun 16 1:01 PM', text: 'System sent envelope to 3 signers' },
    { time: 'Jun 16 1:40 PM', text: 'Brian Wells (AM) signed envelope' },
    { time: '', text: 'Waiting for client signature...' },
  ],
};

/* ------------------------------------------------------------------ */
/*  Dynamic timeline builder for Itafos based on esign state          */
/* ------------------------------------------------------------------ */

function getItafosTimeline(esignState: EsignState): { completed: boolean; text: string }[] {
  const base: { completed: boolean; text: string }[] = [
    { completed: true, text: 'Envelope created — Jun 14, 2:30 PM' },
    { completed: true, text: 'Sent to Dana Whitfield (AM) — Jun 14, 2:31 PM' },
  ];

  if (esignState === 'ready') {
    return [
      { completed: true, text: 'CAP approved — Jun 14, 2:28 PM' },
      { completed: false, text: 'Ready to send envelope...' },
    ];
  }

  if (esignState === 'sent') {
    return [
      ...base,
      { completed: true, text: 'Dana Whitfield signed — Jun 14, 3:15 PM' },
      { completed: true, text: 'Sent to Robert Hale (Client) — Jun 14, 3:16 PM' },
      { completed: false, text: 'Awaiting client signature...' },
    ];
  }

  if (esignState === 'partial') {
    return [
      ...base,
      { completed: true, text: 'Dana Whitfield signed — Jun 14, 3:15 PM' },
      { completed: true, text: 'Sent to Robert Hale (Client) — Jun 14, 3:16 PM' },
      { completed: true, text: 'Robert Hale signed — Jun 16, 10:44 AM' },
      { completed: true, text: 'Sent to Marcus Reyes (AE) — Jun 16, 10:45 AM' },
      { completed: false, text: 'Awaiting AE countersign...' },
    ];
  }

  // complete
  return [
    ...base,
    { completed: true, text: 'Dana Whitfield signed — Jun 14, 3:15 PM' },
    { completed: true, text: 'Sent to Robert Hale (Client) — Jun 14, 3:16 PM' },
    { completed: true, text: 'Robert Hale signed — Jun 16, 10:44 AM' },
    { completed: true, text: 'Sent to Marcus Reyes (AE) — Jun 16, 10:45 AM' },
    { completed: true, text: 'Marcus Reyes signed — Jun 17, 9:10 AM' },
    { completed: true, text: 'Envelope completed — Jun 17, 9:10 AM' },
  ];
}

function getItafosAuditTrail(esignState: EsignState): { time: string; text: string }[] {
  const base: { time: string; text: string }[] = [];

  if (esignState === 'ready') {
    return [
      { time: 'Jun 14 2:28 PM', text: 'CAP approved by coordinator' },
      { time: '', text: 'Waiting to create envelope...' },
    ];
  }

  base.push(
    { time: 'Jun 14 2:30 PM', text: 'System created DocuSign envelope ENV-2026-0847' },
    { time: 'Jun 14 2:31 PM', text: 'System sent envelope to 3 signers' },
    { time: 'Jun 14 3:15 PM', text: 'Dana Whitfield (AM) signed envelope' },
  );

  if (esignState === 'sent') {
    base.push(
      { time: 'Jun 16 10:22 AM', text: 'Robert Hale (Client) viewed envelope' },
      { time: '', text: 'Waiting for client signature...' },
    );
    return base;
  }

  base.push(
    { time: 'Jun 16 10:44 AM', text: 'Robert Hale (Client) signed envelope' },
  );

  if (esignState === 'partial') {
    base.push({ time: '', text: 'Waiting for AE countersign...' });
    return base;
  }

  // complete
  base.push(
    { time: 'Jun 17 9:10 AM', text: 'Marcus Reyes (AE) signed envelope' },
    { time: 'Jun 17 9:10 AM', text: 'Envelope completed — all signatures collected' },
  );
  return base;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function EsignPage() {
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('itafos');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const router = useRouter();
  const esignState = useEsignStore((s) => s.state);
  const signers = useEsignStore((s) => s.signers);
  const send = useEsignStore((s) => s.send);
  const simulateClientSign = useEsignStore((s) => s.simulateClientSign);
  const publish = useEsignStore((s) => s.publish);
  const show = useSyncStore((s) => s.show);
  const showToast = useUIStore((s) => s.showToast);

  const handleSendEnvelope = () => {
    const seq = syncSequences.sendEnvelope;
    show(seq.title, seq.steps, () => {
      send();
    });
  };

  const handlePublish = () => {
    const seq = syncSequences.publishDownstream;
    show(seq.title, seq.steps, () => {
      showToast('Published to downstream systems');
      router.push('/dashboard');
    });
  };

  const signerCircleStyle = (status: string): React.CSSProperties => {
    if (status === 'signed') return { background: '#E4F2EA', color: '#1A7A4A' };
    if (status === 'pending') return { background: '#FBF0DD', color: '#B0690A' };
    return { background: '#EDF0F3', color: '#98A1A8' };
  };

  /* Resolve which queue item is selected */
  const selectedItem = signatureQueue.find((q) => q.id === selectedId)!;
  const isItafos = selectedId === 'itafos';

  /* Determine the effective status for the selected item.
     For Itafos, the state machine drives it. For others, use static data. */
  const effectiveStatus: EsignState = isItafos ? esignState : selectedItem.status;

  /* Derive the queue with Itafos reflecting dynamic state */
  const resolvedQueue = signatureQueue.map((q) =>
    q.id === 'itafos' ? { ...q, status: esignState } : q,
  );

  /* Resolve signers for display */
  const displaySigners = isItafos ? signers : (staticSigners[selectedId] ?? []);

  /* Timeline */
  const timeline = isItafos
    ? getItafosTimeline(esignState)
    : (staticTimelines[selectedId] ?? []);

  /* Audit trail */
  const auditTrail = isItafos
    ? getItafosAuditTrail(esignState)
    : (staticAuditTrails[selectedId] ?? []);

  /* Header summary stats */
  const awaitingCount = resolvedQueue.filter((q) => q.status === 'sent').length;

  if (loading) return <CardSkeleton rows={4} />;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#C60C30' }}>
              E-Signature Routing &middot; NB8/R8
            </div>
            <div style={{ fontSize: 12, color: '#64707A', marginTop: 2 }}>
              {resolvedQueue.length} envelopes &middot; {awaitingCount} awaiting signature
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, background: '#E7F1FA', color: '#0074B8', fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 10px' }}>
            DocuSign &middot; F2
          </span>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ════════ LEFT: Signature Queue ════════ */}
        <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #E4E8ED' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Signature Queue</h2>
          </div>

          {resolvedQueue.map((item) => {
            const isSelected = item.id === selectedId;
            const badge = statusBadgeMap[item.status];
            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.client}
                    </div>
                    <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 2 }}>
                      {item.prism} &middot; {item.type}
                    </div>
                  </div>
                  <span style={{
                    flexShrink: 0,
                    fontSize: 9,
                    fontWeight: 600,
                    borderRadius: 4,
                    padding: '2px 7px',
                    background: badge.bg,
                    color: badge.fg,
                    whiteSpace: 'nowrap',
                  }}>
                    {badge.label}
                  </span>
                </div>
                {item.daysOpen > 0 && (
                  <div style={{ fontSize: 9, color: '#98A1A8', marginTop: 4 }}>
                    Open {item.daysOpen} day{item.daysOpen !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ════════ RIGHT: Selected Client Detail ════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Detail header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{selectedItem.client}</h1>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              borderRadius: 4,
              padding: '2px 8px',
              background: statusBadgeMap[effectiveStatus].bg,
              color: statusBadgeMap[effectiveStatus].fg,
            }}>
              {statusBadgeMap[effectiveStatus].label}
            </span>
          </div>

          {/* Two-column: Signing Order + Envelope Contents */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>

            {/* ── Signing Order card ── */}
            <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Signing Order</h2>

              {displaySigners.map((signer, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid #E4E8ED' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      flexShrink: 0,
                      ...signerCircleStyle(signer.status),
                    }}
                  >
                    {signer.status === 'signed' ? '✓' : signer.status === 'pending' ? '…' : '·'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{signer.role}</div>
                    <div style={{ fontSize: 10, color: '#98A1A8' }}>
                      {signer.name} &middot; {signer.org}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {signer.status === 'signed' && (
                      <span style={{ fontSize: 10, color: '#1A7A4A', fontWeight: 500 }}>Signed {signer.date}</span>
                    )}
                    {signer.status === 'pending' && (
                      <span style={{ fontSize: 10, color: '#B0690A', fontWeight: 500 }}>Pending</span>
                    )}
                    {signer.status === 'waiting' && (
                      <span style={{ fontSize: 10, color: '#98A1A8' }}>Waiting</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Envelope Contents card ── */}
            <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Envelope Contents</h2>

              {envelopeContents.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid #E4E8ED' }}>
                  <div
                    style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0, background: doc.color }}
                  >
                    PDF
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{doc.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── DocuSign Timeline card ── */}
          <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>DocuSign Timeline</h2>

            <div style={{ position: 'relative', paddingLeft: 20 }}>
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute',
                left: 5,
                top: 6,
                bottom: 6,
                width: 2,
                background: '#E4E8ED',
                borderRadius: 1,
              }} />

              {timeline.map((event, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < timeline.length - 1 ? 14 : 0, position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: -18,
                    top: 2,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: event.completed ? '#1A7A4A' : '#E4E8ED',
                    border: event.completed ? '2px solid #E4F2EA' : '2px solid #D0D5DB',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 11,
                    color: event.completed ? '#2D3339' : '#98A1A8',
                    fontStyle: event.completed ? 'normal' : 'italic',
                  }}>
                    {event.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Action Panel ── */}
          {isItafos && (
            <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Actions</h2>

              {esignState === 'ready' && (
                <>
                  <p style={{ fontSize: 11, color: '#64707A', marginBottom: 12 }}>
                    CAP approved. Send DocuSign envelope to begin the signing workflow.
                  </p>
                  <button
                    onClick={handleSendEnvelope}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#A80A28'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#C60C30'; }}
                    style={{ height: 34, padding: '0 16px', background: '#C60C30', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', transition: 'background .12s' }}
                  >
                    Send Envelope &rarr;
                  </button>
                </>
              )}

              {esignState === 'sent' && (
                <>
                  <p style={{ fontSize: 11, color: '#64707A', marginBottom: 12 }}>
                    Envelope sent. Waiting on client signer (Robert Hale).
                  </p>
                  <button
                    onClick={simulateClientSign}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#8E5408'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#B0690A'; }}
                    style={{ height: 34, padding: '0 16px', background: '#B0690A', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer', transition: 'background .12s' }}
                  >
                    Simulate Client Signature
                  </button>
                </>
              )}

              {esignState === 'partial' && (
                <>
                  <p style={{ fontSize: 11, color: '#64707A', marginBottom: 12 }}>
                    Client signed. Waiting on AE countersign (Marcus Reyes).
                  </p>
                  <button
                    onClick={publish}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#005F94'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0074B8'; }}
                    style={{ height: 34, padding: '0 16px', background: '#0074B8', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer', transition: 'background .12s' }}
                  >
                    Complete Signatures
                  </button>
                </>
              )}

              {esignState === 'complete' && (
                <>
                  <p style={{ fontSize: 11, color: '#1A7A4A', fontWeight: 500, marginBottom: 12 }}>
                    &#x2713; All parties signed. Ready to publish downstream.
                  </p>
                  <button
                    onClick={handlePublish}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4A36A8'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#5A45C7'; }}
                    style={{ height: 34, padding: '0 16px', background: '#5A45C7', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer', transition: 'background .12s' }}
                  >
                    Publish to Downstream &middot; NB9 &rarr;
                  </button>
                </>
              )}
            </div>
          )}

          {/* Static action panel for non-Itafos items */}
          {!isItafos && (
            <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Actions</h2>
              {effectiveStatus === 'ready' && (
                <p style={{ fontSize: 11, color: '#64707A', margin: 0 }}>
                  CAP approved. Envelope ready to send.
                </p>
              )}
              {effectiveStatus === 'sent' && (
                <p style={{ fontSize: 11, color: '#B0690A', margin: 0 }}>
                  Envelope sent. Awaiting client signature.
                </p>
              )}
              {effectiveStatus === 'partial' && (
                <p style={{ fontSize: 11, color: '#0074B8', margin: 0 }}>
                  Partially signed. Awaiting remaining signatures.
                </p>
              )}
              {effectiveStatus === 'complete' && (
                <>
                  <p style={{ fontSize: 11, color: '#1A7A4A', fontWeight: 500, marginBottom: 12 }}>
                    &#x2713; All parties signed. Ready to publish downstream.
                  </p>
                  <button
                    onClick={handlePublish}
                    style={{ height: 34, padding: '0 16px', background: '#5A45C7', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}
                  >
                    Publish to Downstream &middot; NB9 &rarr;
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Audit Trail card ── */}
          <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              Audit Trail &middot; {auditTrail.length} event{auditTrail.length !== 1 ? 's' : ''}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {auditTrail.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 0',
                    borderTop: i > 0 ? '1px solid #F0F2F5' : 'none',
                  }}
                >
                  {entry.time ? (
                    <>
                      <span style={{
                        fontSize: 10,
                        color: '#98A1A8',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        minWidth: 110,
                        flexShrink: 0,
                      }}>
                        [{entry.time}]
                      </span>
                      <span style={{ fontSize: 11, color: '#2D3339' }}>{entry.text}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: '#98A1A8', fontStyle: 'italic', paddingLeft: 0 }}>
                      {entry.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
