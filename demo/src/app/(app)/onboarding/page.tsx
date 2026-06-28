'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  onboardingMetrics,
  extractedFields as extractedFieldsData,
} from '@/data/onboarding';

const PDFViewer = dynamic(() => import('@/components/pdf/PDFViewer'), { ssr: false });

/* ================================================================
   CSA Document-Centric Dashboard + Validation/Review Drawer
   ================================================================ */

/* ── Fallback types (will be superseded by data file when other agent finishes) ── */

interface CSADocument {
  id: string;
  client: string;
  uploadDate: string;
  uploadedBy: string;
  extractionStatus: 'extracting' | 'validating' | 'approved' | 'flagged';
  validationStatus: 'not_started' | 'in_progress' | 'completed' | 'needs_review';
  crossValStatus: 'pending' | 'passed' | 'mismatches_found' | 'failed';
  confidence: number;
  lastModified: string;
  assignedReviewer: string;
  persona: string;
  fieldCount: number;
  mismatchCount: number;
  filename?: string;
}

interface ExtractedFieldWithEdit {
  id: string;
  field: string;
  value: string;
  confidence: number;
  citation: string;
  category: string;
  validationStatus: 'valid' | 'mismatch' | 'pending' | 'corrected';
  changeType: 'ai_generated' | 'human_corrected' | 'system_matched' | 'flagged';
  sourcePageNum: number;
  sourceText?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

interface CSAAuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  persona: string;
  actionType: 'upload' | 'extraction' | 'validation' | 'field_edit' | 'approval' | 'sync' | 'system' | 'flag';
  title: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  fieldName?: string;
}

/* ── Fallback mock data ── */

const FALLBACK_DOCS: CSADocument[] = [
  { id: 'CSA-2026-0847', client: 'Acme Corp', uploadDate: '2026-06-24', uploadedBy: 'Dana Whitfield', extractionStatus: 'validating', validationStatus: 'completed', crossValStatus: 'mismatches_found', confidence: 0.94, lastModified: '2026-06-25T15:10:00Z', assignedReviewer: 'Sam Cho', persona: 'ba', fieldCount: 22, mismatchCount: 4 },
  { id: 'CSA-2026-0851', client: 'TechStart LLC', uploadDate: '2026-06-25', uploadedBy: 'Marcus Reyes', extractionStatus: 'validating', validationStatus: 'not_started', crossValStatus: 'pending', confidence: 0.89, lastModified: '2026-06-25T09:15:00Z', assignedReviewer: 'Lena Ortiz', persona: 'pm', fieldCount: 20, mismatchCount: 2 },
  { id: 'CSA-2026-0839', client: 'Summit Services Inc', uploadDate: '2026-06-22', uploadedBy: 'Lena Ortiz', extractionStatus: 'approved', validationStatus: 'completed', crossValStatus: 'passed', confidence: 0.97, lastModified: '2026-06-23T11:30:00Z', assignedReviewer: 'Priya Nair', persona: 'ops', fieldCount: 22, mismatchCount: 0 },
  { id: 'CSA-2026-0842', client: 'Greenfield Partners', uploadDate: '2026-06-21', uploadedBy: 'Sam Cho', extractionStatus: 'approved', validationStatus: 'completed', crossValStatus: 'passed', confidence: 0.92, lastModified: '2026-06-22T14:20:00Z', assignedReviewer: 'Sam Cho', persona: 'ba', fieldCount: 21, mismatchCount: 1 },
  { id: 'CSA-2026-0845', client: 'Horizon Manufacturing', uploadDate: '2026-06-23', uploadedBy: 'Dana Whitfield', extractionStatus: 'flagged', validationStatus: 'needs_review', crossValStatus: 'mismatches_found', confidence: 0.71, lastModified: '2026-06-24T16:45:00Z', assignedReviewer: 'Dana Whitfield', persona: 'pm', fieldCount: 18, mismatchCount: 6 },
  { id: 'CSA-2026-0850', client: 'BrightPath Solutions', uploadDate: '2026-06-20', uploadedBy: 'Priya Nair', extractionStatus: 'approved', validationStatus: 'completed', crossValStatus: 'passed', confidence: 0.96, lastModified: '2026-06-21T10:00:00Z', assignedReviewer: 'Priya Nair', persona: 'reviewer', fieldCount: 22, mismatchCount: 0 },
  { id: 'CSA-2026-0848', client: 'Atlas Logistics', uploadDate: '2026-06-25', uploadedBy: 'Marcus Reyes', extractionStatus: 'validating', validationStatus: 'not_started', crossValStatus: 'pending', confidence: 0.87, lastModified: '2026-06-25T11:00:00Z', assignedReviewer: 'Sam Cho', persona: 'pm', fieldCount: 19, mismatchCount: 3 },
  { id: 'CSA-2026-0844', client: 'Pinnacle Staffing', uploadDate: '2026-06-19', uploadedBy: 'Sam Cho', extractionStatus: 'approved', validationStatus: 'completed', crossValStatus: 'passed', confidence: 0.95, lastModified: '2026-06-20T09:30:00Z', assignedReviewer: 'Sam Cho', persona: 'ba', fieldCount: 22, mismatchCount: 0 },
];

