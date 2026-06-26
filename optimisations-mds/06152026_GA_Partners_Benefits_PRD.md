# G&A Partners | AI Benefits PRD

> **Confidential · Partners Only**
> **Partner Evaluation Package · June 2026**
> *Preliminary — Subject to Change*

# AI-Enabled Benefits — Product Requirements Document

G&A Partners is evaluating strategic AI development and implementation partners to design and build AI-enabled operations workflows for its Benefits function — spanning both G&A Beneficial (GAB, pre-implementation) and Benefits Administration (Ben Admin, ongoing operations). This document provides everything a partner needs to understand the opportunity, current state, and what a winning response looks like.

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

**AI-Enabled Benefits — Product Requirements Document**

G&A Partners is evaluating strategic AI development and implementation partners to design and build AI-enabled operations workflows for its Benefits function — spanning both G&A Beneficial (GAB, pre-implementation) and Benefits Administration (Ben Admin, ongoing operations). This document provides everything a partner needs to understand the opportunity, current state, and what a winning response looks like. Navigate using the tabs above.

### What's Inside

| # | Section | Description |
|---|---------|-------------|
| 01 | **Overview** | Key contents, scope, timeline for the partner evaluation, and the point of contact for all questions and submissions. |
| 02 | **Business Context** | What the Benefits team does, its operational processes, team structures, P&L positions, and the margin improvement mandate. Read this first. |
| 03 | **Process Map** | End-to-end process maps across swimlanes for G&A Beneficial and Benefits Administration, with system touchpoints and initiative tags at each process step. |
| 04 | **Initiative Deep Dive** | Initiative-level breakdowns covering current state, pain points, and what an AI and automation solution must deliver. This is where partners should spend most of their time. |
| 05 | **Business Impact** | Detailed description of the automation initiative and capability requirements, along with effort estimates and processes affected by the initiative. |
| 06 | **Systems & Technical** | Full inventory of systems in scope, integration gaps, missing automations, and API considerations across the Benefits technology stack. |
| 07 | **Glossary** | Definitions of Benefits-specific terminology, G&A operational acronyms, role definitions, and system names used throughout this document. |
| 08 | **Submission Guide** | What we need from partners, how we will evaluate responses, and what a winning submission looks like — including demo specifications for each initiative. |

### Scope & Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| **PRD Shared** | June 15, 2026 | This document distributed to select partners |
| **Partner Response Deadline** | June 25, 2026 | Approach, architecture, cost, demo/POC, and relevant experience required |
| **Partner Presentations** | TBD | Live Q&A and demo walk-through with G&A leadership |

### Point of Contact

**Engagement Lead**

All questions and submissions should be directed to:

**Tilak Sagireddy**
tsagireddy@alixpartners.com

---

## 02 · Business Context

**Eyebrow:** Business Context

**G&A Partners Benefits — Business Overview**

G&A's Benefits function has two primary groups. GAB (G&A Beneficial) is a licensed internal brokerage team that sources, quotes, and renews benefits plans for G&A's clients, acting as the strategic and commercial interface between employers, carriers, and brokers. Benefits Administration is an operations team responsible for the day-to-day administration of the benefits plans (managing system setup, carrier enrollment, payroll deductions, reconciliation, WSE/client issue resolution, etc.). Read this before reviewing the process and technical sections.

### What the Two Teams Do

#### G&A Beneficial (GAB)

GAB owns the client relationship from initial prospect engagement through plan quoting, selection, onboarding, and the annual renewal cycle. The team builds the Client Approved Plans (CAP) document for quoting and renewals, and manages the carrier AOR setup and enrollment launch.

- **Sales Support & Prospecting** — Requirements gathering and pre-quoting support for Business Advisers.
- **Benefits Underwriting & Quoting** — Risk scoring via Hero/Gradient, financial comparison building, proposal release, and rate concession negotiation.
- **CAP Build-out & Completion** — Creation of the Client Approved Plans document defining plan designs, rates, employer contributions, and FSA/HSA parameters for each client.
- **Client Onboarding** — Kickoff and breakout calls, broker commission verification, DocuSign confirmation, benefits booklet preparation, and enrollment portal build.
- **Benefits Renewal** — Annual renewal cycle in which existing clients' plans and CAP data are reviewed, updated, and re-entered into the onboarding flow.

#### Benefits Administration (Ben Admin)

Ben Admin owns the full operational lifecycle after client onboarding: system configuration, payroll deduction auditing, carrier enrollment, WSE/client issue resolution, reconciliation, and regulatory compliance for all active Benefits clients.

- **New Client System Setup & Configuration** — Benefit plans configured in Prism from the CAP; FSA/HSA plans built; carrier enrollment set up for both open-market and master plans.
- **Payroll Reviews & Benefit Deductions** — Monthly audit of employee payroll deductions against plan rates and employer contribution schedules to ensure accuracy.
- **Carrier / Broker Interaction & Enrollment** — Processing of employee enrollments with carriers, maintenance of EDI feeds for master plans, and coordination with brokers on open-market plans.
- **WSE & Client Issue Resolution** — Handling of employee and client inquiries covering ID cards, claims, COBRA events, HSA contributions, and billing questions.
- **Benefits Reconciliation & Payments** — Monthly reconciliation of payroll deduction data against carrier invoices at the employee level, and processing of carrier payments.
- **Benefits Reporting & Compliance** — ACA filings, COBRA administration, and annual regulatory filings and plan-level compliance documentation across the client base.

### Benefits at a Glance

