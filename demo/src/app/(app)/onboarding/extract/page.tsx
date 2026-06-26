'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';

const MAX_FILE_SIZE_MB = 25;
const ALLOWED_TYPES = ['application/pdf'];
const PDF_HEADER = '%PDF';

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

export default function ExtractPage() {
  const { uploadPhase, fileName, startUpload } = useOnboardingStore();
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [validating, setValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div style={{ padding: '24px 24px 32px', maxWidth: 720, margin: '0 auto' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      <div style={{ marginBottom: 28 }}>
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
    </div>
  );
}
