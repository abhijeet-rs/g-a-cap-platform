# G&A Partners | AI Payroll PRD

> **Confidential · Partners Only**
> **Partner Evaluation Package · June 2026**
> *Preliminary — Subject to Change*

# AI-Enabled Payroll — Product Requirements Document

G&A Partners is evaluating strategic AI development and implementation partners to design and build an AI-enabled operations workflow for its Payroll division. This document provides everything a partner needs to understand the opportunity, current state, and what a winning response looks like.

**Document tabs / sections:**

1. Overview
2. Business Context
3. Process Map
4. Initiative Deep Dive
5. Business Impact
6. Systems & Technical
7. Glossary
8. Submission

---

## 01 · Overview

**Eyebrow:** Partner Evaluation Package · June 2026

**AI-Enabled Payroll — Product Requirements Document**

G&A Partners is evaluating strategic AI development and implementation partners to design and build an AI-enabled operations workflow for its Payroll division. This document provides everything a partner needs to understand the opportunity, current state, and what a winning response looks like. Navigate using the tabs above.

### What's Inside

| # | Section | Description |
|---|---------|-------------|
| 01 | **Overview** | Key contents, scope, timeline for the partner evaluation, and the point of contact for all questions and submissions. |
| 02 | **Business Context** | What the Payroll division does, its operational processes, team structure, P&L position, and the margin improvement mandate. Read this first. |
| 03 | **Process Map** | An end-to-end payroll lifecycle showing processes across roles and swimlanes, with key system touchpoints and initiative tags at each step. |
| 04 | **Initiative Deep Dive** | Initiative-level breakdowns covering current state, pain points, and what an AI and automation solution must deliver. This is where partners should spend most of their time. |
| 05 | **Business Impact** | Operational and activity baseline, along with the automation and AI opportunities being evaluated to make the current process more efficient. |
| 06 | **Systems & Technical** | Full inventory of systems in scope, the integration gaps between them, and the missing connections that any partner solution must address. For the partner's technical team. |
| 07 | **Glossary** | Definitions of Payroll-specific terminology, G&A operational acronyms, role definitions, and system names used throughout this document. |
| 08 | **Submission Guide** | What we need from partners, how we will evaluate responses, and what a winning submission looks like — including specifications for each initiative. |

### Scope & Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| **PRD Shared** | June 15, 2026 | This document distributed to select partners |
| **Partner Response Deadline** | June 24, 2026 | Approach, architecture, cost, architectural design, and relevant experience required |
| **Partner Presentations** | TBD | Live Q&A and demo walk-through with G&A leadership |

### Point of Contact

**Engagement Lead**

All questions and submissions should be directed to:

**Tilak Sagireddy**
tsagireddy@alixpartners.com

---

## 02 · Business Context

**Eyebrow:** Business Context

**G&A Partners Payroll — Business Overview**

A concise summary of the Payroll division's business, operating model, team structure, and performance context. Read this before reviewing the process and technical sections.

### What the Payroll Division Does

#### The Business

G&A Partners' Payroll division processes payroll for 4,000+ PEO and ASO clients representing 100,000+ Worksite Employees (WSEs). The division owns the end-to-end payroll lifecycle post Onboarding: processing regular and off-cycle payrolls, coordinating with Treasury and internal departments, managing live-check shipping, and handling all client inquiries and adjustments. Payroll accuracy and on-time posting are the core operational KPIs — a 30–35% miss rate on the 2–3 business day posting target is the most visible service quality problem and a documented driver of client churn.

#### Operational Processes

- **New Client Shadowing & Knowledge Transfer** — ClientSpace payroll note review and knowledge transfer meetings; shadow sessions for complex accounts.
- **Payroll Processing** — Time file import, Prism calculation, invoice reconciliation, Treasury coordination, and payroll posting.
- **Coordination with Other Departments** — Case creation and resolution coordination with Treasury, Tax, Risk, Benefits, 401k, and HR Advisory.
- **Client Invoicing** — Invoice line review against prior reference; investigation of items above the 20% variance threshold.
- **Coordinate Payroll Shipping** — Shipping case creation, live check printing, sorting, packaging, and carrier delivery with dual-person audit.
- **Customer Service** — Triage and resolution of client inquiries via email, phone, and AccessHR cases.
- **Client Retraining** — Targeted retraining sessions for clients with recurring submission errors.
- **Payroll Adjustments & Corrections** — Off-cycle payroll configuration and execution for bonuses, missed pay, terminations, and W2C corrections.
- **Client Inquiry & Case Support** — Investigation and resolution of open AccessHR and ClientSpacePRO inquiry queues.
- **Garnishments & Payment** — Garnishment order setup, check printing, and interrogatory preparation. *Out of scope for this PRD.*

### Payroll Business at a Glance

| Metric | Value | Note |
|--------|-------|------|
| Total Clients Served | **~4,000** | |
| Total WSEs Supported | **~100,000** | |
| Total FTEs | **118** | Incl. 16 offshore FTEs |
| Total FLC | **$10M** | Incl. 16 offshore FTEs |

### Current Team Structure

**PAYROLL OPERATIONS TEAM — 118 FTEs**

| Group | FTEs |
|-------|:----:|
| Payroll Specialists | 78 |
| Offshore Specialists | 16 |
| Payroll Assistants | 6 |
| Garnishment Team | 4 |
| Management & Leadership | 14 |

