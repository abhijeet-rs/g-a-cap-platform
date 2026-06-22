# G&A CAP Platform — New Business CAP Build-out PRD

> **For:** Engineering teammate building on top of the existing CAP tool prototype.
> **Scope:** The **new-business CAP build-out experience** — from document upload, through AI-assisted pre-fill, section build, collaboration/approval, client sign-off, and Ben Admin handoff / Prism write-back.
> **Depends on:** The **Foundational Setup (Admin Console) PRD** — this experience *consumes* the foundation modules (referenced as F1–F10 throughout).
> **Status:** Build spec. Preliminary, iterate as the prototype evolves.

---

## 1. Context & purpose

The platform already supports the **renewal** CAP flow (prior-year Prism record → diff → review). This PRD specifies the **new-business** flow, which is fundamentally different in one way: **a brand-new client does not exist in Prism yet**, so there is no prior-year record to pre-fill from.

Instead, a new-business CAP is **assembled by fusing three sources**, each visibly tagged by provenance:

1. **Uploaded documents** (via AI extraction) — the client's current census, plans, rates, contribution setup.
2. **Foundational data** (the Admin Console) — master plans, carrier rates, the G&A pricing stack, vocabularies, parameters, fees, templates, validation rules.
3. **Underwriting output** — the client's bucket / admin factor / commission.

The experience is about **fusing those three, surfacing every gap, and never making the AM re-key what a document or the library already provides.** It replaces the 2–4 hour manual Excel build with an upload-then-confirm workflow.

### Provenance model (the spine of the whole experience)

Every field in a new-business CAP carries a **provenance tag** so the AM instantly knows what to trust vs. confirm:

| Tag | Meaning | Behavior |
|---|---|---|
| `From library` | Came from foundation data (F3–F8) | Authoritative; read-only or low-touch |
| `From upload · confirm` | Extracted from an uploaded document | Pre-filled, **requires human confirmation** |
| `Needs input` | No source yet | Flagged as a gap |
| `Underwriting` | Bucket/admin/commission from UW | Confirmed once UW output is attached |

This tag is rendered on every field and drives the flagging surfaces (§9) and the readiness gate.

---

## 2. Goals & non-goals

**Goals**

1. Start the CAP from **documents**, not a blank form — AI extraction pre-fills the bulk of it.
2. **Flag missing/low-confidence information up front and persistently**, so gaps are visible from the first screen through handoff.
3. Light up each CAP section from the **foundation** (master plans, rates, pricing stack, vocab, parameters), with **visible linkage** to the source.
4. Support the **multi-role collaboration & approval lifecycle** (AM build → Coordinator QC → client sign-off → Ben Admin).
5. **Generate the booklet from the model** (always in sync), issue it once for e-signature, version it on change.
6. **Close the loop to Prism** — produce a structured, validated handoff/write-back for Ben Admin onboarding.

**Non-goals**

- No re-mastering of carrier rates or master plans (those are synced from Prism via F3).
- No deep underwriting-platform integration (factors enter via upload + extraction — see §4 / F10).
- No payroll/billing execution (Prism).
- Renewal flow is out of scope here (already built).

---

## 3. The experience at a glance

A guided, staged flow with a persistent readiness rail. Stages are navigable (not strictly linear) once the CAP is assembled.

```
New Business CAP
│
├── NB1  Intake & Document Upload        seed info + document checklist + drop-zone
├── NB2  AI Extraction & Completeness     extract → confidence → "missing before we build" gate
├── NB3  Pre-filled CAP Assembly          fuse 3 sources → provenance-tagged draft
├── NB4  Section Build (foundation-powered)
│         Overview · Products · Plan Design & Rates · Tax Plans · Administration
├── NB5  Readiness & Flagging             inline flags + readiness rail + handoff gate
├── NB6  Collaboration & Approval         AM → Coordinator QC → client sign-off → Ben Admin
├── NB7  Booklet Generation & Versioning  live preview → issued for sign-off → re-versioned on change
├── NB8  Client Sign-off                  DocuSign e-sign of the booklet
└── NB9  Ben Admin Handoff & Prism Write-back   structured payload → Prism client setup
```

---

## 4. Cross-cutting requirements

- **Provenance tags** on every field (§1).
- **Foundation linkage chips.** Where a value comes from the library, show a chip naming the source + version (e.g. `Master Plan Library · BCBSTX 2026`, `Pricing Stack v3`, `ACA threshold 2026`). Clicking it deep-links to the source record (read-only).
- **Versioning / snapshot-on-finalize.** The CAP reads *live* foundation versions while in draft; on client sign-off, the CAP and its booklet **snapshot** the exact versions used (immutable).
- **Validation gating (F8).** Error-severity issues block the Ben Admin handoff; warnings don't.
- **Audit trail.** Every edit, confirmation, status change, comment, generation, and sync logs actor + timestamp + before→after.
- **Role-aware UI (F9).** Field edit/visibility follows the blue/yellow/green/red access model; a "needs you" queue is filtered per role.

