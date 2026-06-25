'use client';

import { useRef, useState } from 'react';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { validateField, seedFieldRules, monthOptions, carrierOptions } from '@/lib/fieldValidation';

interface ChecklistDoc {
  name: string;
  unlocks: string;
  status: 'done' | 'pending';
  source?: 'clientspace';
}

const documentChecklist: ChecklistDoc[] = [
  { name: 'Census', unlocks: 'Unlocks: Employee demographics', status: 'done' as const, source: 'clientspace' as const },
  { name: 'Carrier Invoice', unlocks: 'Unlocks: Incumbent plan costs', status: 'done' as const },
  { name: 'SBC / Plan Summary', unlocks: 'Unlocks: Current plan designs', status: 'done' as const },
  { name: 'Prior Booklet', unlocks: 'Unlocks: Contribution setup', status: 'pending' as const },
  { name: 'UW Output', unlocks: 'Unlocks: Bucket / admin / commission', status: 'pending' as const },
  { name: 'FEIN / WC Dec', unlocks: 'Unlocks: Identity & compliance', status: 'pending' as const },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 34,
  border: '1px solid #DCE2E8',
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 'var(--type-body-sm)',
  background: '#FBFCFD',
  outline: 'none',
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--type-table-header)',
  fontWeight: 600,
  color: '#374151',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename: string): { icon: string; color: string } {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return { icon: '\u{1F4C4}', color: '#C60C30' };
  if (['xlsx', 'xls', 'csv'].includes(ext)) return { icon: '\u{1F4CA}', color: '#1A7A4A' };
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return { icon: '\u{1F5BC}', color: '#0074B8' };
  return { icon: '\u{1F4CE}', color: '#374151' };
}

