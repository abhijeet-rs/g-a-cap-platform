'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';

const MAX_FILE_SIZE_MB = 25;
const ALLOWED_TYPES = ['application/pdf'];
const PDF_HEADER = '%PDF';

// ─── Extraction Schema Types ────────────────────────────────────────────────

interface SchemaField {
  id: string;
  label: string;
  enabled: boolean;
  custom?: boolean;
}

interface SchemaCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  fields: SchemaField[];
}

const DEFAULT_SCHEMA: SchemaCategory[] = [
  {
    id: 'general',
    label: 'General Information',
    icon: 'fa-building',
    color: '#0074B8',
    fields: [
      { id: 'org_name', label: 'Organization Name', enabled: true },
      { id: 'contract_type', label: 'Contract Type', enabled: true },
      { id: 'num_employees', label: 'Number of Employees', enabled: true },
      { id: 'decision_maker', label: 'Decision Maker', enabled: true },
    ],
  },
  {
    id: 'contract',
    label: 'Contract & Dates',
    icon: 'fa-file-contract',
    color: '#7B4FBF',
    fields: [
      { id: 'effective_date', label: 'Effective Date', enabled: true },
      { id: 'contract_term', label: 'Contract Term', enabled: true },
      { id: 'termination_notice', label: 'Termination Notice', enabled: true },
      { id: 'early_termination_fee', label: 'Early Termination Fee', enabled: true },
    ],
  },
  {
    id: 'services',
    label: 'Services & Coverage',
    icon: 'fa-shield-halved',
    color: '#2A8F60',
    fields: [
      { id: 'services_included', label: 'Services Included', enabled: true },
      { id: 'suta_coverage', label: 'SUTA Coverage', enabled: true },
      { id: 'wc_codes', label: 'WC Codes', enabled: true },
      { id: 'wc_state', label: 'Workers Comp State', enabled: true },
    ],
  },
  {
    id: 'fees',
    label: 'Fee Structure',
    icon: 'fa-dollar-sign',
    color: '#D97706',
    fields: [
      { id: 'admin_fee', label: 'Admin Fee', enabled: true },
      { id: 'pepm_fee', label: 'PEPM Fee', enabled: true },
      { id: 'implementation_fee', label: 'Implementation Fee', enabled: true },
      { id: 'offcycle_payroll_fee', label: 'Off-cycle Payroll Fee', enabled: true },
      { id: 'cyber_insurance_fee', label: 'Cyber Insurance Fee', enabled: true },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: 'fa-money-check-dollar',
    color: '#0074B8',
    fields: [
      { id: 'pay_frequency', label: 'Pay Frequency', enabled: true },
      { id: 'payroll_deadline', label: 'Payroll Submission Deadline', enabled: true },
    ],
  },
  {
    id: 'benefits',
    label: 'Benefits',
    icon: 'fa-heart-pulse',
    color: '#C60C30',
    fields: [
      { id: 'offer_benefits', label: 'Offer Benefits', enabled: true },
      { id: 'plan_sponsors', label: 'Plan Sponsors', enabled: true },
      { id: 'offer_retirement', label: 'Offer Retirement Plan', enabled: true },
      { id: 'retirement_carrier', label: 'Retirement Plan Carrier', enabled: true },
    ],
  },
  {
    id: 'company',
    label: 'Company Information',
    icon: 'fa-landmark',
    color: '#475467',
    fields: [
      { id: 'ownership_structure', label: 'Ownership Structure', enabled: true },
      { id: 'client_address', label: 'Client Address', enabled: true },
      { id: 'governing_law', label: 'Governing Law', enabled: true },
    ],
  },
];

// ─── Upload validation helpers ───────────────────────────────────────────────

interface UploadError {
  title: string;
  detail: string;
  icon: string;
}

function validateFile(file: File): UploadError | null {
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
    return {
      title: 'Invalid file type',
      detail: `"${file.name}" is not a PDF. Only PDF documents are supported for CSA extraction.`,
      icon: 'fa-file-circle-xmark',
    };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return {
      title: 'File too large',
      detail: `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`,
      icon: 'fa-weight-hanging',
    };
  }
  if (file.size < 1024) {
    return {
      title: 'File too small',
      detail: `"${file.name}" is only ${file.size} bytes. This does not appear to be a valid PDF document.`,
      icon: 'fa-file-circle-exclamation',
    };
  }
  return null;
}