| Metric | Value | Note |
|--------|-------|------|
| Total WSEs Supported | **~130K** | |
| Annual Quotes (GAB) | **10,426** | |
| Total FTEs | **189** | Incl. offshore FTEs |
| Combined FLC | **~$17.6M** | Incl. offshore FTEs |

### Current Team Structure

| Group | Onshore FTEs | Onshore FLC | Offshore FTEs | Offshore FLC |
|-------|--------------|-------------|---------------|--------------|
| **G&A Beneficial (GAB)** | 62 | $7.9M | 10 | $0.3M |
| **Benefits Administration** | 68 | $6.3M | 30 | $0.8M |
| **Retirement Services** *(greyed out / out of focus)* | 17 | $1.8M | — | — |
| **Leadership & Other** *(greyed out / out of focus)* | 2 | — | — | — |

#### G&A Beneficial — Key Roles

- **AM / AE — Existing** — Manage G&A's existing client book of business, owning the relationship from plan selection and quoting through onboarding and annual renewal.
- **AM / AE — New** — Manage newly onboarded clients through the initial implementation cycle and early renewal engagements.
- **Benefits Coordinator** — Support the quoting and onboarding workflow through CAP batch review, benefits booklet preparation, and enrollment portal build.

#### Benefits Administration — Key Roles

- **Benefits Specialist** — Own the full client servicing lifecycle post-onboarding, including carrier enrollments, payroll deduction audits, and WSE and client issue resolution.
- **Benefits Reconciliation Specialist** — Reconcile monthly payroll deduction data against carrier invoices at the employee level and process carrier payments.
- **Benefits Analyst** — Configure new client benefit plans in Prism, manage system setup and periodic audits, and support acquisition integrations.
- **Benefits QC Administrator** — Maintain EDI carrier feeds, manage ACA and regulatory compliance filings, and administer COBRA documentation.

### What We Are Looking For

#### 1 · Core Infrastructure — CAP & System Modernization

**A · CAP Migration to Cloud-Based Solution Integrated with Prism** &nbsp; `[Priority]`

Replace the entirely manual Excel-based Client Approved Plans document with a cloud-hosted, Prism-integrated solution that auto-populates renewal CAPs from existing configurations and validates new-business CAPs against source data — eliminating the 2–4 hour manual build that cascades errors into 8+ downstream processes across both GAB and Ben Admin.

#### 2 · G&A Beneficial — Sales & Underwriting Enablement

**B · AI Underwriting Assistant**

AI document extraction layer that scrubs PDFs, SBCs, and carrier invoices to pre-populate required plan data and flag missing information — eliminating 20–30 min per-case manual scrubbing across 10,426 annual quotes and blocking the 80–90% incomplete submissions from entering the underwriting queue.

#### 3 · Benefits Administration — Service Delivery Automation

**C · Carrier Portal API/RPA for Open-Market Enrollments**

API or RPA-based solution to automate field-by-field Prism-to-carrier-portal data entry for all non-EDI (open-market) enrollments — eliminating 13–17 min of manual transcription per enrollment with high error risk.

**D · Ciklum Platform Expansion** &nbsp; `[Outside PRD Scope]`

Expand existing Ciklum platform for automated case creation, self-service deflection, and AI after-call summarization.

**E · Sidekick Platform Expansion** &nbsp; `[Outside PRD Scope]`

Expand existing Sidekick platform to automate payroll deduction comparison and variance flagging against CAP rates.

**F · Benefits Reconciliation Tool Rollout** &nbsp; `[Outside PRD Scope]`

Complete UAT and production stabilization of the Beacon recon platform to automate monthly payroll-to-carrier invoice reconciliation.

---

## 03 · Process Map

**Eyebrow:** Process Map · Current State Swimlanes

**Benefits Operations — End-to-End Lifecycle**

Two separate process maps reflect the distinct operating models of G&A Beneficial (deal-driven, pre-implementation) and Benefits Administration (event-driven, ongoing operations). Initiative tags (⚐) mark where automation targets each process step. Three inter-department handoff points are annotated where the two teams exchange artifacts.

### Diagram 1: G&A Beneficial (GAB) — 72 FTEs

Swimlane phases: **Prospect & Quote → Client Onboarding → Enrollment & Launch → Handoff & Retention**

#### Lane: Account Manager / Account Executive

| Prospect & Quote | Client Onboarding | Enrollment & Launch | Handoff & Retention |
|------------------|-------------------|---------------------|---------------------|
| Client Requirements Gathering *(Census, plan history, renewal date)* | Kickoff & Breakout Call *(Enrollment strategy confirmed)* | Enrollment Education Meeting | Strategic Client Outreach |
| Submit to Underwriting *(**80–90% submissions incomplete**)* | CAP Build-out & Completion *(**⚐ Init. A · 2–4 hrs manually**)* | Enrollment Monitoring | Welcome Packet Build |
| Comparison Review & Concessions *(70% of deals need 2–3 rounds)* | Broker Commission Verification *(Open-market · no central repo)* | | Benefits Renewal *(**⚐ Init. A · manual CAP duplication**)* |

#### Lane: Underwriting & Comparison

| Prospect & Quote | Client Onboarding | Enrollment & Launch | Handoff & Retention |
|------------------|-------------------|---------------------|---------------------|
| Underwriting & Quoting *(**⚐ Init. B · 20–30 min doc scrub**)* | Carrier Setup (AOR / New Group) *(30–45 day AOR carrier turnaround)* | — | — |
| Risk Scoring (Hero/Gradient) | | | |