#### Payroll Specialists

Own the full payroll lifecycle for assigned clients: time file import, Prism calculation, invoice reconciliation, Treasury coordination, off-cycle management, and all client-facing service. The Payroll Specialist role owns 16 of 27 documented process steps — spanning all four lifecycle phases and representing the primary bottleneck lane in the operation.

#### Payroll Assistants

100% dedicated to Coordinate Payroll Shipping — validating check file attachments, printing and sorting checks by location (up to 20+ per client), generating carrier labels, packaging, executing SOX-required dual-person audit before carrier pickup, and reviewing morning carrier status reports. Every step is manual today.

#### Payroll Management

Responsible for specialist assignment (by capacity, time zone, complexity, and personality fit), SOX control oversight, and exception handling. Uses color-coded workload reports (green/orange/red) to monitor capacity across three regional time zones. Escalation path for reversals and Treasury coordination failures.

### What We Are Looking For

#### 1 · Core Payroll Processing Efficiency

**A · Treasury Reverse Wire Coordination Automation**

System-triggered reverse wire request from Prism upon invoice finalization with automated Treasury acknowledgment workflow, status-push notifications on fund receipt, and auto-release of payroll — eliminating the 2–7 hour manual email cycle that causes 30–35% of payrolls to miss the 2–3 day posting target.

**B · Time File Import Standardization**

Intelligent file parser that normalizes any client-submitted spreadsheet format to Prism-compatible structure regardless of column additions, removals, or naming changes — eliminating dependency on brittle IT-built macros and the 5–30+ minutes of manual file manipulation required on 20–30% of payrolls.

#### 2 · Payroll Shipping Automation

**C · Shipping Case Creation & Attachment**

Prism posting event auto-creates the ClientSpacePRO shipping case with pre-attached check file, batch print report, and auto-populated PSR fields — eliminating the 10–15 minute specialist case creation workflow that executes on every payroll with live checks.

**D · Automated Label Generation, Tracking & Alerts**

Label generation automated via ClientSpacePRO integration with a shipping aggregator; carrier API retrieves tracking numbers and pushes next-morning delay alerts — eliminating the 15–25 min per-case manual label generation and carrier status review that consumes 100% of Payroll Assistant capacity.

#### 3 · Client Service Intelligence

**E · Customer Service Triage & Research Assistant (Ciklum Expansion)** &nbsp; `[Outside PRD Scope]`

AI-powered intake layer that classifies incoming requests by type, pre-pulls relevant employee and payroll data from WorkSight and Prism, identifies the likely resolution path, and drafts initial responses for routine inquiries.

---

## 03 · Process Map

**Eyebrow:** Process Map · Current State Swimlane

**Payroll Operations — End-to-End Lifecycle**

Five roles across four lifecycle phases. Column colors indicate the lifecycle phase; row labels identify the team responsible. Initiative tags (⚑) mark where automation opportunities target each process step.

#### Lane: Payroll Management

| Client Onboarding | Payroll Processing | Post-Processing | Ongoing Support |
|-------------------|--------------------|-----------------|-----------------|
| Specialist Assignment *(Capacity · time zone · complexity)* | SOX Control Oversight *(20% variance · 6 SOX controls)* | Reversal Authorization *(+ Treasury fund recovery)* | Retraining Authorization |
| Workload Review (PSS Report) *(Green/orange/red capacity monitoring)* | Exception Escalation Review | | Escalation Resolution |

#### Lane: Payroll Specialist *(Primary bottleneck · 16 of 27 steps)*

| Client Onboarding | Payroll Processing | Post-Processing | Ongoing Support |
|-------------------|--------------------|-----------------|-----------------|
| Knowledge Transfer Meeting *(ClientSpace notes review)* | Time File Import *(**⚑ Init. B**)* | Shipping Case Creation *(**⚑ Init. C · 10–15 min/case**)* | CS Inquiry Triage & Research *(**⚑ Init. E · Outside PRD Scope**)* |
| Shadow Sessions *(2.5–6 wks for complex clients)* | Prism Calculation | PSR Form + File Attachment *(Manual · no Prism API)* | Off-Cycle Batch Setup |
| | Error Resolution *(→ Cross-Functional Depts.)* | | Adjustments & Reversals |
| | Invoice Reconciliation *(20% variance threshold)* | | Client Retraining |
| | Treasury Reverse Wire Coordination *(**⚑ Init. A · 2–7hr delay**)* | | |
| | Payroll Posting | | |

#### Lane: Payroll Assistant *(100% shipping · All steps manual)*

| Client Onboarding | Payroll Processing | Post-Processing | Ongoing Support |
|-------------------|--------------------|-----------------|-----------------|
| — | — | Validate Case Attachments *(**⚑ Init. D**)* | — |
| | | Print, Sort & Package Checks *(Up to 20+ locations per client)* | |
| | | Generate Carrier Labels *(**⚑ Init. D · manual portal**)* | |
| | | Dual-Person Audit + Pickup | |
| | | Morning Carrier Status Review *(**⚑ Init. D · ~1 hr/day manual**)* | |
| | | Manual Tracking Update in Cases | |