export default function StepIntake() {
  const {
    company, planYear, eeCount, effMonth, carrier, uploadedFiles,
    setCompany, setPlanYear, setEeCount, setEffMonth, setCarrier, addUpload, removeUpload,
  } = useNewBusinessStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const capFileInputRef = useRef<HTMLInputElement>(null);
  const csaFileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* ── CSA (Client Service Agreement) upload state ── */
  const [csaDragging, setCsaDragging] = useState(false);
  const [csaParsing, setCsaParsing] = useState(false);
  const [csaParsed, setCsaParsed] = useState(false);
  const [csaFileName, setCsaFileName] = useState<string | null>(null);

  const handleCsaFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setCsaFileName(file.name);
    setCsaParsing(true);
    setCsaParsed(false);
    setTimeout(() => {
      setCsaParsing(false);
      setCsaParsed(true);
    }, 1500);
  };

  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  /* ── Upload Existing WIP CAP state ── */
  const [intakeMode, setIntakeMode] = useState<'new' | 'upload'>('new');
  const [capImporting, setCapImporting] = useState(false);
  const [capImported, setCapImported] = useState(false);
  const [capDragging, setCapDragging] = useState(false);
  const [capFileName, setCapFileName] = useState<string | null>(null);

  const handleCapFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['xlsx', 'xls'].includes(ext)) return;
    setCapFileName(file.name);
    setCapImporting(true);
    setTimeout(() => {
      setCapImporting(false);
      setCapImported(true);
      // Auto-fill seed info from "imported" data
      setCompany('Itafos Conda');
      setPlanYear('2026');
      setEeCount('298');
      setCarrier('BCBS Texas');
    }, 1500);
  };

  const markTouched = (field: string) => setTouched(p => ({ ...p, [field]: true }));

  const companyValidation = validateField(company, seedFieldRules.company);
  const planYearValidation = validateField(planYear, seedFieldRules.planYear);
  const eeCountValidation = validateField(eeCount, seedFieldRules.eeCount);
  const effMonthValidation = validateField(effMonth, seedFieldRules.effMonth);
  const carrierValidation = validateField(carrier, seedFieldRules.carrier);

  const getBorderColor = (field: string, validation: { valid: boolean }, value: string) => {
    if (!touched[field]) return '#DCE2E8';
    if (!validation.valid) return '#C60C30';
    if (value.trim()) return '#1A7A4A';
    return '#DCE2E8';
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(f => addUpload(f.name, f.size));
    setUploadFeedback(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`);
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Intake Mode Toggle ── */}
      <div style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #E4E8ED',
        padding: 20,
      }}>
        <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', marginBottom: 14 }}>
          How would you like to start?
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => { setIntakeMode('new'); setCapImported(false); setCapImporting(false); setCapFileName(null); }}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 8,
              border: intakeMode === 'new' ? '2px solid #C60C30' : '1px solid #E4E8ED',
              background: intakeMode === 'new' ? '#FFF5F7' : '#FBFCFD',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: intakeMode === 'new' ? '5px solid #C60C30' : '2px solid #DCE2E8',
              background: '#fff',
              flexShrink: 0,
            }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D' }}>Start from scratch</div>
              <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 2 }}>Fill in seed info and upload documents manually</div>
            </div>
          </button>
          <button
            onClick={() => setIntakeMode('upload')}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 8,
              border: intakeMode === 'upload' ? '2px solid #C60C30' : '1px solid #E4E8ED',
              background: intakeMode === 'upload' ? '#FFF5F7' : '#FBFCFD',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: intakeMode === 'upload' ? '5px solid #C60C30' : '2px solid #DCE2E8',
              background: '#fff',
              flexShrink: 0,
            }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D' }}>Upload existing WIP CAP</div>
              <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 2 }}>Import fields from an existing CAP workbook (.xlsx)</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Upload Existing CAP Mode ── */}
      {intakeMode === 'upload' && (
        <div style={{
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #E4E8ED',
          padding: 20,
        }}>
          {!capImporting && !capImported && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setCapDragging(true); }}
                onDragLeave={() => setCapDragging(false)}
                onDrop={(e) => { e.preventDefault(); setCapDragging(false); handleCapFile(e.dataTransfer.files); }}
                onClick={() => capFileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${capDragging ? '#0074B8' : '#DCE2E8'}`,
                  background: capDragging ? '#F0F7FF' : '#FAFBFC',
                  borderRadius: 10,
                  padding: 36,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  ref={capFileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => { handleCapFile(e.target.files); e.target.value = ''; }}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: 36, color: capDragging ? '#0074B8' : '#374151', marginBottom: 8 }}>&#x1F4CA;</div>
                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: capDragging ? '#0074B8' : '#374151' }}>
                  Drop your existing CAP workbook (.xlsx) to import
                </div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 6 }}>
                  Supports .xlsx and .xls files
                </div>
              </div>
            </>
          )}

          {capImporting && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#0074B8', marginBottom: 12 }}>
                Importing...
              </div>
              <div style={{ width: 200, height: 4, background: '#EDF0F3', borderRadius: 2, margin: '0 auto', overflow: 'hidden' }}>
                <div style={{
                  width: '60%', height: '100%', background: '#0074B8', borderRadius: 2,
                  animation: 'capImportPulse 1.5s ease-in-out infinite',
                }} />
              </div>
              <style>{`@keyframes capImportPulse { 0% { width: 10%; } 50% { width: 80%; } 100% { width: 100%; } }`}</style>
              <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 8 }}>
                Reading {capFileName}...
              </div>
            </div>
          )}

          {capImported && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Success message */}
              <div style={{
                background: '#F0FFF5',
                border: '1px solid #C6F0D4',
                borderRadius: 8,
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#1A7A4A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 'var(--type-badge)', fontWeight: 700, flexShrink: 0,
                  }}>
                    &#x2713;
                  </div>
                  <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1A7A4A' }}>
                    Imported 24 fields from CAP workbook
                  </span>
                </div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginLeft: 30 }}>
                  Company Info: 8 fields &middot; Products: 4 fields &middot; Rates: 8 fields &middot; UW Params: 4 fields
                </div>
                <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginLeft: 30, marginTop: 4 }}>
                  Source: {capFileName}
                </div>
              </div>

              {/* Imported seed info preview */}
              <div style={{
                background: '#FAFBFC',
                borderRadius: 8,
                border: '1px solid #EEF1F4',
                padding: 14,
              }}>
                <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                  Imported Seed Data
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Company', value: company },
                    { label: 'Plan Year', value: planYear },
                    { label: 'Est. EE Count', value: eeCount },
                    { label: 'Primary Carrier', value: carrier },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>{item.label}</div>
                      <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document checklist - all done */}
              <div style={{
                background: '#FAFBFC',
                borderRadius: 8,
                border: '1px solid #EEF1F4',
                padding: 14,
              }}>
                <div style={{ fontSize: 'var(--type-table-header)', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                  Document Checklist &mdash; All from CAP
                </div>
                {documentChecklist.map((doc, i) => (
                  <div key={doc.name} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0',
                    borderTop: i > 0 ? '1px solid #EEF1F4' : 'none',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#E4F2EA', color: '#1A7A4A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'var(--type-badge)', flexShrink: 0,
                    }}>&#x2713;</div>
                    <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{doc.name}</span>
                    <span style={{ fontSize: 'var(--type-body-sm)', color: '#1A7A4A', fontWeight: 500, marginLeft: 'auto' }}>From CAP</span>
                  </div>
                ))}
              </div>

              {/* Continue button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIntakeMode('new')}
                  style={{
                    height: 38, padding: '0 22px',
                    background: '#C60C30', color: '#fff',
                    borderRadius: 8, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(198,12,48,.2)',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  Continue with imported data &#x2192;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two-column grid — "Start from scratch" mode */}
      {intakeMode === 'new' && (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── ClientSpace-pulled data callout ── */}
      <div style={{
        background: '#F0F7FF', border: '1px solid #0074B8', borderRadius: 10, padding: 16,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#0074B8', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700,
        }}>&#x21BB;</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#0074B8' }}>Client data synced from ClientSpace</span>
            <span style={{
              fontSize: 'var(--type-badge)', fontWeight: 600, padding: '1px 7px', borderRadius: 4,
              background: '#E7F1FA', color: '#0074B8', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>Auto-pulled</span>
          </div>
          <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: 0, lineHeight: 1.5 }}>
            Census, client contacts and prior documents are pulled automatically from ClientSpace &mdash; you never upload census manually. Provide the CSA below and any incumbent carrier documents not on file.
          </p>
        </div>
      </div>

      {/* ── CSA upload card ── */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E4E8ED', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
            Upload CSA (Client Service Agreement)
          </h3>
          <span style={{
            fontSize: 'var(--type-badge)', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            background: '#FDECEF', color: '#C60C30', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>Required</span>
        </div>

        {!csaParsing && !csaParsed && (
          <div
            onDragOver={(e) => { e.preventDefault(); setCsaDragging(true); }}
            onDragLeave={() => setCsaDragging(false)}
            onDrop={(e) => { e.preventDefault(); setCsaDragging(false); handleCsaFile(e.dataTransfer.files); }}
            onClick={() => csaFileInputRef.current?.click()}
            style={{
              border: `2px dashed ${csaDragging ? '#0074B8' : '#DCE2E8'}`,
              background: csaDragging ? '#F0F7FF' : '#FAFBFC',
              borderRadius: 10, padding: 28, textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              ref={csaFileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => { handleCsaFile(e.target.files); e.target.value = ''; }}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: 28, color: csaDragging ? '#0074B8' : '#C60C30', marginBottom: 6 }}>&#x1F4C4;</div>
            <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: csaDragging ? '#0074B8' : '#374151' }}>
              Drop the signed CSA to parse broker &amp; commission terms
            </div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 4 }}>
              PDF or Word &mdash; broker, commission handling and effective dates are extracted automatically
            </div>
          </div>
        )}

        {csaParsing && (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#0074B8', marginBottom: 12 }}>Parsing CSA…</div>
            <div style={{ width: 200, height: 4, background: '#EDF0F3', borderRadius: 2, margin: '0 auto', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: '#0074B8', borderRadius: 2, animation: 'capImportPulse 1.5s ease-in-out infinite' }} />
            </div>
            <style>{`@keyframes capImportPulse { 0% { width: 10%; } 50% { width: 80%; } 100% { width: 100%; } }`}</style>
            <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 8 }}>Reading {csaFileName}…</div>
          </div>
        )}

        {csaParsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#F0FFF5', border: '1px solid #C6F0D4', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: '#1A7A4A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 'var(--type-badge)', fontWeight: 700, flexShrink: 0,
                }}>&#x2713;</div>
                <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1A7A4A' }}>
                  CSA parsed &mdash; broker, commission handling, effective dates extracted
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginLeft: 30 }}>
                {[
                  { label: 'Broker', value: 'Lockton Companies' },
                  { label: 'Commission', value: '3.0% of premium' },
                  { label: 'Effective', value: '07/01/2026' },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: 'var(--type-caption)', color: '#374151' }}>{item.label}</div>
                    <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 'var(--type-caption)', color: '#374151', marginLeft: 30, marginTop: 8 }}>Source: {csaFileName}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setCsaParsed(false); setCsaFileName(null); }}
                style={{
                  height: 32, padding: '0 14px', background: '#fff', color: '#0074B8',
                  border: '1px solid #0074B8', borderRadius: 6, fontSize: 'var(--type-body-sm)', fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                Replace CSA
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left card: Seed Information */}
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #E4E8ED',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <h3 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
              Seed Information
            </h3>
            <span
              style={{
                fontSize: 'var(--type-badge)',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
                background: '#FDECEF',
                color: '#C60C30',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Required
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Company Name - full width */}
            <div>
              <label style={labelStyle}>Company Name <span style={{ color: '#C60C30' }}>*</span></label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onBlur={() => markTouched('company')}
                style={{
                  ...inputStyle,
                  borderColor: getBorderColor('company', companyValidation, company),
                }}
              />
              {touched.company && !companyValidation.valid && (
                <div style={{ fontSize: 'var(--type-caption)', color: '#C60C30', marginTop: 3 }}>{companyValidation.error}</div>
              )}
              {!(touched.company && !companyValidation.valid) && seedFieldRules.company.hint && (
                <div style={{ fontSize: 'var(--type-caption)', color: '#374151', marginTop: 3 }}>{seedFieldRules.company.hint}</div>
              )}
            </div>

            {/* Plan Year + Est. EE Count */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Plan Year <span style={{ color: '#C60C30' }}>*</span></label>
                <input
                  type="text"
                  value={planYear}
                  onChange={(e) => setPlanYear(e.target.value)}
                  onBlur={() => markTouched('planYear')}
                  style={{
                    ...inputStyle,
                    borderColor: getBorderColor('planYear', planYearValidation, planYear),
                  }}
                />
                {touched.planYear && !planYearValidation.valid && (
                  <div style={{ fontSize: 'var(--type-caption)', color: '#C60C30', marginTop: 3 }}>{planYearValidation.error}</div>
                )}
                {!(touched.planYear && !planYearValidation.valid) && seedFieldRules.planYear.hint && (
                  <div style={{ fontSize: 'var(--type-caption)', color: '#374151', marginTop: 3 }}>{seedFieldRules.planYear.hint}</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Est. EE Count <span style={{ color: '#C60C30' }}>*</span></label>
                <input
                  type="text"
                  value={eeCount}
                  onChange={(e) => setEeCount(e.target.value)}
                  onBlur={() => markTouched('eeCount')}
                  style={{
                    ...inputStyle,
                    borderColor: getBorderColor('eeCount', eeCountValidation, eeCount),
                  }}
                />
                {touched.eeCount && !eeCountValidation.valid && (
                  <div style={{ fontSize: 'var(--type-caption)', color: '#C60C30', marginTop: 3 }}>{eeCountValidation.error}</div>
                )}
                {!(touched.eeCount && !eeCountValidation.valid) && seedFieldRules.eeCount.hint && (
                  <div style={{ fontSize: 'var(--type-caption)', color: '#374151', marginTop: 3 }}>{seedFieldRules.eeCount.hint}</div>
                )}
              </div>
            </div>

            {/* Effective Month + Primary Carrier (dropdowns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Effective Month <span style={{ color: '#C60C30' }}>*</span></label>
                <select
                  value={effMonth}
                  onChange={(e) => { setEffMonth(e.target.value); markTouched('effMonth'); }}
                  style={{
                    ...inputStyle,
                    borderColor: getBorderColor('effMonth', effMonthValidation, effMonth),
                    appearance: 'none' as const,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2398A1A8'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    paddingRight: 28,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select month...</option>
                  {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div style={{ fontSize: 'var(--type-caption)', color: '#374151', marginTop: 3 }}>Benefit plan effective month</div>
              </div>
              <div>
                <label style={labelStyle}>Primary Carrier <span style={{ color: '#C60C30' }}>*</span></label>
                <select
                  value={carrier}
                  onChange={(e) => { setCarrier(e.target.value); markTouched('carrier'); }}
                  style={{
                    ...inputStyle,
                    borderColor: getBorderColor('carrier', carrierValidation, carrier),
                    appearance: 'none' as const,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2398A1A8'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    paddingRight: 28,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select carrier...</option>
                  {carrierOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ fontSize: 'var(--type-caption)', color: '#374151', marginTop: 3 }}>G&A master carrier or Open Market</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right card: Document Checklist */}
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #E4E8ED',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <h3 style={{ fontSize: 'var(--type-card-title)', fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
              Document Checklist
            </h3>
            <span
              style={{
                fontSize: 'var(--type-badge)',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
                background: '#E7F1FA',
                color: '#0074B8',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Upload
            </span>
          </div>

          <div>
            {documentChecklist.map((doc, i) => (
              <div
                key={doc.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid #F1F3F5' : 'none',
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--type-badge)',
                    background: doc.status === 'done' ? '#E4F2EA' : '#F1F3F5',
                    color: doc.status === 'done' ? '#1A7A4A' : '#374151',
                  }}
                >
                  {doc.status === 'done' ? '✓' : '·'}
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#1B2D3D' }}>{doc.name}</div>
                    {doc.source === 'clientspace' && (
                      <span style={{
                        fontSize: 'var(--type-badge)', fontWeight: 600, padding: '1px 7px', borderRadius: 4,
                        background: '#E7F1FA', color: '#0074B8', whiteSpace: 'nowrap',
                      }}>
                        Synced from ClientSpace
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>
                    {doc.source === 'clientspace' ? 'Pulled automatically — no manual upload' : doc.unlocks}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#0074B8' : '#DCE2E8'}`,
          background: dragging ? '#F0F7FF' : 'transparent',
          borderRadius: 10,
          padding: 28,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.doc,.docx,.txt,.md,.zip"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          style={{ display: 'none' }}
        />
        {uploadFeedback ? (
          <>
            <div style={{ fontSize: 22, color: '#1A7A4A', marginBottom: 4 }}>✓</div>
            <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1A7A4A' }}>{uploadFeedback}</div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 4 }}>Click to upload more files</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 22, color: dragging ? '#0074B8' : '#374151', marginBottom: 4, transition: 'color 0.15s ease' }}>&#8593;</div>
            <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: dragging ? '#0074B8' : '#374151', transition: 'color 0.15s ease' }}>Drop files or click to upload</div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: '#374151', marginTop: 4 }}>PDF, Excel, CSV, Image, Word &mdash; up to 25MB each</div>
          </>
        )}
      </div>

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #E4E8ED',
            padding: 16,
          }}
        >
          <h4
            style={{
              fontSize: 'var(--type-table-header)',
              fontWeight: 600,
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            Uploaded Files
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {uploadedFiles.map((file) => {
              const { icon, color } = getFileIcon(file.name);
              return (
                <div
                  key={file.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 'var(--type-body-sm)',
                    color: '#374151',
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: '#FBFCFD',
                    border: '1px solid #F1F3F5',
                  }}
                >
                  {/* File type icon */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--type-body-sm)',
                      background: `${color}14`,
                      color: color,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  {/* File name */}
                  <span style={{ fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  {/* File size */}
                  <span style={{ fontSize: 'var(--type-caption)', color: '#374151', flexShrink: 0 }}>
                    {formatFileSize(file.size)}
                  </span>
                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeUpload(file.name); }}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: '1px solid #E4E8ED',
                      background: '#fff',
                      color: '#374151',
                      fontSize: 'var(--type-badge)',
                      lineHeight: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      padding: 0,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#FDECEF';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#C60C30';
                      (e.currentTarget as HTMLButtonElement).style.color = '#C60C30';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#E4E8ED';
                      (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                    }}
                    title={`Remove ${file.name}`}
                  >
                    &#215;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>)}
    </div>
  );
}