#### Lane: Coordinator / Analyst

| Prospect & Quote | Client Onboarding | Enrollment & Launch | Handoff & Retention |
|------------------|-------------------|---------------------|---------------------|
| — | DocuSign & CAP Batch Review *(**⚐ Init. A · downstream of CAP accuracy**)* | Portal Testing & QC | New Client Checklist & Handoff to Ben Admin |
| | Benefits Booklet Preparation *(**⚐ Init. A · auto-generated from CAP**)* | | |
| | Portal Build (NextGen/WorkSight) | | |

**GAB Initiative Tags**

- **⚐ A** — CAP Migration to Cloud-Based Solution
- **⚐ B** — AI Underwriting Assistant

### Diagram 2: Benefits Administration (Ben Admin) — 98 FTEs

Swimlane phases: **Client Setup → Ongoing Servicing → Recon & Payments → Compliance & QC**

#### Lane: Benefits Specialist

| Client Setup | Ongoing Servicing | Recon & Payments | Compliance & QC |
|--------------|-------------------|------------------|------------------|
| New Client Implementation *(Downstream of GAB CAP handoff)* | Payroll Reviews & Deduction Audit *(**⚐ Init. E · 4+ reports · 20–60 min/client**)* | Exception & Discrepancy Resolution (Recon) | COBRA / State Continuation *(Via WEX · manual entry)* |
| Carrier Enrollment (Open Market) *(**⚐ Init. C · 13–17 min/enrollment**)* | WSE Issue Resolution *(**⚐ Init. D · 2–6 ID card req/day**)* | | |
| | Client Issue Resolution *(**⚐ Init. D · billing & coverage inquiries**)* | | |

#### Lane: Benefits Analyst

| Client Setup | Ongoing Servicing | Recon & Payments | Compliance & QC |
|--------------|-------------------|------------------|------------------|
| New Client System Setup & Config *(**⚐ Init. A downstream · 48% of analyst time**)* | Periodic Audits & QC | — | ACA Register & Compliance *(~800 clients · Jan–Mar season)* |
| Acquisition Migrations | | | |

#### Lane: Benefits Recon Specialist

| Client Setup | Ongoing Servicing | Recon & Payments | Compliance & QC |
|--------------|-------------------|------------------|------------------|
| — | — | Benefits Reconciliation & Payments *(**⚐ Init. F · 97% of role · Excel fallback**)* | — |

#### Lane: Benefits QC / EDI / Compliance

| Client Setup | Ongoing Servicing | Recon & Payments | Compliance & QC |
|--------------|-------------------|------------------|------------------|
| EDI Implementation & Setup | EDI Maintenance & Discrepancy Triage *(Daily validation · manual routing)* | — | ACA / COBRA / 5500 / RxDC / SOC Docs |

**Ben Admin Initiative Tags**

- **⚐ A** — CAP Migration (downstream)
- **⚐ C** — Carrier Portal API/RPA
- **⚐ D** — Ciklum Platform Expansion
- **⚐ E** — Sidekick Platform Expansion
- **⚐ F** — Benefits Reconciliation Tool

### Key Inter-Department Handoff Points

- **→ CAP + Benefit Batch (GAB to Ben Admin)** — Approved CAP and benefit batch in ClientSpace. CAP accuracy is the #1 cross-boundary pain point — errors in GAB cascade directly into Ben Admin system setup blocking.
- **→ Carrier Setup (GAB UW to Ben Admin Specialist/EDI)** — Carrier confirmation and portal credentials for open-market plans. Carrier must be set up before effective date; open-market plans require full manual re-entry.
- **← Renewal Cycle (Ben Admin to GAB)** — Retention triggers renewal; renewed CAP data is manually duplicated from prior-year, reintroducing the same format changes and transcription errors as new-business.

---

## 04 · Initiative Deep Dive

**Eyebrow:** Initiative Deep Dive

**How AI & Automation Can Transform Benefits**

Six automation and AI initiatives (three in scope for this PRD) target the largest manual bottlenecks across the Benefits lifecycle. Each maps to documented process pain points drawn from interviews and the end-to-end process maps, and defines a clear target state. Partners should focus here: this is where the opportunity is defined and where winning responses must demonstrate specificity.

### 1 · Core Infrastructure — CAP & System Modernization &nbsp; `[Priority]`

#### Initiative A — CAP Migration to Cloud-Based Solution Integrated with Prism

**Tags:** `Automation` `Integration`

The Client Approved Plans (CAP) document is referenced in 8+ processes across both GAB and Ben Admin. Built entirely in Excel at 2–4 hours per client, every downstream process depends on its accuracy. A cloud-hosted, Prism-integrated solution that auto-populates renewal CAPs and validates new-business CAPs against source data would eliminate the bulk of this manual transcription.

**Current State**

- CAP built entirely in Excel — plan designs, rates, deductibles, and FSA/HSA parameters entered manually per client
- New-business CAPs take 2–4 hours; renewal CAPs require full manual duplication with format changes each cycle
- Referenced in 8+ downstream processes; ~1,320 new client setups annually amplify the labor cost

**Current Challenges**

- Excel freezes on large plans; triple-checking required before every release
- CAP errors are the #1 cause of Ben Admin system setup blocking — user quote: *"Our setup is blocked quite often because we notice issues on the cap."*
- AM-Existing spends 35–45% of time on CAP/renewal data entry, leaving minimal capacity for strategic client outreach

**AI / Automation Target**