#### Lane: Cross-Functional Depts. *(Treasury · Tax · Risk · Benefits · 401k · HR)*

| Client Onboarding | Payroll Processing | Post-Processing | Ongoing Support |
|-------------------|--------------------|-----------------|-----------------|
| — | Treasury: Reverse Wire Acknowledge & Release *(**⚑ Init. A · manual email today**)* | — | Tax / HR Advisory / 401k *(Coordination Cases)* |
| | Benefits / SUTA / WC Review *(Blocking errors; 2–7 hr delays)* | | |

#### Lane: Client

| Client Onboarding | Payroll Processing | Post-Processing | Ongoing Support |
|-------------------|--------------------|-----------------|-----------------|
| First Payroll Submission | Submit Time File *(Incompatible formats common)* | — | Submit CS Inquiry / AccessHR Case *(**⚑ Init. E · Outside PRD Scope**)* |
| | Approve Payroll | | |

**Initiative Tags**

- **⚑ A** — Treasury Reverse Wire Coordination Automation
- **⚑ B** — Time File Import Standardization
- **⚑ C** — Shipping Case Creation & Attachment
- **⚑ D** — Label Generation, Tracking & Alerts
- **⚑ E** — CS Triage & Research Assistant *(Outside PRD Scope)*

**System Legend**

- Core G&A Systems (PrismHR · ClientSpacePRO)
- Manual / No API (Critical Gaps)
- External & Client Sources (SaaS HR · WorkSight)
- Communication Tools (Outlook · Teams)

**Key Systems**

- ClientSpacePRO · Outlook · Teams
- PrismHR · Treasury Dept. (Email / Teams) · SaaS HR / Client Spreadsheets
- ClientSpacePRO · UPS / FedEx (no API)
- ClientSpacePRO · WorkSight · PrismHR

---

## 04 · Initiative Deep Dive

**Eyebrow:** Initiative Deep Dive

**How AI & Automation Can Transform Payroll**

Identified automation and AI initiatives target the largest time sinks across the payroll lifecycle. Each initiative maps to documented process pain points — drawn from process interviews and the end-to-end BPMN process map — and defines a clear target state. Partners should focus here: this is where the opportunity is defined and where winning responses must demonstrate specificity.

### 1 · Core Payroll Processing Efficiency

#### Initiative A — Treasury Reverse Wire Coordination Automation

**Tags:** `Automation` `Integration`

Every non-ACH payroll requires a specialist to manually email Treasury, wait 2–5 hours for acknowledgment, track release for another 1–2 hours, and escalate via Teams if delayed. This 2–7 hour cycle is the primary reason 30–35% of payrolls miss the 2–3 business day posting target and is the single largest cross-department coordination burden.

**Current State**

- ~24,000–26,000 reverse wire payrolls per year (est. 20% of client base on reverse wire × biweekly/semimonthly frequency)
- Specialist composes Treasury email upon invoice finalization, awaits acknowledgment (2–5 hrs), tracks release (1–2 hrs), and escalates via Teams if unresponsive
- Payroll cannot post until Treasury releases funds — idle wait creates context-switching overhead across all active payrolls

**Current Challenges**

- Manual email coordination with Treasury generates the highest communication volume of any cross-department relationship, consuming 40–50% of all coordination hours
- 30–35% of payrolls miss the 2–3 business day posting target, with Treasury delays as the primary driver
- Each missed posting triggers client-facing service failures and potential escalation cases

**AI / Automation Target**

- Invoice finalization event in Prism auto-creates a case and triggers a structured reverse wire request to Treasury — no specialist email composition required
- API with banks auto-initiates the reverse wire process upon request — eliminating manual Treasury team processing
- Reverse wire status updates on the Treasury dashboard reflect in real time on ClientSpace, removing the need for Payroll Specialist coordination with Treasury
- ClientSpace case auto-updates and closes upon wire receipt status on Treasury dashboard, which auto-releases the Payroll in Prism
- Exception-only handling retained — specialists intervene for declined reverse wires, amount discrepancies, and SOX sign-off; full audit trail preserved throughout

#### Initiative B — Time File Import Standardization

**Tags:** `AI` `Automation`

Approximately 20–30% of clients submit time files in formats incompatible with Prism. Specialists manually manipulate files or engage IT to build client-specific macros — which break whenever a client changes their spreadsheet structure. This adds 5–30+ minutes to an estimated 24,000–36,000 file-import events per year.

**Current State**

- ~1,000–1,500 clients require file manipulation each payroll cycle — ~24,000–36,000 events/year
- Simple macros add 2–5 min; broken macros add 15–30+ min and require IT escalation
- SaaS HR clients (ADP, Paylocity) face zero manipulation; proprietary spreadsheet clients bear the full burden

**Current Challenges**

- Any client change to spreadsheet structure breaks the IT-built macro, halting processing until a new one is built
- IT involvement for broken macros adds unpredictable delay and diverts capacity from higher-value work
- No pre-import validation — specialists discover format issues mid-import, not before

**AI / Automation Target**

- Intelligent file parser normalizes any client-submitted format to Prism-compatible structure regardless of column changes
- Schema mapping learns from each client's file history — column renames trigger auto-remap, not macro failure
- Pre-import validation flags anomalies (missing hours, negative wages, unknown employee IDs) before Prism calculation

