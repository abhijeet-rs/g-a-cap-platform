'use client';

import { useRef, useState } from 'react';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { validateField, seedFieldRules, monthOptions, carrierOptions } from '@/lib/fieldValidation';

const documentChecklist = [
  { name: 'Census', unlocks: 'Unlocks: Employee demographics', status: 'done' as const },
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
  fontSize: 14,
  background: '#FBFCFD',
  outline: 'none',
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#64707A',
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
  return { icon: '\u{1F4CE}', color: '#64707A' };
}

export default function StepIntake() {
  const {
    company, planYear, eeCount, effMonth, carrier, uploadedFiles,
    setCompany, setPlanYear, setEeCount, setEffMonth, setCarrier, addUpload, removeUpload,
  } = useNewBusinessStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

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
      {/* Two-column grid */}
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
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
              Seed Information
            </h3>
            <span
              style={{
                fontSize: 9,
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
                <div style={{ fontSize: 10, color: '#C60C30', marginTop: 3 }}>{companyValidation.error}</div>
              )}
              {!(touched.company && !companyValidation.valid) && seedFieldRules.company.hint && (
                <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 3 }}>{seedFieldRules.company.hint}</div>
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
                  <div style={{ fontSize: 10, color: '#C60C30', marginTop: 3 }}>{planYearValidation.error}</div>
                )}
                {!(touched.planYear && !planYearValidation.valid) && seedFieldRules.planYear.hint && (
                  <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 3 }}>{seedFieldRules.planYear.hint}</div>
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
                  <div style={{ fontSize: 10, color: '#C60C30', marginTop: 3 }}>{eeCountValidation.error}</div>
                )}
                {!(touched.eeCount && !eeCountValidation.valid) && seedFieldRules.eeCount.hint && (
                  <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 3 }}>{seedFieldRules.eeCount.hint}</div>
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
                <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 3 }}>Benefit plan effective month</div>
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
                <div style={{ fontSize: 10, color: '#98A1A8', marginTop: 3 }}>G&A master carrier or Open Market</div>
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
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1B2D3D', margin: 0 }}>
              Document Checklist
            </h3>
            <span
              style={{
                fontSize: 9,
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
                    fontSize: 11,
                    background: doc.status === 'done' ? '#E4F2EA' : '#F1F3F5',
                    color: doc.status === 'done' ? '#1A7A4A' : '#98A1A8',
                  }}
                >
                  {doc.status === 'done' ? '✓' : '·'}
                </div>
                {/* Text */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1B2D3D' }}>{doc.name}</div>
                  <div style={{ fontSize: 10, color: '#98A1A8' }}>{doc.unlocks}</div>
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
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A7A4A' }}>{uploadFeedback}</div>
            <div style={{ fontSize: 11, color: '#98A1A8', marginTop: 4 }}>Click to upload more files</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 22, color: dragging ? '#0074B8' : '#98A1A8', marginBottom: 4, transition: 'color 0.15s ease' }}>&#8593;</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: dragging ? '#0074B8' : '#4A5568', transition: 'color 0.15s ease' }}>Drop files or click to upload</div>
            <div style={{ fontSize: 11, color: '#98A1A8', marginTop: 4 }}>PDF, Excel, CSV, Image, Word &mdash; up to 25MB each</div>
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
              fontSize: 11,
              fontWeight: 600,
              color: '#64707A',
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
                    fontSize: 12,
                    color: '#4A5568',
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
                      fontSize: 14,
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
                  <span style={{ fontSize: 11, color: '#98A1A8', flexShrink: 0 }}>
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
                      color: '#98A1A8',
                      fontSize: 13,
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
                      (e.currentTarget as HTMLButtonElement).style.color = '#98A1A8';
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
    </div>
  );
}