- Renewal CAPs auto-populated from existing Prism configurations; AM reviews and approves rather than rebuilds
- New-business CAPs validated in real time against Prism source data; discrepancies flagged before Ben Admin submission
- Structured CAP data flows directly downstream to Prism setup, deduction audit, and portal build

**Sub-Initiative A1 — GAB Portion — AM/AE/Coordinator Capacity Recovery**

- **Affected Roles:** AE and AM (existing and new), Benefits Coordinator — 50+ FTEs with 25–45% time on CAP/Renewal
- **Key Pain:** Manual renewal CAP duplication; no pre-fill from prior-year Prism data
- **Automation Yield:** 40–50% of affected CAP/Renewal labor; freed AM capacity redirected to client outreach.

**Sub-Initiative A2 — Ben Admin Portion — Benefits Analyst Setup Efficiency**

- **Affected Roles:** Benefits Analyst (8 ICs) — 48% of time on system setup, directly blocked by CAP inaccuracies
- **Key Pain:** Setup blocked by CAP discrepancies; rework cycles post-setup; seasonal spikes in July and Q4
- **Automation Yield:** 20–30% of setup labor (rework cycles eliminated).

### 2 · G&A Beneficial — Sales & Underwriting Enablement

#### Initiative B — AI Underwriting Assistant

**Tags:** `AI` `Automation`

The underwriting team processes 10,426 annual quotes, with 80–90% of submissions arriving incomplete. Manual document scrubbing — extracting plan data from PDFs, SBCs, and invoices — takes 20–30 minutes per case. An AI extraction layer would pre-populate comparison fields; a completeness check would block incomplete cases before they enter the queue.

**Current State**

- 10,426 annual quotes; 20–30 min per case scrubbing PDFs, SBCs, and invoices to extract plan data
- 80–90% of submissions arrive incomplete — back-and-forth with sales consumes ~20% of UW team capacity
- Age-banded rate calculations for larger groups extend scrubbing time further

**Current Challenges**

- 48-hour quoting turnaround driven by scrubbing volume; extends to 3–5+ days with incomplete submissions
- No submission completeness gating — incomplete cases must be returned, doubling handling time
- Non-underwriting work consumes ~40% of team capacity, compressing quoting bandwidth

**AI / Automation Target**

- AI extraction layer auto-populates plan design fields, rates, deductibles, and census data from PDFs and SBCs
- Pre-submission completeness check blocks incomplete cases with actionable error messages
- Scrubbing reduced to review-and-confirm; specialists focus on concession strategy and judgment calls

### 3 · Benefits Administration — Service Delivery Automation

#### Initiative C — Carrier Portal API/RPA for Open-Market Enrollments

**Tags:** `Automation` `Integration`

All non-EDI (open-market) carrier enrollments require a Benefits Specialist to log into each carrier portal and enter enrollment data field-by-field from Prism — 13–17 minutes per enrollment with high error risk. An API or RPA automation would handle the Prism-to-portal transcription; the specialist retains the audit review step.

**Current State**

- Every open-market enrollment requires manual field-by-field data entry into carrier portals from Prism
- 13–17 minutes per enrollment; Benefits Specialists spend 20% of total time on Carrier/Broker Interaction
- EDI available for master plan carriers only; no API alternative for open-market

**Current Challenges**

- Transcription errors create coverage gaps — a directly documented SOX-adjacent risk
- Enrollment audit review required on every case on top of 13–17 min manual entry
- User quote: *"If we could have some type of API for all carriers open market... that would eliminate the need for us to go out to each carrier portal."*

**AI / Automation Target**

- API or RPA reads Prism enrollment data and executes carrier portal entry automatically
- Enrollment confirmation auto-captured and stored in ClientSpace for compliance record
- Exceptions routed to assigned Benefits Specialist with field-level context; audit review step retained

#### Initiative D — Ciklum Platform Expansion &nbsp; `[Outside PRD Scope]`

**Tags:** `AI` `Automation`

The Benefits Specialist team handles high volumes of low-complexity interactions — ID card requests, coverage verification, and billing inquiries — that do not require specialist judgment. Expanding Ciklum for automated case creation, self-service deflection, and AI after-call summarization would redirect capacity to complex cases.

**Current State**

- Benefits Specialists spend 35% of time on WSE and Client Issue Resolution combined
- ID card requests average 2–6 per day; bulk requests of 30–50 during peak open enrollment
- All issue intake is manual triage; no automated case creation

**Current Challenges**

- High-volume low-complexity requests consume capacity reserved for claims, FSA corrections, and COBRA
- No self-service path — every inquiry routes to a Specialist regardless of complexity
- After-call summarization and case documentation are entirely manual

**AI / Automation Target**

- Automated case creation from intake channel eliminates manual triage logging
- Self-service deflection routes ID cards and FAQs to carrier apps with guided prompts
- AI after-call summarization auto-populates ClientSpace case notes; complex cases remain Specialist-owned

#### Initiative E — Sidekick Platform Expansion — Automated Payroll Deduction Audit &nbsp; `[Outside PRD Scope]`

**Tags:** `AI` `Automation`

Monthly payroll deduction reviews consume 23% of the Benefits Specialist team. Each review pulls 4+ Prism reports, manually combines them in Excel, and compares deductions tier-by-tier against the CAP. Expanding Sidekick would replace this workflow with an automated consolidated comparison report.

**Current State**