---

## 5. NB1 — Intake & Document Upload

**Purpose:** Replace the blank form with an upload-first on-ramp.

**Screen**
- **Seed fields** the AM provides (no document supplies these): legal company name, plan year, expected effective month, intended carriers/states (optional — extraction can infer and confirm), estimated EE count.
- **Document checklist + drop-zone.** Each expected document is listed with *what it unlocks*, so the AM understands why it matters:

| Document | Unlocks |
|---|---|
| Census | Employee identity, demographics, classes, eligibility counts |
| Current carrier invoice(s) | Incumbent plan costs (cost comparison) |
| SBCs / current plan summaries | Current plan designs (deductibles, coverage) |
| Prior benefits booklet | Contribution setup, plan lineup |
| Underwriting output (Hero/Gradient) | Bucket / admin factor / commission |
| FEIN / WC dec pages | Identity & compliance fields |

**Requirements**
- Multi-file upload, mixed formats (PDF/Excel/CSV/image), per-file type tagging (auto-detected, AM-correctable).
- The checklist shows received vs. outstanding at a glance.
- AM can proceed with missing documents; outstanding items become flags carried into NB2/NB5.

**Acceptance criteria**
- AM can drop a mixed set of files and see each classified to a document type.
- The checklist reflects what's received vs. still expected.

---

## 6. NB2 — AI Extraction & Completeness Gate

**Purpose:** Turn uploaded documents into a structured candidate dataset, and **block an incomplete build before it starts** (Initiative B synergy).

**Requirements**
- Run extraction across uploads → structured candidate fields with a **confidence score** each.
- Map extracted data to CAP fields (current plan designs, rates, contribution setup, census demographics, classes, identity).
- **Completeness gate:** before assembling the CAP, present a summary — what was extracted, what's low-confidence, and what's missing — with actionable messages (e.g. "No current invoice → cost comparison will be incomplete"; "Underwriting factors missing → rates can't be finalized").
- Low-confidence and missing items are recorded as **flags** that persist into the CAP (do not silently drop them).

**Acceptance criteria**
- Extraction produces a reviewable field set with confidence indicators.
- The completeness summary lists missing/low-confidence items before the CAP is built.
- Proceeding carries those items forward as flags.

---

## 7. NB3 — Pre-filled CAP Assembly

**Purpose:** Fuse the three sources into a provenance-tagged draft CAP.

**Requirements**
- Assemble a draft CAP populating fields from, in priority where they overlap: foundation (`From library`) → extraction (`From upload · confirm`) → underwriting (`Underwriting`) → otherwise `Needs input`.
- Apply provenance tags (§1) to every field.
- For **open-market** plans (no master rate in F3): rates come from the extracted invoice/SBC and are tagged `From upload · confirm rates` — explicitly, since this is the highest manual-error-risk area today.
- Produce an initial readiness count immediately ("12 items need attention").

**Acceptance criteria**
- The assembled CAP shows correct provenance on each field.
- Library-sourced fields carry linkage chips to their foundation source.
- Open-market plan rates are flagged for confirmation.

---

## 8. NB4 — Section Build (foundation-powered)

**Purpose:** Let the AM complete/confirm the CAP section by section, with each section visibly powered by the foundation.

**Section → foundation linkage (must be reflected in the UI):**

| Section | Powered by | Behavior |
|---|---|---|
| **Overview / Company Info** | F6 Vocabularies + extraction | Entity types, class types, waiting periods as managed dropdowns; identity pre-filled from docs |
| **Products grid** | F3 Master Plan Library | AM selects master plans per benefit line; carrier, group #, COBRA/who-pays auto-derive from plan type |
| **Plan Design & Rates** | F3 rates × F4 Pricing Stack | `billed = carrier base rate × risk factor` (risk factor = admin factor + commission; bucket selects base band); contribution strategy → ER/EE split → per-pay-period deduction |
| **Affordability** | F5 Parameters | ACA safe-harbor threshold applied live (`min EE-only contribution < threshold ? Affordable : Not`) |
| **Tax Plans (FSA/HSA)** | F6 Vocabularies | Status/cadence/funding-source options; parameters pre-filled |
| **Administration** | F6 + F5 Fees | Enrollment method, billing cadence, packet types; rush/change/WRAP fees from the schedule |

