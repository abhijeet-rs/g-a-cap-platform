'use client';

import { useState, useEffect, useCallback } from 'react';
import { CardSkeleton } from '@/components/shared/Skeleton';

type DocStatus = 'approved' | 'signed' | 'draft' | 'ready';

interface DocItem {
  name: string;
  status: DocStatus;
  type: string;
  docType: 'cap' | 'booklet' | 'confirmation' | 'sra-en' | 'sra-es' | 'payload';
  generatedDate: string;
  generatedTime: string;
  version: number;
  template: string;
}

const statusColors: Record<DocStatus, { bg: string; fg: string; label: string }> = {
  approved: { bg: '#E4F2EA', fg: '#1A7A4A', label: 'Approved' },
  signed: { bg: '#FBF0DD', fg: '#B0690A', label: 'Signed' },
  draft: { bg: '#EDF0F3', fg: '#5B6770', label: 'Draft' },
  ready: { bg: '#E7F1FA', fg: '#0074B8', label: 'Ready' },
};

const documents: DocItem[] = [
  { name: 'CAP Summary — Itafos Conda', status: 'approved', type: 'PDF', docType: 'cap', generatedDate: 'Jun 14, 2026', generatedTime: '3:30 PM', version: 4, template: 'F7 · CAP Summary v4' },
  { name: 'Benefits Booklet — Itafos Conda', status: 'signed', type: 'PDF', docType: 'booklet', generatedDate: 'Jun 14, 2026', generatedTime: '3:30 PM', version: 4, template: 'F7 · Benefits Booklet v4' },
  { name: 'ER Confirmation — Itafos Conda', status: 'approved', type: 'PDF', docType: 'confirmation', generatedDate: 'Jun 14, 2026', generatedTime: '3:30 PM', version: 4, template: 'F7 · ER Confirmation v4' },
  { name: 'EE SRA (English) — Itafos Conda', status: 'draft', type: 'PDF', docType: 'sra-en', generatedDate: 'Jun 12, 2026', generatedTime: '2:15 PM', version: 2, template: 'F7 · SRA English v2' },
  { name: 'EE SRA (Spanish) — Itafos Conda', status: 'draft', type: 'PDF', docType: 'sra-es', generatedDate: 'Jun 12, 2026', generatedTime: '2:15 PM', version: 2, template: 'F7 · SRA Spanish v2' },
  { name: 'Prism Handoff Payload — Itafos Conda', status: 'ready', type: 'JSON', docType: 'payload', generatedDate: 'Jun 14, 2026', generatedTime: '3:35 PM', version: 4, template: 'F7 · Prism Payload v4' },
];

const filterOptions: { value: DocStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Documents' },
  { value: 'approved', label: 'Approved' },
  { value: 'signed', label: 'Signed' },
  { value: 'draft', label: 'Draft' },
  { value: 'ready', label: 'Ready' },
];

const selectStyle: React.CSSProperties = {
  height: 30, padding: '0 28px 0 10px', border: '1px solid #E4E8ED',
  borderRadius: 7, fontSize: 11, fontWeight: 600, color: '#1B2D3D',
  background: '#fff', cursor: 'pointer', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2398A1A8'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
};