- Benefits Specialists spend 23% of time on payroll deduction reviews — the highest single time allocation in the role
- Each review: pull 4+ Prism reports → combine in Excel → compare against CAP → reconcile invoice (20–60 min per client)
- HSA employer match entered manually per employee with no automated validation

**Current Challenges**

- 4+ disconnected Prism reports required per cycle; VLOOKUP-based comparison is fragile and error-prone
- No automated variance identification — discrepancies must be manually spotted and can persist across pay periods
- User quote: *"If we could create some type of report within Prism that included everything that we reviewed versus pulling multiple reports..."*

**AI / Automation Target**

- Sidekick auto-pulls deduction register, CAP rates, and prior pay period data into a consolidated variance report
- HSA employer match auto-calculated from plan enrollment data and CAP specs
- Specialists review exception-flagged variances only; routine matches confirmed in bulk

#### Initiative F — Benefits Reconciliation Tool Rollout &nbsp; `[Outside PRD Scope]`

**Tags:** `Automation`

The Beacon platform is designed to automate monthly payroll-to-carrier invoice reconciliation but is partially deployed and unreliable, forcing a manual Excel fallback. UAT completion and production stabilization — not new development — is the key investment required.

**Current State**

- Recon Specialists spend 97% of time on monthly reconciliation across all active clients
- Beacon platform partially deployed but unreliable; Excel fallback required when Beacon fails
- 8 different carrier payment methods require manual routing logic

**Current Challenges**

- Beacon unreliability forces monthly Excel fallback — platform cannot be depended on without UAT completion
- Over/under-payment risk from reconciliation errors creates direct financial exposure
- UAT completion — not new development — is the identified key investment

**AI / Automation Target**

- Complete Beacon UAT and stabilize production — enabling reliable auto-pull and employee-level invoice comparison
- Exception-based workflow: Specialists review flagged discrepancies only; matches confirmed automatically
- Excel fallback eliminated; payment routing logic automated within Beacon

---

## 05 · Business Impact

**Eyebrow:** Business Impact

**Operational Baseline & Automation Impact**

This tab presents two connected views: our automation goal for CAP Migration — the highest-priority initiative in this PRD — and how the G&A Beneficial team currently spends time across its core processes, with the three processes targeted by Initiative A highlighted.

### Initiative A — Automation Goal &nbsp; `[Priority]`

**A · CAP Migration** — *Cloud-Based Solution Integrated with Prism / WorkSight*

**Target End State — What We Are Looking For**

- **CAP auto-generation from source data:** Solution ingests data from G&A's client repository, benefits plan configurations, and underwriting results to auto-generate the Client Approved Plans document — covering plan designs, carrier rates, employer contribution schedules, pay period structures, and FSA/HSA parameters — eliminating the current 2–4 hour manual Excel build per client.
- **Dynamic template management:** Solution supports real-time updates to the CAP template and associated downstream outputs when base rates change, plans are added or modified, or contribution structures are revised — ensuring all artifacts remain in sync without requiring a full manual rebuild.
- **Renewal auto-population:** For renewal cycles, the solution auto-populates the CAP from prior-year Prism plan configurations, flagging year-over-year changes for AM review rather than requiring full manual reconstruction. AM-Existing currently spends 35% of their time on renewals alone.
- **Benefits booklet auto-generation:** Solution auto-generates the client-facing benefits booklet directly from approved CAP data during initial enrollment and annual renewal, eliminating the downstream manual coordinator build step.
- **E-signature and contract management:** Integrated e-signature and contract management capabilities to obtain, store, and track client plan sign-off annually — replacing manual DocuSign coordination outside the system and providing a centralized audit trail of client approvals.
- **Real-time data validation:** CAP data validated in real time against Prism plan configurations and carrier rate tables before submission to Ben Admin; discrepancies flagged at the source, eliminating the downstream setup blocking that currently delays new client go-lives.
- **Prism / WorkSight and ClientSpace integration:** Bi-directional integration with Prism/WorkSight and ClientSpace to serve as a unified repository for benefit plan details, ensuring benefit deductions, carrier enrollment parameters, payroll audit references, and reconciliation inputs are all sourced from a single system of truth.

### Activity Baseline — G&A Beneficial (GAB)

Column FTE counts: AE—Existing (4 FTEs), AM—Existing (27 FTEs), AE—New (4 FTEs), AM—New (10 FTEs), Ben. Coordinator (5 FTEs), Ben. Underwriter (1 FTE).

| Process | AE—Existing | AM—Existing | AE—New | AM—New | Ben. Coordinator | Ben. Underwriter | FTE Equiv. | Initiative |
|---------|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|
| **CAP Build-out & Completion** | **10%** | **10%** | **20%** | **20%** | **10%** | **—** | **6.4** | ⚐ A |
| **Benefits Booklet Preparation** | **5%** | **5%** | **5%** | **5%** | **15%** | **—** | **3.0** | ⚐ A |
| **Benefits Renewal** | **30%** | **35%** | **5%** | **5%** | **10%** | **2%** | **11.9** | ⚐ A |
| Sales Support & Prospecting | 5% | 5% | 10% | 10% | — | — | 3.0 | — |
| Client Requirements Gathering | 10% | 10% | 20% | 20% | 10% | 10% | 6.5 | — |
| Benefits Underwriting & Quoting | 5% | 5% | 10% | 10% | 30% | 75% | 5.2 | ⚐ B |
| Enrollment Education | 10% | 10% | 10% | 10% | — | 5% | 4.6 | — |
| Welcome Packet Build | — | — | 5% | 5% | 10% | — | 1.2 | — |
| Broker Commission Verification | 5% | 5% | 5% | 5% | 10% | 1% | 2.8 | — |
| Strategic Client Outreach | 15% | 10% | 5% | 5% | — | 5% | 4.1 | — |
| QC & Work Audits | 5% | 5% | 5% | 5% | 5% | 2% | 2.5 | — |

