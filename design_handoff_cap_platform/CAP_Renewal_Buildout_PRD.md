# G&A CAP Platform — Renewal CAP PRD

> **For:** Engineering teammate building on top of the existing CAP tool prototype.
> **Scope:** The **renewal CAP experience** — from the renewal radar, through prior-year pre-fill, document-driven updates, version-drift reconciliation, approval, annual sign-off, and Prism write-back.
> **Depends on:** The **Foundational Setup (Admin Console) PRD** (modules F1–F10, and especially the **Ongoing sync model** in F2) and shares machinery with the **New Business CAP Build-out PRD** (referenced as NB#).
> **Status:** Build spec. Preliminary, iterate as the prototype evolves.

---

## 1. Context & purpose

The platform supports two CAP origination paths. New business **fuses uploaded documents** into a fresh CAP. A **renewal starts from a known baseline** — last year's CAP plus the current Prism client record — so the work is **"diff and approve," not "build."**

The defining challenge of renewals is that **two independent dimensions of change** must be reconciled, and the AM should only ever spend attention on what actually moved:

1. **Client-driven change** — renewal rate increase, plan adds/drops, census/class/headcount changes.
2. **Master-data drift** — carrier rates, pricing-stack factors, parameters, or templates that were **re-versioned during the plan year** *after* last year's CAP was frozen.

Most renewal tooling surfaces only #1. Making #2 visible and reconcilable — *"this CAP is still on 2025 rates; here's what changed in 2026"* — is the platform's differentiator and a clean demo "aha."

### Relationship to the foundation (no sync logic here)

This experience **consumes** the foundation's two inbound Prism streams (Foundation PRD F2 → *Ongoing sync model*): continuously-synced **master data** (with effective-dated versions) and the **client-record** mirror + per-client refresh. The renewal flow does **not** implement its own sync — it reads the synced data and the drift signal the foundation provides.

---

## 2. Goals & non-goals

**Goals**

1. Surface **upcoming renewals** from synced client records, on time, with ownership and risk.
2. **Pre-fill the renewal CAP** from the prior-year CAP + current Prism record, auto-migrating plan codes.
3. Let updates arrive via **wizard edits and document upload**, both rendered as **reviewable deltas** against the carried-forward baseline.
4. Make **master-data drift visible and reconcilable** — every CAP declares which versions it references, detects staleness, and reconciles the move on the record.
5. Run the **approval lifecycle** with renewal-specific gates (e.g. Renewal Increase Confirmed).
6. Generate the booklet from the model and manage **annual contract sign-off** with year-over-year history.
7. **Close the loop** to Prism as an *update* to the existing client.

**Non-goals**

- No sync mechanics here (owned by foundation F2).
- No re-mastering of carrier rates/plans (synced; F3).
- No payroll/billing execution (Prism).
- New-business origination is out of scope (separate PRD).

---

## 3. The experience at a glance

```
Renewal CAP
│
├── R1  Renewal Radar / Book of Business   synced client records → upcoming renewals, owner, risk
├── R2  Start Renewal & Pre-fill            prior-year CAP + Prism record → pre-filled CAP + code migration
├── R3  Document Updates as Deltas          uploads propose changes vs. carried-forward values
├── R4  Data-Currency & Version Drift        which versions this CAP references + what's newer
├── R5  Renewal Diff & Review               unified diff (carried-forward vs changed; client vs master); bulk approve
├── R6  Readiness & Approval                renewal-increase gate + audit gates → lifecycle
├── R7  Booklet & Annual Contract Mgmt       live preview → issued → signed; year-over-year sign-off history
├── R8  Client Sign-off                     DocuSign e-sign
└── R9  Prism Write-back                     update existing client config (phased)
```

---

## 4. Cross-cutting requirements

- **Everything is a diff.** Carried-forward vs. changed, client-driven vs. master-driven, last year's snapshot vs. this year's data. The AM acts only on what moved.
- **Provenance + foundation linkage** (as in NB): every field shows its source and a linkage chip to the foundation record + version.
- **Version pinning & snapshot-on-finalize** (Foundation §4): the renewal reads *live* foundation versions once re-based; on sign-off it **snapshots** the versions used. The prior signed booklet remains immutable on its own snapshot.
- **Validation gating (F8):** error-severity issues block Ben Admin handoff; warnings advise.
- **Audit trail:** every edit, approval, generation, drift reconciliation, and sync read logs actor + timestamp + before→after.
- **Role-aware UI (F9):** edit/visibility per the legend model; per-role "needs you" queue.

---

## 5. R1 — Renewal Radar / Book of Business

**Purpose:** Surface upcoming renewals from synced client records so they start on time.

**Powered by:** Foundation F2 *Stream 2* (client-record mirror).

**Screen**
- A renewal **queue/calendar** keyed on each client's **effective date**, sorted by renewal month (July and Q4 are the seasonal spikes).
- Per row: client, effective date, days-to-renewal, AM/specialist owner, current status, and risk flags (renewal increase %, stalled).
- Filters: by month, owner, status; a **"needs you"** filter per role.

**Requirements**
- **Lead-time triggers** — surface renewals at configurable thresholds (e.g. 120 / 90 / 60 days out) with escalation as the date approaches.
- **Batch handling** — select multiple renewals to initiate or progress together (renewals are seasonal and high-volume).
- Reads from the synced client-record mirror; shows mirror freshness ("client data as of …").

**Acceptance criteria**
- Upcoming renewals appear sorted by effective date with owner + days-to-renewal.
- An AM can filter to their own due renewals and start one from the radar.

---

## 6. R2 — Start Renewal & Pre-fill

**Purpose:** Establish the renewal baseline by fusing the prior-year CAP with the current Prism record — a review surface, not a blank form.

**Requirements**
- On start, trigger a **per-client refresh** (Foundation F2 *Stream 2* "Refresh this client") to capture mid-year changes as of a clean timestamp.
- **Pre-fill from two sources:**
  - **Prior-year CAP** — plan lineup, contribution strategy, administration config.
  - **Prism client-master record** — carrier, buckets, admin/commission/risk factors (**prior and current year**), effective date, WSE count, Mchild, deductions, classes, waiting period, AM/specialist.
- **Plan-code crosswalk migration (F3):** auto-apply old→new Prism plan codes for the renewal year.
- **Change-flag derivation:** auto-derive each benefit line's `Changes` value (same carrier/same rates · only rates changed · plans+rates changed · plan added) from the prior vs. current data, so the AM sees *what kind* of change each line is before editing.
- Land the AM on the **Renewal Diff** review surface (R5) with carried-forward items pre-approvable in bulk.

**Acceptance criteria**
- Selecting a due client produces a pre-filled CAP with migrated plan codes and per-line change flags.
- Prior- and current-year factors are both present and visible.

---

## 7. R3 — Document Updates as Deltas

**Purpose:** Allow document-driven updates (refreshed census, new SBCs, revised underwriting, updated invoice) **on top of** the pre-filled baseline — without overwriting silently.

**Requirements**
- Reuse the new-business extraction engine (NB2), but in **update mode**: an extracted value that differs from the carried-forward value renders as a **proposed delta** (e.g. "Census headcount 298 → 312 (from uploaded census)") that the AM **accepts or rejects**.
- Accepted deltas fold into the unified Renewal Diff (R5) alongside all other changes; rejected ones are logged.
- Document uploads are optional — the wizard remains the primary edit path; uploads are an accelerator.

**Acceptance criteria**
- Uploading a document surfaces proposed deltas vs. the baseline, never silent overwrites.
- Accepting a delta updates the field and records it in the diff + audit log.

---

## 8. R4 — Data-Currency & Version Drift (centerpiece)

**Purpose:** Make master-data drift legible — the platform always declares which versions a CAP references, detects staleness, and reconciles the move.

**Powered by:** Foundation F2 *drift-detection plumbing* + the version pins on the CAP.

**Requirements**
- **Data-currency banner** on open: state the baseline plainly — *"This renewal is based on 2025 master data. Newer versions are available: 2026 carrier rates, Pricing Stack v4, ACA threshold 2026. Review 14 changes."*
- **Per-field version badges:** a value shows its version (e.g. `2025 rate`) with an indicator when a newer version exists; clicking reveals old→new.
- **"Bring up to date" / re-baseline action:** pull the renewal forward onto current foundation versions, presented as a **reviewable diff** (never an automatic swap). The AM approves the move; the reconciliation is logged.
- **Audit corollary:** the prior signed booklet stays immutable on its 2025 snapshot; the renewal becomes a *new* versioned artifact on 2026 data — yielding a clean year-over-year trail of which data each approval used.

**Acceptance criteria**
- Opening a renewal whose pinned versions are stale shows the data-currency banner with an accurate change count.
- "Bring up to date" produces a reviewable diff the AM must approve before values move.
- A field on an outdated version is badged and can show old→new.

---

## 9. R5 — Renewal Diff & Review

**Purpose:** One review surface where the AM resolves everything that moved, with the *source* of each change made explicit.

**Requirements**
- A unified diff listing every change, each tagged by **type**:

| Change type | Source | Example |
|---|---|---|
| **Client-driven** | Prism record + uploaded docs (R3) | Renewal increase, plan added, headcount change |
| **Master-data-driven** | Foundation version bumps (F3/F4/F5/F7) via R4 | Carrier rate table updated, admin factor revised, ACA threshold changed, template updated |

- **Bulk-approve carried-forward** (unchanged) items; focus attention on changed lines.
- Per row: prior value, current value, change type, source/linkage chip, and accept/adjust controls.
- Live recompute on acceptance (e.g. a rate change flows through the contribution calculator to ER/EE split + PPD).

**Acceptance criteria**
- The diff distinguishes client-driven vs. master-data-driven changes.
- The AM can bulk-approve carried-forward items and adjust changed ones, with live recompute.

---

## 10. R6 — Readiness & Approval lifecycle

**Purpose:** Run the renewal through review/approval with renewal-specific gates.

**Roles** (same as new business): **AM/AE** owns the renewal; **Underwriter** confirms/updates factors; **Coordinator** runs QC; **Client** signs off; **Benefits Analyst** configures Prism.

**Lifecycle:**
```
Draft → Internal Review (Coordinator QC) → Client Sign-off → Approved → Ben Admin Handoff → Configured
```

**Renewal-specific readiness gates (F8):**
- **Renewal Increase Confirmed** (explicit gate, from the workbook audit checklist).
- **Source-data / rate validation** — every plan and rate is validated **in real time against its source of truth** (F3 carrier rate tables for the renewal's plan year + Prism plan configurations); a discrepancy raises a specific, actionable error at the field and is an audit gate. On renewals this also catches a value that **stayed on a stale rate** (carried forward but not reconciled to the current rate table — ties to R4 drift) and any **open-market rate** that doesn't match its source. Same F8 rule type as the new-business demo path.
- Standard audit gates: CAP completely filled, Booklet/CAP rates & plans match, ClientSpace benefits page updated, open-market SBCs complete.
- Plus: **no unreconciled version drift** (R4) and **no unresolved proposed deltas** (R3) before handoff.

**Collaboration mechanics:** per-field comments + @mentions, per-role "needs you" queue, activity/audit log, section-scoped change-requests that re-run the relevant gates (and re-version the booklet per R7).

**Acceptance criteria**
- The renewal cannot advance to handoff with unconfirmed renewal increase, unreconciled drift, or an unresolved source-data rate discrepancy.
- A carried-forward rate that no longer matches the current source rate table is flagged with the expected value before handoff.
- Status transitions are gated to the correct role.

---

## 11. R7 — Booklet Generation & Annual Contract Management

**Purpose:** Generate the renewal booklet from the model and manage the **annual** client sign-off with history.

**Requirements**
- **Live preview** from F7 templates + CAP data (always in sync — eliminates the "booklet/CAP rates must match" drift gate).
- **Issued once** for client sign-off; **re-versioned** on material change; **signed version snapshotted and locked**.
- **Annual contract management:** obtain, store, and **track the client's plan sign-off each year**, with a **year-over-year version history** of signed booklets (2024 → 2025 → 2026), each **pinned to its data snapshot** (ties to R4). This history is the audit trail the Benefits PRD's e-sign/contract requirement calls for.

**Acceptance criteria**
- The booklet preview reflects current renewal data with no manual build.
- Each annual sign-off is stored and retrievable as a versioned, snapshot-pinned record.

---

## 12. R8 — Client Sign-off

**Purpose:** Route the issued renewal booklet for client e-signature.

**Requirements**
- Send via **DocuSign** (F2 config) with signer routing; track sent/viewed/signed on the CAP.
- On signature: advance to **Approved**, snapshot CAP + booklet versions, append to the annual sign-off history (R7), and log the event.

**Acceptance criteria**
- The AM can route the renewal booklet and see status update.
- Signature locks the artifact and advances the lifecycle.

---

## 13. R9 — Prism Write-back

**Purpose:** Close the loop — push the approved renewal to Prism as an **update** to the existing client (cleaner than a new-business create, since the client already exists).

**Phased (same approach as NB9):**
- **Phase 1 (demo-ready, no live tenant):** generate a **structured, validated update payload** (changed plans/rates/codes/params, with migrated plan codes) and demonstrate a **simulated write-back** updating the existing Prism client.
- **Phase 2 (scoped build):** real **Prism API update** via the benefit service — apply the renewal config to the existing client; idempotent, with error/rollback and audit. Dependency: Prism API access + interim data layer.

**Requirements**
- Generate the update payload from approved-renewal data; validate against F8 (no error-severity issues pass).
- **Ben Admin handoff view:** the Analyst reviews the validated update, confirms, and triggers the write-back (simulated in Phase 1).
- Mirror case/approval state into **ClientSpace** (F2).
- On success, advance the CAP to **Configured**.

**Acceptance criteria**
- An approved renewal produces a structured, validated Prism **update** payload (not a create).
- The Analyst can review and trigger the (simulated) write-back, advancing to Configured.
- ClientSpace reflects the renewal handoff case/state.

---

## 14. Data model (entities to introduce/extend)

Conceptual entities (names illustrative; align to existing prototype conventions):

- **RenewalBaseline** — { capId, priorCapId, prismRecordSnapshot, refreshedAt }
- **DiffRow** (extend existing) — add `changeType: client|master`, `source`, `priorValue`, `currentValue`, `linkageRef`, `status: carried|changed|accepted|rejected`
- **DriftReport** — { capId, pinnedVersions[], currentVersions[], staleItems[]: { module, recordId, from, to }, reconciledAt? }
- **ProposedDelta** — { capId, field, baselineValue, proposedValue, sourceDocId, decision: accept|reject }
- **PlanCodeMigration** — { capId, line, oldCode, newCode, carrier }
- **ContractSignoff** (annual history) — { clientId, planYear, bookletVersionId, dataSnapshotRef, signedAt, status }
- **PrismHandoff** (extend) — add `operation: create|update`
- **AuditEvent** — { entity, action, actor, ts, before, after }

Extend **Cap** with renewal state: baseline reference, drift report, pinned foundation versions, per-line change flags, annual sign-off linkage.

---

## 15. Build sequencing (suggested milestones)

**Milestone 1 — Baseline + diff spine (demo-critical)**
- R1 Renewal Radar (from synced client records).
- R2 Start Renewal & Pre-fill (prior CAP + Prism record + code migration + change flags).
- R5 Renewal Diff with bulk-approve and live recompute.

**Milestone 2 — The differentiator**
- R4 Data-Currency & Version Drift (banner, version badges, re-baseline diff).
- R3 Document Updates as Deltas.

**Milestone 3 — Approve & close the loop**
- R6 Readiness/approval with renewal-increase gate.
- R7 Booklet + annual contract management; R8 DocuSign sign-off.
- R9 Structured Prism **update** payload + simulated write-back + ClientSpace mirror.

---

*G&A CAP Platform — Renewal CAP PRD · Build spec for the existing CAP prototype · Preliminary.*