function getDocumentContent(docType: string): string {
  switch (docType) {
    case 'cap':
      return `Plan Summary
─────────────────────────
Medical Plans
  PPO $500 80% — BCBS Texas
  Billed Rate (EO): $931.52
  ER Contribution: 72% ($670.69)
  EE Contribution: $260.83

  HDHP $3300 90% — BCBS Texas
  Billed Rate (EO): $745.50
  ER Contribution: 81% ($603.86)

Dental
  Guardian PPO $1500 (Open Market)
  Rate (EO): $29.00 | ER: 80%

Vision
  Guardian Base PPO (Open Market)
  Rate (EO): $6.00 | ER: 80%

Contribution Strategy: Variable
Annual Deductions: 24 (semi-monthly)
ACA Affordability: ✓ Affordable`;

    case 'booklet':
      return `ITAFOS CONDA
Benefits Enrollment Guide — Plan Year 2026
═══════════════════════════════════════

Medical Benefits
Your employer offers two medical plan options:
  1. PPO $500 — 80% coverage, $500 deductible
  2. HDHP $3300 — 90% coverage, $3,300 deductible

Dental Benefits
  Guardian PPO $1500

Vision Benefits
  Guardian Base PPO

Contribution
  Your employer contributes 72% of medical premiums.`;

    case 'confirmation':
      return `BENEFITS SELECTION CONFIRMATION
Client: Itafos Conda | Effective: Jul 1, 2026
──────────────────────────────────────
Confirmed Plans:
  ✓ Medical PPO $500 80% — BCBS Texas
  ✓ Medical HDHP $3300 90% — BCBS Texas
  ✓ Dental PPO $1500 — Guardian
  ✓ Vision Base PPO — Guardian

Total Monthly ER Cost (EO): $1,437.01
Authorized by: Dana Whitfield, AM`;

    case 'sra-en':
      return `SUMMARY OF RATES & ALTERNATIVES
Client: Itafos Conda | Plan Year: 2026
──────────────────────────────────────
Medical Plan Comparison:

Current: PPO $500 80% — BCBS Texas
  EO Rate: $931.52 | Change: +4.2%

Alternative 1: HDHP $3300 90% — BCBS Texas
  EO Rate: $745.50 | Savings: -20.0%

Alternative 2: PPO $1000 70% — Aetna
  EO Rate: $812.30 | Savings: -12.8%

Dental: Guardian PPO $1500
  EO Rate: $29.00 | Change: +1.8%

Vision: Guardian Base PPO
  EO Rate: $6.00 | Change: 0.0%`;

    case 'sra-es':
      return `RESUMEN DE TARIFAS Y ALTERNATIVAS
Cliente: Itafos Conda | Ano del Plan: 2026
──────────────────────────────────────
Comparacion de Planes Medicos:

Actual: PPO $500 80% — BCBS Texas
  Tarifa EO: $931.52 | Cambio: +4.2%

Alternativa 1: HDHP $3300 90% — BCBS Texas
  Tarifa EO: $745.50 | Ahorro: -20.0%

Alternativa 2: PPO $1000 70% — Aetna
  Tarifa EO: $812.30 | Ahorro: -12.8%

Dental: Guardian PPO $1500
  Tarifa EO: $29.00 | Cambio: +1.8%

Vision: Guardian Base PPO
  Tarifa EO: $6.00 | Cambio: 0.0%`;

    case 'payload':
      return `{
  "client": "Itafos Conda",
  "prismId": "GA-2908",
  "planYear": 2026,
  "effectiveDate": "2026-07-01",
  "plans": {
    "medical": [
      { "name": "PPO $500 80%", "carrier": "BCBS Texas",
        "rate_eo": 931.52, "er_pct": 0.72 },
      { "name": "HDHP $3300 90%", "carrier": "BCBS Texas",
        "rate_eo": 745.50, "er_pct": 0.81 }
    ],
    "dental": [
      { "name": "PPO $1500", "carrier": "Guardian",
        "rate_eo": 29.00, "er_pct": 0.80 }
    ],
    "vision": [
      { "name": "Base PPO", "carrier": "Guardian",
        "rate_eo": 6.00, "er_pct": 0.80 }
    ]
  },
  "status": "ready",
  "generatedBy": "system"
}`;

    default:
      return `Document content preview not available.`;
  }
}

function getVersionHistory(doc: DocItem): { version: string; date: string; note: string }[] {
  if (doc.version >= 4) {
    return [
      { version: 'v4 (current)', date: 'Jun 14, 2026', note: 'Generated from approved CAP' },
      { version: 'v3', date: 'Jun 12, 2026', note: 'Updated after rate correction' },
      { version: 'v2', date: 'Jun 10, 2026', note: 'Initial generation' },
      { version: 'v1', date: 'Jun 8, 2026', note: 'Draft' },
    ];
  }
  return [
    { version: `v${doc.version} (current)`, date: doc.generatedDate, note: 'Current version' },
    ...(doc.version >= 2 ? [{ version: 'v1', date: 'Jun 8, 2026', note: 'Draft' }] : []),
  ];
}

