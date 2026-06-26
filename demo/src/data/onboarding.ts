/* ================================================================
   Onboarding Ops — Mock Data
   All customer names are masked aliases.
   ================================================================ */

/* ── Metric tiles ── */
export interface OnboardingMetric {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon: string;
  color: string;
  bg: string;
}

export const onboardingMetrics: OnboardingMetric[] = [
  { label: 'Active Extractions', value: 3, delta: '+1 today', deltaUp: true, icon: 'fa-file-arrow-up', color: '#0074B8', bg: '#E7F1FA' },
  { label: 'Pending Validation', value: 2, delta: '1 urgent', deltaUp: false, icon: 'fa-triangle-exclamation', color: '#B0690A', bg: '#FBF0DD' },
  { label: 'Approved This Week', value: 8, delta: '+3 vs last wk', deltaUp: true, icon: 'fa-circle-check', color: '#1A7A4A', bg: '#E4F2EA' },
  { label: 'Avg Confidence', value: '94.2%', delta: '+0.8%', deltaUp: true, icon: 'fa-bullseye', color: '#5A45C7', bg: '#F8F6FE' },
];

/* ── Recent CSA extractions table ── */
export type ExtractionStatus = 'extracting' | 'validating' | 'approved' | 'flagged';

export interface RecentExtraction {
  id: string;
  document: string;
  client: string;
  status: ExtractionStatus;
  confidence: number;
  extracted: string;
  reviewer: string;
}

export const extractionStatusMeta: Record<ExtractionStatus, { label: string; fg: string; bg: string }> = {
  extracting: { label: 'Extracting', fg: '#0074B8', bg: '#E7F1FA' },
  validating: { label: 'Validating', fg: '#B0690A', bg: '#FBF0DD' },
  approved: { label: 'Approved', fg: '#1A7A4A', bg: '#E4F2EA' },
  flagged: { label: 'Flagged', fg: '#C60C30', bg: '#FDECEF' },
};

export const recentExtractions: RecentExtraction[] = [
  { id: 'EXT-001', document: 'CSA-2026-0847.pdf', client: 'Acme Corp', status: 'validating', confidence: 0.94, extracted: '2026-06-24', reviewer: 'Dana Whitfield' },
  { id: 'EXT-002', document: 'CSA-2026-0851.pdf', client: 'TechStart LLC', status: 'extracting', confidence: 0.0, extracted: '2026-06-25', reviewer: 'Unassigned' },
  { id: 'EXT-003', document: 'CSA-2026-0839.pdf', client: 'Summit Services Inc', status: 'approved', confidence: 0.97, extracted: '2026-06-22', reviewer: 'Priya Nair' },
  { id: 'EXT-004', document: 'CSA-2026-0842.pdf', client: 'Greenfield Partners', status: 'approved', confidence: 0.92, extracted: '2026-06-21', reviewer: 'Sam Cho' },
  { id: 'EXT-005', document: 'CSA-2026-0845.pdf', client: 'Horizon Manufacturing', status: 'flagged', confidence: 0.71, extracted: '2026-06-23', reviewer: 'Dana Whitfield' },
  { id: 'EXT-006', document: 'CSA-2026-0850.pdf', client: 'BrightPath Solutions', status: 'approved', confidence: 0.96, extracted: '2026-06-20', reviewer: 'Priya Nair' },
  { id: 'EXT-007', document: 'CSA-2026-0848.pdf', client: 'Atlas Logistics', status: 'extracting', confidence: 0.0, extracted: '2026-06-25', reviewer: 'Unassigned' },
  { id: 'EXT-008', document: 'CSA-2026-0844.pdf', client: 'Pinnacle Staffing', status: 'approved', confidence: 0.95, extracted: '2026-06-19', reviewer: 'Sam Cho' },
];

/* ── Extracted CSA fields ── */
export interface ExtractedCSAField {
  id: string;
  field: string;
  value: string;
  confidence: number;
  citation: string;
  category: string;
}

