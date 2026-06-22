export type Role = 'am' | 'ae' | 'coord' | 'analyst' | 'gab' | 'admin';
export type Permission = 'create' | 'edit' | 'approve' | 'publish' | 'esign' | 'admin';
export type Status = 'draft' | 'in_review' | 'approved' | 'signed' | 'published';
export type Tier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
export type ContribStrategy = 'variable' | 'base_plan' | 'flat_dollar' | 'rolldown';
export type Provenance = 'library' | 'upload' | 'underwriting' | 'input';
export type Severity = 'error' | 'warning' | 'pass';
export type DiffChangeType = 'client' | 'master';
export type SignerStatus = 'signed' | 'pending' | 'waiting';
export type EsignState = 'ready' | 'sent' | 'partial' | 'complete';

export interface Client {
  id: string;
  name: string;
  prism: string;
  tier: Tier;
  wse: number;
  owner: string;
  status: Status;
  eff: string;
  urgDays: number;
  renewDay: string;
  renewMon: string;
}

export interface TierRates {
  eo: number;
  es: number;
  ec: number;
  ef: number;
}

export interface Plan {
  id: string;
  type: 'Medical' | 'Dental' | 'Vision';
  carrier: string;
  plan: string;
  masterOrOpen: 'Master' | 'Open Mkt';
  erPct: number;
  base: TierRates;
}

export interface UWParams {
  bucket: number;
  af: number;
  comm: number;
  rf: number;
}

export interface RoleInfo {
  email: string;
  role: Role;
  label: string;
  short: string;
  name: string;
  permissions: Permission[];
  color: string;
}

export interface ExtractionRow {
  field: string;
  value: string;
  confidence: number;
  source: string;
}

export interface AssemblyField {
  label: string;
  value: string;
  provenance: Provenance;
}

export interface AssemblySection {
  title: string;
  source: string;
  sourceColor: string;
  filled: number;
  total: number;
  fields: AssemblyField[];
}

export interface ValidationCheck {
  label: string;
  status: Severity;
  message?: string;
}

export interface ValidationGroup {
  title: string;
  checks: ValidationCheck[];
}

export interface DiffRow {
  key: string;
  plan: string;
  field: string;
  prior: string;
  current: string;
  changed: boolean;
  changeType?: DiffChangeType;
  delta?: string;
}

export interface Signer {
  role: string;
  name: string;
  org: string;
  status: SignerStatus;
  date?: string;
}

export interface ProposedChange {
  field: string;
  before: string;
  after: string;
  description: string;
}

export interface CopilotMessage {
  role: 'system' | 'user' | 'agent';
  content: string;
  citation?: string;
  actions?: { label: string; query: string }[];
  proposedChange?: ProposedChange;
}

export interface SyncStep {
  label: string;
  api: string;
  ms: number;
}

export interface StatusMeta {
  label: string;
  bg: string;
  fg: string;
}

export interface MetricTile {
  label: string;
  value: number;
  sub: string;
  icon: string;
  iconBg: string;
  iconFg: string;
}

export interface AdminCard {
  title: string;
  body: string;
  accentColor: string;
  badge?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  client: string;
  prism: string;
  tier: Tier;
  status: Status;
  type: string;
}