### 2 · Payroll Shipping Automation

#### Initiative C — Shipping Case Creation & Attachment

**Tags:** `Automation` `Integration`

After every payroll with live checks, the specialist manually downloads the check file from Prism, creates a shipping case in ClientSpacePRO, attaches required files, fills PSR form fields, and submits to the queue. This 8-step sequence runs on an estimated 50–100 cases per week and consumes 10–15 minutes of specialist time per case.

**Current State**

- ~50–100 shipping cases per week; est. 18,000–30,000 per year (15–25% of payrolls include live checks)
- 8-step manual sequence: download check file → open ClientSpacePRO → navigate to client → create case → attach check file → attach batch print report → fill PSR fields → submit
- No API connection between Prism and ClientSpacePRO — every handoff is manual file download/upload

**Current Challenges**

- No automation between payroll posting and shipping case creation — specialists initiate the full handoff manually each time
- Case status must be manually updated at every handoff, creating visibility gaps between specialist and assistant
- Wrong attachments and missing dates are the most common error type, causing case rejections and rework

**AI / Automation Target**

- Prism posting event auto-creates the ClientSpacePRO shipping case with check file and batch print report pre-attached
- PSR fields auto-populated from Prism data (pay date, frequency, check count, location list) — specialist confirms rather than enters
- Validation rules cross-check pay dates and check counts before submission; case status auto-updates at each transition

#### Initiative D — Automated Label Generation, Tracking & Alerts

**Tags:** `Automation` `Integration`

Payroll Assistants spend 100% of their capacity on shipping — and every step is manual. Label generation requires carrier portal access, tracking numbers are copied by hand into each case, and delays are only discovered the next morning when assistants review carrier status reports.

**Current State**

- 6 Payroll Assistants dedicated 100% to shipping — 12,480 hours/year consumed by manual tasks
- 15–25 min per case for validation and label generation; ~1 hr/day for next-morning carrier status review
- No integration with ClientSpacePRO or any carrier API — every label is generated manually through carrier web portals

**Current Challenges**

- Tracking numbers must be manually retrieved from carrier portals and added to each ClientSpacePRO case individually
- Delivery delays are discovered the morning after shipment — no proactive alert mechanism exists
- Three regional shipping queues create coordination overhead and duplication of status-checking effort

**AI / Automation Target**

- ClientSpacePRO integration with a shipping aggregator auto-generates labels from case data — location, package count, and carrier preferences pre-populated
- Carrier API retrieves tracking numbers upon label generation and posts to the case automatically
- Delay and exception events push real-time alerts to assigned specialists — no next-morning manual discovery

> **Combined Shipping Automation (C + D):** Together, these initiatives address the full shipping cycle — specialist case creation and assistant label/tracking workflows. Combined, they target the recovery of the majority of Payroll Assistant capacity, which today is 100% consumed by manual shipping tasks.

### 3 · Client Service Intelligence

#### Initiative E — Customer Service Triage & Research Assistant (Ciklum Expansion) &nbsp; `[Outside PRD Scope]`

**Tags:** `AI` `Automation`

Specialists handle ~10 CS requests per day plus ~20 AccessHR cases per week, each requiring research across WorkSight and PrismHR before a response can be composed. Customer Service and Client Inquiry combined represent 18% of specialist capacity — the second-largest time pool after core processing.

**Current State**

- ~3,540 total inquiries/year; active work time 2–30 min per request (avg. 12–15 min)
- Specialist workflow: triage → search WorkSight → cross-reference PrismHR → check AccessHR → compose response → update case
- Routine types (paycheck lookups, deductions, direct deposit, W2 reissue) make up ~40–50% of volume

**Current Challenges**

- No system pre-pulls context before research begins — every inquiry starts from a blank slate across multiple systems
- 2-hour email SLA creates constant urgency, reducing capacity during peak processing periods
- AccessHR and ClientSpacePRO are siloed — no deduplication; specialists cross-check both manually

**AI / Automation Target**

- AI intake layer classifies request type and pre-pulls relevant employee and payroll data from WorkSight and PrismHR before specialist opens the case
- For routine types, AI drafts an initial response for specialist review — reducing research and composition time by ~50–70%
- Automatic deduplication check against open AccessHR cases surfaces prior context

---

## 05 · Business Impact

**Eyebrow:** Business Impact

**Operational Baseline & Automation Opportunities**

A view of the Payroll team's current labor baseline, how specialist and assistant capacity is allocated across processes today, and the automation and AI opportunities being evaluated — including what each initiative is targeting and what the target operating model looks like.

### Team & Labor Cost Baseline

| Role                         | Headcount | Total FLC |
| ---------------------------- | :-------: | --------: |
| Onshore Payroll Specialists  |    78     |     $6.9M |
| Offshore Payroll Specialists |    16     |     $0.3M |
| Payroll Assistants           |     6     |     $0.3M |
| **Total**                    |    100    |     $7.5M |

### Time Allocation by Process (Activity Baseline)

#### Payroll Specialists — 94 FTEs