export const extractedFields: ExtractedCSAField[] = [
  { id: 'f01', field: 'Company Legal Name', value: 'Acme Corp', confidence: 0.99, citation: 'CSA p.1 §1.1', category: 'Client Info' },
  { id: 'f02', field: 'DBA / Trade Name', value: 'Acme Corporation', confidence: 0.97, citation: 'CSA p.1 §1.1', category: 'Client Info' },
  { id: 'f03', field: 'FEIN', value: '**-***4782', confidence: 0.98, citation: 'CSA p.1 §1.2', category: 'Client Info' },
  { id: 'f04', field: 'State of Incorporation', value: 'Delaware', confidence: 0.96, citation: 'CSA p.1 §1.3', category: 'Client Info' },
  { id: 'f05', field: 'Primary Contact', value: 'Jordan Mitchell', confidence: 0.93, citation: 'CSA p.2 §1.5', category: 'Client Info' },
  { id: 'f06', field: 'Effective Date', value: '08/01/2026', confidence: 0.99, citation: 'CSA p.2 §2.1', category: 'Agreement' },
  { id: 'f07', field: 'Initial Term', value: '12 months', confidence: 0.98, citation: 'CSA p.2 §2.1', category: 'Agreement' },
  { id: 'f08', field: 'Auto-Renewal', value: 'Yes — 12-month successive periods', confidence: 0.95, citation: 'CSA p.2 §2.2', category: 'Agreement' },
  { id: 'f09', field: 'Termination Notice', value: '90 days written notice', confidence: 0.94, citation: 'CSA p.2 §2.3', category: 'Agreement' },
  { id: 'f10', field: 'Admin Fee', value: '$45.00 / employee / month', confidence: 0.97, citation: 'CSA p.3 §3.1', category: 'Fees' },
  { id: 'f11', field: 'Per-Employee Fee (Minimum)', value: '$3,500 / month', confidence: 0.91, citation: 'CSA p.3 §3.2', category: 'Fees' },
  { id: 'f12', field: 'Setup / Implementation Fee', value: '$2,500 one-time', confidence: 0.96, citation: 'CSA p.3 §3.3', category: 'Fees' },
  { id: 'f13', field: 'Billing Frequency', value: 'Monthly — Net 15', confidence: 0.98, citation: 'CSA p.3 §3.4', category: 'Fees' },
  { id: 'f14', field: 'Payment Terms', value: 'ACH draft on 1st business day', confidence: 0.88, citation: 'CSA p.3 §3.5', category: 'Fees' },
  { id: 'f15', field: 'Services Included', value: 'Payroll, Benefits Admin, Workers Comp, HRIS, Time & Attendance', confidence: 0.92, citation: 'CSA p.4 §4.1', category: 'Services' },
  { id: 'f16', field: 'SUTA Coverage', value: 'Full — PEO assumes SUTA liability', confidence: 0.89, citation: 'CSA p.5 §5.1', category: 'Tax & Compliance' },
  { id: 'f17', field: 'WC Code(s)', value: '8810, 8742, 5191', confidence: 0.93, citation: 'CSA p.5 §5.2', category: 'Tax & Compliance' },
  { id: 'f18', field: 'WC Experience Mod', value: '0.87', confidence: 0.90, citation: 'CSA p.5 §5.3', category: 'Tax & Compliance' },
  { id: 'f19', field: 'Benefits Effective Date', value: 'First of month following 30-day waiting period', confidence: 0.86, citation: 'CSA p.6 §6.1', category: 'Benefits' },
  { id: 'f20', field: 'Medical Plans Offered', value: 'PPO, HDHP w/ HSA', confidence: 0.91, citation: 'CSA p.6 §6.2', category: 'Benefits' },
  { id: 'f21', field: 'Dental Plans Offered', value: 'DPPO, DHMO', confidence: 0.87, citation: 'CSA p.6 §6.3', category: 'Benefits' },
  { id: 'f22', field: 'Indemnification', value: 'Mutual indemnification with $2M cap', confidence: 0.78, citation: 'CSA p.8 §9.1', category: 'Legal' },
];

/* ── Validation mismatches ── */
export type MismatchSeverity = 'error' | 'warning' | 'info';
export type MismatchResolution = 'unresolved' | 'accept_csa' | 'accept_system' | 'flagged';

export interface ValidationMismatch {
  id: string;
  field: string;
  csaValue: string;
  systemValue: string;
  system: string;
  mismatchType: string;
  severity: MismatchSeverity;
  resolution: MismatchResolution;
}

export const validationSummary = {
  totalFields: 22,
  validated: 22,
  matched: 14,
  mismatches: 8,
  requireAttention: 4,
};

