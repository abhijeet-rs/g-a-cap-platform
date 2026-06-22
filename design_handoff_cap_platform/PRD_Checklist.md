# CAP Platform v3 — PRD Compliance Checklist

## North Star Demo Goals (from 00_Overview §9)
- [ ] Renewal CAP auto-populated from prior-year Prism — reviewed & approved without re-entry
- [ ] New-business validation: rate discrepancy → specific actionable error before Ben Admin
- [ ] Benefits booklet auto-generated from approved CAP data
- [ ] E-signature workflow routing CAP to client for sign-off
- [ ] Structured CAP data downstream for Prism/WorkSight without re-entry

---

## Foundation PRD (F1–F10)

### F1 — Admin Console Shell
- [ ] Top-level Admin area, separate from CAP workspace
- [ ] Left-nav with all 10 modules (F2–F10)
- [ ] Admin-only gating

### F2 — Connections Hub
- [ ] Card per connector: Prism, ClientSpace, DocuSign (status, last sync, actions)
- [ ] Connector detail: credentials, sync settings, field mapping, sync log
- [ ] Prism: configurable sync (scheduled + on-demand + webhook trigger)
- [ ] Two Prism sync streams: Master data (continuous) + Client records (mirror + refresh)
- [ ] Sync log with records added/updated, failures
- [ ] No "sandbox/mock/demo" labels — always present as live
- [ ] Drift-detection plumbing (CAP's pinned versions vs current live)

### F3 — Master Plan Library
- [ ] Browsable plan catalog (searchable/filterable by carrier, state, plan type)
- [ ] Plan detail: design summary, carrier, Prism codes, rate table by tier (versioned by plan year)
- [ ] Rate change diff review (old→new per plan/tier)
- [ ] Plan-code crosswalk view (old code → new code)
- [ ] All fields read-only with `Prism · synced` badge
- [ ] Distinguish master vs open-market plans

### F4 — Pricing Stack
- [ ] Buckets per carrier
- [ ] Admin-factor tables (versioned)
- [ ] Commission schedules/defaults
- [ ] Risk-factor formula config: `billed = base × risk_factor` where `RF = admin_factor + commission`
- [ ] Everything versioned by effective date
- [ ] Edits require second-approver
- [ ] Central building blocks, per-CAP resolution

### F5 — Parameters & Fees
- [ ] ACA affordability threshold ($129.9/mo, year-versioned)
- [ ] Annual-deduction options (12/24/26/52)
- [ ] Fee schedule (Rush, Change, MCHILD, WRAP)
- [ ] Versioned config

### F6 — Vocabularies
- [ ] Managed dropdown lists: class types, waiting periods, entity types, commission handling, HSA/FSA cadence, meeting/enrollment/billing
- [ ] CRUD + deactivate without delete
- [ ] Versioned

### F7 — Document Templates
- [ ] Template editor with merge-field mapping
- [ ] ER Confirmation, EE SRA (EN+ES), Rate Sheet, OB Confirmation, Prism payload
- [ ] Live preview with sample data
- [ ] Template versioning

### F8 — Validation Rules
- [ ] Library of typed rules: completeness, source-data validation, cross-field, audit gates
- [ ] Each rule: section, fields, severity, message, fix hint
- [ ] Real-time evaluation during CAP edit
- [ ] Source-data validation against F3 + F4
- [ ] Versioned, enable/disable

### F9 — Roles & Access
- [ ] Field-level permissions: Blue (AM-entry), Yellow (conditional), Green (shareable), Red (internal)
- [ ] 6+ roles mapped to field-edit and document-sharing rights
- [ ] Synced fields read-only for everyone
- [ ] PHI/PII/SOX controls

### F10 — Underwriting Intake
- [ ] Upload zone for SBCs, invoices, UW output PDFs
- [ ] AI extraction → human confirms → populates CAP
- [ ] Configurable extraction field map
- [ ] Completeness check

### Cross-cutting (F)
- [ ] Source-of-truth badges everywhere: `Prism · synced`, `G&A-managed`, `Connected`
- [ ] Effective-dating / versioning on all G&A-owned data
- [ ] Audit trail: create/edit/version/sync logs actor + timestamp + before→after
- [ ] Approval on sensitive edits
- [ ] Search + filter on every list
- [ ] Empty/sync states

---

## New Business PRD (NB1–NB9)

### NB1 — Intake & Document Upload
- [ ] Seed fields: company name, plan year, effective month, carriers, EE count
- [ ] Document checklist + drop-zone with "what it unlocks"
- [ ] Multi-file upload, mixed formats, auto-classification
- [ ] Proceed with missing docs → flags carried forward

### NB2 — AI Extraction & Completeness
- [ ] Extraction results with confidence scores
- [ ] Completeness gate: extracted / low-confidence / missing summary
- [ ] Flags persist into CAP

### NB3 — Pre-filled Assembly
- [ ] Fuse 3 sources: Foundation → Extraction → Underwriting → Needs input
- [ ] Provenance tags on every field
- [ ] Foundation linkage chips (clickable)
- [ ] Open-market rates flagged `From upload · confirm rates`
- [ ] Initial readiness count

### NB4 — Section Build
- [ ] Each section shows foundation source chips
- [ ] Overview: F6 Vocabularies + extraction
- [ ] Products Grid: F3 Master Plan Library selection
- [ ] Plan Design & Rates: F3 × F4 calculation
- [ ] Contribution strategy modeling: Variable / Base Plan / Flat Dollar / Rolldown
- [ ] Live PPD recompute
- [ ] Affordability check against F5 ACA threshold
- [ ] Tax Plans: F6 HSA/FSA options
- [ ] Administration: F6 + F5 Fees

### NB5 — Readiness & Flagging
- [ ] Inline flags on each unresolved field
- [ ] Persistent readiness rail (N items by section/severity)
- [ ] Handoff gate: error-severity blocks Ben Admin handoff
- [ ] Source-data validation: rate vs F3 table, specific actionable errors
- [ ] Error format: field + entered value + expected value + fix

### NB6 — Collaboration & Approval
- [ ] Status lifecycle: Draft → Internal Review → Client Sign-off → Approved → Handoff → Configured
- [ ] Per-field comments + @mentions
- [ ] "Needs you" queue per role
- [ ] Activity/audit log
- [ ] Change-requests re-open specific sections

### NB7 — Booklet Generation
- [ ] Live preview from F7 templates + CAP data
- [ ] Issued once for sign-off, re-versioned on material change
- [ ] Signed version snapshotted and locked

### NB8 — Client Sign-off
- [ ] DocuSign routing with signer routing
- [ ] Status tracking: sent / viewed / signed
- [ ] On signature: snapshot CAP + booklet versions

### NB9 — Ben Admin Handoff
- [ ] Structured Prism handoff payload (validated)
- [ ] Ben Admin review + trigger write-back (simulated)
- [ ] ClientSpace case mirror
- [ ] Advance to Configured

### Cross-cutting (NB)
- [ ] Provenance tags: `From library`, `From upload · confirm`, `Needs input`, `Underwriting`
- [ ] Foundation linkage chips on values from F3-F8
- [ ] Version pinning + snapshot-on-finalize
- [ ] Audit trail on every action

---

## Renewal PRD (R1–R9)

### R1 — Renewal Radar
- [ ] Queue/calendar by effective date
- [ ] Per row: client, effective date, days-to-renewal, owner, status, risk flags
- [ ] Lead-time triggers (120/90/60 days)
- [ ] Batch handling
- [ ] "Needs you" filter per role

### R2 — Start Renewal & Pre-fill
- [ ] Per-client Prism refresh on start
- [ ] Pre-fill from prior-year CAP + Prism client record
- [ ] Plan-code crosswalk migration (old→new codes)
- [ ] Auto-derived change flags per benefit line
- [ ] Land on Renewal Diff (R5)

### R3 — Document Updates as Deltas
- [ ] Upload in update mode → proposed deltas vs baseline
- [ ] Accept/reject per delta
- [ ] Accepted deltas fold into unified diff (R5)

### R4 — Data-Currency & Version Drift ⭐
- [ ] Data-currency banner: "Based on 2025 data, N newer changes available"
- [ ] Per-field version badges with old→new on click
- [ ] "Bring up to date" re-baseline action → reviewable diff
- [ ] Reconciliation logged in audit
- [ ] Prior signed booklet stays on its snapshot

### R5 — Renewal Diff & Review
- [ ] Unified diff: each change tagged client-driven vs master-data-driven
- [ ] Bulk-approve carried-forward items
- [ ] Per row: prior, current, change type, source chip, accept/adjust
- [ ] Live recompute on acceptance

### R6 — Readiness & Approval
- [ ] Renewal-specific gates: Renewal Increase Confirmed, no unreconciled drift
- [ ] Source-data validation (F8) — rate vs current rate table
- [ ] Carried-forward stale rates flagged
- [ ] Status lifecycle same as NB6

### R7 — Booklet & Annual Contract
- [ ] Live preview, versioned, signed locked
- [ ] Year-over-year sign-off history (2024→2025→2026)
- [ ] Each pinned to its data snapshot

### R8 — Client Sign-off
- [ ] DocuSign routing, status tracking
- [ ] On signature: snapshot + append to annual history

### R9 — Prism Write-back
- [ ] Structured update payload (not create)
- [ ] Ben Admin review + trigger
- [ ] ClientSpace case mirror

---

## Copilot PRD (CP1–CP7)

### CP1 — Sidebar & Interaction
- [ ] Persistent sidebar panel, togglable from anywhere
- [ ] Conversational I/O with actionable cards
- [ ] Multi-turn chaining
- [ ] Deep-links to sections/fields
- [ ] Inline before→after diffs for proposed writes

### CP2 — Context Awareness
- [ ] Knows active CAP, section, role, flow type, pinned versions
- [ ] Retrieval over real data (not fabricated)
- [ ] Citations with source reference

### CP3 — Read Tools
- [ ] CAP model queries
- [ ] Foundation (F3-F8) lookups
- [ ] Prism (via F2) reads
- [ ] ClientSpace case status
- [ ] Document extraction results
- [ ] DocuSign envelope status
- [ ] Cross-CAP / prior-year

### CP4 — Write Tools
- [ ] Field edits with diff+confirm
- [ ] Contribution modeling with recompute preview
- [ ] Diff resolution (accept/reject deltas)
- [ ] Drift reconciliation
- [ ] Run validation / summarize blockers
- [ ] Generate/preview booklet
- [ ] Route for signature, generate Prism payload
- [ ] All writes confirmed before apply

### CP5 — Explain & Reason
- [ ] Explain value math step-by-step with citations
- [ ] Explain blockers with jump-links
- [ ] Explain differences (client vs master)
- [ ] Explain field definitions

### CP6 — Suggested Actions
- [ ] Context-aware prompt chips (differ by flow/section)
- [ ] Proactive nudges tied to real state
- [ ] One-click actionable (still with confirmation)

### CP7 — Guardrails
- [ ] Confirmation on all writes
- [ ] RBAC enforcement (action set = capabilities ∩ role)
- [ ] PII/PHI minimization
- [ ] Grounded-or-silent (no fabrication)
- [ ] Full audit logging (kind: "ai")
- [ ] Source transparency / citations

### Cross-cutting (CP)
- [ ] Flow-adaptive: New Business vs Renewal behaviors
- [ ] Scripted/offline mode preserved for demo

---

## Cross-cutting (All PRDs)

### Data Governance
- [ ] Three data classes visible: Synced, G&A-owned, Connected
- [ ] PHI/PII/SOX aware throughout
- [ ] Field-level permissions
- [ ] Everything auditable

### Provenance
- [ ] Every field shows source: `Prism · synced`, `From library`, `From upload · confirm`, `Needs input`, `Underwriting`
- [ ] Linkage chips to source record + version (clickable)

### Versioning
- [ ] All G&A-owned data versioned by effective date
- [ ] Drafts read live versions
- [ ] Finalized/signed CAPs snapshot versions used
- [ ] Snapshot immutable for audit/SOX

### Validation
- [ ] Real-time as fields edited
- [ ] Source-data validation against F3/F4
- [ ] Specific actionable errors at field level
- [ ] Error-severity gates block handoff

### Demo Constraints
- [ ] Prism connection always presents as live
- [ ] No sandbox/mock/demo labels
- [ ] Build on existing prototype conventions
