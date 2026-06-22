import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import capData from '@/data/capData.json';

/* ─── Types ─── */

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'user' | 'system';
  action: string;
  entity: string;
  entityId: string;
  before?: string;
  after?: string;
}

export interface CapRecord {
  id: string;
  clientId: string;
  clientName: string;
  prism: string;
  type: 'new_business' | 'renewal';
  status: 'draft' | 'in_review' | 'approved' | 'signed' | 'published';
  planYear: string;
  carrier: string;
  eeCount: number;
  tier: string;
  owner: string;
  effDate: string;
  contribStrategy: string;
  erPct: number;
  plans: string[];
  validationErrors: number;
  validationWarnings: number;
  createdAt: string;
  updatedAt: string;
  snapshotVersions?: Record<string, string>;
}

export interface RenewalDelta {
  field: string;
  oldVal: string;
  newVal: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface DataState {
  caps: CapRecord[];
  auditLog: AuditEntry[];
  fieldOverrides: Record<string, Record<string, string>>;
  confirmedFields: Record<string, string[]>;
  renewalDeltas: Record<string, RenewalDelta[]>;
  _auditCounter: number;

  // Actions
  addAudit: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  updateCapStatus: (capId: string, status: CapRecord['status'], actor: string) => void;
  setFieldOverride: (capId: string, field: string, value: string, actor: string) => void;
  confirmField: (capId: string, field: string, actor: string) => void;
  addRenewalDelta: (capId: string, delta: { field: string; oldVal: string; newVal: string }) => void;
  resolveRenewalDelta: (capId: string, field: string, status: 'accepted' | 'rejected', actor: string) => void;
  getAuditForEntity: (entityId: string) => AuditEntry[];
  resetAll: () => void;
}

/* ─── Helpers ─── */

const BASE_DATE = new Date('2026-06-18T09:14:00');

function buildTimestamp(counter: number): string {
  const d = new Date(BASE_DATE.getTime() + counter * 60_000);
  return d.toISOString().replace('Z', '');
}

function buildSeedAudit(): AuditEntry[] {
  return (capData.seedAudit as Array<{
    actor: string;
    actorType: 'user' | 'system';
    action: string;
    entity: string;
    entityId: string;
    offsetMinutes: number;
  }>).map((s, i) => ({
    id: `audit-seed-${i + 1}`,
    timestamp: new Date(BASE_DATE.getTime() + s.offsetMinutes * 60_000)
      .toISOString()
      .replace('Z', ''),
    actor: s.actor,
    actorType: s.actorType,
    action: s.action,
    entity: s.entity,
    entityId: s.entityId,
  }));
}

const initialCaps: CapRecord[] = capData.caps as CapRecord[];
const initialAudit: AuditEntry[] = buildSeedAudit();

/* ─── Store ─── */

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      caps: initialCaps,
      auditLog: initialAudit,
      fieldOverrides: {},
      confirmedFields: {},
      renewalDeltas: {},
      _auditCounter: initialAudit.length,

      addAudit: (entry) => {
        set((s) => {
          const nextCounter = s._auditCounter + 1;
          const newEntry: AuditEntry = {
            ...entry,
            id: `audit-${nextCounter}`,
            timestamp: buildTimestamp(nextCounter),
          };
          return {
            auditLog: [...s.auditLog, newEntry],
            _auditCounter: nextCounter,
          };
        });
      },

      updateCapStatus: (capId, status, actor) => {
        const prev = get().caps.find((c) => c.id === capId);
        set((s) => ({
          caps: s.caps.map((c) =>
            c.id === capId
              ? { ...c, status, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
        get().addAudit({
          actor,
          actorType: 'user',
          action: `changed status from "${prev?.status ?? 'unknown'}" to "${status}"`,
          entity: 'cap',
          entityId: capId,
          before: prev?.status,
          after: status,
        });
      },

      setFieldOverride: (capId, field, value, actor) => {
        const prev = get().fieldOverrides[capId]?.[field];
        set((s) => ({
          fieldOverrides: {
            ...s.fieldOverrides,
            [capId]: {
              ...(s.fieldOverrides[capId] ?? {}),
              [field]: value,
            },
          },
        }));
        get().addAudit({
          actor,
          actorType: 'user',
          action: `overrode field "${field}" to "${value}"`,
          entity: 'cap',
          entityId: capId,
          before: prev,
          after: value,
        });
      },

      confirmField: (capId, field, actor) => {
        set((s) => ({
          confirmedFields: {
            ...s.confirmedFields,
            [capId]: [...(s.confirmedFields[capId] ?? []), field],
          },
        }));
        get().addAudit({
          actor,
          actorType: 'user',
          action: `confirmed field "${field}"`,
          entity: 'cap',
          entityId: capId,
        });
      },

      addRenewalDelta: (capId, delta) => {
        set((s) => ({
          renewalDeltas: {
            ...s.renewalDeltas,
            [capId]: [
              ...(s.renewalDeltas[capId] ?? []),
              { ...delta, status: 'pending' as const },
            ],
          },
        }));
      },

      resolveRenewalDelta: (capId, field, status, actor) => {
        set((s) => ({
          renewalDeltas: {
            ...s.renewalDeltas,
            [capId]: (s.renewalDeltas[capId] ?? []).map((d) =>
              d.field === field ? { ...d, status } : d
            ),
          },
        }));
        get().addAudit({
          actor,
          actorType: 'user',
          action: `${status} renewal delta for "${field}"`,
          entity: 'cap',
          entityId: capId,
        });
      },

      getAuditForEntity: (entityId) => {
        return get().auditLog.filter((e) => e.entityId === entityId);
      },

      resetAll: () => {
        set({
          caps: initialCaps,
          auditLog: initialAudit,
          fieldOverrides: {},
          confirmedFields: {},
          renewalDeltas: {},
          _auditCounter: initialAudit.length,
        });
      },
    }),
    {
      name: 'ga-cap-data-store',
      version: 1,
    }
  )
);