function getAuditTrail(doc: DocItem): { date: string; event: string }[] {
  if (doc.version >= 4) {
    return [
      { date: 'Jun 14 3:30 PM', event: 'System generated document from F7 template v4' },
      { date: 'Jun 14 3:31 PM', event: 'System attached to DocuSign envelope ENV-2026-0847' },
      { date: 'Jun 14 3:32 PM', event: 'Dana Whitfield reviewed document' },
      { date: 'Jun 14 3:45 PM', event: 'Dana Whitfield approved document' },
      { date: 'Jun 12 2:15 PM', event: 'System re-generated after dental rate correction' },
      { date: 'Jun 10 11:00 AM', event: 'System generated initial version from CAP data' },
      { date: 'Jun 8 9:30 AM', event: 'System created draft from template' },
    ];
  }
  return [
    { date: `${doc.generatedDate} ${doc.generatedTime}`, event: 'System generated document from F7 template' },
    { date: 'Jun 8 9:30 AM', event: 'System created draft from template' },
  ];
}

const infoFields = [
  { label: 'CLIENT', value: 'Itafos Conda' },
  { label: 'PRISM ID', value: 'GA-2908' },
  { label: 'PLAN YEAR', value: '2026' },
  { label: 'CARRIER', value: 'BCBS Texas' },
];