export const validationMismatches: ValidationMismatch[] = [
  { id: 'mm-1', field: 'Admin Fee', csaValue: '$45.00/ee/mo', systemValue: '$42.00/ee/mo', system: 'Salesforce', mismatchType: 'Value Discrepancy', severity: 'warning', resolution: 'unresolved' },
  { id: 'mm-2', field: 'SUTA Coverage', csaValue: 'Full', systemValue: 'Standard', system: 'ClientSpace', mismatchType: 'Category Mismatch', severity: 'error', resolution: 'unresolved' },
  { id: 'mm-3', field: 'Effective Date', csaValue: '08/01/2026', systemValue: '07/01/2026', system: 'ClientSpace', mismatchType: 'Date Discrepancy', severity: 'error', resolution: 'unresolved' },
  { id: 'mm-4', field: 'Services Included', csaValue: 'Includes Time & Attendance', systemValue: 'Not listed', system: 'Salesforce', mismatchType: 'Missing Item', severity: 'warning', resolution: 'unresolved' },
  { id: 'mm-5', field: 'Per-Employee Fee (Min)', csaValue: '$3,500/mo', systemValue: '$3,200/mo', system: 'Salesforce', mismatchType: 'Value Discrepancy', severity: 'warning', resolution: 'unresolved' },
  { id: 'mm-6', field: 'Termination Notice', csaValue: '90 days', systemValue: '60 days', system: 'ClientSpace', mismatchType: 'Value Discrepancy', severity: 'error', resolution: 'unresolved' },
  { id: 'mm-7', field: 'WC Experience Mod', csaValue: '0.87', systemValue: '0.92', system: 'PrismHR', mismatchType: 'Value Discrepancy', severity: 'warning', resolution: 'unresolved' },
  { id: 'mm-8', field: 'Auto-Renewal', csaValue: 'Yes — 12-month', systemValue: 'Yes — 6-month', system: 'ClientSpace', mismatchType: 'Term Mismatch', severity: 'error', resolution: 'unresolved' },
];

export const severityMeta: Record<MismatchSeverity, { label: string; fg: string; bg: string; icon: string }> = {
  error: { label: 'Error', fg: '#C60C30', bg: '#FDECEF', icon: 'fa-circle-xmark' },
  warning: { label: 'Warning', fg: '#B0690A', bg: '#FBF0DD', icon: 'fa-triangle-exclamation' },
  info: { label: 'Info', fg: '#0074B8', bg: '#E7F1FA', icon: 'fa-circle-info' },
};

/* ── Live API types (compatible with FastAPI backend response) ── */
export interface LiveExtractedField {
  field_name: string;
  field_value: string;
  confidence: number;
  source_citation: string;
  category: string;
  requires_review: boolean;
  is_masked: boolean;
}

export interface LiveValidationMismatch {
  field_name: string;
  csa_value: string;
  system_value: string;
  system_source: string;
  mismatch_type: string;
  severity: 'error' | 'warning' | 'info';
  resolution?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
}

/* ── Audit trail ── */
export interface OnboardingAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  document: string;
  type: 'upload' | 'extraction' | 'validation' | 'resolution' | 'approval' | 'sync' | 'system';
}

