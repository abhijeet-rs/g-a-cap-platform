'use client';

import { useEffect, useState } from 'react';
import {
  bookletMeta,
  bookletCoverage,
  bookletTaxPlans,
  bookletDisclosures,
  bookletSignatures,
  BookletCoverageSection,
  BookletSignatureBlock,
} from '@/data/booklet';

/* ------------------------------------------------------------------ */
/*  BookletPreview                                                     */
/*  A paginated, document-like replica of the real "Benefits          */
/*  Selection Confirmation" PDF. Rendered inside a full-screen modal.  */
/* ------------------------------------------------------------------ */

interface BookletPreviewProps {
  onClose?: () => void;
  /** When true, signature blocks render as if executed (script + date). */
  signed?: boolean;
  /** Optional CTA shown in the toolbar (e.g. "Send to Client via DocuSign"). */
  primaryAction?: { label: string; onClick: () => void };
}

const SHEET_WIDTH = 820;

/* DocuSign amber is the sign-off accent; Prism red + ClientSpace blue elsewhere. */
const AMBER = '#B0690A';
const RED = '#C60C30';
const INK = '#1B2D3D';
const SLATE = '#374151';

const fontStack = "'IBM Plex Sans', system-ui, sans-serif";
const monoStack = "'IBM Plex Mono', monospace";

/* ---- shared sheet primitives ---- */

function Sheet({ children, pageLabel }: { children: React.ReactNode; pageLabel: string }) {
  return (
    <div
      style={{
        width: SHEET_WIDTH,
        maxWidth: '100%',
        margin: '0 auto',
        background: '#fff',
        boxShadow: '0 8px 40px rgba(16,32,45,.28)',
        borderRadius: 2,
        padding: '44px 52px 36px',
        position: 'relative',
        color: INK,
        fontFamily: fontStack,
      }}
    >
      {children}
      {/* footer */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 12,
          borderTop: '1px solid #E4E8ED',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--type-caption)',
          color: '#98A1A8',
        }}
      >
        <span style={{ fontFamily: monoStack }}>G&amp;A Partners · {bookletMeta.prismId}</span>
        <span style={{ fontWeight: 600 }}>{pageLabel}</span>
      </div>
    </div>
  );
}

function Masthead() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottom: `3px solid ${RED}`,
        paddingBottom: 14,
        marginBottom: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 7,
            background: RED,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '-0.02em',
          }}
        >
          G&amp;A
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--type-body-lg)', color: INK, lineHeight: 1.1 }}>
            G&amp;A Partners
          </div>
          <div style={{ fontSize: 'var(--type-caption)', color: '#98A1A8', letterSpacing: '0.04em' }}>
            Benefits Administration
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 'var(--type-caption)', color: '#98A1A8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Plan Year {bookletMeta.planYear}
        </div>
        <div style={{ fontSize: 'var(--type-caption)', color: '#98A1A8', fontFamily: monoStack }}>
          {bookletMeta.generatedFrom}
        </div>
      </div>
    </div>
  );
}

/* ---- client info grid ---- */

const infoRows: { label: string; value: string }[] = [
  { label: 'Client', value: bookletMeta.client },
  { label: 'Client ID', value: bookletMeta.clientId },
  { label: 'Prism ID', value: bookletMeta.prismId },
  { label: 'Plan Year', value: bookletMeta.planYear },
  { label: 'Effective Period', value: bookletMeta.effectivePeriod },
  { label: 'Master Plan', value: bookletMeta.masterPlan },
  { label: 'Enrollment Method', value: bookletMeta.enrollmentMethod },
  { label: 'Billing Frequency', value: bookletMeta.billingFrequency },
  { label: 'ACA Reporting', value: bookletMeta.acaReporting },
  { label: 'Affordable', value: bookletMeta.affordable },
  { label: 'Contribution Strategy', value: bookletMeta.contributionStrategy },
  { label: 'Completed By', value: bookletMeta.completedBy },
];

function ClientInfoGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        border: '1px solid #E4E8ED',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 26,
      }}
    >
      {infoRows.map((row, i) => (
        <div
          key={row.label}
          style={{
            padding: '9px 14px',
            background: i % 2 === 0 ? '#FAFBFC' : '#fff',
            borderBottom: i < infoRows.length - 2 ? '1px solid #EEF1F4' : 'none',
            borderRight: i % 2 === 0 ? '1px solid #EEF1F4' : 'none',
          }}
        >
          <div
            style={{
              fontSize: 'var(--type-table-header)',
              fontWeight: 700,
              color: '#98A1A8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 2,
            }}
          >
            {row.label}
          </div>
          <div style={{ fontSize: 'var(--type-body)', fontWeight: 600, color: INK }}>{row.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ---- coverage / contribution tables ---- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 'var(--type-section-title)',
        fontWeight: 700,
        color: INK,
        margin: '0 0 10px',
        paddingBottom: 6,
        borderBottom: `2px solid ${RED}`,
      }}
    >
      {children}
    </div>
  );
}