| Process | % of Time | FTE Equivalent |
|---------|:---------:|---------------:|
| **Payroll Processing** *(Init. B)* | 60% | 56.4 |
| **Customer Service** *(Init. E · Out of Scope)* | 15% | 14.1 |
| **Coordination w/ Other Depts.** *(Init. A)* | 10% | 9.4 |
| **Coordinate Payroll Shipping** *(Init. C)* | 5% | 4.7 |
| Client Invoicing | 3% | 2.8 |
| Payroll Adjustments & Corrections | 3% | 2.8 |
| Client Inquiry & Case Support *(Init. E · Out of Scope)* | 3% | 2.8 |
| New Client Shadowing / Retraining | 1% | 0.9 |

#### Payroll Assistants — 6 FTEs

| Process | % of Time | FTE Equivalent |
|---------|:---------:|---------------:|
| **Coordinate Payroll Shipping** *(Init. D)* | 100% | 6.0 |

### Automation / AI Opportunities

#### 1 · Core Payroll Processing Efficiency

| Initiative | Target Process | Automation Goal | Target State |
|------------|----------------|-----------------|--------------|
| **A · Treasury Reverse Wire Coordination Automation** *(Automation Integration)* | Coordination w/ Other Depts. (Treasury) | Every reverse wire payroll requires a specialist to manually email Treasury and wait 2–7 hours for release, causing 30–35% of payrolls to miss the posting target. We want to eliminate this entirely — triggering an API-driven reverse wire process upon Prism invoice finalization, with real-time status sync to ClientSpace and payroll auto-release upon wire receipt | **Automated:** Reverse wire request, bank API-initiated wire processing, real-time ClientSpace status sync, payroll auto-release on wire receipt<br />**Specialist:** Declined reverse wires, discrepancies, SOX sign-off |
| **B · Time File Import Standardization** *(AI Automation)* | Payroll Processing (file import) | Specialists spend significant time manipulating client time files or waiting on IT to fix broken macros whenever a client changes their spreadsheet structure. We want to eliminate this manual work entirely — normalizing any submitted format to Prism-compatible structure via adaptive schema mapping that learns from each client's file history | **Automated:** Format normalization, schema mapping, pre-import validation<br />**Specialist:** Anomaly review, novel client formats, edge case approval |

#### 2 · Payroll Shipping Automation

| Initiative | Target Process | Automation Goal | Target State |
|------------|----------------|-----------------|--------------|
| **C · Shipping Case Creation & Attachment** *(Automation Integration)* | Coordinate Payroll Shipping (Specialist) | After every live-check payroll, specialists manually create a shipping case, attach files, and fill form fields — an 8-step sequence that repeats on every single shipment. We want to eliminate this entirely — auto-creating the ClientSpacePRO case with pre-attached files and auto-populated PSR fields the moment Prism posts the payroll | **Automated:** Case creation, file attachment, PSR population, status updates<br />**Specialist:** Final confirmation, SOX dual-person audit sign-off |
| **D · Automated Label Generation, Tracking & Alerts** *(Automation Integration)* | Coordinate Payroll Shipping (Assistant) | Payroll Assistants spend their entire capacity manually generating labels, copying tracking numbers from carrier portals, and reviewing status reports the morning after shipment. We want to eliminate all of this — auto-generating labels via carrier API integration, retrieving tracking numbers automatically, and pushing proactive delay alerts in real time | **Automated:** Label generation, tracking retrieval, delay alerts<br />**Assistant:** Physical sorting & packaging, dual-person audit, exceptions |

#### 3 · Client Service Intelligence

| Initiative | Target Process | Automation Goal | Target State |
|------------|----------------|-----------------|--------------|
| **E · CS Triage & Research Assistant** *(Outside PRD Scope · AI Automation)* | Customer Service + Client Inquiry | Specialists start every CS inquiry from scratch — searching across multiple systems to find answers that often follow predictable patterns. We want to eliminate this research burden — classifying requests automatically and pre-pulling relevant employee and payroll data before the specialist even opens the case | **Automated:** Request classification, data pre-pull, routine response drafting<br />**Specialist:** Complex inquiries, response approval, escalations |

---

## 06 · Systems & Technical

**Eyebrow:** Systems & Technical

**System Inventory, Integration Gaps & Technical Constraints**

A full inventory of every system that Payroll teams currently use, the gaps between them, and the missing integrations that a partner solution must address. This is the technical foundation for any architecture proposal.

### Core Systems in Scope

**PrismHR** — *Core Payroll Calculation Engine*
The primary payroll processing system. Handles payroll calculation, wage/tax/deduction computation, ACH posting, and ACH auto-debit. These are the only three automated steps in the entire payroll workflow. Prism is the source of truth for all payroll data — check files, invoice records, payroll history. Critical gap: Prism has no native outbound integrations to Treasury, ClientSpacePRO, or carrier systems. All handoffs are manual file exports.
Tags: `Core System` `No Outbound API (Treasury / CSPro / Carrier)` `Event Source for Inits. A, C`

**ClientSpacePRO** — *Case Management & Shipping Workflow*
The primary case management system for payroll operations — shipping cases, CS inquiry cases, error coordination cases, and AccessHR cases all route through ClientSpacePRO. Shipping cases require manual creation, manual file attachment, and manual PSR form completion. No API connection between Prism and ClientSpacePRO — every shipping case is created from scratch after manually downloading the check file from Prism.
Tags: `Core System` `No Prism Integration` `No Carrier API` `Target for Inits. C, D, E`