export const auditTrail: OnboardingAuditEntry[] = [
  { id: 'a01', timestamp: '2026-06-25T14:32:00Z', actor: 'Dana Whitfield', action: 'CSA Uploaded', details: 'Document uploaded for Acme Corp onboarding — 14-page PDF, 2.3 MB', document: 'CSA-2026-0847.pdf', type: 'upload' },
  { id: 'a02', timestamp: '2026-06-25T14:33:12Z', actor: 'System', action: 'Parsing Started', details: 'OCR engine initialized — document queued for structure detection', document: 'CSA-2026-0847.pdf', type: 'system' },
  { id: 'a03', timestamp: '2026-06-25T14:34:45Z', actor: 'AI Engine', action: 'Extraction Completed', details: '22 fields extracted with average confidence 0.94 — 2 fields below threshold', document: 'CSA-2026-0847.pdf', type: 'extraction' },
  { id: 'a04', timestamp: '2026-06-25T14:35:20Z', actor: 'System', action: 'Cross-Validation Initiated', details: 'Comparing extracted values against Salesforce, ClientSpace, and PrismHR records', document: 'CSA-2026-0847.pdf', type: 'validation' },
  { id: 'a05', timestamp: '2026-06-25T14:36:08Z', actor: 'System', action: 'Cross-Validation Complete', details: '8 mismatches found across 3 systems — 4 require attention', document: 'CSA-2026-0847.pdf', type: 'validation' },
  { id: 'a06', timestamp: '2026-06-25T15:10:00Z', actor: 'Dana Whitfield', action: 'Mismatch Resolved', details: 'Admin Fee — accepted CSA value ($45.00/ee/mo) over Salesforce ($42.00/ee/mo)', document: 'CSA-2026-0847.pdf', type: 'resolution' },
  { id: 'a07', timestamp: '2026-06-25T15:12:30Z', actor: 'Dana Whitfield', action: 'Mismatch Resolved', details: 'Effective Date — accepted CSA value (08/01/2026) over ClientSpace (07/01/2026)', document: 'CSA-2026-0847.pdf', type: 'resolution' },
  { id: 'a08', timestamp: '2026-06-25T15:15:00Z', actor: 'Dana Whitfield', action: 'Field Flagged', details: 'SUTA Coverage flagged for BA review — CSA says "Full", ClientSpace says "Standard"', document: 'CSA-2026-0847.pdf', type: 'resolution' },
  { id: 'a09', timestamp: '2026-06-25T16:45:00Z', actor: 'Sam Cho', action: 'BA Review Complete', details: 'SUTA Coverage confirmed as "Full" per client agreement — ClientSpace update required', document: 'CSA-2026-0847.pdf', type: 'resolution' },
  { id: 'a10', timestamp: '2026-06-25T17:00:00Z', actor: 'Priya Nair', action: 'Extraction Approved', details: 'All 22 fields validated and approved — extraction ready for system sync', document: 'CSA-2026-0847.pdf', type: 'approval' },
  { id: 'a11', timestamp: '2026-06-25T17:01:30Z', actor: 'System', action: 'ClientSpace Sync Initiated', details: 'Pushing approved field values to ClientSpace case record', document: 'CSA-2026-0847.pdf', type: 'sync' },
  { id: 'a12', timestamp: '2026-06-25T17:02:15Z', actor: 'System', action: 'ClientSpace Case Created', details: 'ClientSpace case #CS-2026-0847 created — 22 fields written, 0 errors', document: 'CSA-2026-0847.pdf', type: 'sync' },
  { id: 'a13', timestamp: '2026-06-25T17:03:00Z', actor: 'System', action: 'PrismHR Sync Queued', details: 'PrismHR configuration sync queued — WC codes, SUTA, and payroll settings', document: 'CSA-2026-0847.pdf', type: 'sync' },
  { id: 'a14', timestamp: '2026-06-24T09:15:00Z', actor: 'Marcus Reyes', action: 'CSA Uploaded', details: 'Document uploaded for TechStart LLC onboarding — 11-page PDF, 1.8 MB', document: 'CSA-2026-0851.pdf', type: 'upload' },
  { id: 'a15', timestamp: '2026-06-22T11:30:00Z', actor: 'Lena Ortiz', action: 'CSA Uploaded', details: 'Document uploaded for Summit Services Inc onboarding — 16-page PDF, 2.7 MB', document: 'CSA-2026-0839.pdf', type: 'upload' },
];

/* ── Audit type metadata ── */
export const auditTypeMeta: Record<OnboardingAuditEntry['type'], { icon: string; color: string; bg: string }> = {
  upload: { icon: 'fa-cloud-arrow-up', color: '#0074B8', bg: '#E7F1FA' },
  extraction: { icon: 'fa-microchip', color: '#5A45C7', bg: '#F8F6FE' },
  validation: { icon: 'fa-code-compare', color: '#B0690A', bg: '#FBF0DD' },
  resolution: { icon: 'fa-check-double', color: '#1A7A4A', bg: '#E4F2EA' },
  approval: { icon: 'fa-stamp', color: '#1A7A4A', bg: '#E4F2EA' },
  sync: { icon: 'fa-arrows-rotate', color: '#0074B8', bg: '#E7F1FA' },
  system: { icon: 'fa-server', color: '#5B6770', bg: '#F1F3F5' },
};

/* ================================================================
   CSA Document-Centric Review — Types & Data
   ================================================================ */