const cellBase: React.CSSProperties = {
  padding: '7px 12px',
  fontSize: 'var(--type-body)',
  textAlign: 'right',
};

function CoverageSection({ section }: { section: BookletCoverageSection }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <SectionTitle>{section.title}</SectionTitle>
      {section.plans.map((plan) => (
        <div key={plan.name} style={{ marginBottom: 14 }}>
          {/* plan sub-header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              background: plan.selected ? '#FBF0DD' : '#F5F7FA',
              border: `1px solid ${plan.selected ? '#F0DCB6' : '#E4E8ED'}`,
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
            }}
          >
            <span style={{ fontSize: 'var(--type-body-lg)', fontWeight: 700, color: INK }}>{plan.name}</span>
            <span style={{ fontSize: 'var(--type-body-sm)', color: SLATE }}>
              {plan.carrier}
              {plan.network ? ` · ${plan.network}` : ''}
            </span>
            {plan.selected && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 'var(--type-badge)',
                  fontWeight: 700,
                  color: AMBER,
                  background: '#fff',
                  border: `1px solid ${AMBER}`,
                  borderRadius: 9999,
                  padding: '1px 9px',
                }}
              >
                SELECTED
              </span>
            )}
          </div>
          {/* contribution table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: INK }}>
                <th
                  style={{
                    ...cellBase,
                    textAlign: 'left',
                    color: '#fff',
                    fontSize: 'var(--type-table-header)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Tier
                </th>
                {['Total Billed', 'Employer Portion', 'Employee Portion'].map((h) => (
                  <th
                    key={h}
                    style={{
                      ...cellBase,
                      color: '#fff',
                      fontSize: 'var(--type-table-header)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan.rates.map((r, idx) => (
                <tr
                  key={r.tier}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#FAFBFC',
                    borderBottom: '1px solid #EEF1F4',
                  }}
                >
                  <td style={{ ...cellBase, textAlign: 'left', fontWeight: 600, color: INK }}>{r.tier}</td>
                  <td style={{ ...cellBase, fontFamily: monoStack, color: INK }}>{r.total}</td>
                  <td style={{ ...cellBase, fontFamily: monoStack, color: '#1A7A4A', fontWeight: 600 }}>{r.er}</td>
                  <td style={{ ...cellBase, fontFamily: monoStack, color: SLATE }}>{r.ee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function TaxPlansBlock() {
  return (
    <div style={{ marginBottom: 8 }}>
      <SectionTitle>Tax-Favored Plans</SectionTitle>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {bookletTaxPlans.map((p) => {
          const offered = p.value !== 'Not Offered';
          return (
            <div
              key={p.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '8px 12px',
                background: offered ? '#F8F6FE' : '#FAFBFC',
                border: `1px solid ${offered ? '#EAE4FA' : '#EEF1F4'}`,
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 'var(--type-body)', fontWeight: 600, color: INK }}>{p.label}</span>
              <span
                style={{
                  fontSize: 'var(--type-body-sm)',
                  color: offered ? '#5A45C7' : '#98A1A8',
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                {p.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- page 2: disclosures + signatures ---- */

function Disclosure({ heading, body }: { heading: string; body: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 'var(--type-body-lg)',
          fontWeight: 700,
          color: INK,
          marginBottom: 5,
        }}
      >
        {heading}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--type-body)',
          lineHeight: 1.6,
          color: SLATE,
          textAlign: 'justify',
        }}
      >
        {body}
      </p>
    </div>
  );
}