**Treasury Department** — *Reverse Wire Coordination (Email / Teams)*
Treasury is an internal department — not a named system — that processes reverse wire payments for non-ACH payroll clients. All coordination happens via manual email: specialists compose a reverse wire request after invoice finalization, await acknowledgment, track release, and escalate via Teams if unresponsive. There is no API or automated trigger between Prism and Treasury. This manual email cycle (2–7 hours end-to-end) is the primary cause of 30–35% of payrolls missing the 2–3 business day posting target.
Tags: `Manual Email Only (Critical Gap)` `Primary Target for Init. A`

**WorkSight** — *Client HR & Employee Data Platform*
Client-facing portal holding employee records, HR data, benefits information, and payroll history for WSEs. The primary first stop for specialists responding to CS inquiries. WorkSight and PrismHR must both be searched for most inquiries — no unified employee view exists across the two systems, contributing to the 2–30 minute handle time range for CS requests.
Tags: `In Scope` `No Unified View with Prism` `Data Source for Init. E`

**AccessHR** — *Client Inquiry Case Platform*
A secondary case platform used for client inquiry routing and tracking alongside ClientSpacePRO. Specialists receive ~20 AccessHR cases per week and must cross-reference AccessHR against ClientSpacePRO to identify duplicate or related inquiries — no auto-deduplication exists between the two platforms.
Tags: `In Scope` `No Deduplication vs. ClientSpacePRO` `Data Source for Init. E`

**SaaS HR Platforms (ADP, Paylocity, etc.)** — *Client Time File Sources*
A subset of clients use SaaS HR platforms with partial auto-integration to Prism — these clients require zero file manipulation. The problematic cases come from clients on proprietary Excel spreadsheets with non-standard column structures. IT has built client-specific macros for these clients, but macros break whenever clients change their spreadsheet structure without notice.
Tags: `Partially Integrated` `Brittle IT Macros for Non-SaaS Clients` `Target for Init. B`

**UPS / FedEx (Carrier Platforms)** — *Live Check Shipment & Tracking*
Carrier platforms for live paycheck delivery. Currently accessed manually — label generation, tracking number retrieval, and status monitoring are all performed by Payroll Assistants through carrier web portals with no API integration to ClientSpacePRO. Three regional shipping queues create coordination overhead. The SOX-required dual-person audit before pickup depends on accurate manual handoff documentation.
Tags: `No API Integration (Critical)` `Target for Init. D`

**Microsoft Teams / Outlook** — *Primary Communication Channel*
All Treasury reverse wire coordination, error escalation, and inter-department coordination flows through Teams and Outlook. This is the manual channel that Initiative A replaces — there is no structured workflow or SLA enforcement. Treasury coordination alone consumes 40–50% of the cross-department coordination allocation (10% of specialist time = 19,552 hours/year).
Tags: `In Scope` `Unstructured — No SLA Enforcement` `Replacement Target for Init. A`

**Ciklum** — *Target: AI CS Triage Platform*
The target AI/automation platform for Initiative E (CS Triage & Research Assistant). Ciklum is described as an expansion of an existing engagement — the target platform for the AI intake layer that classifies CS requests, pre-pulls employee and payroll data from WorkSight and PrismHR, and drafts initial responses for routine inquiries.
Tags: `AI CS Triage · Init. E`

### Integration Gap Summary

| Gap | Systems Affected | Current Workaround | Initiative | Priority |
|-----|------------------|--------------------|:----------:|:--------:|
| **No Prism → Treasury Integration** | PrismHR → Treasury Dept. (Email / Teams) | Manual email after every reverse wire invoice — 2–7 hr cycle; 30–35% miss posting target | A | Critical |
| **No Prism → ClientSpacePRO auto-case creation** | PrismHR → ClientSpacePRO | Specialist manually creates shipping case, attaches check file, fills PSR fields after every live-check payroll | C | High |
| **No carrier API integration** | ClientSpacePRO → UPS / FedEx | Assistants generate labels manually through carrier portals; tracking numbers copied by hand | D | High |
| **Brittle IT macros for file import** | Client files → PrismHR | IT-built macros break when clients change spreadsheet structure; manual manipulation or IT escalation required | B | High |
| **No cross-system CS inquiry context** | WorkSight + PrismHR + AccessHR → Specialist | Specialists manually search 2–3 systems to triangulate answers for every CS inquiry | E | Medium |
| **No AccessHR ↔ ClientSpacePRO deduplication** | AccessHR → ClientSpacePRO | Specialists manually check both systems before responding to any inquiry to prevent duplicate handling | E | Medium |

> **Note to partners:** Partners are not constrained by the current system architecture. If a different integration platform, middleware layer, or replacement tool better addresses the requirements, that is a valid and encouraged response. The systems above are documented as context, not constraints. SOX compliance requirements for any changes to payroll posting and check handling workflows must be explicitly addressed — particularly for Initiatives A (reverse wire release trigger) and C (check file attachment integrity).

---

## 07 · Glossary

**Eyebrow:** Glossary

**Terms, Definitions & Acronyms**

Definitions of all Payroll-specific terms, G&A operational acronyms, role designations, and system names used throughout this document.

### Roles