/* ── CSA status types ── */
export type CSAValidationStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review';
export type CSACrossValStatus = 'pending' | 'passed' | 'mismatches_found' | 'failed';
export type FieldChangeType = 'ai_generated' | 'human_corrected' | 'validation_failed' | 'pending_review' | 'approved';
export type ApprovalAction = 'save_draft' | 'approve' | 'request_changes' | 'reject' | 'rerun' | 'escalate';

/* ── CSA Document ── */
export interface CSADocument {
  id: string;
  client: string;
  uploadDate: string;
  uploadedBy: string;
  extractionStatus: ExtractionStatus;
  validationStatus: CSAValidationStatus;
  crossValStatus: CSACrossValStatus;
  confidence: number;
  lastModified: string;
  assignedReviewer: string;
  persona: string;
  fieldCount: number;
  mismatchCount: number;
  pdfUrl?: string;
}

/* ── Field editing & notes ── */
export interface FieldEdit {
  fieldId: string;
  previousValue: string;
  newValue: string;
  modifiedBy: string;
  persona: string;
  timestamp: string;
  reason: string;
}

export interface FieldNote {
  id: string;
  fieldId: string;
  text: string;
  author: string;
  persona: string;
  timestamp: string;
}

export interface ExtractedFieldWithEdit extends ExtractedCSAField {
  changeType: FieldChangeType;
  editHistory: FieldEdit[];
  notes: FieldNote[];
  validationStatus: 'passed' | 'failed' | 'warning' | 'pending';
  sourcePage?: number;
  isEdited: boolean;
}

/* ── CSA Audit Event ── */
export interface CSAAuditEvent {
  id: string;
  csaId: string;
  timestamp: string;
  actor: string;
  persona: string;
  action: string;
  details: string;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
  type: 'upload' | 'extraction' | 'validation' | 'field_edit' | 'approval' | 'rejection' | 'sync' | 'system' | 'comment';
}

/* ── Persona metadata ── */
export const personaMeta: Record<string, { label: string; color: string; bg: string }> = {
  pm: { label: 'Project Manager', color: '#0074B8', bg: '#E7F1FA' },
  pa: { label: 'Payroll Analyst', color: '#5A45C7', bg: '#F8F6FE' },
  ba: { label: 'Business Analyst', color: '#B0690A', bg: '#FBF0DD' },
  ops: { label: 'Operations', color: '#1A7A4A', bg: '#E4F2EA' },
  reviewer: { label: 'Reviewer', color: '#C60C30', bg: '#FDECEF' },
  admin: { label: 'Admin', color: '#374151', bg: '#F1F3F5' },
  ai_extraction: { label: 'AI Extraction Agent', color: '#2A8F60', bg: '#E4F2EA' },
  validation_agent: { label: 'Validation Agent', color: '#0074B8', bg: '#E7F1FA' },
};