function SignatureTable({ signed }: { signed: boolean }) {
  const colHead: React.CSSProperties = {
    padding: '7px 12px',
    fontSize: 'var(--type-table-header)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#fff',
    textAlign: 'left',
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
      <thead>
        <tr style={{ background: AMBER }}>
          <th style={colHead}>Name (Printed)</th>
          <th style={colHead}>Signature</th>
          <th style={{ ...colHead, width: 120 }}>Date</th>
        </tr>
      </thead>
      <tbody>
        {bookletSignatures.map((sig: BookletSignatureBlock, i) => {
          const isSigned = signed || !!sig.signedDate;
          const date = sig.signedDate ?? (signed ? executedDate(i) : '');
          return (
            <tr key={sig.role} style={{ borderBottom: '1px solid #E4E8ED' }}>
              <td style={{ padding: '12px', verticalAlign: 'bottom' }}>
                <div style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: INK }}>{sig.name}</div>
                <div style={{ fontSize: 'var(--type-caption)', color: '#98A1A8' }}>
                  {sig.role} · {sig.org}
                </div>
              </td>
              <td style={{ padding: '12px', verticalAlign: 'bottom' }}>
                {isSigned ? (
                  <span
                    style={{
                      fontFamily: "'Segoe Script', 'Brush Script MT', cursive",
                      fontStyle: 'italic',
                      fontSize: 22,
                      color: '#13386B',
                      lineHeight: 1,
                    }}
                  >
                    {sig.name.split(',')[0]}
                  </span>
                ) : (
                  <div
                    style={{
                      borderBottom: '1px solid #98A1A8',
                      height: 22,
                      minWidth: 140,
                    }}
                  />
                )}
              </td>
              <td style={{ padding: '12px', verticalAlign: 'bottom' }}>
                {isSigned ? (
                  <span style={{ fontSize: 'var(--type-body)', fontFamily: monoStack, color: INK }}>{date}</span>
                ) : (
                  <div style={{ borderBottom: '1px solid #98A1A8', height: 22, minWidth: 90 }} />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function executedDate(i: number): string {
  return ['06/14/2026', '06/16/2026', '06/17/2026'][i] ?? '06/17/2026';
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function BookletPreview({ onClose, signed = false, primaryAction }: BookletPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        background: mounted ? 'rgba(11,20,28,.62)' : 'rgba(11,20,28,0)',
        transition: 'background .2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          flexShrink: 0,
          height: 56,
          background: '#13212C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 'var(--type-badge)',
              fontWeight: 700,
              color: '#fff',
              background: AMBER,
              borderRadius: 4,
              padding: '3px 9px',
              letterSpacing: '0.03em',
            }}
          >
            BENEFITS SELECTION CONFIRMATION
          </span>
          <span style={{ fontSize: 'var(--type-body-sm)', color: '#9AA7B2', fontFamily: monoStack }}>
            {bookletMeta.client} · {bookletMeta.prismId} · PDF · 2 pages
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#8E5408')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = AMBER)}
              style={{
                height: 34,
                padding: '0 16px',
                background: AMBER,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 'var(--type-body-sm)',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(176,105,10,.4)',
                transition: 'background .12s',
              }}
            >
              {primaryAction.label}
            </button>
          )}
          <button
            onClick={onClose}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.12)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,.2)',
              background: 'transparent',
              color: '#fff',
              fontSize: 'var(--type-body-sm)',
              cursor: 'pointer',
              transition: 'background .12s',
            }}
          >
            &#x2715;
          </button>
        </div>
      </div>

      {/* Scrollable document area */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 24px 60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity .25s ease, transform .25s ease',
          }}
        >
          {/* PAGE 1 */}
          <Sheet pageLabel="Page 1 of 2">
            <Masthead />
            <h1
              style={{
                fontSize: 'var(--type-display)',
                fontWeight: 700,
                color: INK,
                margin: '0 0 4px',
                letterSpacing: '-0.01em',
              }}
            >
              Benefits Selection Confirmation
            </h1>
            <p style={{ fontSize: 'var(--type-body-lg)', color: SLATE, margin: '0 0 22px' }}>
              Confirmed plan elections and monthly contribution strategy for the upcoming plan year.
            </p>

            <ClientInfoGrid />

            {bookletCoverage.map((section) => (
              <CoverageSection key={section.key} section={section} />
            ))}

            <TaxPlansBlock />
          </Sheet>

          {/* PAGE 2 */}
          <Sheet pageLabel="Page 2 of 2">
            <Masthead />
            <h1
              style={{
                fontSize: 'var(--type-section-title)',
                fontWeight: 700,
                color: INK,
                margin: '0 0 16px',
                letterSpacing: '-0.01em',
              }}
            >
              Disclosures and Confirmation
            </h1>

            <Disclosure heading="Broker &amp; Plan Administrative Services" body={bookletDisclosures.intro} />
            <Disclosure heading="Renewal Credit" body={bookletDisclosures.renewalCredit} />
            <Disclosure heading="Broker Compensation Disclosure" body={bookletDisclosures.brokerCompensation} />

            <div
              style={{
                marginTop: 24,
                padding: '14px 16px',
                background: signed ? '#F0FFF5' : '#FBF0DD',
                border: `1px solid ${signed ? '#C6F0D4' : '#F0DCB6'}`,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 'var(--type-card-title)',
                  fontWeight: 700,
                  color: signed ? '#1A7A4A' : AMBER,
                  marginBottom: 2,
                }}
              >
                {signed ? 'Executed — All Signatures Collected' : 'Authorization & Signatures'}
              </div>
              <div style={{ fontSize: 'var(--type-body)', color: SLATE }}>
                {signed
                  ? 'This Benefits Selection Confirmation has been fully executed via DocuSign.'
                  : 'By signing below, the parties confirm the plan elections and contribution strategy set out above.'}
              </div>
            </div>

            <SignatureTable signed={signed} />
          </Sheet>
        </div>
      </div>
    </div>
  );
}
