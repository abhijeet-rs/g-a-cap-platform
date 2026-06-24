'use client';

import { useState, useMemo, useEffect } from 'react';
import { assemblySections, SyncableField } from '@/data/assembly';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import { Provenance } from '@/lib/types';
import { validateField, assemblyFieldRules } from '@/lib/fieldValidation';

const fieldComments: Record<string, string> = {
  'Company Name': 'Dana W: Please confirm this value',
  'EE Count': 'Dana W: Please confirm this value',
  'Commission': 'Dana W: Please confirm this value',
};

const provenanceConfig: Record<
  Provenance,
  { color: string; bg: string; textColor: string; label: string }
> = {
  library: { color: '#0074B8', bg: '#E7F1FA', textColor: '#0074B8', label: 'From library' },
  upload: { color: '#B0690A', bg: '#FBF0DD', textColor: '#B0690A', label: 'From upload · confirm' },
  underwriting: { color: '#5A45C7', bg: '#F0EDFA', textColor: '#5A45C7', label: 'Underwriting' },
  input: { color: '#C60C30', bg: '#FDECEF', textColor: '#C60C30', label: 'Needs input' },
};

const sourceChipLabels: Record<string, string> = {
  'F6 · Vocabularies': 'Source: F6 · Vocabularies',
  'F4 · Pricing Stack': 'Source: F4 · Pricing Stack',
  'F3 · Master Plans': 'Source: F3 · Master Plan Library',
};