- **Payroll Specialist** — The primary operational role. Owns the full payroll lifecycle for assigned clients: time file import, Prism calculation, invoice reconciliation, Treasury coordination, off-cycle batch setup, and all client-facing service requests. 78 onshore + 16 offshore = 94 total. The Payroll Specialist role owns 16 of 27 documented process steps — spanning all four lifecycle phases and representing the primary bottleneck lane in the operation.
- **Payroll Assistant** — Support role dedicated 100% to Coordinate Payroll Shipping. Responsibilities include validating case attachments, printing and sorting checks by destination (up to 20+ locations per client), generating carrier labels, packaging, executing the SOX-required dual-person audit, and reviewing morning carrier status reports. 6 total FTEs. Every step is manual today.
- **Payroll Management** — Oversight layer responsible for specialist assignment (by capacity, time zone, complexity, and personality fit), workload monitoring via color-coded PSS Workload Status Reports (green/orange/red), SOX control governance, and reversal authorization. Escalation path for Treasury coordination failures and high-complexity off-cycle scenarios.
- **Garnishment Team** — A separate team (lead + 2 specialists + coordinator) operating a parallel track for garnishment order setup, check printing, and interrogatory preparation. Excluded from the scope of this PRD per engagement direction.

### Process & Operational Terms

- **ACH (Automated Clearing House)** — Electronic payment method for payroll disbursement. ACH posting and ACH auto-debit are two of the three automated steps in the current payroll workflow. ACH clients do not require Treasury reverse wire coordination — this distinction defines the addressable pool for Initiative A.
- **Check File** — The output file generated by Prism after payroll calculation, containing all employee payment details for live check printing. Must be manually downloaded from Prism and attached to the ClientSpacePRO shipping case by the specialist — the primary manual handoff targeted by Initiative C.
- **Dual-Person Audit** — A SOX-required control for live check shipments. Two individuals (specialist + assistant) must independently verify that check file, package contents, and carrier documentation are correct before release to the carrier. This control is preserved under all automation scenarios — Initiative C improves documentation quality and completeness to support the audit, not replace it.
- **Off-Cycle Payroll** — Any payroll run outside the client's regular pay schedule — bonuses, missed pay corrections, termination settlements, or W2C corrections. ~390 off-cycles per year (5–10/week). Off-cycle batch configuration is described as the "biggest pain point" in Adjustments & Corrections — specialists must navigate complex suppression settings where "one wrong selection could make everything not pull properly."
- **PSR (Payroll Shipping Request)** — The form that must be completed within the ClientSpacePRO shipping case to initiate live check shipment. Fields include pay date, pay frequency, check count, and location details. Manual PSR completion is the most common source of case rejections (wrong dates, wrong check counts) targeted by Initiative C.
- **SOX Controls** — Sarbanes-Oxley financial controls governing payroll processing. Six SOX-relevant controls are documented: (1) source document reconciliation, (2) 20% variance threshold review, (3) 100% invoice accuracy accountability, (4) dual-person audit before shipment, (5) CCPA and state garnishment compliance, (6) client approval required before finalization. Any automation solution must explicitly preserve all six controls.
- **Reverse Wire** — Payment method for non-ACH payroll clients requiring reverse wire transfer. The specialist emails Treasury with the invoice, waits for acknowledgment and fund release, then posts the payroll in Prism. The 2–7 hour end-to-end cycle is the primary cause of payrolls missing the 2–3 business day posting target. Reverse reverse wire clients represent an estimated 15–25% of the client base.
- **WSE (Worksite Employee)** — An employee of a G&A client company, co-employed through the PEO arrangement. G&A Payroll processes payroll for ~100,000 WSEs across ~4,000 client companies. WSE employment data lives in WorkSight; payroll history lives in PrismHR. Specialists must search both systems to answer CS inquiries about individual WSEs.

### Systems & Technology Terms

- **Ciklum** — The AI/automation platform identified for Initiative E (CS Triage & Research Assistant). Described as an expansion of an existing G&A Partners engagement — the target platform for the AI intake layer that classifies CS requests, pre-pulls employee and payroll data from WorkSight and PrismHR, and drafts initial responses for routine inquiry types.
- **ClientSpacePRO** — The PEO-specific case management CRM used by Payroll as the system of record for all shipping cases, CS inquiry cases, and cross-department coordination cases. No native API connection to PrismHR, Treasury, or carrier systems — all data movement between ClientSpacePRO and external systems is currently manual file transfer.
- **PrismHR** — The core payroll calculation engine. All payroll runs execute within Prism. The three automated steps in the current workflow (payroll calculation, ACH posting, ACH auto-debit) all occur within Prism. Prism is the authoritative data source for check files, invoice records, and payroll history that all five initiatives depend on as their event source or data layer.
- **PSS Workload Status Report** — A color-coded capacity management report (green/orange/red) used by Payroll Management to monitor specialist workloads across three regional time zones. Key input to specialist assignment decisions during client onboarding and capacity planning.

---

## 08 · Submission Guide

**Eyebrow:** Submission Guide

**What We Need From You**

Your response must address all six items below. Quality over length — a specific response beats a comprehensive generic one. Any format is accepted, plus working demos where specified.

### Required Submission Components