const FALLBACK_FIELDS: ExtractedFieldWithEdit[] = [
  { id: 'f01', field: 'Company Legal Name', value: 'Acme Corp', confidence: 0.99, citation: 'CSA p.1 §1.1', category: 'Client Information', validationStatus: 'valid', changeType: 'ai_generated', sourcePageNum: 1 },
  { id: 'f02', field: 'DBA / Trade Name', value: 'Acme Corporation', confidence: 0.97, citation: 'CSA p.1 §1.1', category: 'Client Information', validationStatus: 'valid', changeType: 'ai_generated', sourcePageNum: 1 },
  { id: 'f03', field: 'FEIN', value: '**-***4782', confidence: 0.98, citation: 'CSA p.1 §1.2', category: 'Client Information', validationStatus: 'valid', changeType: 'ai_generated', sourcePageNum: 1 },
  { id: 'f04', field: 'State of Incorporation', value: 'Delaware', confidence: 0.96, citation: 'CSA p.1 §1.3', category: 'Client Information', validationStatus: 'valid', changeType: 'system_matched', sourcePageNum: 1 },
  { id: 'f05', field: 'Primary Contact', value: 'Jordan Mitchell', confidence: 0.93, citation: 'CSA p.2 §1.5', category: 'Client Information', validationStatus: 'valid', changeType: 'ai_generated', sourcePageNum: 2 },
  { id: 'f06', field: 'Effective Date', value: '08/01/2026', confidence: 0.99, citation: 'CSA p.2 §2.1', category: 'Agreement', validationStatus: 'corrected', changeType: 'human_corrected', sourcePageNum: 2 },
  { id: 'f07', field: 'Initial Term', value: '12 months', confidence: 0.98, citation: 'CSA p.2 §2.1', category: 'Agreement', validationStatus: 'valid', changeType: 'ai_generated', sourcePageNum: 2 },
  { id: 'f08', field: 'Auto-Renewal', value: 'Yes — 12-month successive periods', confidence: 0.95, citation: 'CSA p.2 §2.2', category: 'Agreement', validationStatus: 'mismatch', changeType: 'flagged', sourcePageNum: 2 },
  { id: 'f09', field: 'Termination Notice', value: '90 days written notice', confidence: 0.94, citation: 'CSA p.2 §2.3', category: 'Agreement', validationStatus: 'mismatch', changeType: 'flagged', sourcePageNum: 2 },
  { id: 'f10', field: 'Admin Fee', value: '$45.00 / employee / month', confidence: 0.97, citation: 'CSA p.3 §3.1', category: 'Fees', validationStatus: 'corrected', changeType: 'human_corrected', sourcePageNum: 3 },
  { id: 'f11', field: 'Per-Employee Fee (Minimum)', value: '$3,500 / month', confidence: 0.91, citation: 'CSA p.3 §3.2', category: 'Fees', validationStatus: 'mismatch', changeType: 'flagged', sourcePageNum: 3 },
  { id: 'f12', field: 'Setup / Implementation Fee', value: '$2,500 one-time', confidence: 0.96, citation: 'CSA p.3 §3.3', category: 'Fees', validationStatus: 'valid', changeType: 'ai_generated', sourcePageNum: 3 },
  { id: 'f13', field: 'Billing Frequency', value: 'Monthly — Net 15', confidence: 0.98, citation: 'CSA p.3 §3.4', category: 'Fees', validationStatus: 'valid', changeType: 'system_matched', sourcePageNum: 3 },
  { id: 'f14', field: 'Payment Terms', value: 'ACH draft on 1st business day', confidence: 0.88, citation: 'CSA p.3 §3.5', category: 'Fees', validationStatus: 'pending', changeType: 'ai_generated', sourcePageNum: 3 },
  { id: 'f15', field: 'Services Included', value: 'Payroll, Benefits Admin, Workers Comp, HRIS, Time & Attendance', confidence: 0.92, citation: 'CSA p.4 §4.1', category: 'Services', validationStatus: 'mismatch', changeType: 'flagged', sourcePageNum: 4 },
  { id: 'f16', field: 'SUTA Coverage', value: 'Full — PEO assumes SUTA liability', confidence: 0.89, citation: 'CSA p.5 §5.1', category: 'Tax & Compliance', validationStatus: 'corrected', changeType: 'human_corrected', sourcePageNum: 5 },
  { id: 'f17', field: 'WC Code(s)', value: '8810, 8742, 5191', confidence: 0.93, citation: 'CSA p.5 §5.2', category: 'Tax & Compliance', validationStatus: 'valid', changeType: 'system_matched', sourcePageNum: 5 },
  { id: 'f18', field: 'WC Experience Mod', value: '0.87', confidence: 0.90, citation: 'CSA p.5 §5.3', category: 'Tax & Compliance', validationStatus: 'mismatch', changeType: 'flagged', sourcePageNum: 5 },
  { id: 'f19', field: 'Benefits Effective Date', value: 'First of month following 30-day waiting period', confidence: 0.86, citation: 'CSA p.6 §6.1', category: 'Benefits', validationStatus: 'valid', changeType: 'ai_generated', sourcePageNum: 6 },
  { id: 'f20', field: 'Medical Plans Offered', value: 'PPO, HDHP w/ HSA', confidence: 0.91, citation: 'CSA p.6 §6.2', category: 'Benefits', validationStatus: 'valid', changeType: 'ai_generated', sourcePageNum: 6 },
  { id: 'f21', field: 'Dental Plans Offered', value: 'DPPO, DHMO', confidence: 0.87, citation: 'CSA p.6 §6.3', category: 'Benefits', validationStatus: 'pending', changeType: 'ai_generated', sourcePageNum: 6 },
  { id: 'f22', field: 'Indemnification', value: 'Mutual indemnification with $2M cap', confidence: 0.78, citation: 'CSA p.8 §9.1', category: 'Legal', validationStatus: 'pending', changeType: 'ai_generated', sourcePageNum: 8 },
];

const FALLBACK_AUDIT_EVENTS: CSAAuditEvent[] = [
  { id: 'ae01', timestamp: '2026-06-24T09:15:00Z', actor: 'Dana Whitfield', persona: 'PM', actionType: 'upload', title: 'CSA Uploaded', details: 'Document uploaded for Acme Corp onboarding — 14-page PDF, 2.3 MB' },
  { id: 'ae02', timestamp: '2026-06-24T09:17:30Z', actor: 'AI Extraction Agent', persona: 'System', actionType: 'extraction', title: 'AI Extraction Completed', details: '22 fields extracted with average confidence 94% — 2 fields below threshold' },
  { id: 'ae03', timestamp: '2026-06-24T09:18:45Z', actor: 'Validation Agent', persona: 'System', actionType: 'validation', title: 'Cross-Validation Executed', details: '8 mismatches found across Salesforce, ClientSpace, and PrismHR' },
  { id: 'ae04', timestamp: '2026-06-24T10:30:00Z', actor: 'Dana Whitfield', persona: 'PM', actionType: 'field_edit', title: 'Admin Fee Modified', details: 'Matched CSA value to source document', fieldName: 'Admin Fee', previousValue: '$42.00/ee/mo', newValue: '$45.00/ee/mo' },
  { id: 'ae05', timestamp: '2026-06-24T11:15:00Z', actor: 'Sam Cho', persona: 'BA', actionType: 'field_edit', title: 'Effective Date Modified', details: 'Corrected per CSA §2.1', fieldName: 'Effective Date', previousValue: '07/01/2026', newValue: '08/01/2026' },
  { id: 'ae06', timestamp: '2026-06-24T14:20:00Z', actor: 'Dana Whitfield', persona: 'PM', actionType: 'flag', title: 'SUTA Coverage Flagged', details: 'Needs BA verification — CSA says "Full", system says "Standard"' },
  { id: 'ae07', timestamp: '2026-06-24T16:30:00Z', actor: 'Sam Cho', persona: 'BA', actionType: 'validation', title: 'SUTA Coverage Verified', details: 'Confirmed Full coverage per client agreement' },
  { id: 'ae08', timestamp: '2026-06-25T09:00:00Z', actor: 'Priya Nair', persona: 'Reviewer', actionType: 'approval', title: 'Validation Approved', details: 'All fields validated — extraction approved for system sync' },
  { id: 'ae09', timestamp: '2026-06-25T09:01:30Z', actor: 'System', persona: 'System', actionType: 'sync', title: 'ClientSpace Sync Initiated', details: 'Pushing approved field values to ClientSpace case record' },
  { id: 'ae10', timestamp: '2026-06-25T09:02:15Z', actor: 'System', persona: 'System', actionType: 'sync', title: 'ClientSpace Case Created', details: 'Case #CS-2026-0847 created — 22 fields written, 0 errors' },
];

/* ── Status color maps ── */

const EXTRACTION_STATUS_META: Record<string, { label: string; fg: string; bg: string }> = {
  extracting: { label: 'Extracting', fg: '#0074B8', bg: '#E7F1FA' },
  validating: { label: 'Validating', fg: '#B0690A', bg: '#FBF0DD' },
  approved: { label: 'Approved', fg: '#1A7A4A', bg: '#E4F2EA' },
  flagged: { label: 'Flagged', fg: '#C60C30', bg: '#FDECEF' },
};

const VALIDATION_STATUS_META: Record<string, { label: string; fg: string; bg: string }> = {
  not_started: { label: 'Not Started', fg: '#98A1A8', bg: '#F1F3F5' },
  in_progress: { label: 'In Progress', fg: '#0074B8', bg: '#E7F1FA' },
  completed: { label: 'Completed', fg: '#1A7A4A', bg: '#E4F2EA' },
  needs_review: { label: 'Needs Review', fg: '#C60C30', bg: '#FDECEF' },
};