> **The three highlighted processes** (CAP Build-out & Completion, Benefits Booklet Preparation, Benefits Renewal) represent approximately **21–22 onshore FTEs** across the GAB team. Beyond this, the CAP Migration & Automation initiative also directly impacts G&A Beneficial's offshore team of **~10 FTEs** who support CAP build-out and renewal processes — bringing the total addressable capacity to **31–32 FTEs** across GAB.

---

## 06 · Systems & Technical

**Eyebrow:** Systems & Technical

**Benefits Technology Stack & Integration Landscape**

A complete inventory of systems in scope across G&A Beneficial and Benefits Administration, including current integration gaps and the target state for each initiative. Partners should design solutions within and against this stack — proposals that ignore documented system constraints will not score well.

### Core Systems

**PrismHR** — *Primary HRIS / Benefits Administration Platform*
System of record for all plan configurations, employee enrollments, payroll deductions, and benefits data. Every downstream Ben Admin process originates from or validates against Prism. Initiatives A, C, E, and F all require Prism data access as source of truth.
Tags: `Core Platform` `Source of Record`

**ClientSpacePRO** — *Case Management & Workflow Platform*
Primary case management system for client and WSE issue resolution, carrier interaction tracking, and process workflow. The CAP Migration (Initiative A) integrates with ClientSpace for case tracking, approval routing, and audit trail documentation.
Tags: `Core Platform` `Case Management`

**NextGen / WorkSight** — *Employee Benefits Enrollment Portal*
Benefits enrollment portal used by WSEs during open enrollment. Coordinator/Analyst team builds and tests the portal based on the CAP. Portal accuracy is directly downstream of CAP quality — CAP errors surface during portal build and block enrollment launch.
Tags: `Core Platform` `Enrollment Portal`

**Hero / Gradient** — *Underwriting Risk Scoring*
External risk scoring platforms used during Benefits Underwriting & Quoting. The CAP Migration (Initiative A) indirectly benefits this workflow by providing clean, structured plan data as input to the quoting process.
Tags: `Underwriting` `External Platform`

**WEX** — *COBRA & FSA/HSA Administration*
Third-party administrator for COBRA continuation, FSA, and HSA plan administration. COBRA qualifying events must be manually entered one at a time — a documented pain point. FSA/HSA parameters are part of the CAP and configured in both Prism and WEX during new client setup.
Tags: `COBRA / FSA / HSA` `Manual Entry Required`

**Beacon Platform** — *Benefits Reconciliation Tool (Partial Deployment)*
Designed to automate monthly payroll-to-carrier invoice reconciliation at the employee level. Currently partially deployed and unreliable — when functional it significantly reduces recon time; when failing the team falls back to Excel.
Tags: `Partial Deployment` `Target: Full Production`

### Platform Expansion Targets (Initiatives A, D & E)

**CAP Cloud Tool (Net-New)** — *Initiative A — CAP System of Record*
No current system exists. Net-new solution required — either purpose-built cloud application or configurable platform integrated with Prism. Must support: auto-population from Prism plan configurations, real-time validation, structured data output for downstream flows (Prism setup, WorkSight), and version control for renewal cycles. Build-vs-buy is a key evaluation criterion.
Tags: `Gap — No Solution Exists` `Net-New Required`

**Ciklum Platform** *(Outside PRD Scope)* — *Initiative D — Service Automation Expansion*
Existing vendor relationship. Expansion scope: (1) automated case creation from intake channels, (2) self-service deflection for ID card requests and coverage verification, (3) AI after-call summarization for ClientSpace documentation. Partners should demonstrate specific integration depth with both Ciklum and ClientSpacePRO.
Tags: `Existing Vendor` `Outside PRD Scope`

**Sidekick Platform** *(Outside PRD Scope)* — *Initiative E — Payroll Deduction Audit Automation*
Existing vendor relationship. Expansion scope: automated comparison and variance flagging against Prism deduction register, CAP rates, and previous pay period data. Requires Prism read integration and CAP data integration. Partners must demonstrate Prism read capability and exception-routing to ClientSpace.
Tags: `Existing Vendor` `Outside PRD Scope`

### Critical Integration Gaps

| Gap | Initiative | Current Workaround | Target State |
|-----|:----:|--------------------|--------------|
| **CAP Document — No System Integration** | ⚐ A | Excel document manually built and shared; downstream systems re-read CAP manually without validation | Cloud-hosted CAP tool with Prism write-back; structured data flows downstream without manual re-entry |
| **Document Ingestion — No Extraction Layer** | ⚐ B | Underwriter manually reads PDFs, SBCs, and invoices to extract plan data (20–30 min per case) | AI extraction pre-populates comparison fields; specialist reviews and confirms |
| **Carrier Portals — No API for Open-Market** | ⚐ C | Specialist manually logs into each carrier portal and enters data field-by-field from Prism (13–17 min per enrollment) | API or RPA reads Prism enrollment data and executes portal entry automatically; specialist audits output |
| **Self-Service Channel — No Deflection Routing** *(Outside PRD Scope)* | ⚐ D | All WSE and client inquiries route to Benefits Specialists regardless of complexity | Ciklum self-service routes low-complexity inquiries to carrier apps; complex cases route to Specialists |
| **Prism Deduction Reports — No Consolidated View** *(Outside PRD Scope)* | ⚐ E | 4+ separate Prism reports pulled and combined manually in Excel with VLOOKUP formulas each review cycle | Sidekick pulls and consolidates data automatically; variances pre-flagged before Specialist review |
| **Beacon Reconciliation — Partial Deployment** *(Outside PRD Scope)* | ⚐ F | Beacon used when functional; Excel-based manual reconciliation as fallback when Beacon fails | Full UAT completion and production stabilization; Excel fallback eliminated |