export default function StepAssembly() {
  const [hoveredComment, setHoveredComment] = useState<string | null>(null);
  const [hoveredSourceChip, setHoveredSourceChip] = useState<string | null>(null);
  const [syncingField, setSyncingField] = useState<string | null>(null);
  const [hoveredSync, setHoveredSync] = useState<string | null>(null);

  // Use the Zustand store so values persist across steps
  const fieldValues = useNewBusinessStore(s => s.assemblyFields);
  const confirmedFields = useNewBusinessStore(s => s.confirmedFields);
  const setAssemblyField = useNewBusinessStore(s => s.setAssemblyField);
  const confirmField = useNewBusinessStore(s => s.confirmField);

  const handleSync = (key: string, simulatedValue: string) => {
    setSyncingField(key);
    setTimeout(() => {
      setAssemblyField(key, simulatedValue);
      confirmField(key);
      setSyncingField(null);
    }, 800);
  };

  const [assemblyTouched, setAssemblyTouched] = useState<Record<string, boolean>>({});

  const markAssemblyTouched = (key: string) =>
    setAssemblyTouched(p => ({ ...p, [key]: true }));

  const getKey = (sectionTitle: string, fieldLabel: string) =>
    `${sectionTitle}__${fieldLabel}`;

  const handleValueChange = (key: string, newValue: string) => {
    setAssemblyField(key, newValue);
  };

  const handleConfirm = (key: string) => {
    confirmField(key);
  };

  // Auto-compute Multiplier when all 4 UW params are filled
  useEffect(() => {
    const bucket = fieldValues['Underwriting__Bucket'];
    const af = fieldValues['Underwriting__Admin Factor'];
    const comm = fieldValues['Underwriting__Commission'];
    const rf = fieldValues['Underwriting__Risk Factor'];

    if (bucket && af && comm && rf) {
      const bVal = parseFloat(bucket);
      const aVal = parseFloat(af);
      const cVal = parseFloat(comm);
      const rVal = parseFloat(rf);

      if (!isNaN(bVal) && !isNaN(aVal) && !isNaN(cVal) && !isNaN(rVal)) {
        const multiplier = bVal * aVal * (1 + cVal) * rVal;
        const rounded = multiplier.toFixed(4);
        if (fieldValues['Underwriting__Multiplier'] !== rounded) {
          setAssemblyField('Underwriting__Multiplier', rounded);
        }
      }
    }
  }, [
    fieldValues['Underwriting__Bucket'],
    fieldValues['Underwriting__Admin Factor'],
    fieldValues['Underwriting__Commission'],
    fieldValues['Underwriting__Risk Factor'],
    fieldValues,
    setAssemblyField,
  ]);

  // Compute filled counts per section dynamically
  const sectionFilledCounts = useMemo(() => {
    const counts: Record<string, { filled: number; total: number }> = {};
    assemblySections.forEach((section) => {
      let filled = 0;
      section.fields.forEach((field) => {
        const key = getKey(section.title, field.label);
        if (fieldValues[key]) filled++;
      });
      counts[section.title] = { filled, total: section.fields.length };
    });
    return counts;
  }, [fieldValues]);

  // Compute total attention items
  const attentionCount = useMemo(() => {
    let count = 0;
    assemblySections.forEach((section) => {
      section.fields.forEach((field) => {
        const key = getKey(section.title, field.label);
        const val = fieldValues[key];
        const isConfirmed = confirmedFields[key];
        if (field.provenance === 'upload' && !isConfirmed) count++;
        if (field.provenance === 'input' && !val) count++;
        if (field.provenance === 'underwriting' && !val) count++;
      });
    });
    return count;
  }, [fieldValues, confirmedFields]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Provenance legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        {Object.entries(provenanceConfig).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: cfg.color,
              }}
            />
            <span style={{ fontSize: 'var(--type-label)', fontWeight: 600, color: '#374151' }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Readiness alert */}
      {attentionCount > 0 && (
        <div
          style={{
            background: '#FBF0DD',
            border: '1px solid #F0DDB5',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 'var(--type-body-sm)' }}>&#9888;</span>
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 500, color: '#B0690A' }}>
            {attentionCount} items need attention &mdash; confirm values and fill missing fields
          </span>
        </div>
      )}

      {/* Assembly sections */}
      {assemblySections.map((section) => {
        const counts = sectionFilledCounts[section.title];

        return (
          <div
            key={section.title}
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #E4E8ED',
              padding: 20,
            }}
          >
            {/* Section header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3
                  style={{
                    fontSize: 'var(--type-table-header)',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: '#C60C30',
                    letterSpacing: '0.04em',
                    margin: 0,
                  }}
                >
                  {section.title}
                </h3>
                <span
                  style={{
                    fontSize: 'var(--type-badge)',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    color: '#fff',
                    backgroundColor: section.sourceColor,
                  }}
                >
                  {section.source}
                </span>
              </div>
              <span style={{ fontSize: 'var(--type-caption)', color: '#374151', fontWeight: 500 }}>
                {counts.filled}/{counts.total} filled
              </span>
            </div>

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {section.fields.map((field) => {
                const key = getKey(section.title, field.label);
                const currentValue = fieldValues[key];
                const isConfirmed = confirmedFields[key];
                const prov = provenanceConfig[field.provenance];
                const comment = fieldComments[field.label];

                // Determine effective provenance for rendering
                const effectiveProv = (field.provenance === 'upload' && isConfirmed)
                  ? 'library' as Provenance
                  : field.provenance;
                const effectiveConfig = provenanceConfig[effectiveProv];

                // Determine if field should be editable
                const isEditable = (() => {
                  if (field.provenance === 'upload' && !isConfirmed) return true;
                  if (field.provenance === 'input') return true;
                  if (field.provenance === 'underwriting' && !currentValue) return true;
                  return false;
                })();

                // Border color for editable fields
                const borderColor = (() => {
                  if (field.provenance === 'upload' && !isConfirmed) return prov.color;
                  if (field.provenance === 'input') return prov.color;
                  if (field.provenance === 'underwriting' && !currentValue) return prov.color;
                  return effectiveConfig.color;
                })();

                return (
                  <div key={field.label}>
                    {/* Label with provenance dot */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 4,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          flexShrink: 0,
                          backgroundColor: effectiveConfig.color,
                        }}
                      />
                      <span style={{ fontSize: 'var(--type-body-sm)', color: '#374151' }}>{field.label}</span>
                      {/* Confirmed checkmark next to label */}
                      {field.provenance === 'upload' && isConfirmed && (
                        <span style={{ fontSize: 'var(--type-badge)', color: '#1A7A4A', fontWeight: 700 }}>&#10003;</span>
                      )}
                      {/* Prism sync refresh icon */}
                      {(field as SyncableField).syncSource && (
                        <span
                          onMouseEnter={() => setHoveredSync(key)}
                          onMouseLeave={() => setHoveredSync(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            const src = (field as SyncableField).syncSource!;
                            if (src.simulatedValue) handleSync(key, src.simulatedValue);
                          }}
                          style={{
                            marginLeft: 'auto',
                            fontSize: 'var(--type-badge)',
                            cursor: 'pointer',
                            color: syncingField === key ? '#0074B8' : '#374151',
                            animation: syncingField === key ? 'spin .7s linear infinite' : 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            position: 'relative',
                            flexShrink: 0,
                          }}
                          title={(field as SyncableField).syncSource!.description}
                        >
                          ↻
                          {hoveredSync === key && syncingField !== key && (
                            <span style={{
                              position: 'absolute', bottom: '100%', right: 0, marginBottom: 4,
                              background: '#1B2D3D', color: '#fff', fontSize: 'var(--type-caption)', fontWeight: 500,
                              padding: '4px 8px', borderRadius: 5, whiteSpace: 'nowrap', zIndex: 20,
                              boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                            }}>
                              {(field as SyncableField).syncSource!.system} · {(field as SyncableField).syncSource!.description}
                            </span>
                          )}
                        </span>
                      )}
                      {comment && (
                        <span
                          style={{
                            fontSize: 'var(--type-badge)',
                            cursor: 'pointer',
                            marginLeft: 2,
                            position: 'relative',
                          }}
                          onMouseEnter={() => setHoveredComment(field.label)}
                          onMouseLeave={() => setHoveredComment(null)}
                        >
                          {'💬'}
                          {hoveredComment === field.label && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: 0,
                                marginBottom: 4,
                                background: '#1B2D3D',
                                color: '#fff',
                                fontSize: 'var(--type-caption)',
                                fontWeight: 500,
                                padding: '6px 10px',
                                borderRadius: 6,
                                whiteSpace: 'nowrap',
                                zIndex: 20,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              }}
                            >
                              {comment}
                            </div>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Value box */}
                    {isEditable ? (() => {
                      const rule = assemblyFieldRules[key];
                      const validation = rule ? validateField(currentValue, rule) : { valid: true, error: null };
                      const isTouched = assemblyTouched[key];
                      const showError = isTouched && !validation.valid;
                      const isMultiplier = key === 'Underwriting__Multiplier';

                      // Determine input border color with validation
                      const inputBorderColor = showError
                        ? '#C60C30'
                        : (isTouched && validation.valid && currentValue.trim())
                          ? '#1A7A4A'
                          : borderColor;

                      return (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={currentValue}
                              placeholder={field.provenance === 'input' ? `Enter ${field.label.toLowerCase()}...` : ''}
                              onChange={(e) => handleValueChange(key, e.target.value)}
                              onBlur={() => markAssemblyTouched(key)}
                              readOnly={isMultiplier}
                              style={{
                                width: '100%',
                                height: 32,
                                borderRadius: 6,
                                padding: '0 10px',
                                fontSize: 'var(--type-body-sm)',
                                fontWeight: 500,
                                outline: 'none',
                                border: `1.5px solid ${inputBorderColor}`,
                                background: isMultiplier ? '#F8F9FA' : '#fff',
                                color: '#1B2D3D',
                              }}
                            />
                            {field.provenance === 'upload' && !isConfirmed && (
                              <button
                                onClick={() => handleConfirm(key)}
                                style={{
                                  height: 22,
                                  padding: '0 8px',
                                  borderRadius: 4,
                                  border: 'none',
                                  background: '#E4F2EA',
                                  color: '#1A7A4A',
                                  fontSize: 'var(--type-body-sm)',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  marginLeft: 6,
                                  whiteSpace: 'nowrap' as const,
                                }}
                              >
                                &#10003; Confirm
                              </button>
                            )}
                          </div>
                          {showError && (
                            <div style={{ fontSize: 'var(--type-caption)', color: '#C60C30', marginTop: 3 }}>{validation.error}</div>
                          )}
                          {!showError && rule?.hint && (
                            <div style={{ fontSize: 'var(--type-caption)', color: '#374151', marginTop: 3 }}>{rule.hint}</div>
                          )}
                        </div>
                      );
                    })() : (
                      <div
                        style={{
                          height: 32,
                          borderRadius: 6,
                          padding: '0 10px',
                          fontSize: 'var(--type-body-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          background: effectiveConfig.bg,
                          color: effectiveConfig.textColor,
                          position: 'relative',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{currentValue}</span>
                        {/* Source chip for library fields */}
                        {effectiveProv === 'library' && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              fontSize: 8,
                              fontWeight: 600,
                              color: '#0074B8',
                              background: '#D4E8F7',
                              padding: '2px 6px',
                              borderRadius: 4,
                              cursor: 'pointer',
                              position: 'relative',
                            }}
                            onMouseEnter={() => setHoveredSourceChip(key)}
                            onMouseLeave={() => setHoveredSourceChip(null)}
                          >
                            {field.provenance === 'upload' && isConfirmed ? 'confirmed' : section.source}
                            {hoveredSourceChip === key && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '100%',
                                  right: 0,
                                  marginBottom: 4,
                                  background: '#1B2D3D',
                                  color: '#fff',
                                  fontSize: 'var(--type-caption)',
                                  fontWeight: 500,
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  whiteSpace: 'nowrap',
                                  zIndex: 20,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                              >
                                {sourceChipLabels[section.source] || `Source: ${section.source}`}
                              </div>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
