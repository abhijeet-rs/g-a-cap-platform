# G&A CAP Platform — Overview & Context

> **Read this first.** This document frames the whole PRD set. It explains *what* we're building, *why*, the systems it lives among, and the cross-cutting principles every other PRD assumes. Each detailed PRD (Foundation, New Business, Renewal, Copilot) is written to be actionable on its own — this document supplies the shared context that makes them cohere.
>
> **Status:** Preliminary build context for the existing CAP prototype. Subject to change.

---

## 1. Background — who G&A is and where the CAP fits

**G&A Partners** is a Professional Employer Organization (PEO). It co-employs its clients' workforces and administers their payroll, benefits, HR, and workers' comp. Its **Benefits function** has two teams:

- **G&A Beneficial (GAB)** — the pre-implementation team. Owns the client relationship from quoting through plan selection, onboarding, and the **annual renewal** cycle. GAB builds the CAP.
- **Benefits Administration (Ben Admin)** — the post-implementation team. Configures clients in PrismHR, runs payroll-deduction audits, carrier enrollment, reconciliation, and compliance. Ben Admin *consumes* the CAP.

**The CAP (Client Approved Plans)** is the single most important artifact between these two teams. It defines, per client per plan year: plan designs, carrier rates, employer-contribution strategy, deductibles, pay-period structures, and FSA/HSA parameters. It is referenced in **8+ downstream processes** and its accuracy is the #1 upstream quality-control point in the entire benefits operation.

Today the CAP is a **manually built Excel workbook** (29 sheets, heavy cross-sheet formulas). That's the problem.

## 2. The problem we're solving

- **New-business CAPs take 2–4 hours** of manual Excel building per client (~1,320 new setups/year).
- **Renewal CAPs are rebuilt by hand** each year — prior-year data re-keyed, re-introducing the same transcription errors.
- **CAP errors are the #1 cause of Ben Admin setup blocking** — a Benefits Analyst spends ~48% of their time on setup, frequently blocked by CAP inaccuracies.
- Reference data (master plans, carrier rates, the G&A pricing recipe, dropdown lists, fee schedules, document templates) is **copy-pasted into every workbook**, so a rate change means touching hundreds of files and nobody knows which version any given CAP used.
- The client **benefits booklet** is built separately and drifts out of sync with the CAP.

Addressable capacity across GAB: **~31–32 FTEs**.

## 3. What we're building