---

## 07 · Glossary

**Eyebrow:** Glossary

**Terms, Acronyms & Definitions**

Benefits-specific terminology, G&A operational acronyms, role definitions, and system names used throughout this document. Partners unfamiliar with the PEO benefits context should read this before the Initiative Deep Dive.

### Organizational & Role Terms

- **G&A Beneficial (GAB)** — G&A's pre-implementation benefits team. Owns the client relationship from prospect engagement through quoting, plan selection, CAP build, enrollment, and the annual renewal cycle. 72 FTEs (62 onshore, 10 offshore).
- **Benefits Administration (Ben Admin)** — G&A's post-implementation benefits operations team. Owns system configuration, payroll deduction auditing, carrier enrollment, WSE/client issue resolution, reconciliation, and regulatory compliance for ~130,000 WSEs. 98 FTEs (68 onshore, 30 offshore).
- **Account Manager (AM)** — Primary client-facing role in GAB. 27 existing + 10 new AMs. Currently spends 35–45% of time on CAP and renewal data entry. Largest beneficiary of Initiative A.
- **Account Executive (AE)** — Senior client-facing role in GAB. 4 existing + 4 new AEs. Involved in CAP build, renewal, and strategic client engagement.
- **Benefits Coordinator** — GAB role supporting underwriting and onboarding workflow — CAP batch review, booklet preparation, and portal build coordination. 5 ICs.
- **Benefits Underwriter** — Specialist role in GAB owning risk scoring via Hero/Gradient, comparison building, and proposal release. 1 IC, supported by unlisted underwriting team of ~5.
- **Benefits Specialist** — Primary operational role in Ben Admin. 36 ICs + 8 managers = 44 FTEs. Owns payroll reviews, carrier enrollment, WSE and client issue resolution. The largest single role across both Benefits teams.
- **Benefits Analyst** — Technical configuration role in Ben Admin. 8 ICs + 1 manager = 9 FTEs. Owns new client system setup (48% of time), periodic audits, process improvement, and acquisition integration. Directly downstream of CAP accuracy.
- **Benefits Recon Specialist** — Role in Ben Admin dedicated to monthly billing reconciliation. 4 ICs + 1 manager = 5 FTEs. Spends 97% of time on reconciliation — the most concentrated single-process role in the operation.
- **Benefits QC Admin** — Quality control and compliance role in Ben Admin. 3 ICs + 1 manager = 4 FTEs. Owns EDI implementation and maintenance, ACA filings, COBRA administration, and compliance documentation.

### Process & Document Terms

- **CAP (Client Approved Plans)** — The Client Approved Plans document — a manually built Excel spreadsheet defining plan designs, rates, employer contributions, deductibles, and FSA/HSA parameters for each client. Referenced in 8+ downstream processes. Accuracy is the single most critical upstream quality control point in the benefits function.
- **CAP Batch** — Collection of CAP documents submitted at the GAB → Ben Admin handoff point. CAP batch is the primary input for Ben Admin system setup and the trigger for new client configuration in Prism.
- **SBC (Summary of Benefits & Coverage)** — Standardized plan summary document required by ACA regulations. Used as a primary input to the underwriting comparison process and as a source document for carrier rate verification during CAP build-out.
- **Open-Market Plan** — A benefits plan arranged through a carrier or broker on the open market, as opposed to a master plan held directly by G&A. Open-market plans require manual carrier portal enrollment (no EDI available), which is a documented pain point in the current Ben Admin workflow.
- **Master Plan** — A benefits plan held directly by G&A, available to all PEO clients. Master plans use EDI for enrollment. EDI is maintained by the Benefits QC Admin team.
- **EDI (Electronic Data Interchange)** — Automated electronic enrollment file transmission between G&A systems and carrier systems for master plan clients. EDI is available only for master plans — open-market plans still require manual portal entry, a documented operational pain point for the Benefits Specialist team.
- **AOR (Agent of Record)** — Designated broker on a client's open-market insurance plan. AOR setup requires carrier confirmation and takes 30–45 days for new-business plans — a documented bottleneck in Client Onboarding.
- **Benefits Reconciliation** — Monthly process comparing G&A's payroll deduction data (Prism) against carrier invoices at the employee level to identify over/under-payments. Performed by the Recon Specialist team using Beacon (partial) and Excel fallback.
- **Payroll Deduction Review** — Monthly audit conducted by Benefits Specialists comparing Prism deduction registers against CAP rates, tier-by-tier. Largest single time allocation for the Benefits Specialist role (23%).

### Regulatory & Compliance Terms