/* ── CSA Documents list ── */
export const csaDocuments: CSADocument[] = [
  { id: 'CSA-2026-0847', client: 'Acme Corp', uploadDate: '2026-06-24', uploadedBy: 'Dana Whitfield', extractionStatus: 'validating', validationStatus: 'completed', crossValStatus: 'mismatches_found', confidence: 0.94, lastModified: '2026-06-25T15:10:00Z', assignedReviewer: 'Sam Cho', persona: 'ba', fieldCount: 22, mismatchCount: 4 },
  { id: 'CSA-2026-0851', client: 'TechStart LLC', uploadDate: '2026-06-25', uploadedBy: 'Marcus Reyes', extractionStatus: 'extracting', validationStatus: 'not_started', crossValStatus: 'pending', confidence: 0, lastModified: '2026-06-25T09:15:00Z', assignedReviewer: 'Unassigned', persona: 'pm', fieldCount: 0, mismatchCount: 0 },
  { id: 'CSA-2026-0839', client: 'Summit Services Inc', uploadDate: '2026-06-22', uploadedBy: 'Lena Ortiz', extractionStatus: 'approved', validationStatus: 'completed', crossValStatus: 'passed', confidence: 0.97, lastModified: '2026-06-23T11:30:00Z', assignedReviewer: 'Priya Nair', persona: 'ops', fieldCount: 22, mismatchCount: 0 },
  { id: 'CSA-2026-0842', client: 'Greenfield Partners', uploadDate: '2026-06-21', uploadedBy: 'Sam Cho', extractionStatus: 'approved', validationStatus: 'completed', crossValStatus: 'passed', confidence: 0.92, lastModified: '2026-06-22T14:20:00Z', assignedReviewer: 'Sam Cho', persona: 'ba', fieldCount: 21, mismatchCount: 1 },
  { id: 'CSA-2026-0845', client: 'Horizon Manufacturing', uploadDate: '2026-06-23', uploadedBy: 'Dana Whitfield', extractionStatus: 'flagged', validationStatus: 'needs_review', crossValStatus: 'mismatches_found', confidence: 0.71, lastModified: '2026-06-24T16:45:00Z', assignedReviewer: 'Dana Whitfield', persona: 'pm', fieldCount: 18, mismatchCount: 6 },
  { id: 'CSA-2026-0850', client: 'BrightPath Solutions', uploadDate: '2026-06-20', uploadedBy: 'Priya Nair', extractionStatus: 'approved', validationStatus: 'completed', crossValStatus: 'passed', confidence: 0.96, lastModified: '2026-06-21T10:00:00Z', assignedReviewer: 'Priya Nair', persona: 'reviewer', fieldCount: 22, mismatchCount: 0 },
  { id: 'CSA-2026-0848', client: 'Atlas Logistics', uploadDate: '2026-06-25', uploadedBy: 'Marcus Reyes', extractionStatus: 'extracting', validationStatus: 'not_started', crossValStatus: 'pending', confidence: 0, lastModified: '2026-06-25T11:00:00Z', assignedReviewer: 'Unassigned', persona: 'pm', fieldCount: 0, mismatchCount: 0 },
  { id: 'CSA-2026-0844', client: 'Pinnacle Staffing', uploadDate: '2026-06-19', uploadedBy: 'Sam Cho', extractionStatus: 'approved', validationStatus: 'completed', crossValStatus: 'passed', confidence: 0.95, lastModified: '2026-06-20T09:30:00Z', assignedReviewer: 'Sam Cho', persona: 'ba', fieldCount: 22, mismatchCount: 0 },
];