async function validatePdfContent(file: File): Promise<UploadError | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer);
      const header = String.fromCharCode(...arr.slice(0, 5));
      if (!header.startsWith(PDF_HEADER)) {
        resolve({
          title: 'Corrupted or invalid PDF',
          detail: `"${file.name}" does not have a valid PDF header. The file may be corrupted, password-protected, or not a real PDF.`,
          icon: 'fa-file-shield',
        });
      } else {
        const text = String.fromCharCode(...arr.slice(0, Math.min(arr.length, 4096)));
        if (text.includes('/Encrypt')) {
          resolve({
            title: 'Password-protected PDF',
            detail: `"${file.name}" appears to be encrypted or password-protected. Please upload an unlocked version of the CSA.`,
            icon: 'fa-lock',
          });
        } else {
          resolve(null);
        }
      }
    };
    reader.onerror = () => {
      resolve({
        title: 'File read error',
        detail: `Unable to read "${file.name}". The file may be corrupted or inaccessible.`,
        icon: 'fa-circle-exclamation',
      });
    };
    reader.readAsArrayBuffer(file.slice(0, 4096));
  });
}

// ─── Schema Modal ────────────────────────────────────────────────────────────

function SchemaModal({
  schema,
  onSave,
  onClose,
}: {
  schema: SchemaCategory[];
  onSave: (updated: SchemaCategory[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<SchemaCategory[]>(() =>
    schema.map((cat) => ({ ...cat, fields: cat.fields.map((f) => ({ ...f })) }))
  );
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState('');

  const toggleField = (catId: string, fieldId: string) => {
    setDraft((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : {
              ...cat,
              fields: cat.fields.map((f) =>
                f.id === fieldId ? { ...f, enabled: !f.enabled } : f
              ),
            }
      )
    );
  };

  const removeCustomField = (catId: string, fieldId: string) => {
    setDraft((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : { ...cat, fields: cat.fields.filter((f) => f.id !== fieldId) }
      )
    );
  };

  const commitNewField = (catId: string) => {
    const trimmed = newFieldLabel.trim();
    if (!trimmed) {
      setAddingTo(null);
      setNewFieldLabel('');
      return;
    }
    const id = `custom_${catId}_${Date.now()}`;
    setDraft((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : {
              ...cat,
              fields: [
                ...cat.fields,
                { id, label: trimmed, enabled: true, custom: true },
              ],
            }
      )
    );
    setNewFieldLabel('');
    setAddingTo(null);
  };

  const enabledCount = draft.reduce(
    (sum, cat) => sum + cat.fields.filter((f) => f.enabled).length,
    0
  );
  const totalCount = draft.reduce((sum, cat) => sum + cat.fields.length, 0);

  return (
    /* backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,24,40,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 640,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(16,24,40,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#E7F1FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-sliders" style={{ fontSize: 17, color: '#0074B8' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 'var(--type-section-title)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
              }}
            >
              Extraction Schema
            </div>
            <div
              style={{
                fontSize: 'var(--type-body-sm)',
                color: 'var(--text-secondary)',
                marginTop: 3,
              }}
            >
              Configure which fields the AI extracts from CSA documents
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              color: 'var(--text-tertiary)',
              fontSize: 16,
              borderRadius: 6,
              lineHeight: 1,
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* summary bar */}
        <div
          style={{
            padding: '10px 24px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <i
            className="fa-solid fa-circle-check"
            style={{ fontSize: 13, color: '#2A8F60' }}
          />
          <span style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{enabledCount}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> fields
            enabled for extraction
          </span>
        </div>

        {/* scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px 8px' }}>
          {draft.map((cat) => (
            <div key={cat.id} style={{ marginBottom: 20 }}>
              {/* category header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: `${cat.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <i
                    className={`fa-solid ${cat.icon}`}
                    style={{ fontSize: 11, color: cat.color }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 'var(--type-body-sm)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {cat.label}
                </span>
                <span
                  style={{
                    fontSize: 'var(--type-badge)',
                    color: 'var(--text-tertiary)',
                    marginLeft: 2,
                  }}
                >
                  {cat.fields.filter((f) => f.enabled).length}/{cat.fields.length}
                </span>
              </div>

              {/* field chips */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  paddingLeft: 34,
                }}
              >
                {cat.fields.map((field) => (
                  <div
                    key={field.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      borderRadius: 20,
                      border: field.enabled
                        ? `1.5px solid ${cat.color}55`
                        : '1.5px solid var(--border-primary)',
                      background: field.enabled ? `${cat.color}10` : 'var(--bg-secondary)',
                      cursor: field.custom ? undefined : 'pointer',
                      transition: 'all 0.12s ease',
                      userSelect: 'none',
                    }}
                    onClick={() => !field.custom && toggleField(cat.id, field.id)}
                  >
                    {/* toggle pill */}
                    {!field.custom && (
                      <div
                        style={{
                          width: 28,
                          height: 16,
                          borderRadius: 8,
                          background: field.enabled ? cat.color : '#D0D5DD',
                          position: 'relative',
                          flexShrink: 0,
                          transition: 'background 0.12s ease',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 2,
                            left: field.enabled ? 14 : 2,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left 0.12s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                          }}
                        />
                      </div>
                    )}

                    <span
                      style={{
                        fontSize: 'var(--type-body-sm)',
                        color: field.enabled ? cat.color : 'var(--text-tertiary)',
                        fontWeight: field.enabled ? 500 : 400,
                        transition: 'color 0.12s ease',
                      }}
                    >
                      {field.label}
                    </span>

                    {/* remove button for custom fields */}
                    {field.custom && (
                      <button
                        onClick={() => removeCustomField(cat.id, field.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: 2,
                          color: '#C60C30',
                          fontSize: 11,
                          lineHeight: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Remove custom field"
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    )}
                  </div>
                ))}

                {/* add field inline */}
                {addingTo === cat.id ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 8px 4px 10px',
                      borderRadius: 20,
                      border: `1.5px solid ${cat.color}`,
                      background: `${cat.color}08`,
                    }}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitNewField(cat.id);
                        if (e.key === 'Escape') {
                          setAddingTo(null);
                          setNewFieldLabel('');
                        }
                      }}
                      placeholder="Field name…"
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: 'var(--type-body-sm)',
                        color: 'var(--text-primary)',
                        width: 120,
                        padding: 0,
                      }}
                    />
                    <button
                      onClick={() => commitNewField(cat.id)}
                      style={{
                        background: cat.color,
                        border: 'none',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 10,
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-check" />
                    </button>
                    <button
                      onClick={() => {
                        setAddingTo(null);
                        setNewFieldLabel('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        fontSize: 11,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingTo(cat.id);
                      setNewFieldLabel('');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 10px',
                      borderRadius: 20,
                      border: '1.5px dashed var(--border-primary)',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      fontSize: 'var(--type-body-sm)',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = cat.color;
                      (e.currentTarget as HTMLButtonElement).style.color = cat.color;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        'var(--border-primary)';
                      (e.currentTarget as HTMLButtonElement).style.color =
                        'var(--text-tertiary)';
                    }}
                  >
                    <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
                    Add field
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            flexShrink: 0,
            background: '#fff',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: '1px solid var(--border-primary)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 'var(--type-body-sm)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#2A8F60',
              cursor: 'pointer',
              fontSize: 'var(--type-body-sm)',
              fontWeight: 600,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <i className="fa-solid fa-floppy-disk" style={{ fontSize: 13 }} />
            Save Schema
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ExtractPage() {
  const { uploadPhase, fileName, startUpload } = useOnboardingStore();
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [validating, setValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Schema state
  const [schema, setSchema] = useState<SchemaCategory[]>(DEFAULT_SCHEMA);
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);

  const handleFileSelected = useCallback(async (file: File) => {
    setDragOver(false);
    setUploadError(null);
    setValidating(true);

    const basicErr = validateFile(file);
    if (basicErr) {
      setUploadError(basicErr);
      setValidating(false);
      return;
    }

    const contentErr = await validatePdfContent(file);
    if (contentErr) {
      setUploadError(contentErr);
      setValidating(false);
      return;
    }

    setValidating(false);
    startUpload(file);
    router.push('/onboarding');
  }, [startUpload, router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  }, [handleFileSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    e.target.value = '';
  }, [handleFileSelected]);

  const enabledFieldCount = schema.reduce(
    (sum, cat) => sum + cat.fields.filter((f) => f.enabled).length,
    0
  );

  return (
    <div style={{ padding: '24px 24px 32px', maxWidth: 720, margin: '0 auto' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 'var(--type-section-title)', color: '#2A8F60' }} />
          <h1 style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Upload CSA
          </h1>
        </div>
        <p style={{ fontSize: 'var(--type-body)', color: 'var(--text-secondary)', margin: 0 }}>
          Upload a Client Service Agreement PDF. The document will be parsed by LlamaParse and fields will be extracted automatically. You can review the results from the dashboard.
        </p>
      </div>

      {/* Edit Schema button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setSchemaModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 14px',
            borderRadius: 8,
            border: '1.5px solid var(--border-primary)',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 'var(--type-body-sm)',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.12s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#0074B8';
            (e.currentTarget as HTMLButtonElement).style.color = '#0074B8';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-primary)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          }}
        >
          <i className="fa-solid fa-sliders" style={{ fontSize: 13 }} />
          Edit Schema
          <span style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 10,
            padding: '1px 7px',
            fontSize: 'var(--type-badge)',
            color: 'var(--text-tertiary)',
            fontWeight: 600,
          }}>
            {enabledFieldCount} fields
          </span>
        </button>
      </div>

      {/* Upload error banner */}
      {uploadError && (
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: '#FDECEF', border: '1px solid #F5C6CB',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#C60C3015',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className={`fa-solid ${uploadError.icon}`} style={{ fontSize: 18, color: '#C60C30' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--type-body)', fontWeight: 700, color: '#8a000a', marginBottom: 4 }}>
              {uploadError.title}
            </div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: '#8a000a', lineHeight: 1.5 }}>
              {uploadError.detail}
            </div>
          </div>
          <button
            onClick={() => setUploadError(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: '#8a000a', fontSize: 14, flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {uploadPhase === 'idle' && !validating && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: dragOver ? '#E4F2EA' : '#FAFBFC',
            border: `2px dashed ${dragOver ? '#2A8F60' : uploadError ? '#C60C30' : '#D0D5DD'}`,
            borderRadius: 16, padding: '64px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: dragOver ? '#2A8F6018' : '#F1F3F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 32, color: dragOver ? '#2A8F60' : '#98A1A8' }} />
          </div>
          <div style={{ fontSize: 'var(--type-body-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Drop a CSA document here, or click to browse
          </div>
          <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
            PDF only — max {MAX_FILE_SIZE_MB} MB
          </div>
          <div style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8,
            background: '#E7F1FA', border: '1px solid #D0E3F1',
            fontSize: 'var(--type-body-sm)', color: '#0074B8', fontWeight: 500,
          }}>
            <i className="fa-solid fa-bolt" style={{ fontSize: 11 }} />
            Powered by LlamaParse — extraction takes 10-30 seconds
          </div>
          <div style={{
            marginTop: 4, display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)',
          }}>
            <i className="fa-solid fa-shield-check" style={{ fontSize: 10 }} />
            Validates PDF integrity, rejects corrupted, locked, or non-PDF files
          </div>
        </div>
      )}

      {validating && (
        <div style={{
          background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 12,
          padding: 28, boxShadow: 'var(--shadow-xs)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 20, height: 20, border: '2.5px solid #0074B8', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          }} />
          <div>
            <div style={{ fontSize: 'var(--type-body)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Validating file...
            </div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
              Checking PDF integrity, file size, and format.
            </div>
          </div>
        </div>
      )}

      {(uploadPhase === 'uploading' || uploadPhase === 'processing') && (
        <div style={{
          background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 12,
          padding: 28, boxShadow: 'var(--shadow-xs)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 20, height: 20, border: '2.5px solid #2A8F60', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          }} />
          <div>
            <div style={{ fontSize: 'var(--type-body)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Uploading {fileName}...
            </div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
              Redirecting to dashboard — you{"'"}ll see the extraction progress there.
            </div>
          </div>
        </div>
      )}

      {/* Schema modal */}
      {schemaModalOpen && (
        <SchemaModal
          schema={schema}
          onSave={(updated) => {
            setSchema(updated);
            setSchemaModalOpen(false);
          }}
          onClose={() => setSchemaModalOpen(false)}
        />
      )}
    </div>
  );
}