**Requirements**
- **Contribution strategy modeling** in Plan Design & Rates: support Variable / Base Plan / Flat Dollar / Rolldown, with EE% / Dep% / flat-$ / spousal-surcharge inputs; recompute ER/EE split + PPD live on change.
- Annual-deduction value (from F5 options) drives `PPD = EE_monthly × 12 / annual_deductions`.
- Confirming a `From upload · confirm` field clears its flag; editing a `From library` field (where permitted) requires a reason and is logged.
- Each section header shows its foundation source chip(s).

**Acceptance criteria**
- Selecting a master plan in Products populates rates in Plan Design from F3 × F4.
- Changing the contribution strategy recomputes every tier's ER/EE split and PPD.
- The affordability result updates live against the F5 threshold.

---

## 9. NB5 — Readiness & Flagging

**Purpose:** Make every gap visible and make "ready for handoff" a single, trustworthy state.

**Two classes of issue feed readiness:**
- **Completeness / provenance flags** — missing or unconfirmed fields (`low-confidence extraction`, `no source`, `rate missing for open-market plan`).
- **Source-data / rate-discrepancy validation (F8)** — every selected plan and rate is validated **in real time against its system source of truth**: the F3 master plan catalog + carrier rate table (for the CAP's pinned plan year) and Prism plan configurations. A discrepancy raises a **specific, actionable error at the field**. This is the **demo step 2** path ("a rate discrepancy or missing field triggers a specific, actionable error before submission to Ben Admin") and directly serves the PRD's "real-time validation against Prism plan configs and carrier rate tables… flagged at the source" requirement.

**Source-data validation — what it catches (examples):**
- A manually-entered or extracted **open-market rate** that doesn't match the source (or an internal master-plan rate that doesn't equal `carrier base rate × F4 risk factor`).
- A **plan code** that isn't in the current F3 catalog (unknown/retired).
- A **tier rate** outside the source rate table's expected range.
- A required **source-validated field** missing (e.g. bucket/factor not yet supplied by underwriting).

Each error names the **field, the entered value, the expected source value, and the fix** (e.g. *"Dental EE rate $48.10 does not match Guardian TX 2026 table ($46.90). Confirm the rate or correct the source."*).

**Three surfaces**
1. **Inline flags** — each unresolved field shows a flag + reason, including source-data discrepancies with the expected value.
2. **Persistent readiness rail** — a running "N items need attention," grouped by section and severity, driven by F8 validation rules (completeness + source-data + consistency) + outstanding provenance flags.
3. **Handoff gate** — error-severity items (including any source-data discrepancy) block the Ben Admin handoff; warnings are advisory. The rail is the single list between the AM and "ready."

**Acceptance criteria**
- A CAP rate that does not match the F3 source rate table for its pinned plan year produces a specific, actionable error naming the entered value and the expected source value — surfaced as it's entered, not only at handoff.
- A missing source-validated field (e.g. underwriting factor) raises an actionable error before submission.
- Resolving an item updates the count everywhere immediately.
- An unmet error-severity rule (including a source-data discrepancy) prevents advancing to Ben Admin handoff.

---

## 10. NB6 — Collaboration & Approval lifecycle

**Purpose:** Support the multi-role build/review/approve flow.

**Roles & responsibilities**
- **Account Manager / AE** — builds and owns the CAP (upload, confirm extractions, select plans, set contribution strategy).
- **Benefits Underwriter** — supplies pricing factors (bucket / admin factor / commission), via underwriting-output upload or direct entry.
- **Benefits Coordinator** — QC review; the audit checklist is the internal-approval gate ("CAP completely filled," "Booklet/CAP rates & plans match," "ClientSpace benefits page updated," "open-market SBCs complete").
- **Client** — signs off on the benefits selections (booklet e-sign).
- **Benefits Analyst (Ben Admin)** — configures Prism from the approved CAP (NB9).

**Lifecycle (status model):**
```
Draft → Internal Review (Coordinator QC) → Client Sign-off → Approved → Ben Admin Handoff → Configured
```

**Collaboration mechanics**
- Per-field **comments + @mentions**; resolve/unresolve.
- A **"needs you" queue** per role.
- **Activity / audit log** on the CAP.
- **Change-requests** that re-open a specific section rather than the whole CAP; material changes after Internal Review re-trigger the relevant F8 gates (and re-version the booklet per NB7).

**Acceptance criteria**
- The CAP advances through statuses with the right role able to act at each.
- A change after Internal Review re-opens the affected section and re-runs its gates.
- The "needs you" queue reflects the current role.

---

## 11. NB7 — Booklet Generation & Versioning

**Purpose:** Generate the client booklet from the CAP model — always in sync, never hand-built.

**Requirements**
- **Live preview** of the booklet at any time, rendered from F7 templates + CAP data. (This eliminates the "Booklet/CAP rates must match" drift problem — the booklet *is* the data.)
- **Issued once** for client sign-off — the rendered, routed-for-signature artifact.
- **Re-versioned only on material change** after issuance; each issuance is versioned.
- The **signed version is snapshotted and locked** (immutable, audit/SOX).