/* ── Detailed fields for CSA-2026-0847 (extends extractedFields with edit/review metadata) ── */
export const csaFieldsDetailed: ExtractedFieldWithEdit[] = [
  { id: 'f01', field: 'Company Legal Name', value: 'Acme Corp', confidence: 0.99, citation: 'CSA p.1 §1.1', category: 'Client Info', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 1, isEdited: false },
  { id: 'f02', field: 'DBA / Trade Name', value: 'Acme Corporation', confidence: 0.97, citation: 'CSA p.1 §1.1', category: 'Client Info', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 1, isEdited: false },
  { id: 'f03', field: 'FEIN', value: '**-***4782', confidence: 0.98, citation: 'CSA p.1 §1.2', category: 'Client Info', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 1, isEdited: false },
  { id: 'f04', field: 'State of Incorporation', value: 'Delaware', confidence: 0.96, citation: 'CSA p.1 §1.3', category: 'Client Info', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 1, isEdited: false },
  { id: 'f05', field: 'Primary Contact', value: 'Jordan Mitchell', confidence: 0.93, citation: 'CSA p.2 §1.5', category: 'Client Info', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 2, isEdited: false },
  { id: 'f06', field: 'Effective Date', value: '08/01/2026', confidence: 0.99, citation: 'CSA p.2 §2.1', category: 'Agreement', changeType: 'validation_failed', editHistory: [], notes: [{ id: 'n01', fieldId: 'f06', text: 'ClientSpace shows 07/01/2026 — verify with client before approving', author: 'Dana Whitfield', persona: 'pm', timestamp: '2026-06-25T15:12:30Z' }], validationStatus: 'failed', sourcePage: 2, isEdited: false },
  { id: 'f07', field: 'Initial Term', value: '12 months', confidence: 0.98, citation: 'CSA p.2 §2.1', category: 'Agreement', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 2, isEdited: false },
  { id: 'f08', field: 'Auto-Renewal', value: 'Yes — 12-month successive periods', confidence: 0.95, citation: 'CSA p.2 §2.2', category: 'Agreement', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'failed', sourcePage: 2, isEdited: false },
  { id: 'f09', field: 'Termination Notice', value: '90 days written notice', confidence: 0.94, citation: 'CSA p.2 §2.3', category: 'Agreement', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'failed', sourcePage: 2, isEdited: false },
  { id: 'f10', field: 'Admin Fee', value: '$45.00 / employee / month', confidence: 0.97, citation: 'CSA p.3 §3.1', category: 'Fees', changeType: 'human_corrected', editHistory: [{ fieldId: 'f10', previousValue: '$42.00 / employee / month', newValue: '$45.00 / employee / month', modifiedBy: 'Dana Whitfield', persona: 'pm', timestamp: '2026-06-25T15:10:00Z', reason: 'Corrected to match CSA document value over Salesforce' }], notes: [], validationStatus: 'warning', sourcePage: 3, isEdited: true },
  { id: 'f11', field: 'Per-Employee Fee (Minimum)', value: '$3,500 / month', confidence: 0.91, citation: 'CSA p.3 §3.2', category: 'Fees', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'warning', sourcePage: 3, isEdited: false },
  { id: 'f12', field: 'Setup / Implementation Fee', value: '$2,500 one-time', confidence: 0.96, citation: 'CSA p.3 §3.3', category: 'Fees', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 3, isEdited: false },
  { id: 'f13', field: 'Billing Frequency', value: 'Monthly — Net 15', confidence: 0.98, citation: 'CSA p.3 §3.4', category: 'Fees', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 3, isEdited: false },
  { id: 'f14', field: 'Payment Terms', value: 'ACH draft on 1st business day', confidence: 0.88, citation: 'CSA p.3 §3.5', category: 'Fees', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'warning', sourcePage: 3, isEdited: false },
  { id: 'f15', field: 'Services Included', value: 'Payroll, Benefits Admin, Workers Comp, HRIS, Time & Attendance', confidence: 0.92, citation: 'CSA p.4 §4.1', category: 'Services', changeType: 'ai_generated', editHistory: [], notes: [{ id: 'n02', fieldId: 'f15', text: 'Time & Attendance not listed in Salesforce — may need to add', author: 'Sam Cho', persona: 'ba', timestamp: '2026-06-25T16:45:00Z' }], validationStatus: 'warning', sourcePage: 4, isEdited: false },
  { id: 'f16', field: 'SUTA Coverage', value: 'Full — PEO assumes SUTA liability', confidence: 0.89, citation: 'CSA p.5 §5.1', category: 'Tax & Compliance', changeType: 'pending_review', editHistory: [], notes: [{ id: 'n03', fieldId: 'f16', text: 'CSA says Full but ClientSpace says Standard — flagged for BA review', author: 'Dana Whitfield', persona: 'pm', timestamp: '2026-06-25T15:15:00Z' }], validationStatus: 'failed', sourcePage: 5, isEdited: false },
  { id: 'f17', field: 'WC Code(s)', value: '8810, 8742, 5191', confidence: 0.93, citation: 'CSA p.5 §5.2', category: 'Tax & Compliance', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 5, isEdited: false },
  { id: 'f18', field: 'WC Experience Mod', value: '0.87', confidence: 0.90, citation: 'CSA p.5 §5.3', category: 'Tax & Compliance', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'warning', sourcePage: 5, isEdited: false },
  { id: 'f19', field: 'Benefits Effective Date', value: 'First of month following 30-day waiting period', confidence: 0.86, citation: 'CSA p.6 §6.1', category: 'Benefits', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 6, isEdited: false },
  { id: 'f20', field: 'Medical Plans Offered', value: 'PPO, HDHP w/ HSA', confidence: 0.91, citation: 'CSA p.6 §6.2', category: 'Benefits', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 6, isEdited: false },
  { id: 'f21', field: 'Dental Plans Offered', value: 'DPPO, DHMO', confidence: 0.87, citation: 'CSA p.6 §6.3', category: 'Benefits', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'passed', sourcePage: 6, isEdited: false },
  { id: 'f22', field: 'Indemnification', value: 'Mutual indemnification with $2M cap', confidence: 0.78, citation: 'CSA p.8 §9.1', category: 'Legal', changeType: 'ai_generated', editHistory: [], notes: [], validationStatus: 'warning', sourcePage: 8, isEdited: false },
];