A **cloud-hosted, Prism-integrated CAP platform** (this is **Initiative A** in G&A's Benefits PRD — its #1 priority) that replaces the Excel workbook with a real system. At a high level it must:

1. **Auto-generate new-business CAPs** from source data (uploaded documents + the master library + underwriting output).
2. **Auto-populate renewal CAPs** from prior-year Prism configurations, flagging year-over-year changes for review instead of a rebuild.
3. **Validate CAP data in real time** against Prism configurations and carrier rate tables, flagging discrepancies at the source before Ben Admin handoff.
4. **Auto-generate the client benefits booklet** from approved CAP data.
5. Handle **e-signature + annual contract management** with a centralized audit trail.
6. Flow **structured CAP data downstream** (Prism setup, enrollment portal, deduction audit, reconciliation) with no re-entry.
7. Provide a **natural-language Copilot** that retrieves, explains, and acts across the whole experience.

We are **building** this on top of an existing prototype (`cap-studio` — React/TypeScript/Vite/Tailwind/Zustand), not buying a configurable platform.

## 4. Engagement context (why the shape of these PRDs)

This work is part of a partner evaluation; the CAP tool is the marquee, demo-driven deliverable. Two things follow from that and explain choices throughout the PRDs:

- **Demo-first, no live tenant.** There is no live Prism tenant available for demos. The platform's Prism connection is therefore backed by **simulated data** — but this is an *implementation detail and must never be surfaced in the UI* (no "sandbox/mock/demo" labels). Everything must look and behave like a live connection, so the same code later swaps to the real Prism API.
- **Depth over breadth.** The build is sequenced so the highest-value paths (auto-population, validation, booklet generation, e-sign, write-back) work end-to-end on realistic seed data (the **ITAFOS CONDA** sample is the canonical example).

## 5. The systems landscape — and the one rule that governs the architecture

```
        ┌──────────────────────────────────────────────────────────┐
        │                    CAP PLATFORM                            │
        │  (orchestration layer — the thing we're building)          │
        │  quoting · contribution modeling · validation ·            │
        │  booklet generation · approval workflow · Copilot          │
        └───────┬───────────────────┬───────────────────┬───────────┘
   reads/writes │        reads/writes│           routes  │
                ▼                    ▼                    ▼
        ┌───────────────┐   ┌────────────────┐   ┌──────────────┐
        │  PrismHR /    │   │ ClientSpacePRO │   │   DocuSign    │
        │  WorkSight    │   │  (workflow /   │   │ (e-signature)│
        │  (SoR: plans, │   │  cases / audit)│   └──────────────┘
        │  rates, enroll│   └────────────────┘
        │  -ments)      │
        └───────────────┘
```

- **PrismHR / WorkSight** — the **system of record** for plan configurations, carrier rates, enrollments, and payroll execution. **We do not replace or fork it.** WorkSight is its client-facing wrapper + enrollment portal.
- **ClientSpacePRO** — G&A's internal CRM and **workflow/case/audit** engine. The CAP platform drives case state, approval routing, and audit trail here.
- **DocuSign** — e-signature for the booklet/contract sign-off.

**The governing rule:** the CAP platform is a **clean orchestration layer on top of Prism — not a rip-and-replace, and not a second system of record.** It *reads* master/rate/client data from Prism, owns the quoting/modeling/approval layer Prism doesn't model, and *writes back* the final config. Carrier rates and master plans are never re-mastered in the platform; they are synced.

## 6. Cross-cutting principles (every PRD assumes these)

These appear throughout the detailed PRDs. They are collected here once so they read as one system.

**6.1 Three classes of data, three edit rules.**

| Class | Source of truth | Edit rule | Examples |
|---|---|---|---|
| **Synced** | Prism | Read-only in the platform | Master plans, carrier rates, plan-code crosswalks, client records |
| **G&A-owned** | The platform | Editable centrally, versioned | Pricing-stack factors, parameters, fees, templates, vocab, validation rules |
| **Connected** | External systems | Configured here | ClientSpace (workflow), DocuSign (e-sign) |

**6.2 Prism is the system of record; the platform owns what Prism doesn't model.** Prism owns plan configs + carrier rates (execution truth). The platform owns the **G&A pricing recipe**, the **quoting/proposal artifact**, document templates, and approval workflow. Never duplicate carrier rates.

**6.3 Provenance is visible everywhere.** Every field shows where its value came from — `Prism · synced`, `From library`, `From upload · confirm`, `Needs input`, `Underwriting` — with a chip linking to the source record + version. Synced fields are read-only.

**6.4 Versioning + snapshot-on-finalize.** All G&A-owned data is effective-dated/versioned. A **draft** CAP reads the *current live* version (so central edits propagate forward); a **finalized/signed** CAP **snapshots** the versions it used and locks them (immutability for audit/SOX). This is what makes "edit once → flows to all future CAPs" safe.

**6.5 Real-time, source-anchored validation.** Every value is validated as it's entered against its source of truth (carrier rate tables, Prism configs). Discrepancies and missing required fields raise **specific, actionable errors at the field** and gate the Ben Admin handoff.

**6.6 Everything is auditable.** Every edit, confirmation, status change, generation, sync read, and Copilot action logs actor + timestamp + before→after. This replaces the workbook's change-tracker tabs and satisfies SOX controls.

**6.7 Role- and permission-aware.** The workbook's blue/yellow/green/red legend becomes a field-level permission + sharing model (AM-entry / conditional / client-shareable / internal-only), important given PHI/PII/wage data.

## 7. Domain primer (concepts the PRDs use without re-explaining)

- **Two-tier plan model.** Prism stores benefit plans at a **system level** (the reusable master catalog G&A negotiates with carriers) and a **client level** (a specific client adopting a plan). The platform quotes *from* the system level; a new client doesn't exist at the client level until onboarding.
- **Carrier rate.** The raw price the carrier charges, by **tier** (Employee Only / EE+Spouse / EE+Child(ren) / EE+Family), sometimes age-banded.
- **G&A pricing stack (the "risk factor").** G&A marks up the carrier rate: `billed rate = carrier base rate × risk factor`, where `risk factor = admin factor + commission`, and a **bucket** selects which base-rate band applies. (Worked example: BCBSTX EE-only base $810.02 × 1.15 = billed $931.52.) These factors are central building blocks (managed in the platform); the *specific* factor for a client is resolved per CAP from underwriting (new business) or the prior-year Prism record (renewal).
- **Contribution strategy.** How the billed rate is split employer vs. employee — **Variable / Base Plan / Flat Dollar / Rolldown**, with EE% / Dep% / flat-$ inputs. Drives the per-pay-period deduction: `PPD = EE_monthly × 12 / annual_deductions`.
- **Master plan vs. open-market plan.** Master = G&A-negotiated, has carrier rates in Prism and (increasingly) carrier APIs. Open-market = client-chosen carrier, **no API/EDI**, rates entered manually — the highest manual-error-risk area.
- **New business vs. renewal.** New business **fuses uploaded documents** (no prior Prism record). A renewal **starts from a prior-year baseline** (Prism record + last year's CAP) and is "diff and approve." This is why there are separate PRDs.
- **The downstream fan-out.** Approved CAP data feeds 8+ processes: Prism client setup, the WorkSight/NextGen enrollment portal build, payroll deduction audits, reconciliation, carrier enrollment, and WEX (FSA/HSA). The platform must expose structured data to these — it's the "single source of truth" the PRD asks for.

## 8. The PRD set — what each covers and how they relate

Read in this order:

1. **`00_CAP_Platform_Overview_and_Context.md`** — *this document.* The shared context.
2. **`CAP_Platform_Foundation_PRD.md`** — the **Admin Console / foundation** layer: connections + ongoing Prism sync, master plan library, the G&A pricing stack, parameters/fees, vocabularies, document templates, validation rules, roles, underwriting intake. **Everything else consumes this** (modules referenced as **F1–F10**).
3. **`CAP_NewBusiness_Buildout_PRD.md`** — the **new-business** experience: document upload → AI extraction → provenance-tagged pre-fill → foundation-powered section build → validation/flagging → approval → booklet → e-sign → Prism write-back (**NB1–NB9**).
4. **`CAP_Renewal_Buildout_PRD.md`** — the **renewal** experience: renewal radar → prefill from prior-year + plan-code migration → document-updates-as-deltas → **version-drift/data-currency reconciliation** → unified diff → approval → annual contract management → Prism write-back as an *update* (**R1–R9**).
5. **`CAP_Copilot_PRD.md`** — the **cross-cutting Copilot**: a sidebar agent that retrieves, explains, and acts across both flows, grounded in real data, with confirmed writes and full audit (**CP1–CP7**).

**Supporting reference (not a PRD):**
- **`CAP_Excel_Metadata.md`** — a deep structural map of the existing CAP Excel workbook (every sheet, the calculation logic, the controlled vocabularies, the rate engine). The authoritative source for the data model and the math the platform must reproduce. **Read alongside the Foundation PRD.**

**How they fit together:** the Foundation establishes the data and connections; New Business and Renewal are the two origination experiences built on it; the Copilot layers across both. Module references (F#, NB#, R#, CP#) are stable cross-document anchors — when a PRD says "F8" or "R4," it points to that module in the named PRD.

## 9. What the prototype/demo must ultimately show (north star)

The build is sequenced toward demonstrating, on the seeded sample data, end-to-end:

1. A **renewal CAP auto-populated** from prior-year Prism data — reviewed and approved without manual re-entry.
2. A **new-business validation path** where a rate discrepancy or missing field triggers a specific, actionable error before Ben Admin submission.
3. The **benefits booklet auto-generated** from approved CAP data.
4. An **e-signature workflow** routing the CAP to the client for sign-off.
5. **Structured CAP data** available downstream for Prism/WorkSight setup without re-entry, with the case/audit trail reflected in ClientSpace.

Each detailed PRD's "build sequencing" section prioritizes the milestones that make this north star real first.

## 10. Conventions & constraints

- **Build on the existing prototype** (`cap-studio`); reuse its conventions where sensible. The detailed PRDs describe entities conceptually — align names to the codebase.
- **Prism connection always presents as live** (§4) — no sandbox/mock labels in the UI.
- **No new system of record, no new sync engine outside the Foundation's connections** — all Prism/ClientSpace/DocuSign access routes through F2.
- **PHI/PII/SOX aware** throughout — minimize sensitive data sent to any LLM, enforce field-level permissions, log everything.
- **Out of scope (for now):** the submission's commercial artifacts (build-vs-buy write-up, cost model, change-management plan, relevant-experience deck) and the broader Benefits initiatives B–F. These PRDs cover Initiative A's product/experience design.

---

## Quick glossary

- **CAP** — Client Approved Plans (the per-client, per-plan-year benefits artifact).
- **GAB** — G&A Beneficial (builds the CAP). **Ben Admin** — Benefits Administration (configures Prism from it).
- **AM / AE** — Account Manager / Executive (owns the CAP). **Coordinator** — QC + booklet/portal. **Underwriter** — risk scoring / factors. **Benefits Analyst** — Prism configuration (Ben Admin).
- **Prism / WorkSight** — system of record (plans, rates, enrollments) / its enrollment portal + client wrapper.
- **ClientSpace** — workflow/case/audit CRM. **DocuSign** — e-signature.
- **Master plan** — G&A-negotiated carrier plan (rates in Prism). **Open-market** — client's own carrier (manual rates, no API).
- **Bucket / admin factor / commission / risk factor** — the G&A pricing stack: `billed = base × (admin factor + commission)`.
- **Contribution strategy** — employer/employee split method (Variable / Base Plan / Flat Dollar / Rolldown). **PPD** — per-pay-period deduction.
- **Provenance** — the source tag on every field. **Drift** — when a CAP references stale master-data versions.

---

*G&A CAP Platform — Overview & Context · Front matter for the CAP PRD set · Preliminary.*
