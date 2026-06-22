# G&A CAP Platform — Foundational Setup (Admin Console) PRD

> **For:** Engineering teammate building on top of the existing CAP tool prototype.
> **Scope:** The **foundation / Admin Console** layer — everything that must be configured *once, centrally* before any client CAP can be built. This is a sibling area to the existing per-client CAP workspace, not a rewrite of it.
> **Status:** Build spec. Preliminary, iterate as the prototype evolves.

---

## 1. Context & purpose

The CAP platform replaces the manual Excel "Client Approved Plans" workbook (Benefits PRD Initiative A). The existing prototype already covers the **per-client CAP build** (overview, products, plan design & rates, validation, renewal diff, outputs).

This PRD specifies the **layer underneath it**: the centrally-managed foundation that *drives every CAP build*. Today this data is copy-pasted into every Excel workbook (master plans, carrier rates, G&A's pricing factors, dropdown lists, fee schedules, document templates). That's the root cause of CAP errors and rework. The Admin Console makes this data **configured once, versioned, and consumed by every CAP** — so an Account Manager building a quote *selects from* pre-configured truth and never re-keys reference data.

### The core principle: three classes of foundation data

Every screen in this layer falls into one of three buckets, and the **edit rules differ by bucket**. This distinction must be visible in the UI.


| Class         | Source of truth              | Edit rule in this platform                                                          | Examples                                                                                                          |
| ------------- | ---------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Synced**    | **Prism** (system of record) | **Read-only.** Pulled from Prism; never editable here (editing would fork the SoR). | Master plans, carrier base rates, plan-code crosswalk, client records (for renewals)                              |
| **G&A-owned** | **This platform**            | **Editable centrally** by admins; versioned.                                        | Pricing-stack building blocks, global parameters, fees, document templates, vocabularies, validation rules, roles |
| **Connected** | External systems             | **Configured** here (credentials, mappings); data flows via integration.            | ClientSpace (workflow/cases), DocuSign (e-sign)                                                                   |


> **System-of-record rule (non-negotiable):** The platform is **not** a second system of record for plan configs or carrier rates — those live in Prism. The platform *is* the system of record for the G&A pricing recipe, the quoting/proposal artifact, document templates, and approval workflow state. Do not build editable carrier-rate tables; sync them.

### Data/connection note (read before building integrations)

The Prism connection is backed by **simulated data** for now (no live tenant). **This is an implementation detail — do NOT surface it in the UI.** The Connections Hub and every synced screen should present Prism as a normal, live connection (connection health, last-synced timestamps, sync logs, re-sync). Build the integration layer behind an interface so the simulated data source can later be swapped for the real Prism API without UI changes. No "sandbox", "mock", or "demo" labels anywhere in the product surface.

---

## 2. Goals & non-goals

**Goals**

1. Give Benefits Ops admins a single console to establish and maintain all org-wide foundation data.
2. Make carrier rates and master plans **flow from Prism**, with clear freshness and change-review, never manual re-entry.
3. Make G&A's pricing stack **centrally governed** (the building blocks) while still resolving per-client during CAP build.
4. Let admins configure **document/booklet templates, parameters, vocabularies, and validation rules** that every CAP consumes.
5. Configure **ClientSpace and DocuSign** connections that the CAP workflow depends on.
6. Provide a lean path for **underwriting results to enter a CAP** without building brittle underwriting-platform integrations.

**Non-goals**

- No editing of carrier rates or master plan designs inside the platform (Prism owns these).
- No deep API integration with Hero/Gradient or other underwriting platforms (see §8 — handled via upload + extraction).
- No per-client CAP building here — that's the existing workspace. This layer *feeds* it.
- No payroll/billing execution — that's Prism.

---

## 3. F1 — Information architecture & Admin Console shell

A top-level **Admin / Settings** area (this is **F1** — the console shell, navigation, and admin-only gating), separate from the client-facing CAP workspace. Suggested left-nav:

```
Admin Console
├── Connections            (F2)  Prism · ClientSpace · DocuSign
├── Master Plan Library    (F3)  synced plans + carrier rate tables (read-only)
├── Pricing Stack          (F4)  buckets · admin-factor tables · commission · risk-factor formula
├── Parameters & Fees      (F5)  ACA threshold · deduction options · fee schedule
├── Vocabularies           (F6)  managed dropdown lists + carrier reference
├── Document Templates      (F7)  booklet / confirmation / SRA / Prism payload templates
├── Validation Rules       (F8)  typed readiness rules + audit gates
├── Roles & Access         (F9)  field-level permissions (legend model)
└── Underwriting Intake     (F10) upload + AI extraction config
```

---

## 4. Cross-cutting requirements (apply to every module)

These behaviors are shared; implement once and reuse.

- **Source-of-truth badges.** Every field shows where its value comes from: `Prism · synced 2h ago` (read-only styling), `G&A-managed` (editable), or `ClientSpace`/`DocuSign`. Synced fields are visually distinct and non-editable.
- **Effective-dating / versioning.** All G&A-owned config (rates context, pricing factors, parameters, templates, vocab, rules) is **versioned by effective date / plan year**. Editing creates a new version; prior versions are retained and viewable. A CAP **in draft** reads the *current live* version; a CAP **finalized/signed snapshots** the version it used (immutability for audit/SOX). Surface the rule in the UI ("changes apply to new and in-progress CAPs; signed CAPs keep their approved version").
- **Audit trail.** Every create/edit/version/sync action logs actor, timestamp, before→after. Viewable per record. This replaces the workbook's Change Tracker / CAP Updates tabs.
- **Approval on sensitive edits.** Pricing-stack and parameter changes require a second-approver step (configurable). Log the approval.
- **Search + filter** on every list screen.
- **Empty/sync states.** Clear states for "never synced", "sync in progress", "sync failed (with reason + retry)".

---

## 5. F2 — Connections Hub

**Purpose:** One place to configure and monitor the external systems the platform depends on. Home of the Prism connection.

**Screens**

- **Connections overview:** a card per connector (Prism, ClientSpace, DocuSign) showing: status (Connected / Degraded / Disconnected), last successful sync/handshake, and a quick action (Re-sync / Configure / View logs).
- **Connector detail** (per connector): credentials/auth config, sync settings, field mapping, and a **sync log** (timestamped runs, records affected, errors).

**Requirements**

*Prism (the marquee connector — class: Synced source)*

- Configure **what syncs**: master plans, carrier rate tables, plan-code crosswalks, and client-master records (renewal source).
- Configure **cadence**: scheduled (e.g. nightly) **+ on-demand "Re-sync now"** + support for an event/webhook trigger on rate change (design the interface even if the trigger is simulated).
- **Field mapping** view: Prism field → platform field (read-only mapping is fine for v1, but display it).
- **Sync log**: each run shows records added/updated, and a reviewable summary. Failed syncs show reason + retry.
- Present as a live connection at all times (see §1 data note).

#### Ongoing sync model (two inbound streams)

The Prism connection maintains **two inbound (read-only) sync streams**. The outbound **write-back** to Prism is a separate path (per-CAP onboarding/renewal handoff — not part of this sync). All experiences (new business, renewal) *consume* these streams; they do not implement their own sync.

- **Stream 1 — Master data (continuous, shared).** Carrier rates, master-plan catalog, plan-code crosswalks. Drives every CAP, so kept continuously current: scheduled baseline **+ event/webhook on change + on-demand**. Each change creates a new **effective-dated version** — this version history is the anchor for downstream drift detection. New rate versions pass through the F3 diff-review before going live.
- **Stream 2 — Client records (mirror + per-client refresh).** The Prism client-master records (effective dates, prior/current factors, WSE counts, classes, plans offered) that change mid-year. Maintained as a **synced mirror** (keeps the renewal radar/queue accurate) **plus an on-demand "Refresh this client"** that the renewal flow triggers at start to establish a clean, timestamped baseline.
- **Change-capture, not just snapshots.** Prefer delta/change feeds so the platform can show "what changed since last sync" (master) and "what changed on this client since last year's CAP" (client). Where Prism can't push deltas, fall back to scheduled snapshot-and-compare. Client record state is timestamped with a change log; master data carries version history.
- **Drift-detection plumbing.** Every CAP records the master-data versions it referenced (see §4 snapshot rule). A background **drift check** compares each CAP's pinned versions against current live versions and exposes the delta to the consuming experience (e.g. the renewal **data-currency banner**). This is provided by the foundation; experiences only read it.

*ClientSpace (class: Connected — workflow/case/forms engine)*

- Configure connection + the case/workflow objects the CAP writes to (case creation, approval routing, benefits-page export, commissions).
- This is where CAP **workflow state** is mirrored; the Admin Console only configures the connection — the per-CAP workspace drives the actual case events.

*DocuSign (class: Connected — e-signature)*

- Configure connection + **envelope/template mapping** and signer routing rules used when a CAP booklet is sent for client sign-off.
- Show status callbacks (sent / viewed / signed) wiring config.

**Acceptance criteria**

- Admin can view all three connectors' health at a glance.
- Admin can trigger a Prism re-sync and see the run reflected in the log.
- No UI text reveals the data source is simulated.

---

## 6. F3 — Master Plan Library (Synced, read-only)

**Purpose:** The browsable catalog of master plans and carrier rates pulled from Prism's **system level**. This is what CAPs quote *from*. Read-only by rule.

**Background (domain):** Prism uses a two-tier model — **system-level** master plans (the reusable catalog G&A negotiates with carriers) and **client-level** plan adoption. This module surfaces the **system-level** catalog. Carrier rates are quoted by **tier** (Employee Only / Employee & Spouse / Employee & Child(ren) / Employee & Family), sometimes age-banded/network/tobacco-varied.

**Screens**

- **Plan list:** searchable/filterable (by carrier, state, plan type, master vs. open-market, plan year). Each row: plan name, carrier, Prism plan code(s), plan year, rate freshness.
- **Plan detail:** plan design summary, carrier, Prism prefix/code, bucket label, and the **rate table by tier**, **versioned by plan year**.
- **Rate change review (diff):** when a sync brings new carrier rates, show a **reviewable diff (old → new)** per plan/tier before it goes live downstream. (Rates "auto-propagate to downstream booklets," so a human-visible diff is the safety valve.) Approving applies the new version; the change is logged.
- **Plan-code crosswalk view:** old Prism code → new Prism code per carrier, used by renewals to auto-migrate plan codes year-over-year. Mostly automatic; surfaced here for transparency/audit.

**Domain reference to model (from the CAP workbook):**

- Master plan catalog maps **dropdown plan name → Prism prefix → bucket label** (e.g. `Master Plan - BCBSTX` → `BCBSTX` → `BCBSTX Bucket:`; `Master Plan - Cigna Nat'l` → `CIGNANATIONAL`; `Open Market` → `OPENMARKET`; `Not Offered` → `NOMEDICAL`). 40+ master medical options, plus ancillary catalogs (Guardian dental, vision, Teladoc, LegalShield).
- Some carriers flagged as manual-rate (e.g. Wellmark) or fixed-rate (e.g. Reliance MEC) — display these flags.

**Requirements**

- All fields read-only with `Prism · synced` badge.
- Rate tables versioned by plan year; allow viewing prior plan-year versions.
- Distinguish **master** vs **open-market** plans (open-market = no EDI/API, manual rates).

**Acceptance criteria**

- Admin can find a master plan and view its current + prior-year rate tables.
- A simulated rate update produces a diff the admin must review/approve before it's live.
- Nothing in this module is editable.

---

## 7. F4 — Pricing Stack (G&A-owned)

**Purpose:** Configure G&A's proprietary pricing recipe — the markup applied on top of carrier base rates. This is the data Prism does **not** model as G&A's own logic, so the platform owns it.

**The math to support (the "FULL BVP" risk-factor model):**

```
billed_rate (per plan, per tier) = carrier_base_rate × risk_factor
risk_factor = admin_factor + commission
bucket = selects which carrier base-rate band/column applies
```

Worked example (BCBSTX, Employee Only): base $810.02 × risk factor 1.15 (admin 1.13 + commission 0.02) = billed $931.52.

### Central vs. per-CAP — the key design decision

The pricing stack is **layered**, mirroring Prism's own system-default → client-override pattern:

- **Central (this module):** the **building blocks and rules** — bucket definitions per carrier, admin-factor tables, commission schedules/defaults, and the risk-factor formula. Stable, org-wide, versioned. **Configured here.**
- **Per-CAP (existing workspace, not here):** **which** bucket/admin-factor/commission applies to a specific client. That is deal-specific — it comes from **underwriting** for new business and from the **prior-year Prism record** for renewals. The CAP build **selects from** the central library; overrides are allowed but gated by approval.

> Do **not** centrally hard-code a client's factor (e.g. "Itafos = 1.15"). Centrally define the *menu* of buckets, the factor tables, and the formula. The client's resolved factor is set at CAP build.

**Screens**

- **Buckets:** per carrier, the defined buckets/bands and what base-rate column each selects.
- **Admin-factor tables:** versioned tables of admin factors (the G&A overhead/margin multiplier component).
- **Commission schedules:** default commission values + handling options (GAB, OB-Friendly, OB, Deduct & Credit Only).
- **Risk-factor formula config:** the formula definition (default `admin_factor + commission`), with the ability to support a **second bucket/admin-factor** for dual-carrier / LP plans.

**Requirements**

- Everything versioned by effective date/plan year.
- Edits require second-approver (sensitive — affects pricing on every deal).
- The per-CAP resolution logic lives in the CAP workspace, but this module must expose the building blocks it reads.

**Acceptance criteria**

- Admin can define/edit a bucket set and admin-factor table for a carrier and version it.
- The CAP workspace can resolve a billed rate using: synced carrier base rate (F3) × risk factor derived from these building blocks.
- Changing an admin-factor table creates a new version; signed CAPs are unaffected.

---

## 8. F5 — Parameters & Fees (G&A-owned)

**Purpose:** The org-wide single-value settings that today rot inside spreadsheet cells.

**Requirements (model each as versioned config):**

- **ACA affordability safe-harbor threshold** (currently `129.9` monthly) — year-versioned; updated annually. Used by the affordability check (`min EE-only employee contribution < threshold ? Affordable : Not affordable`).
- **Annual-deduction options** (12 / 24 / 26 / 52) — the per-CAP value drives every per-pay-period deduction (`PPD = EE_monthly × 12 / annual_deductions`).
- **Fee schedule:** Rush Fee ($150 paper / $500 electronic), Change Fee ($150 / $250), MCHILD ($1,000 one-time + $24 PEPY), WRAP opt-in ($500).

**Acceptance criteria**

- Admin can update the ACA threshold and see it create a new effective-dated version.
- Fee values are read by the CAP workspace, not hard-coded there.

---

## 9. F6 — Vocabularies (G&A-owned)

**Purpose:** Centralize every managed dropdown list so all CAPs use consistent, clean values (important for clean Prism handoff).

**Lists to manage (from the workbook `Options` sheet):** class types, waiting-period options, entity types, commission-handling, HSA/FSA cadence + funding-source options, meeting/packet/enrollment-method/billing-cadence lists, the `Changes` (year-over-year delta) vocabulary, and carrier corporate reference data (WRAP addresses/phones).

**Requirements**

- CRUD on list items; versioned; deactivate without deleting (preserve historical references).
- Each list has a stable key the CAP workspace binds to.

**Acceptance criteria**

- Admin can add/retire a class type; existing CAPs referencing a retired value still render it.

---

## 10. F7 — Document & Booklet Template Studio (G&A-owned)

**Purpose:** Let the platform **generate** client/employee/Prism documents instead of hand-building them.

**Templates to support (from the workbook output tabs):**

- **ER Confirmation** ("Benefits Selection Confirmation") + overflow / open-market-medical variants.
- **EE SRA** ("Benefits Enrollment Form & Salary Redirection Agreement") — **English + Spanish**.
- **EE Rate Sheet**, **OB Confirmation**, **CS Parent Benefits Page**.
- **Prism handoff payload** (the structured "send to analyst" export).

**Requirements**

- **Template editor** with **merge-field mapping** to the CAP data model (a slot binds to e.g. `billed_rate.ee_only`, `er_contribution.family`, `ppd`).
- Branding, multi-language support, and **template versioning**.
- **Live preview rendered with sample client data.**
- Booklet is the artifact routed to DocuSign for client sign-off (ties to F2 DocuSign config).

**Acceptance criteria**

- Admin can edit a template, bind merge fields, and preview it populated with sample data.
- Editing a template versions it; previously generated/signed documents are unaffected.

---

## 11. F8 — Validation Rules (G&A-owned)

**Purpose:** Formalize the workbook's "Action Needed" sentinels and coordinator audit checklist into typed, governed rules that gate CAP readiness/handoff.

**Requirements**

- A library of typed rules: each has a section, field(s), severity (error / warning / info), message, and optional fix hint.
- **Rule types** the library must support:
  - **Completeness rules** — a required field is empty/`Action Needed` (formalizes the workbook sentinels).
  - **Source-data validation rules** — a CAP value is compared against its **system source of truth** and flagged when it diverges. Specifically: each selected plan and its billed/carrier rate is validated against the **F3 master plan catalog + carrier rate table** (for the CAP's pinned plan year) and **Prism plan configurations**; a mismatch (e.g. a manually-entered or extracted rate that doesn't equal the source rate × the F4 risk factor, an unknown/retired plan code, or a tier rate outside the source table) raises a **specific, actionable error** naming the field, the CAP value, the expected source value, and the fix. This is the rule type behind the Benefits PRD demo step 2 and the "real-time validation against Prism plan configs and carrier rate tables… discrepancies flagged at the source" target-end-state requirement.
  - **Cross-field/consistency rules** — e.g. booklet/CAP rates & plans match, affordability (reads the F5 threshold), open-market SBC completeness.
- **Audit-gate rules** that block Ben Admin handoff until satisfied (e.g. "CAP completely filled", "Booklet/CAP rates & plans match", "ClientSpace benefits page updated", "Open-market SBCs complete"). Source-data validation errors are audit gates by default.
- Rules evaluate **in real time** as the CAP is edited (not only at handoff), so discrepancies surface at the source the moment they appear.
- Versioned; admin can enable/disable and edit messages.

**Acceptance criteria**

- Admin can edit a rule's message/severity.
- A CAP rate that does not match the F3 source rate table (for its pinned plan year) raises a specific, actionable error identifying the field, the entered value, and the expected source value.
- The CAP workspace's readiness check reads this rule set; an unmet error-severity gate (including a source-data discrepancy) blocks handoff.

---

## 12. F9 — Roles & Access (G&A-owned)

**Purpose:** Field-level permissions and client-sharing controls, derived from the workbook's color legend.

**Model (map the legend to access):**

- **Blue** — AM-entry fields (primary inputs).
- **Yellow** — conditional inputs.
- **Green** — client-shareable / approved-to-share.
- **Red** — internal only / do not share.

**Requirements**

- Map roles (GAB: Account Manager, Coordinator, Underwriter; Ben Admin: Analyst, Specialist; plus Admin) to field-edit and document-sharing rights.
- Enforce that synced (Prism) fields are read-only for everyone.
- Respect PHI/PII/wage-data sensitivity and SOX controls (dual-review on enrollment/deduction-affecting changes).

**Acceptance criteria**

- A non-admin role cannot edit pricing-stack or parameter config.
- Red-classified fields are never included in client-shared outputs.

---

## 13. F10 — Underwriting Intake (G&A-owned, no platform integration)

**Decision:** **Do not integrate** with Hero/Gradient or other underwriting platforms (they are manual, no-API risk-scoring tools — high effort, low ROI, brittle). Instead, capture underwriting *results* into a CAP via **document upload + AI extraction**, with manual entry as fallback. This intentionally ties into Benefits PRD **Initiative B (AI Underwriting Assistant)** rather than owning a fragile integration.

**Requirements (foundation portion — the config + intake surface):**

- An **"underwriting result intake"** that accepts uploads (SBCs, carrier invoices, underwriting output PDFs) → AI extracts plan data / factors → **human confirms** → values populate the CAP's pricing factors and plan data.
- Configurable extraction field map (what we expect to pull: bucket, admin factor, commission, rates, plan designs).
- Completeness check that flags missing required fields before a case can proceed (mirrors Initiative B's pre-submission gate).
- **Renewals don't need this** — factors arrive via the Prism client-master export (F3 / renewal flow). Make the intake the path for **new business** primarily.

**Acceptance criteria**

- A user can upload a document, see extracted fields, correct them, and push confirmed values into a CAP.
- No outbound connection to any underwriting platform exists.

---

## 14. Data model (entities to introduce/extend)

Conceptual entities for the foundation layer (names illustrative; align to existing prototype conventions as the teammate sees fit):

- **Connection** — { system: Prism|ClientSpace|DocuSign, status, lastSync, config, mappings, logs[] }
- **MasterPlan** (synced) — { name, carrier, state, planType, prismPrefix, prismCodes, bucketLabel, masterOrOpenMarket, rateFlags }
- **CarrierRateTable** (synced, versioned) — { masterPlanId, planYear, ratesByTier{}, effectiveDate, syncedAt }
- **PlanCodeCrosswalk** (synced) — { carrier, oldCode, newCode }
- **Bucket** (G&A, versioned) — { carrier, bucketId, baseRateColumnRef }
- **AdminFactorTable** / **CommissionSchedule** (G&A, versioned)
- **RiskFactorFormula** (G&A, versioned) — { definition, supportsSecondBucket }
- **GlobalParameter** (G&A, versioned) — { key, value, effectiveDate } (ACA threshold, deduction options)
- **Fee** (G&A, versioned)
- **Vocabulary** / **VocabularyItem** (G&A, versioned)
- **DocumentTemplate** (G&A, versioned) — { type, language, body, mergeFieldMap }
- **ValidationRule** (G&A, versioned) — { section, fields, severity, message, fix, isAuditGate }
- **RoleAccessMatrix** (G&A) — { roleId, fieldClass(blue/yellow/green/red), canEdit, canShare }
- **UnderwritingIntake** — { uploads[], extractedFields, confirmedFields, completeness }
- **AuditEvent** — { entity, action, actor, ts, before, after }

**Common pattern:** every G&A-owned entity carries `{ version, effectiveDate, status(active/superseded), createdBy, approvedBy }`.

---

## 15. Build sequencing (suggested milestones)

Ordered for fastest path to a coherent, demoable foundation that the existing CAP workspace can consume.

**Milestone 1 — Spine (demo-critical)**

- F2 Connections Hub (all three connectors, Prism live + healthy).
- F3 Master Plan Library (browse plans + rate tables, freshness badges, rate-diff review).
- F4 Pricing Stack (buckets + admin-factor + formula) — enough for the CAP workspace to resolve one billed rate end-to-end.
- F7 Document Templates (one template editable + live preview).

**Milestone 2 — Governance**

- F5 Parameters & Fees, F6 Vocabularies, F8 Validation Rules.
- Versioning/effective-dating + audit trail wired across all G&A-owned modules.

**Milestone 3 — Access & intake**

- F9 Roles & Access, F10 Underwriting Intake.
- DocuSign envelope mapping + ClientSpace case-object config hardened.z

---

## 16. Open questions (confirm with G&A / Paul, the benefits SME)

1. **Where does G&A's factor stack (bucket/admin/commission) live today** — Prism custom fields, a separate UW system, or only spreadsheets? Determines whether F4 *reads* some of these from Prism vs. fully masters them here.
2. **Naming:** confirm "CAP" = *Client Approved Plans* (PRD/workbook) is the same object stakeholders call *Carrier Administration Process* in conversation — same artifact, validate before build.
3. **Open-market plans:** confirm there's no rate API; assume manual rate capture via F10 intake.
4. **Rate-change propagation policy:** when a carrier rate updates mid-cycle, confirm the desired behavior for in-flight draft CAPs (auto-pick-up new version vs. hold) — current spec: drafts pick up live version, signed CAPs keep their snapshot.
5. **Unified data lake dependency:** confirm whether F2 Prism sync should target the CTO's planned data lake or a scoped interim data layer for now.

---

*G&A CAP Platform — Foundational Setup PRD · Build spec for the existing CAP prototype · Preliminary.*