const CROSSVAL_STATUS_META: Record<string, { label: string; fg: string; bg: string }> = {
  pending: { label: 'Pending', fg: '#98A1A8', bg: '#F1F3F5' },
  passed: { label: 'Passed', fg: '#1A7A4A', bg: '#E4F2EA' },
  mismatches_found: { label: 'Mismatches', fg: '#B0690A', bg: '#FBF0DD' },
  failed: { label: 'Failed', fg: '#C60C30', bg: '#FDECEF' },
};

const FIELD_VALIDATION_META: Record<string, { label: string; fg: string; bg: string }> = {
  valid: { label: 'Valid', fg: '#1A7A4A', bg: '#E4F2EA' },
  mismatch: { label: 'Mismatch', fg: '#B0690A', bg: '#FBF0DD' },
  pending: { label: 'Pending', fg: '#98A1A8', bg: '#F1F3F5' },
  corrected: { label: 'Corrected', fg: '#0074B8', bg: '#E7F1FA' },
};

const CHANGE_TYPE_META: Record<string, { label: string; fg: string; bg: string }> = {
  ai_generated: { label: 'AI Generated', fg: '#5A45C7', bg: '#F8F6FE' },
  human_corrected: { label: 'Human Corrected', fg: '#0074B8', bg: '#E7F1FA' },
  system_matched: { label: 'System Matched', fg: '#1A7A4A', bg: '#E4F2EA' },
  flagged: { label: 'Flagged', fg: '#C60C30', bg: '#FDECEF' },
};

const AUDIT_TYPE_META: Record<string, { icon: string; fg: string; bg: string }> = {
  upload: { icon: 'fa-cloud-arrow-up', fg: '#0074B8', bg: '#E7F1FA' },
  extraction: { icon: 'fa-microchip', fg: '#5A45C7', bg: '#F8F6FE' },
  validation: { icon: 'fa-code-compare', fg: '#B0690A', bg: '#FBF0DD' },
  field_edit: { icon: 'fa-pen-to-square', fg: '#0074B8', bg: '#E7F1FA' },
  approval: { icon: 'fa-stamp', fg: '#1A7A4A', bg: '#E4F2EA' },
  sync: { icon: 'fa-arrows-rotate', fg: '#0074B8', bg: '#E7F1FA' },
  system: { icon: 'fa-server', fg: '#5B6770', bg: '#F1F3F5' },
  flag: { icon: 'fa-flag', fg: '#C60C30', bg: '#FDECEF' },
};

const PERSONA_META: Record<string, { fg: string; bg: string }> = {
  PM: { fg: '#0074B8', bg: '#E7F1FA' },
  BA: { fg: '#5A45C7', bg: '#F8F6FE' },
  Reviewer: { fg: '#1A7A4A', bg: '#E4F2EA' },
  System: { fg: '#5B6770', bg: '#F1F3F5' },
  Ops: { fg: '#B0690A', bg: '#FBF0DD' },
};

/* ── Field category grouping — aligned with ClientSpace Onboarding Handoff ── */
const FIELD_CATEGORIES = ['General Information', 'Contract & Dates', 'Payroll', 'Services & Coverage', 'Time & Labor', 'PTO', 'Benefits', 'Retirement / 401k', 'Fee Structure', 'Company Information'];

const CATEGORY_ICONS: Record<string, string> = {
  'General Information': 'fa-building',
  'Contract & Dates': 'fa-file-contract',
  'Payroll': 'fa-money-check-dollar',
  'Services & Coverage': 'fa-concierge-bell',
  'Time & Labor': 'fa-clock',
  'PTO': 'fa-calendar-check',
  'Benefits': 'fa-heart-pulse',
  'Retirement / 401k': 'fa-piggy-bank',
  'Fee Structure': 'fa-dollar-sign',
  'Company Information': 'fa-id-card',
};

/* ── API status mapping ── */

function mapExtractionStatus(apiStatus: string): 'extracting' | 'validating' | 'approved' | 'flagged' {
  switch (apiStatus) {
    case 'processing': return 'extracting';
    case 'needs_review': return 'validating';
    case 'approved': return 'approved';
    case 'flagged': return 'flagged';
    default: return 'extracting';
  }
}

/* ── ClientSpace Handoff Data — for mismatch flagging ── */
const CLIENTSPACE_VALUES: Record<string, string> = {
  'Organization Name': 'Tsiro Real Estate Management, LLC',
  'Contract Type': 'PEO - Full Service',
  'Number of Employees': '35',
  'Effective Date': '08/01/2026',
  'Contract Term': '2 Years',
  'SUTA Coverage': 'Standard',
  'Admin Fee': '$120.00 PEPM',
  'PEPM Fee': '$120.00 PEPM',
  'Billing Frequency': 'Bi-weekly',
  'WC Codes': 'CT 5606, CT 9012',
  'Services Included': 'Payroll, Benefits Admin, WC',
  'Plan Sponsors': 'G&A Partners',
  'Pay Frequency': 'Bi-weekly',
  'Offer Benefits': 'Yes',
  'Offer Retirement Plan': 'Yes',
  'Ownership Structure': 'LLC',
  'Implementation Fee': '$1,500.00',
};

function getClientSpaceMismatch(fieldName: string, extractedValue: string): { csValue: string; isMismatch: boolean } | null {
  const csValue = CLIENTSPACE_VALUES[fieldName];
  if (!csValue) return null;
  if (extractedValue === 'Not available in document') return null;
  const csNorm = csValue.toLowerCase().replace(/[^a-z0-9]/g, '');
  const exNorm = extractedValue.toLowerCase().replace(/[^a-z0-9]/g, '');
  const isMismatch = !exNorm.includes(csNorm) && !csNorm.includes(exNorm);
  return { csValue, isMismatch };
}

/* ── Utility ── */