- **ACA (Affordable Care Act)** — Federal healthcare law requiring employers to offer qualifying coverage and file annual reports. G&A files ACA reports for ~800 clients annually during a Jan–Mar filing season — a labor-intensive seasonal spike for Benefits Analyst and Benefits QC Admin.
- **COBRA** — Federal law requiring continued health coverage to employees who lose coverage due to qualifying events. COBRA qualifying event entry in WEX is currently manual, one event at a time — a documented pain point.
- **HSA / FSA / HRA** — Tax-advantaged benefit accounts. HSA employer match amounts are currently entered manually per employee in Prism with no automated validation — creating recurring audit cycles. FSA/HSA parameters are part of the CAP.
- **SOX Control** — Sarbanes-Oxley internal control point requiring dual-person review or documented audit trail. Several Benefits processes carry SOX controls, particularly around carrier enrollment accuracy (coverage gap risk) and payroll deduction accuracy.

---

## 08 · Submission Guide

**Eyebrow:** Submission Guide

**What We Need from Partners**

G&A Partners and AlixPartners are looking for specificity, not generality. Generic AI/automation platform pitches without demonstrated integration depth against Prism, ClientSpacePRO, and carrier-specific systems will not score well. The sections below define what we need, with demo requirements for Initiative A.

### Required Submission Components

**1. Proposed Approach & Workplan**
What is your recommended approach and workplan for Initiative A (CAP Migration)? Our preliminary view targets Q1–Q3 for the foundational build. Do you agree with this timeline? What does the first 30–60–90 days look like specifically, including discovery, design, and any phased rollout across GAB and Ben Admin?

**2. Architecture & Technical Design**
Build vs. buy — purpose-built cloud app or configurable platform? How does the solution ingest data from G&A's client repository, benefits plan configurations, and underwriting results? How does it write back to Prism/WorkSight for system setup? How does it validate new-business CAP data against Prism source configurations in real time? How do structured CAP fields flow downstream to Prism, ClientSpace, and the benefits booklet workflow without re-entry? How does the e-signature and contract management layer integrate with the existing DocuSign or similar workflow? Include a system architecture diagram.

**3. Effort, Timeline & Cost**
Build cost by initiative, ongoing infrastructure/licensing cost, and proposed pricing model. Separate build cost from run cost clearly. Include G&A-side resource requirements (who needs to be involved and how much of their time). For Initiative A, include change management scope — this touches both GAB and Ben Admin workflows and requires adoption across 45+ Account Managers and 8+ Benefits Analysts.

**4. Data, Compliance & PII Handling**
Benefits data includes PHI (health coverage records), PII (SSNs, dependent information), and wage records. The CAP document contains plan-level financial parameters, employer contribution structures, and client-specific rate data. Explain what data governance controls apply, how CAP data is stored and access-controlled within the solution, how data flows securely between the CAP tool and Prism/WorkSight and ClientSpace, and how the solution handles data retention and deletion policies.

**5. Working Demo / Proof of Concept**
**CAP Migration Demo:** Using a sample prior-year Prism configuration, demonstrate the following:

1. Renewal CAP auto-populated from existing Prism plan data — AM reviews and approves changes without manual re-entry;
2. New-business CAP validation path where a rate discrepancy or missing field triggers a specific, actionable error before submission to Ben Admin;
3. Benefits booklet auto-generated from the approved CAP data;
4. E-signature workflow routing the approved CAP to the client for sign-off;
5. Approved CAP data structured and available for downstream Prism/WorkSight system setup without re-entry.

Show how the solution handles data flow to ClientSpace for case tracking and audit trail.

*Video recording of a live demo is accepted if a live session is not possible before the deadline.*

**6. Relevant Experience**
2–3 specific examples of AI or automation solutions built for benefits administration, HCM, or PEO environments. For each: problem, solution, systems integrated, and measurable outcome (cycle time reduction, error rate improvement, FTE savings preferred). Include the team that would work on this engagement and their relevant experience with PrismHR, ClientSpacePRO, carrier portal integrations, and benefits compliance (PHI/PII data handling). Experience with e-signature platforms, contract management workflows, and document generation in benefits or HCM environments is specifically valued.

### Evaluation Criteria

| Criterion | Weight | What We Are Looking For |
|-----------|:------:|-------------------------|
| **Working POC / Demo Quality** | 30% | Does the CAP auto-population demo show real Prism read/write integration, or just a UI mockup? Does the benefits booklet auto-generation demonstrate a live output from CAP data? Does the e-signature workflow show an actual routing and sign-off path? |
| **Architecture Credibility** | 25% | Is the CAP cloud tool design realistic given the need to integrate with Prism/WorkSight as source of record, generate the benefits booklet, manage e-signatures, and flow structured data downstream to ClientSpace? Is the build-vs-buy recommendation well-reasoned given G&A's existing stack? |
| **Relevant Experience** | 20% | Have you built benefits administration, HCM, or PEO automation at comparable scale? PrismHR integration experience is specifically valued. Experience with benefits plan document generation, e-signature workflows, and PrismHR integrations is specifically valued. |
| **Cost Realism & Change Management** | 15% | Is build cost credible given integration scope (Prism/WorkSight, ClientSpacePRO, e-signature platform)? Is change management for Initiative A scoped as a first-class deliverable, covering both GAB and Ben Admin adoption? |
| **Speed to Value** | 10% | What is the realistic timeline to deliver a working CAP auto-population capability by Q3? Can the benefits booklet auto-generation and e-signature workflow be delivered in parallel or must they sequence after the core CAP build? |

> **Submit to:** tsagireddy@alixpartners.com &nbsp;|&nbsp; **Deadline:** June 25, 2026

---

*G&A Partners · AI Benefits Operations PRD · Confidential · Preliminary — Subject to Change*