**Acceptance criteria**
- The booklet preview reflects the current CAP data with no manual build step.
- Issuing for sign-off creates a versioned booklet; a material change produces a new version.
- A signed booklet cannot be edited.

---

## 12. NB8 — Client Sign-off

**Purpose:** Route the issued booklet for client e-signature.

**Requirements**
- Send the issued booklet to the client via **DocuSign** (config from F2), with signer routing.
- Track status (sent / viewed / signed) on the CAP; reflect into the lifecycle (→ Approved on signature).
- On signature, snapshot the CAP + booklet versions (§4) and log the event.

**Acceptance criteria**
- The AM can route the booklet for signature and see status update on the CAP.
- Signature advances the CAP to Approved and locks the signed artifact.

---

## 13. NB9 — Ben Admin Handoff & Prism Write-back

**Purpose:** Close the loop — turn the approved CAP into Prism client setup, eliminating the Benefits Analyst's manual re-keying (today ~48% of their time, frequently blocked by CAP errors).

**Phased approach (pitch the loop, control delivery risk):**

- **Phase 1 (demo-ready, no live tenant):** generate a **structured, validated Prism handoff payload** — an upgrade of the workbook's "send to analyst" text block into clean structured data (client identity, plans, codes, rates, enrollment params) — and demonstrate a **simulated write-back** to Prism client setup. Fully demoable; visually closes the loop.
- **Phase 2 (scoped build):** real **Prism API write-back** (PrismHR exposes a benefit service) — create client-level plans, rates, and enrollment parameters from the approved CAP. Requires mapping CAP structure → Prism client-benefit model, master vs. open-market handling, idempotency, error/rollback, and audit. Dependency: Prism API access + interim data layer.

**Requirements**
- Generate the structured handoff payload from approved-CAP data; validate it against F8 gates (no error-severity issues may pass).
- Present a **Ben Admin handoff view**: the Analyst sees the validated package, confirms, and triggers the write-back (simulated in Phase 1).
- Mirror the case/approval state into **ClientSpace** (F2) for tracking + audit.
- On successful write-back, advance the CAP to **Configured**.

**Acceptance criteria**
- An approved CAP produces a structured, validated Prism payload.
- The Ben Admin can review and trigger the (simulated) write-back, advancing the CAP to Configured.
- ClientSpace reflects the handoff case/state.

---

## 14. Data model (entities to introduce/extend)

Conceptual entities for the new-business flow (names illustrative; align to existing prototype conventions):

- **NewBusinessIntake** — { capId, seedFields, documents[]: { file, type, status }, checklistState }
- **ExtractionResult** — { documentId, fields[]: { capField, value, confidence }, unresolved[] }
- **ProvenanceField** — { capField, value, source: library|upload|underwriting|input, sourceRef, confirmed: bool, flag? }
- **FoundationLink** — { capField, module: F3|F4|F5|F6|F7|F8, recordId, version, label }
- **ReadinessItem** — { capId, section, field, severity, message, fix, origin: rule|provenance, resolved }
- **BookletVersion** — { capId, version, templateVersions, issuedAt, status: preview|issued|signed, snapshot }
- **SignatureEnvelope** — { bookletVersionId, provider: DocuSign, status, signerRouting, events[] }
- **PrismHandoff** — { capId, payload, validationState, mode: simulated|live, status, clientSpaceCaseId }
- **AuditEvent** — { entity, action, actor, ts, before, after }

Extend the existing **Cap** entity with new-business state where needed (intake reference, provenance map, readiness summary, booklet versions, handoff record).

---

## 15. Build sequencing (suggested milestones)

Ordered for fastest path to the marquee demo (upload → pre-fill → review → booklet → sign → write-back).

**Milestone 1 — The pre-fill spine (demo-critical)**
- NB1 Intake & Upload + NB2 Extraction & Completeness Gate.
- NB3 Pre-filled Assembly with provenance tags + foundation linkage chips.
- NB4 Plan Design & Rates lit by F3 × F4 (one carrier end-to-end), with live contribution modeling.

**Milestone 2 — Readiness & booklet**
- NB5 Flagging surfaces + F8 handoff gate.
- NB7 Booklet live preview + issuance + versioning.
- NB8 DocuSign sign-off.

**Milestone 3 — Collaboration & loop-close**
- NB6 Roles, lifecycle, comments, "needs you" queue.
- NB9 Structured Prism payload + simulated write-back + ClientSpace case mirror.

---

*G&A CAP Platform — New Business CAP Build-out PRD · Build spec for the existing CAP prototype · Preliminary.*