/* ── CSA Audit Events for CSA-2026-0847 ── */
export const csaAuditEvents: CSAAuditEvent[] = [
  { id: 'ca01', csaId: 'CSA-2026-0847', timestamp: '2026-06-24T10:00:00Z', actor: 'Dana Whitfield', persona: 'pm', action: 'CSA Uploaded', details: 'Document uploaded for Acme Corp onboarding — 14-page PDF, 2.3 MB', type: 'upload' },
  { id: 'ca02', csaId: 'CSA-2026-0847', timestamp: '2026-06-24T10:01:12Z', actor: 'System', persona: 'ai_extraction', action: 'Parsing Started', details: 'OCR engine initialized — document queued for structure detection', type: 'system' },
  { id: 'ca03', csaId: 'CSA-2026-0847', timestamp: '2026-06-24T10:02:45Z', actor: 'AI Engine', persona: 'ai_extraction', action: 'Extraction Completed', details: '22 fields extracted with average confidence 0.94 — 2 fields below threshold', type: 'extraction' },
  { id: 'ca04', csaId: 'CSA-2026-0847', timestamp: '2026-06-24T10:03:20Z', actor: 'System', persona: 'validation_agent', action: 'Cross-Validation Initiated', details: 'Comparing extracted values against Salesforce, ClientSpace, and PrismHR records', type: 'validation' },
  { id: 'ca05', csaId: 'CSA-2026-0847', timestamp: '2026-06-24T10:04:08Z', actor: 'System', persona: 'validation_agent', action: 'Cross-Validation Complete', details: '8 mismatches found across 3 systems — 4 require attention', type: 'validation' },
  { id: 'ca06', csaId: 'CSA-2026-0847', timestamp: '2026-06-25T15:10:00Z', actor: 'Dana Whitfield', persona: 'pm', action: 'Field Corrected', details: 'Admin Fee updated from $42.00/ee/mo to $45.00/ee/mo — matched CSA value', fieldName: 'Admin Fee', previousValue: '$42.00 / employee / month', newValue: '$45.00 / employee / month', type: 'field_edit' },
  { id: 'ca07', csaId: 'CSA-2026-0847', timestamp: '2026-06-25T15:12:30Z', actor: 'Dana Whitfield', persona: 'pm', action: 'Note Added', details: 'Effective Date — added note about ClientSpace discrepancy (07/01/2026 vs 08/01/2026)', fieldName: 'Effective Date', type: 'comment' },
  { id: 'ca08', csaId: 'CSA-2026-0847', timestamp: '2026-06-25T15:15:00Z', actor: 'Dana Whitfield', persona: 'pm', action: 'Field Flagged', details: 'SUTA Coverage flagged for BA review — CSA says "Full", ClientSpace says "Standard"', fieldName: 'SUTA Coverage', type: 'validation' },
  { id: 'ca09', csaId: 'CSA-2026-0847', timestamp: '2026-06-25T16:45:00Z', actor: 'Sam Cho', persona: 'ba', action: 'BA Review Complete', details: 'SUTA Coverage confirmed as "Full" per client agreement — ClientSpace update required', fieldName: 'SUTA Coverage', type: 'validation' },
  { id: 'ca10', csaId: 'CSA-2026-0847', timestamp: '2026-06-25T16:50:00Z', actor: 'Sam Cho', persona: 'ba', action: 'Note Added', details: 'Services Included — Time & Attendance not in Salesforce, flagged for update', fieldName: 'Services Included', type: 'comment' },
  { id: 'ca11', csaId: 'CSA-2026-0847', timestamp: '2026-06-25T17:00:00Z', actor: 'Priya Nair', persona: 'reviewer', action: 'Extraction Approved', details: 'All 22 fields validated and approved — extraction ready for system sync', type: 'approval' },
  { id: 'ca12', csaId: 'CSA-2026-0847', timestamp: '2026-06-25T17:01:30Z', actor: 'System', persona: 'ops', action: 'ClientSpace Sync Initiated', details: 'Pushing approved field values to ClientSpace case record', type: 'sync' },
  { id: 'ca13', csaId: 'CSA-2026-0847', timestamp: '2026-06-25T17:02:15Z', actor: 'System', persona: 'ops', action: 'ClientSpace Case Created', details: 'ClientSpace case #CS-2026-0847 created — 22 fields written, 0 errors', type: 'sync' },
];
