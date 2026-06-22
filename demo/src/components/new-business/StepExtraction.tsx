'use client';

import { extractionRows } from '@/data/extraction';

function confidenceColor(c: number): string {
  if (c >= 95) return '#1A7A4A';
  if (c >= 90) return '#B0690A';
  return '#C60C30';
}

function sourceBadge(source: string): { bg: string; color: string } {
  switch (source) {
    case 'Upload':
      return { bg: '#E7F1FA', color: '#0074B8' };
    case 'Invoice':
      return { bg: '#FBF0DD', color: '#B0690A' };
    case 'SBC':
      return { bg: '#E4F2EA', color: '#1A7A4A' };
    case 'Census':
      return { bg: '#F0EDFA', color: '#5A45C7' };
    case 'Needs input':
      return { bg: '#FDECEF', color: '#C60C30' };
    default:
      return { bg: '#F1F3F5', color: '#64707A' };
  }
}

const headerCellStyle: React.CSSProperties = {
  fontSize: 9,
  textTransform: 'uppercase',
  fontWeight: 600,
  color: '#64707A',
  letterSpacing: '0.04em',
};

export default function StepExtraction() {
  const extracted = extractionRows.filter((r) => r.confidence > 0).length;
  const lowConf = extractionRows.filter((r) => r.confidence > 0 && r.confidence < 92).length;
  const missing = extractionRows.filter((r) => r.confidence === 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div style={{ borderRadius: 10, padding: 12, textAlign: 'center', background: '#E4F2EA' }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#1A7A4A' }}>{extracted}</div>
          <div
            style={{
              fontSize: 9,
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#1A7A4A',
              letterSpacing: '0.04em',
            }}
          >
            Extracted
          </div>
        </div>
        <div style={{ borderRadius: 10, padding: 12, textAlign: 'center', background: '#FBF0DD' }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#B0690A' }}>{lowConf}</div>
          <div
            style={{
              fontSize: 9,
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#B0690A',
              letterSpacing: '0.04em',
            }}
          >
            Low Confidence
          </div>
        </div>
        <div style={{ borderRadius: 10, padding: 12, textAlign: 'center', background: '#FDECEF' }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#C60C30' }}>{missing}</div>
          <div
            style={{
              fontSize: 9,
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#C60C30',
              letterSpacing: '0.04em',
            }}
          >
            Missing
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #E4E8ED',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.5fr 80px 90px',
            padding: '8px 16px',
            background: '#F8F9FA',
            borderBottom: '1px solid #E4E8ED',
          }}
        >
          <div style={headerCellStyle}>Field</div>
          <div style={headerCellStyle}>Value</div>
          <div style={headerCellStyle}>Confidence</div>
          <div style={headerCellStyle}>Source</div>
        </div>

        {/* Rows */}
        {extractionRows.map((row) => {
          const badge = sourceBadge(row.source);
          return (
            <div
              key={row.field}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1.5fr 80px 90px',
                padding: '10px 16px',
                borderTop: '1px solid #F1F3F5',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 500, color: '#1B2D3D' }}>{row.field}</div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: '#4A5568',
                }}
              >
                {row.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 9999,
                    background: '#EDF0F3',
                    overflow: 'hidden',
                  }}
                >
                  {row.confidence > 0 && (
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 9999,
                        background: confidenceColor(row.confidence),
                        width: `${row.confidence}%`,
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    color: '#64707A',
                    fontWeight: 500,
                    width: 28,
                    textAlign: 'right',
                  }}
                >
                  {row.confidence > 0 ? `${row.confidence}%` : '--'}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: badge.bg,
                    color: badge.color,
                  }}
                >
                  {row.source}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