export default function DocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DocStatus | 'all'>('all');
  const [drawerDoc, setDrawerDoc] = useState<DocItem | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const openDrawer = useCallback((doc: DocItem) => {
    setDrawerDoc(doc);
    requestAnimationFrame(() => setDrawerVisible(true));
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setTimeout(() => setDrawerDoc(null), 240);
  }, []);

  const filtered = filter === 'all' ? documents : documents.filter(d => d.status === filter);

  if (loading) {
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#1B2D3D',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    marginBottom: 10,
  };

  const sectionDividerStyle: React.CSSProperties = {
    height: 1,
    background: '#EEF1F4',
    margin: '16px 0',
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Generated Documents</h1>
          <p style={{ fontSize: 10, color: '#98A1A8', margin: '4px 0 0' }}>
            Auto-generated from approved CAP data &middot; F7
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: '#98A1A8', fontWeight: 600 }}>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as DocStatus | 'all')}
            style={selectStyle}
          >
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map((doc, i) => {
          const sm = statusColors[doc.status];
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16,
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'box-shadow 0.15s ease',
                boxShadow: isHovered ? '0 4px 16px rgba(16,32,45,.1)' : 'none',
              }}
            >
              {/* File icon */}
              <div style={{ width: 32, height: 40, borderRadius: 6, background: 'linear-gradient(to bottom, #13212C, #3B4A57)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>
                {doc.type}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                <div style={{ fontSize: 9, color: '#98A1A8', fontFamily: "'IBM Plex Mono', monospace" }}>
                  {doc.type} &middot; Itafos Conda
                </div>
              </div>

              {/* Status badge */}
              <span
                style={{ display: 'inline-flex', alignItems: 'center', height: 20, fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 8px', flexShrink: 0, backgroundColor: sm.bg, color: sm.fg }}
              >
                {sm.label}
              </span>

              {/* Action buttons */}
              <button
                onClick={() => openDrawer(doc)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F4F6F8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                style={{
                  height: 26, padding: '0 9px', border: '1px solid #E4E8ED',
                  borderRadius: 6, background: '#fff', color: '#1B2D3D',
                  fontSize: 10, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                  transition: 'background .12s',
                }}
              >
                Preview
              </button>
              <button
                onClick={() => showToast('Document downloaded')}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#A80A28'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#C60C30'; }}
                style={{
                  height: 26, padding: '0 9px', border: 'none',
                  borderRadius: 6, background: '#C60C30', color: '#fff',
                  fontSize: 10, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                  transition: 'background .12s',
                }}
              >
                Download
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '36px 16px', textAlign: 'center', fontSize: 12, color: '#64707A' }}>
          No documents match the selected filter.
        </div>
      )}

      {/* Document Detail Drawer */}
      {drawerDoc && (() => {
        const sm = statusColors[drawerDoc.status];
        const typeBadgeColors: Record<string, { bg: string; fg: string }> = {
          PDF: { bg: '#FDE8EC', fg: '#C60C30' },
          JSON: { bg: '#E7F1FA', fg: '#0074B8' },
        };
        const tb = typeBadgeColors[drawerDoc.type] || { bg: '#EDF0F3', fg: '#5B6770' };
        const versionHistory = getVersionHistory(drawerDoc);
        const auditTrail = getAuditTrail(drawerDoc);
        const docContent = getDocumentContent(drawerDoc.docType);
        const isApproved = drawerDoc.status === 'approved';

        const dynamicInfoFields = [
          ...infoFields,
          { label: 'TEMPLATE', value: drawerDoc.template },
          { label: 'STATUS', value: sm.label },
          { label: 'GENERATED', value: `${drawerDoc.generatedDate} ${drawerDoc.generatedTime}` },
        ];

        return (
          <>
            {/* Overlay */}
            <div
              onClick={closeDrawer}
              style={{
                position: 'fixed',
                inset: 0,
                background: drawerVisible ? 'rgba(16,32,45,.4)' : 'rgba(16,32,45,0)',
                zIndex: 180,
                transition: 'background .22s ease',
              }}
            />

            {/* Drawer Panel */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 520,
                maxWidth: '100vw',
                background: '#fff',
                boxShadow: '-8px 0 30px rgba(16,32,45,.08)',
                zIndex: 190,
                display: 'flex',
                flexDirection: 'column',
                transform: drawerVisible ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform .22s cubic-bezier(.4,0,.2,1)',
              }}
            >
              {/* Drawer Header */}
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #EEF1F4', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1B2D3D', lineHeight: 1.3, paddingRight: 16 }}>
                    {drawerDoc.name}
                  </div>
                  <button
                    onClick={closeDrawer}
                    onMouseEnter={() => setHoveredBtn('close-x')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      border: 'none',
                      background: hoveredBtn === 'close-x' ? '#F3F4F6' : 'none',
                      fontSize: 18,
                      cursor: 'pointer',
                      color: '#98A1A8',
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background .12s',
                    }}
                  >
                    &#x2715;
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', height: 20,
                    fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 8px',
                    backgroundColor: sm.bg, color: sm.fg,
                  }}>
                    {sm.label}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', height: 20,
                    fontSize: 9, fontWeight: 600, borderRadius: 4, padding: '0 8px',
                    backgroundColor: tb.bg, color: tb.fg,
                  }}>
                    {drawerDoc.type}
                  </span>
                  <span style={{ fontSize: 10, color: '#98A1A8', marginLeft: 4 }}>
                    Generated {drawerDoc.generatedDate} &middot; v{drawerDoc.version}
                  </span>
                </div>
              </div>

              {/* Drawer Body (scrollable) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* Document Info Section */}
                <div style={{ ...sectionHeadingStyle }}>Document Info</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0',
                  background: '#FAFBFC',
                  border: '1px solid #EEF1F4',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}>
                  {dynamicInfoFields.map((field, idx) => (
                    <div
                      key={field.label}
                      style={{
                        padding: '10px 14px',
                        borderBottom: idx < dynamicInfoFields.length - 2 ? '1px solid #EEF1F4' : 'none',
                        borderRight: idx % 2 === 0 ? '1px solid #EEF1F4' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                        {field.label}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#1B2D3D' }}>
                        {field.label === 'STATUS' ? (
                          <span style={{ color: sm.fg }}>{field.value}</span>
                        ) : field.value}
                      </div>
                    </div>
                  ))}
                  {/* Fill empty cell if odd number of fields */}
                  {dynamicInfoFields.length % 2 !== 0 && <div />}
                </div>

                <div style={sectionDividerStyle} />

                {/* Document Content Preview */}
                <div style={{ ...sectionHeadingStyle }}>Document Preview</div>
                <div style={{
                  background: '#FAFBFC',
                  border: '1px solid #EEF1F4',
                  borderRadius: 8,
                  padding: 16,
                  overflow: 'hidden',
                }}>
                  <pre style={{
                    margin: 0,
                    fontFamily: "'IBM Plex Mono', 'SF Mono', 'Consolas', monospace",
                    fontSize: 10.5,
                    lineHeight: 1.6,
                    color: '#1B2D3D',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {docContent}
                  </pre>
                </div>

                <div style={sectionDividerStyle} />

                {/* Version History */}
                <div style={{ ...sectionHeadingStyle }}>Version History</div>
                <div style={{
                  background: '#FAFBFC',
                  border: '1px solid #EEF1F4',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}>
                  {versionHistory.map((v, idx) => (
                    <div
                      key={v.version}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderBottom: idx < versionHistory.length - 1 ? '1px solid #EEF1F4' : 'none',
                      }}
                    >
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: idx === 0 ? '#1A7A4A' : '#98A1A8',
                        fontFamily: "'IBM Plex Mono', monospace",
                        minWidth: 72,
                        flexShrink: 0,
                      }}>
                        {v.version}
                      </span>
                      <span style={{ fontSize: 10, color: '#64707A', minWidth: 90, flexShrink: 0 }}>
                        {v.date}
                      </span>
                      <span style={{ fontSize: 10, color: '#1B2D3D' }}>
                        {v.note}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={sectionDividerStyle} />

                {/* Audit Trail */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ ...sectionHeadingStyle, marginBottom: 0 }}>Audit Trail</span>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: '#98A1A8',
                    background: '#EDF0F3',
                    borderRadius: 10,
                    padding: '2px 7px',
                  }}>
                    {auditTrail.length} events
                  </span>
                </div>
                <div style={{
                  background: '#FAFBFC',
                  border: '1px solid #EEF1F4',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}>
                  {auditTrail.map((entry, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '9px 14px',
                        borderBottom: idx < auditTrail.length - 1 ? '1px solid #EEF1F4' : 'none',
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Timeline dot */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, flexShrink: 0 }}>
                        <div style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: idx === 0 ? '#1A7A4A' : '#CBD1D8',
                        }} />
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: '#98A1A8',
                        fontFamily: "'IBM Plex Mono', monospace",
                        minWidth: 100,
                        flexShrink: 0,
                        paddingTop: 1,
                      }}>
                        {entry.date}
                      </div>
                      <div style={{ fontSize: 10, color: '#1B2D3D', lineHeight: 1.4, paddingTop: 1 }}>
                        {entry.event}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom spacing */}
                <div style={{ height: 20 }} />
              </div>

              {/* Drawer Footer */}
              <div style={{
                padding: '14px 24px',
                borderTop: '1px solid #EEF1F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
                flexShrink: 0,
                background: '#fff',
              }}>
                <button
                  onClick={closeDrawer}
                  onMouseEnter={() => setHoveredBtn('close-btn')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    height: 34,
                    padding: '0 16px',
                    border: '1px solid #E4E8ED',
                    borderRadius: 8,
                    background: hoveredBtn === 'close-btn' ? '#F8F9FA' : '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#1B2D3D',
                    transition: 'background .12s',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => { showToast('Document downloaded'); closeDrawer(); }}
                  onMouseEnter={() => setHoveredBtn('download-btn')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    height: 34,
                    padding: '0 16px',
                    border: 'none',
                    borderRadius: 8,
                    background: hoveredBtn === 'download-btn' ? '#A80A28' : '#C60C30',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(198,12,48,.2)',
                    transition: 'background .12s',
                  }}
                >
                  Download PDF
                </button>
                {isApproved && (
                  <button
                    onClick={() => { showToast('Sent to DocuSign'); closeDrawer(); }}
                    onMouseEnter={() => setHoveredBtn('docusign-btn')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      height: 34,
                      padding: '0 16px',
                      border: 'none',
                      borderRadius: 8,
                      background: hoveredBtn === 'docusign-btn' ? '#4A36A8' : '#5A45C7',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(90,69,199,.2)',
                      transition: 'background .12s',
                    }}
                  >
                    Send to DocuSign
                  </button>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#13212C', color: '#fff', padding: '10px 20px', borderRadius: 8,
          fontSize: 12, fontWeight: 600, zIndex: 200,
          boxShadow: '0 4px 20px rgba(16,32,45,.3)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