**1. Proposed Approach & Workplan**
What is your phasing? Our recommended sequencing starts with Shipping Automation (C + D) in Q1, Treasury Reverse Wire (A) in Q2, and Time File Import (B) in Q3–Q4. Do you agree? Where would you sequence differently, and why? What does the first 30–60–90 days look like in specific terms? Can Shipping Case Creation (C) be built and validated independently before Label/Tracking (D) is layered on? What SOX control preservation milestones need to be achieved before go-live on Initiatives A and C?

**2. Architecture & Technical Design**
How do you architect each initiative against the Prism + ClientSpacePRO + external-system stack? **Initiative A:** The target flow auto-creates a ClientSpacePRO case upon invoice finalization and triggers a structured reverse wire request to Treasury Dept. How do you architect the Prism event trigger, route status back to ClientSpace in real time, and handle exceptions — while maintaining a full SOX audit trail? **Initiative B:** What is your approach to schema inference and adaptive column mapping — rule-based, ML, or hybrid? How does the system handle genuinely ambiguous mappings without introducing payroll calculation errors? **Initiative C:** How do you ensure the correct check file version from Prism is attached to the ClientSpacePRO case with enough confidence to satisfy the SOX dual-person audit requirement? **Initiative D:** Which shipping aggregator(s) do you propose, and how do you handle multi-location packages per client? Include a system architecture diagram.

**3. Effort, Timeline & Cost**
Build cost by initiative, ongoing infrastructure cost, proposed pricing model. Include G&A-side resource requirements (who needs to be involved, how much of their time, including compliance/SOX review). Separate build cost from run cost clearly — a low build / high run structure requires explicit justification. For Initiatives A and C, include the SOX compliance review as a first-class deliverable in the timeline, not an assumption.

**4. Data, Compliance & PII Handling**
Payroll data is among the most sensitive PII categories — wage records, SSNs, bank account details, and tax information. **For Initiatives A and C:** SOX compliance is non-negotiable — explain your approach to audit trail requirements for the reverse wire release trigger (A) and check file attachment integrity (C). What compliance documentation will be provided at go-live for each?

**5. Working Demo / POC**
We are not asking for a working demo or POC. Instead, we want to see an architectural design for Initiatives A, C, and D that demonstrates your capabilities and approach to automating these workflows. The design should give us confidence in your technical depth and experience with the systems involved.

**(A) Treasury Reverse Wire Coordination Automation:** Provide an architectural design showing how Prism invoice finalization triggers a ClientSpacePRO case creation and a structured reverse wire request, how a bank API auto-initiates the wire process, how Treasury dashboard status syncs in real time to ClientSpace, and how the case auto-closes and payroll auto-releases upon wire receipt. Include your approach to SOX audit trail preservation and exception handling.

**(C) Shipping Case Creation & Attachment:** Provide an architectural design showing how a Prism posting event auto-creates the ClientSpacePRO shipping case with pre-attached check file and auto-populated PSR fields, including validation rules and how the SOX dual-person audit requirement is preserved.

**(D) Label Generation, Tracking & Alerts:** Provide an architectural design showing how ClientSpacePRO integrates with a shipping aggregator for automated label generation, how carrier API retrieves and posts tracking numbers, and how proactive delay alerts are pushed to specialists in real time.

**6. Relevant Experience**
2–3 specific examples of AI or automation solutions built for payroll operations, financial transaction processing, or HR service environments. For each: problem, solution, systems integrated, and measurable outcome (cycle time reduction, error rate improvement, operational impact). Include the team that would work on this engagement and their relevant experience with PrismHR, ClientSpacePRO, and carrier API integrations specifically. SOX-compliant automation build experience is strongly valued for Initiatives A and C.

### Evaluation Criteria

| Criterion | Weight | What We Are Looking For |
|-----------|:------:|-------------------------|
| **Working POC / Demo Quality** | 30% | Does the architectural design for Initiative A show a credible end-to-end reverse wire automation flow — from Prism trigger through bank API to ClientSpace real-time sync and payroll auto-release? Does the design for C demonstrate how the Prism-to-ClientSpace integration preserves the SOX dual-person audit requirement? Does the design for D show a realistic carrier API integration for label generation and proactive delay alerts? |
| **Architecture Credibility** | 25% | Is the design realistic given Prism's limited outbound API surface? Are the SOX compliance requirements for Initiatives A and C specifically scoped as first-class deliverables? Is the file parser approach grounded in a real schema-inference or adaptive ML methodology? |
| **Relevant Experience** | 20% | Have you built payroll, financial transaction, or HR service automation at comparable scale? PrismHR experience is specifically valued. SOX-compliant automation experience is required for Initiatives A and C. |
| **Cost Realism & Compliance Strategy** | 15% | Is build cost credible given the integration scope (Prism → Treasury, Prism → ClientSpacePRO, ClientSpacePRO → carrier APIs)? Is SOX audit trail documentation for Initiatives A and C scoped as a first-class deliverable rather than an assumption? |
| **Speed to Value** | 10% | Can Shipping Automation (C + D) go live as the Q1 quick win within 60–90 days? How does the team navigate SOX review timelines for A and C alongside build velocity? |

> **Submit to:** tsagireddy@alixpartners.com &nbsp;|&nbsp; **Deadline:** TBD

---

*G&A Partners · AI Payroll PRD · Confidential · Preliminary — Subject to Change*