function relativeTime(dateStr: string): string {
  const now = new Date('2026-06-25T17:00:00Z'); // Demo fixed time
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

/* ── Inline badge component ── */

function Badge({ label, fg, bg, style }: { label: string; fg: string; bg: string; style?: React.CSSProperties }) {
  return (
    <span style={{
      fontSize: 'var(--type-badge)', fontWeight: 600, borderRadius: 6,
      padding: '2px 8px', color: fg, background: bg,
      display: 'inline-flex', alignItems: 'center', height: 22,
      whiteSpace: 'nowrap', lineHeight: 1,
      ...style,
    }}>{label}</span>
  );
}

/* ================================================================
   Main Dashboard Page (wrapped in Suspense for useSearchParams)
   ================================================================ */

function OnboardingDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [drawerCsaId, setDrawerCsaId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'validation' | 'audit'>('validation');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Field editing state
  const [fieldEdits, setFieldEdits] = useState<Record<string, string>>({});
  const [fieldNotes, setFieldNotes] = useState<Record<string, string>>({});
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfSearchText, setPdfSearchText] = useState('');
  const [pdfZoom, setPdfZoom] = useState(100);
  const [drawerUnlocked, setDrawerUnlocked] = useState(false);
  const [globalNote, setGlobalNote] = useState('');
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [caseCreated, setCaseCreated] = useState(false);

  // Drawer animation ref
  const drawerAnimRef = useRef<number | null>(null);

  // Live data from API
  const [documents, setDocuments] = useState<CSADocument[]>(FALLBACK_DOCS);
  const [isLiveData, setIsLiveData] = useState(false);

  // Fetch documents from API on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/csa/documents')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.documents?.length > 0) {
          const mapped = data.documents.map((d: any) => ({
            id: d.id,
            client: d.client_name,
            uploadDate: d.upload_date,
            uploadedBy: d.uploaded_by,
            extractionStatus: mapExtractionStatus(d.extraction_status),
            validationStatus: d.validation_status,
            crossValStatus: d.cross_val_status,
            confidence: d.confidence,
            lastModified: d.last_modified,
            assignedReviewer: d.assigned_reviewer,
            persona: d.persona,
            fieldCount: d.field_count,
            mismatchCount: d.mismatch_count,
            filename: d.filename,
          }));
          setDocuments(mapped);
          setIsLiveData(true);
        }
      })
      .catch(() => { /* use fallback */ });
  }, []);

  // Auto-refresh polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:8000/api/csa/documents')
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (data.documents?.length > 0) {
            const mapped = data.documents.map((d: any) => ({
              id: d.id,
              client: d.client_name,
              uploadDate: d.upload_date,
              uploadedBy: d.uploaded_by,
              extractionStatus: mapExtractionStatus(d.extraction_status),
              validationStatus: d.validation_status,
              crossValStatus: d.cross_val_status,
              confidence: d.confidence,
              lastModified: d.last_modified,
              assignedReviewer: d.assigned_reviewer,
              persona: d.persona,
              fieldCount: d.field_count,
              mismatchCount: d.mismatch_count,
              filename: d.filename,
            }));
            setDocuments(mapped);
            setIsLiveData(true);
          }
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const csaDocs = [...documents].sort((a, b) => {
    if (a.extractionStatus === 'extracting' && b.extractionStatus !== 'extracting') return -1;
    if (a.extractionStatus !== 'extracting' && b.extractionStatus === 'extracting') return 1;
    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
  });
  const [csaFields, setCsaFields] = useState<ExtractedFieldWithEdit[]>(FALLBACK_FIELDS);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const csaAuditEvents = FALLBACK_AUDIT_EVENTS;

  // Fetch real extracted fields when drawer opens
  useEffect(() => {
    if (!drawerCsaId) return;
    setFieldsLoading(true);
    fetch(`http://localhost:8000/api/csa/${drawerCsaId}/fields`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.extracted_fields?.length > 0) {
          const mapped: ExtractedFieldWithEdit[] = data.extracted_fields.map((f: any, idx: number) => ({
            id: `live-${idx}`,
            field: f.field_name,
            value: f.field_value,
            confidence: f.confidence,
            citation: f.source_citation,
            category: f.category || 'Other',
            validationStatus: f.requires_review ? 'pending' : 'valid',
            changeType: f.is_masked ? 'ai_generated' : 'ai_generated',
            sourcePageNum: f.page_number || (idx + 1),
            sourceText: f.source_text || '',
            boundingBox: f.bounding_box || undefined,
          }));
          setCsaFields(mapped);
        }
      })
      .catch(() => setCsaFields(FALLBACK_FIELDS))
      .finally(() => setFieldsLoading(false));
  }, [drawerCsaId]);

  /* Read URL search params on mount */
  useEffect(() => {
    const csaParam = searchParams.get('csa');
    const drawerParam = searchParams.get('drawer');
    if (csaParam) {
      const doc = csaDocs.find(d => d.id === csaParam);
      if (doc) {
        setDrawerCsaId(csaParam);
        setDrawerTab((drawerParam === 'audit' ? 'audit' : 'validation'));
        // Small delay for animation
        requestAnimationFrame(() => setDrawerVisible(true));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  /* Drawer open/close with URL sync */
  const openDrawer = useCallback((csaId: string, tab: 'validation' | 'audit' = 'validation') => {
    setDrawerCsaId(csaId);
    setDrawerTab(tab);
    setSelectedFieldId(null);
    setFieldEdits({});
    setFieldNotes({});
    setExpandedNotes({});
    setPdfPage(1);
    setPdfZoom(100);
    setDrawerUnlocked(false);
    setShowUnlockConfirm(false);
    setGlobalNote('');
    requestAnimationFrame(() => setDrawerVisible(true));
    window.history.replaceState(null, '', `/onboarding?csa=${csaId}&drawer=${tab}`);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setTimeout(() => {
      setDrawerCsaId(null);
      setSelectedFieldId(null);
    }, 250);
    window.history.replaceState(null, '', '/onboarding');
  }, []);

  const switchDrawerTab = useCallback((tab: 'validation' | 'audit') => {
    setDrawerTab(tab);
    if (drawerCsaId) {
      window.history.replaceState(null, '', `/onboarding?csa=${drawerCsaId}&drawer=${tab}`);
    }
  }, [drawerCsaId]);

  const copyShareLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setToastMessage('Link copied to clipboard');
    }).catch(() => {
      setToastMessage('Failed to copy link');
    });
  }, []);

  const editField = useCallback((fieldId: string, value: string) => {
    setFieldEdits(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const updateFieldNote = useCallback((fieldId: string, note: string) => {
    setFieldNotes(prev => ({ ...prev, [fieldId]: note }));
  }, []);

  const activeDoc = drawerCsaId ? csaDocs.find(d => d.id === drawerCsaId) : null;

  /* Group fields by category */
  // Derive categories from actual fields, preserving FIELD_CATEGORIES order where present
  const actualCategories = Array.from(new Set(csaFields.map(f => f.category)));
  const orderedCategories = [
    ...FIELD_CATEGORIES.filter(c => actualCategories.includes(c)),
    ...actualCategories.filter(c => !FIELD_CATEGORIES.includes(c)),
  ];
  const fieldsByCategory = orderedCategories.reduce((acc, cat) => {
    const fields = csaFields.filter(f => f.category === cat);
    if (fields.length > 0) acc[cat] = fields;
    return acc;
  }, {} as Record<string, ExtractedFieldWithEdit[]>);

  /* Group audit events by date */
  const auditByDate = csaAuditEvents.reduce((acc, evt) => {
    const dateKey = new Date(evt.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(evt);
    return acc;
  }, {} as Record<string, CSAAuditEvent[]>);

  if (loading) {
    return (
      <div style={{ padding: '24px 24px 32px' }}>
        <div style={{ height: 32, width: 320, background: '#EEF1F4', borderRadius: 8, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 100, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ height: 400, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 24px 32px', minWidth: 900 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1B2D3D', color: '#fff', padding: '10px 20px', borderRadius: 8,
          fontSize: 'var(--type-body-sm)', fontWeight: 600, zIndex: 2000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'var(--animate-toast-in)',
        }}>
          <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
          {toastMessage}
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <i className="fa-solid fa-file-invoice" style={{ fontSize: 'var(--type-section-title)', color: '#2A8F60' }} />
            <h1 style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              AI-Assisted CSA Extraction
            </h1>
          </div>
          <p style={{ fontSize: 'var(--type-body)', color: 'var(--text-secondary)', margin: 0 }}>
            AI-assisted Client Service Agreement extraction, cross-validation, and onboarding data preparation.
          </p>
        </div>
        <Link
          href="/onboarding/extract"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 8, border: 'none',
            background: '#2A8F60', color: '#fff',
            fontSize: 'var(--type-body-sm)', fontWeight: 600,
            textDecoration: 'none', cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(42,143,96,0.2)',
            transition: 'background 0.12s ease',
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 13 }} />
          Upload CSA
        </Link>
      </div>

      {/* Metric tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {onboardingMetrics.map((m) => (
          <div key={m.label} style={{
            background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 12,
            padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: m.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <i className={`fa-solid ${m.icon}`} style={{ fontSize: 16, color: m.color }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 4 }}>
                {m.value}
              </div>
              {m.delta && (
                <div style={{
                  fontSize: 'var(--type-badge)', fontWeight: 600,
                  color: m.deltaUp ? '#1A7A4A' : '#B0690A',
                }}>
                  {m.deltaUp ? '▲' : '▼'} {m.delta}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full-width CSA table */}
      <div style={{
        background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 12,
        boxShadow: 'var(--shadow-xs)', overflow: 'hidden',
      }}>
        {isLiveData && (
          <div style={{ padding: '6px 18px', background: '#E7F1FA', borderBottom: '1px solid #D0E3F1', fontSize: 11, color: '#0074B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-database" style={{ fontSize: 10 }} />
            Live data from extraction database — auto-refreshing
          </div>
        )}
        <div style={{
          padding: '16px 18px', borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: 'var(--text-primary)' }}>
            CSA Documents
          </div>
          <span style={{ fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            {csaDocs.length} documents
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                {['CSA ID', 'Client', 'Upload Date', 'Uploaded By', 'Extraction', 'Validation', 'Confidence', 'Cross-Validation', 'Last Modified', 'Reviewer', 'Actions'].map((h) => (
                  <th key={h} style={{
                    fontSize: 'var(--type-table-header)', fontWeight: 600, color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csaDocs.map((doc) => {
                const exMeta = EXTRACTION_STATUS_META[doc.extractionStatus] || EXTRACTION_STATUS_META.extracting;
                const valMeta = VALIDATION_STATUS_META[doc.validationStatus] || VALIDATION_STATUS_META.not_started;
                const cvMeta = CROSSVAL_STATUS_META[doc.crossValStatus] || CROSSVAL_STATUS_META.pending;
                const isHovered = hoveredRow === doc.id;
                const isProcessing = doc.extractionStatus === 'extracting';

                return (
                  <tr
                    key={doc.id}
                    onMouseEnter={() => setHoveredRow(doc.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid var(--border-secondary)',
                      backgroundImage: isProcessing
                        ? 'linear-gradient(90deg, #F3EAFF 0%, #EDE5FF 40%, #F9F5FF 70%, #F3EAFF 100%)'
                        : undefined,
                      backgroundSize: isProcessing ? '200% 100%' : undefined,
                      backgroundColor: !isProcessing ? (isHovered ? 'var(--bg-secondary)' : 'transparent') : undefined,
                      animation: isProcessing ? 'shimmer 2.5s ease-in-out infinite' : undefined,
                      transition: 'background-color 0.08s ease',
                      position: 'relative' as const,
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      {(() => {
                        const hasRealFile = doc.filename && doc.filename !== doc.id + '.pdf' && !doc.filename.startsWith('CSA-');
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-file-pdf" style={{ fontSize: hasRealFile ? 18 : 13, color: isProcessing ? '#5A45C7' : hasRealFile ? '#C60C30' : '#98A1A8', flexShrink: 0 }} />
                            <div>
                              {hasRealFile ? (
                                <>
                                  <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: isProcessing ? '#5A45C7' : 'var(--text-primary)' }}>
                                    {doc.filename}
                                  </div>
                                  <div style={{ fontSize: 'var(--type-badge)', fontWeight: 500, color: '#98A1A8', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                                    {doc.id.length > 20 ? doc.id.slice(0, 8) + '…' : doc.id}
                                  </div>
                                </>
                              ) : (
                                <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}>
                                  {doc.id}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {doc.client}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                      {formatDate(doc.uploadDate)}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                      {doc.uploadedBy}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge label={exMeta.label} fg={exMeta.fg} bg={exMeta.bg} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge label={valMeta.label} fg={valMeta.fg} bg={valMeta.bg} />
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--type-body-sm)', fontWeight: 600 }}>
                      {doc.confidence > 0 ? (
                        <span style={{ color: doc.confidence >= 0.9 ? '#1A7A4A' : doc.confidence >= 0.75 ? '#B0690A' : '#C60C30' }}>
                          {(doc.confidence * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>--</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge label={cvMeta.label} fg={cvMeta.fg} bg={cvMeta.bg} />
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
                      {relativeTime(doc.lastModified)}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                      {doc.assignedReviewer}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {doc.extractionStatus === 'extracting' ? (
                        <div
                          title="Extraction in progress..."
                          style={{
                            width: 30, height: 30, borderRadius: 6,
                            border: '1px solid var(--border-primary)',
                            background: '#F1F3F5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'not-allowed',
                          }}
                        >
                          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 14, color: '#0074B8' }} />
                        </div>
                      ) : (
                        <button
                          onClick={() => openDrawer(doc.id, 'validation')}
                          title="View details"
                          style={{
                            width: 30, height: 30, borderRadius: 6,
                            border: '1px solid var(--border-primary)',
                            background: isHovered ? '#E7F1FA' : '#fff',
                            color: isHovered ? '#0074B8' : 'var(--text-secondary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.12s ease',
                            fontSize: 13,
                          }}
                        >
                          <i className="fa-solid fa-eye" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================
         Drawer Backdrop + Panel
         ================================================================ */}
      {drawerCsaId && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(16,32,45,0.35)',
              zIndex: 999,
              opacity: drawerVisible ? 1 : 0,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
            }}
          />

          {/* Drawer panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: '85vw', maxWidth: 1600, minWidth: 900,
            background: '#fff',
            zIndex: 1000,
            boxShadow: '-8px 0 30px rgba(16,32,45,0.08)',
            display: 'flex', flexDirection: 'column',
            transform: drawerVisible ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
          }}>
            {/* Drawer Header */}
            {activeDoc && (
              <div style={{
                padding: '16px 24px', borderBottom: '1px solid var(--border-primary)',
                background: '#FAFBFC', flexShrink: 0,
              }}>
                {/* Top row: CSA ID, badges, actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {activeDoc.id}
                    </span>
                    <Badge label={EXTRACTION_STATUS_META[activeDoc.extractionStatus]?.label || ''} fg={EXTRACTION_STATUS_META[activeDoc.extractionStatus]?.fg || ''} bg={EXTRACTION_STATUS_META[activeDoc.extractionStatus]?.bg || ''} />
                    <Badge label={VALIDATION_STATUS_META[activeDoc.validationStatus]?.label || ''} fg={VALIDATION_STATUS_META[activeDoc.validationStatus]?.fg || ''} bg={VALIDATION_STATUS_META[activeDoc.validationStatus]?.bg || ''} />
                    {activeDoc.confidence > 0 && (
                      <Badge
                        label={`${(activeDoc.confidence * 100).toFixed(1)}% confidence`}
                        fg={activeDoc.confidence >= 0.9 ? '#1A7A4A' : activeDoc.confidence >= 0.75 ? '#B0690A' : '#C60C30'}
                        bg={activeDoc.confidence >= 0.9 ? '#E4F2EA' : activeDoc.confidence >= 0.75 ? '#FBF0DD' : '#FDECEF'}
                      />
                    )}
                    <span style={{ fontSize: 'var(--type-caption)', color: 'var(--text-tertiary)' }}>
                      <i className="fa-solid fa-user" style={{ marginRight: 4 }} />
                      {activeDoc.assignedReviewer}
                    </span>
                    <span style={{ fontSize: 'var(--type-caption)', color: 'var(--text-tertiary)' }}>
                      <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
                      {relativeTime(activeDoc.lastModified)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={copyShareLink}
                      title="Copy share link"
                      style={{
                        width: 32, height: 32, borderRadius: 6,
                        border: '1px solid var(--border-primary)', background: '#fff',
                        color: 'var(--text-secondary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, transition: 'all 0.1s ease',
                      }}
                    >
                      <i className="fa-solid fa-share-nodes" />
                    </button>
                    <button
                      onClick={closeDrawer}
                      title="Close drawer"
                      style={{
                        width: 32, height: 32, borderRadius: 6,
                        border: '1px solid var(--border-primary)', background: '#fff',
                        color: 'var(--text-secondary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, transition: 'all 0.1s ease',
                      }}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                </div>

                {/* Action buttons row — locked for approved CSAs */}
                {activeDoc.extractionStatus === 'approved' && !drawerUnlocked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 16px', borderRadius: 8,
                      background: '#F1F3F5', border: '1px solid #E5E7EB',
                      fontSize: 'var(--type-body-sm)', color: '#5B6770', fontWeight: 600,
                    }}>
                      <i className="fa-solid fa-lock" style={{ fontSize: 12, color: '#1A7A4A' }} />
                      Approved & Synced to ClientSpace
                    </div>
                    <button
                      onClick={() => setShowUnlockConfirm(true)}
                      style={{
                        padding: '7px 14px', borderRadius: 6,
                        border: '1px solid #D0D5DD', background: '#fff',
                        color: '#374151', fontSize: 'var(--type-body-sm)', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.1s ease',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <i className="fa-solid fa-lock-open" style={{ fontSize: 11 }} />
                      Unlock for Editing
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button style={{
                      padding: '7px 14px', borderRadius: 6,
                      border: '1px solid var(--border-primary)', background: '#fff',
                      color: 'var(--text-primary)', fontSize: 'var(--type-body-sm)', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.1s ease',
                    }}>
                      <i className="fa-regular fa-floppy-disk" style={{ marginRight: 6, fontSize: 12 }} />
                      Save Draft
                    </button>
                    <button
                      onClick={() => {
                        setCaseCreated(true);
                        setToastMessage('ClientSpace case created — assigned to Sales team');
                      }}
                      style={{
                        padding: '7px 14px', borderRadius: 6,
                        border: 'none', background: caseCreated ? '#5B6770' : '#1A7A4A',
                        color: '#fff', fontSize: 'var(--type-body-sm)', fontWeight: 600,
                        cursor: caseCreated ? 'default' : 'pointer', transition: 'all 0.1s ease',
                        boxShadow: caseCreated ? 'none' : '0 2px 6px rgba(26,122,74,0.2)',
                      }}>
                      <i className={`fa-solid ${caseCreated ? 'fa-circle-check' : 'fa-check'}`} style={{ marginRight: 6, fontSize: 12 }} />
                      {caseCreated ? 'Approved & Case Created' : 'Approve'}
                    </button>
                    <button style={{
                      padding: '7px 14px', borderRadius: 6,
                      border: 'none', background: '#B0690A',
                      color: '#fff', fontSize: 'var(--type-body-sm)', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.1s ease',
                    }}>
                      <i className="fa-solid fa-rotate" style={{ marginRight: 6, fontSize: 12 }} />
                      Re-run Extraction
                    </button>
                    <button style={{
                      padding: '7px 14px', borderRadius: 6,
                      border: 'none', background: '#C60C30',
                      color: '#fff', fontSize: 'var(--type-body-sm)', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.1s ease',
                    }}>
                      <i className="fa-solid fa-ban" style={{ marginRight: 6, fontSize: 12 }} />
                      Reject
                    </button>
                  </div>
                )}

                {/* Case creation notification */}
                {caseCreated && (
                  <div style={{
                    marginTop: 10, padding: '12px 16px', borderRadius: 10,
                    background: '#E4F2EA', border: '1px solid #B7DECA',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1A7A4A15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fa-solid fa-briefcase" style={{ fontSize: 16, color: '#1A7A4A' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: '#1A4A2E', marginBottom: 2 }}>
                        ClientSpace Case Auto-Created
                      </div>
                      <div style={{ fontSize: 'var(--type-badge)', color: '#2D6B47', lineHeight: 1.5 }}>
                        Case <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>CS-2026-{activeDoc?.id.split('-').pop()}</span> created and assigned to <strong>Sales Team</strong> — Dana Whitfield (PM), Sam Cho (PA). 22 fields synced, onboarding tasks generated.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#1A7A4A', background: '#D1EAD8', padding: '2px 8px', borderRadius: 4 }}>
                        <i className="fa-solid fa-check" style={{ marginRight: 3, fontSize: 8 }} />
                        Synced
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#0074B8', background: '#E7F1FA', padding: '2px 8px', borderRadius: 4 }}>
                        <i className="fa-solid fa-user-plus" style={{ marginRight: 3, fontSize: 8 }} />
                        Assigned
                      </span>
                    </div>
                  </div>
                )}

                {/* Unlock confirmation dialog */}
                {showUnlockConfirm && (
                  <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      background: '#fff', borderRadius: 14, padding: 0,
                      width: 480, maxWidth: '90vw',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        padding: '20px 24px 16px',
                        borderBottom: '1px solid #E5E7EB',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: '#FEF3E2', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 18, color: '#B0690A' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--type-body-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Unlock Approved Extraction
                          </div>
                          <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-tertiary)' }}>
                            {activeDoc.id}
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: 'var(--type-body)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
                          This CSA extraction has been <strong style={{ color: 'var(--text-primary)' }}>approved and synced to ClientSpace</strong>. Unlocking it will allow modifications that may affect downstream records.
                        </p>
                        <div style={{
                          padding: '12px 14px', borderRadius: 8,
                          background: '#FEF3E2', border: '1px solid #F5D5A0',
                          fontSize: 'var(--type-body-sm)', color: '#7A4800', lineHeight: 1.6,
                        }}>
                          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }} />
                          <strong>Warning:</strong> Changes will apply modifications to the downstream ClientSpace entries including client records, onboarding cases, and task assignments. Are you sure you want to unlock and reprocess this CSA?
                        </div>
                      </div>
                      <div style={{
                        padding: '14px 24px', background: '#FAFBFC',
                        borderTop: '1px solid #E5E7EB',
                        display: 'flex', justifyContent: 'flex-end', gap: 8,
                      }}>
                        <button
                          onClick={() => setShowUnlockConfirm(false)}
                          style={{
                            padding: '8px 18px', borderRadius: 7,
                            border: '1px solid #D0D5DD', background: '#fff',
                            color: '#374151', fontSize: 'var(--type-body-sm)', fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => { setDrawerUnlocked(true); setShowUnlockConfirm(false); }}
                          style={{
                            padding: '8px 18px', borderRadius: 7,
                            border: 'none', background: '#B0690A',
                            color: '#fff', fontSize: 'var(--type-body-sm)', fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(176,105,10,0.3)',
                          }}
                        >
                          <i className="fa-solid fa-lock-open" style={{ marginRight: 6, fontSize: 11 }} />
                          Unlock & Allow Editing
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Drawer Tabs */}
            <div style={{
              display: 'flex', borderBottom: '1px solid var(--border-primary)',
              background: '#fff', flexShrink: 0,
            }}>
              {([
                { key: 'validation' as const, label: 'Validation & Review', icon: 'fa-list-check' },
                { key: 'audit' as const, label: 'Audit & Logs', icon: 'fa-clock-rotate-left' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => switchDrawerTab(tab.key)}
                  style={{
                    padding: '12px 20px',
                    fontSize: 'var(--type-body-sm)', fontWeight: 600,
                    color: drawerTab === tab.key ? '#0074B8' : 'var(--text-secondary)',
                    background: 'transparent',
                    border: 'none', borderBottom: drawerTab === tab.key ? '2px solid #0074B8' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <i className={`fa-solid ${tab.icon}`} style={{ fontSize: 12 }} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {drawerTab === 'validation' ? (
                /* ── Validation & Review: Two-panel split ── */
                <div style={{ display: 'flex', height: '100%' }}>
                  {/* Left panel: Fields */}
                  <div style={{
                    width: '45%', borderRight: '1px solid var(--border-primary)',
                    overflowY: 'auto', padding: '16px 20px',
                  }}>
                    {orderedCategories.map((cat) => {
                      const fields = fieldsByCategory[cat];
                      if (!fields || fields.length === 0) return null;
                      const catIcon = CATEGORY_ICONS[cat] || 'fa-folder';

                      return (
                        <div key={cat} style={{ marginBottom: 24 }}>
                          {/* Category header */}
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            marginBottom: 12, paddingBottom: 8,
                            borderBottom: '1px solid var(--border-secondary)',
                          }}>
                            <i className={`fa-solid ${catIcon}`} style={{ fontSize: 12, color: 'var(--text-tertiary)' }} />
                            <span style={{
                              fontSize: 'var(--type-table-header)', fontWeight: 700,
                              color: 'var(--text-secondary)', textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}>
                              {cat}
                            </span>
                            <span style={{
                              fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)', fontWeight: 500,
                            }}>
                              ({fields.length})
                            </span>
                          </div>

                          {/* Fields */}
                          {fields.map((field) => {
                            const isSelected = selectedFieldId === field.id;
                            const csMismatch = getClientSpaceMismatch(field.field, field.value);

                            return (
                              <div
                                key={field.id}
                                onClick={() => {
                                  if (field.value === 'Not available in document') return;
                                  setSelectedFieldId(field.id);
                                  setPdfPage(field.sourcePageNum);
                                  setPdfSearchText(field.value || '');
                                }}
                                style={{
                                  padding: '8px 10px', marginBottom: 4, borderRadius: 6,
                                  border: isSelected && field.value !== 'Not available in document'
                                    ? '1.5px solid #0074B8'
                                    : csMismatch?.isMismatch
                                      ? '1px solid #F5C6CB'
                                      : '1px solid transparent',
                                  background: isSelected && field.value !== 'Not available in document'
                                    ? '#F0F7FF'
                                    : csMismatch?.isMismatch
                                      ? '#FFF8F8'
                                      : 'transparent',
                                  cursor: 'pointer',
                                  transition: 'all 0.08s ease',
                                }}
                              >
                                {/* Field label + mismatch flag */}
                                <div style={{
                                  fontSize: 'var(--type-badge)', fontWeight: 600,
                                  color: csMismatch?.isMismatch ? '#C60C30' : 'var(--text-tertiary)', textTransform: 'uppercase',
                                  letterSpacing: '0.04em', marginBottom: 3,
                                  display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                  {field.field}
                                  {csMismatch?.isMismatch && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, color: '#C60C30', background: '#FDECEF', padding: '1px 6px', borderRadius: 3, border: '1px solid #F5C6CB', textTransform: 'none' }}>
                                      <i className="fa-solid fa-flag" style={{ fontSize: 8 }} />
                                      CS Mismatch
                                    </span>
                                  )}
                                </div>

                                {/* ClientSpace value comparison — shown only on mismatch */}
                                {csMismatch?.isMismatch && (
                                  <div style={{ fontSize: 9, color: '#8a000a', marginBottom: 4, padding: '3px 8px', borderRadius: 4, background: '#FDECEF', lineHeight: 1.4 }}>
                                    <span style={{ fontWeight: 700 }}>ClientSpace:</span> <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{csMismatch.csValue}</span>
                                    <span style={{ margin: '0 4px', color: '#C60C30' }}>→</span>
                                    <span style={{ fontWeight: 700 }}>CSA:</span> {field.value.slice(0, 40)}
                                  </div>
                                )}

                                {/* Value + confidence + page — list rendering for comma-separated fields */}
                                {(() => {
                                  const LIST_FIELDS = ['Services Included', 'Offer Benefits', 'WC Codes'];
                                  const displayValue = fieldEdits[field.id] !== undefined ? fieldEdits[field.id] : field.value;
                                  const isListField = LIST_FIELDS.includes(field.field);
                                  const listItems = isListField && displayValue && displayValue !== 'Not available in document'
                                    ? displayValue.split(',').map((s: string) => s.trim()).filter(Boolean)
                                    : null;

                                  if (listItems && listItems.length > 1) {
                                    return (
                                      <div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                                          {listItems.map((item: string, idx: number) => (
                                            <span key={idx} style={{
                                              fontSize: 'var(--type-badge)', fontWeight: 600,
                                              color: '#1B2D3D', background: '#E7F1FA',
                                              border: '1px solid #D0E3F1',
                                              padding: '3px 10px', borderRadius: 6,
                                              display: 'inline-flex', alignItems: 'center', gap: 4,
                                            }}>
                                              <i className="fa-solid fa-check" style={{ fontSize: 8, color: '#1A7A4A' }} />
                                              {item}
                                            </span>
                                          ))}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          <span style={{
                                            fontSize: 10, fontWeight: 700, minWidth: 32, textAlign: 'right',
                                            color: field.confidence >= 0.90 ? '#1A7A4A' : field.confidence >= 0.80 ? '#B0690A' : '#C60C30',
                                          }}>
                                            {(field.confidence * 100).toFixed(0)}%
                                          </span>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id); setPdfPage(field.sourcePageNum); setPdfSearchText(field.value || ''); }}
                                            title={`Navigate to page ${field.sourcePageNum}`}
                                            style={{ fontSize: 9, fontWeight: 700, color: '#5A45C7', background: '#F8F6FE', border: '1px solid #E8E0FD', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}
                                          >
                                            <i className="fa-solid fa-file-lines" style={{ fontSize: 8 }} />
                                            Pg {field.sourcePageNum}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <input
                                        type="text"
                                        value={displayValue}
                                        onChange={(e) => editField(field.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder={field.value === 'Not available in document' ? 'Enter value manually…' : ''}
                                        style={{
                                          flex: 1, padding: '5px 8px', borderRadius: 5,
                                          border: '1px solid var(--border-primary)',
                                          fontSize: 'var(--type-body-sm)', fontWeight: 500,
                                          color: field.value === 'Not available in document' ? '#98A1A8' : 'var(--text-primary)',
                                          background: field.value === 'Not available in document' ? '#FAFBFC' : '#fff',
                                          fontStyle: field.value === 'Not available in document' ? 'italic' : 'normal',
                                          outline: 'none', minWidth: 0,
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = '#0074B8'; e.target.style.color = 'var(--text-primary)'; e.target.style.fontStyle = 'normal'; }}
                                        onBlur={(e) => { e.target.style.borderColor = ''; }}
                                      />

                                      {(() => {
                                        const isNotAvailable = field.value === 'Not available in document';
                                        return isNotAvailable ? (
                                          <span style={{ fontSize: 9, fontWeight: 600, color: '#98A1A8', background: '#F1F3F5', borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                                            Not extracted
                                          </span>
                                        ) : (
                                          <>
                                            <span style={{ fontSize: 10, fontWeight: 700, minWidth: 32, textAlign: 'right', color: field.confidence >= 0.90 ? '#1A7A4A' : field.confidence >= 0.80 ? '#B0690A' : '#C60C30' }}>
                                              {(field.confidence * 100).toFixed(0)}%
                                            </span>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id); setPdfPage(field.sourcePageNum); setPdfSearchText(field.value || ''); }}
                                              title={`Navigate to page ${field.sourcePageNum}`}
                                              style={{ fontSize: 9, fontWeight: 700, color: '#5A45C7', background: '#F8F6FE', border: '1px solid #E8E0FD', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}
                                            >
                                              <i className="fa-solid fa-file-lines" style={{ fontSize: 8 }} />
                                              Pg {field.sourcePageNum}
                                            </button>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* Global review notes */}
                    <div style={{
                      position: 'sticky', bottom: 0,
                      padding: '12px 0 0',
                      borderTop: '1px solid var(--border-primary)',
                      background: '#fff',
                      marginTop: 16,
                    }}>
                      <div style={{
                        fontSize: 'var(--type-badge)', fontWeight: 700,
                        color: 'var(--text-secondary)', textTransform: 'uppercase',
                        letterSpacing: '0.05em', marginBottom: 6,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <i className="fa-solid fa-note-sticky" style={{ fontSize: 11 }} />
                        Review Notes
                      </div>
                      <textarea
                        value={globalNote}
                        onChange={(e) => setGlobalNote(e.target.value)}
                        placeholder="Add notes, corrections, or review comments for this CSA extraction..."
                        rows={3}
                        style={{
                          width: '100%', padding: '8px 10px',
                          borderRadius: 6, border: '1px solid var(--border-primary)',
                          fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)',
                          resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                          lineHeight: 1.5,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#0074B8'; }}
                        onBlur={(e) => { e.target.style.borderColor = ''; }}
                      />
                    </div>
                  </div>

                  {/* Right panel: PDF.js Viewer with text highlighting */}
                  <div style={{ width: '55%', display: 'flex', flexDirection: 'column' }}>
                    <PDFViewer
                      url={`http://localhost:8000/api/csa/${activeDoc?.id}/pdf`}
                      pageNumber={pdfPage}
                      searchText={(() => {
                        if (!selectedFieldId) return pdfSearchText || undefined;
                        const sf = csaFields.find(fld => fld.id === selectedFieldId);
                        if (sf?.boundingBox) return undefined;
                        return pdfSearchText || undefined;
                      })()}
                      highlight={(() => {
                        if (!selectedFieldId) return undefined;
                        const f = csaFields.find(fld => fld.id === selectedFieldId);
                        if (!f || f.sourcePageNum === 0) return undefined;
                        if (f.boundingBox) {
                          return {
                            page_number: f.sourcePageNum,
                            x: f.boundingBox.x,
                            y: f.boundingBox.y,
                            width: f.boundingBox.width,
                            height: f.boundingBox.height,
                          };
                        }
                        // No bounding box from API — generate a highlight region
                        // Use field index within same-page fields to stagger y-position
                        const samePageFields = csaFields.filter(fld => fld.sourcePageNum === f.sourcePageNum);
                        const idxOnPage = samePageFields.findIndex(fld => fld.id === f.id);
                        const yOffset = 10 + (idxOnPage * 18) % 70;
                        return {
                          page_number: f.sourcePageNum,
                          x: 8,
                          y: yOffset,
                          width: 80,
                          height: 14,
                        };
                      })()}
                      fieldLabel={selectedFieldId ? csaFields.find(f => f.id === selectedFieldId)?.field : undefined}
                      onPageChange={(pg) => setPdfPage(pg)}
                      filename={activeDoc?.filename || activeDoc?.id || 'Document'}
                    />
                  </div>
                </div>
              ) : (
                /* ── Audit & Logs Tab ── */
                <div style={{ overflowY: 'auto', padding: '20px 32px', height: '100%' }}>
                  {Object.entries(auditByDate).map(([dateKey, events]) => (
                    <div key={dateKey} style={{ marginBottom: 28 }}>
                      {/* Date group header */}
                      <div style={{
                        fontSize: 'var(--type-caption)', fontWeight: 700,
                        color: 'var(--text-tertiary)', textTransform: 'uppercase',
                        letterSpacing: '0.05em', marginBottom: 14,
                        paddingBottom: 6, borderBottom: '1px solid var(--border-secondary)',
                      }}>
                        {dateKey}
                      </div>

                      {/* Timeline entries */}
                      <div style={{ position: 'relative', paddingLeft: 36 }}>
                        {/* Vertical timeline line */}
                        <div style={{
                          position: 'absolute', left: 15, top: 0, bottom: 0,
                          width: 2, background: 'var(--border-secondary)',
                        }} />

                        {events.map((evt, idx) => {
                          const atMeta = AUDIT_TYPE_META[evt.actionType] || AUDIT_TYPE_META.system;
                          const pMeta = PERSONA_META[evt.persona] || PERSONA_META.System;

                          return (
                            <div key={evt.id} style={{ marginBottom: 16, position: 'relative' }}>
                              {/* Timeline dot */}
                              <div style={{
                                position: 'absolute', left: -36 + 8, top: 2,
                                width: 16, height: 16, borderRadius: '50%',
                                background: atMeta.bg, border: `2px solid ${atMeta.fg}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 1,
                              }}>
                                <i className={`fa-solid ${atMeta.icon}`} style={{ fontSize: 7, color: atMeta.fg }} />
                              </div>

                              {/* Event content */}
                              <div style={{
                                background: '#fff', border: '1px solid var(--border-secondary)',
                                borderRadius: 8, padding: '10px 14px',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {evt.title}
                                  </span>
                                  <span style={{
                                    fontSize: '9px', fontWeight: 600, borderRadius: 4,
                                    padding: '1px 6px', color: pMeta.fg, background: pMeta.bg,
                                  }}>
                                    {evt.persona}
                                  </span>
                                  <span style={{ fontSize: 'var(--type-caption)', color: 'var(--text-tertiary)' }}>
                                    {relativeTime(evt.timestamp)}
                                  </span>
                                </div>

                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                                  fontSize: 'var(--type-caption)', color: 'var(--text-secondary)',
                                }}>
                                  <i className="fa-solid fa-user" style={{ fontSize: 9, color: 'var(--text-tertiary)' }} />
                                  {evt.actor}
                                  <span style={{ color: 'var(--text-tertiary)' }}>|</span>
                                  {formatTimestamp(evt.timestamp)}
                                </div>

                                <div style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                  {evt.details}
                                </div>

                                {/* Field edit diff display */}
                                {evt.previousValue && evt.newValue && (
                                  <div style={{
                                    marginTop: 8, padding: '8px 10px', borderRadius: 6,
                                    background: '#F9FAFB', border: '1px solid var(--border-secondary)',
                                    fontSize: 'var(--type-caption)',
                                  }}>
                                    {evt.fieldName && (
                                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontSize: 'var(--type-badge)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        {evt.fieldName}
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{
                                        color: '#C60C30', textDecoration: 'line-through',
                                        background: '#FDECEF', padding: '1px 6px', borderRadius: 4,
                                        fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 'var(--type-caption)',
                                      }}>
                                        {evt.previousValue}
                                      </span>
                                      <i className="fa-solid fa-arrow-right" style={{ fontSize: 9, color: 'var(--text-tertiary)' }} />
                                      <span style={{
                                        color: '#1A7A4A', fontWeight: 600,
                                        background: '#E4F2EA', padding: '1px 6px', borderRadius: 4,
                                        fontFamily: 'var(--font-mono)', fontSize: 'var(--type-caption)',
                                      }}>
                                        {evt.newValue}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Toolbar button style constant ── */
const pdfToolbarBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 4,
  border: '1px solid var(--border-primary)', background: '#fff',
  color: 'var(--text-secondary)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 11, transition: 'all 0.1s ease', padding: 0,
};

/* ================================================================
   Page export with Suspense boundary (required for useSearchParams)
   ================================================================ */

export default function OnboardingDashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '24px 24px 32px' }}>
        <div style={{ height: 32, width: 320, background: '#EEF1F4', borderRadius: 8, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 100, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ height: 400, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12 }} />
      </div>
    }>
      <OnboardingDashboardContent />
    </Suspense>
  );
}
