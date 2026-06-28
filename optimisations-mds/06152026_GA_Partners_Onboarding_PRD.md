# G&A Partners | AI Onboarding PRD

> **Confidential · Partners Only**
> **Partner Evaluation Package · June 2026**
> *Preliminary — Subject to Change*

# AI-Enabled Onboarding — Product Requirements Document

G&A Partners is evaluating strategic AI development and implementation partners to design and build an AI-enabled operations workflow for its Client Onboarding division. This document provides everything a partner needs to understand the opportunity, current state, and what a winning response looks like.

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

**AI-Enabled Onboarding — Product Requirements Document**

G&A Partners is evaluating strategic AI development and implementation partners to design and build an AI-enabled operations workflow for its Client Onboarding division. This document provides everything a partner needs to understand the opportunity, current state, and what a winning response looks like. Navigate using the tabs above.

### What's Inside

| # | Section | Description |
|---|---------|-------------|
| 01 | **Overview** | Key contents, scope, timeline for the partner evaluation, and the point of contact for all questions and submissions. |
| 02 | **Business Context** | What the Onboarding division does, its team structure, role split between Project Managers and Payroll Analysts, P&L position, and the margin improvement mandate. |
| 03 | **Process Map** | Onboarding lifecycle across swim lanes showing PM and PA activities by phase with key systems and documented pain points. |
| 04 | **Initiative Deep Dive** | Initiative-level breakdowns covering current state, pain points, and what an AI and automation solution must deliver across identified initiatives. |
| 05 | **Business Impact** | Onboarding activity baseline showing PM and PA time allocation across all process areas with automation goals, alongside onboarding cycle compression context by phase. |
| 06 | **Systems & Technical** | Full inventory of the 10+ systems in scope, integration gaps, and the GuideCX-to-WorkSight migration context. For the partner's technical team. |
| 07 | **Glossary** | Definitions of Onboarding terminology, G&A-specific acronyms, role titles (PM, PA, BA), system names, and onboarding phase labels used throughout this document. |
| 08 | **Submission Guide** | What we need from partners, how we will evaluate responses, and what a winning submission looks like. |

### Scope & Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| **PRD Shared** | June 15, 2026 | This document distributed to select partners |
| **Partner Response Deadline** | June 25, 2026 | Approach, architecture, cost, demo/POC, and relevant experience required |
| **Partner Presentations** | TBD | Live Q&A and demo walk-through with G&A Onboarding leadership |

### Point of Contact

**Engagement Lead**

All questions and submissions should be directed to:

**Tilak Sagireddy**
tsagireddy@alixpartners.com

---

## 02 · Business Context

**Eyebrow:** Business Context

**G&A Partners Onboarding — Business Overview**

A concise summary of the Onboarding division's business model, team structure, role split, performance context, and the two strategic mandates that define what success looks like. Read this before reviewing the process and technical sections.

### What the Onboarding Division Does

#### The Business

G&A Partners' Onboarding division manages the end-to-end process of transitioning a newly signed client from CSA execution through the first 90 to 150 days. The team is the operational bridge between Sales and ongoing payroll operations — every client that enters G&A's book of business must pass through Onboarding before generating recurring revenue. At 704 clients onboarded in 2025, the team runs a high-volume, time-critical production operation where cycle time directly correlates to revenue recognition speed.

#### Operational Phases

- **Deal Initiation & Assignment** — Contract validation to confirm scope, services, and billing details before onboarding work begins.
- **Sales Handoff** — Structured knowledge transfer from Sales to the onboarding team to ensure full alignment on what was sold and committed.
- **Client Kickoff & Data Collection** — Establishing the client relationship and gathering all required documentation, employee data, and payroll inputs needed to begin configuration.
- **System Configuration** — Building the client's full payroll and HR infrastructure across PrismHR and WorkSight based on the collected data and agreed service terms.
- **Payroll Testing & Training** — Mock payroll, error resolution, Benefits/401k review, client admin training.
- **First Payroll & Transition** — First payroll processing, dual PM/PA readiness check, PS assignment, knowledge transfer.

### Onboarding Business at a Glance

| Metric | Value |
|--------|-------|
| Clients Onboarded (2025) | **704** |
| Total Onboarding FTEs | **35** |
| Total Onboarding FLC | **$4.5M** |
| Avg. Onboarding Cycle Time | **~40–60 days** |

### Current Team Structure

**ONBOARDING TEAM — 35 FTEs**

| Group | FTEs | Total FLC |
|-------|------|-----------|
| **Onboarding Project Managers** | 15 | $2.0M |
| **Onboarding Payroll Analysts** | 16 | $1.7M |
| **Leadership & Management** | 4 | $0.8M |

#### Onboarding Project Managers (OBPM)

Own the client-facing onboarding relationship from sales handoff through transition. Responsible for coordinating the client kickoff, managing data collection, building the client's environment in PrismHR and WorkSight, training the client on the portal, and ensuring a clean handoff to the ongoing Payroll Specialist.

#### Onboarding Payroll Analysts (OBPA)

Own all payroll-specific setup and testing for new clients. Responsible for translating client requirements into a fully configured payroll environment in PrismHR, validating the setup through mock payroll, coordinating compliance reviews, training the client admin on payroll submission, and processing the first live payrolls before transitioning the account.

### What We Are Looking For

#### 1 · Gross Margin Capture — Onboarding Cycle Compression

**A · Onboarding Cycle Compression (Time-to-First-Payroll Acceleration)**

G&A currently takes 40–60 days to onboard a new client vs. an industry standard of ~3 weeks. Compressing the cycle by 10–14 calendar days means new clients begin generating billable payroll cycles earlier, directly accelerating gross margin recognition. Target: reduce time-to-first-payroll from the CSA sign date. Most time compression is achievable without fundamental process redesign through a combination of process changes and automation investments.

**Where the 10–14 Days Come From**

1. Enforcing a 24-hour SLA for PM/PA assignment and a 48-hour SLA for other specialist assignments eliminates downstream delays `Process Improvement`
2. AI-assisted CSA review and checklist-style validation from sales replaces four independent manual reviews, triggering automated document requests immediately after deal close `AI`
3. Combining client kickoff and payroll breakout into one meeting eliminates the 5-business-day scheduling gap that currently sits between two sessions that can run back-to-back `Process Improvement`
4. Enforcing hard data collection deadlines with automated daily reminders and escalation triggers can compress client data collection delays `Automation`
5. Parallelizing PM and PA system configuration — combined with pre-approving standard SUTA rates during sales — removes the serial setup dependency and the executive approval queue from the critical path `Process Improvement`

#### 2 · Cost Efficiency — FTE Capacity & Operational Improvement

**B · Automated Project Management Workflows**

Workflow automation that auto-syncs case status across ClientSpace, PrismHR, and the Master Client List on phase events, auto-generates OB PM Tool task progress notes, and triggers multi-departmental follow-up sequences — eliminating the manual coordination overhead that dominates both PM and PA time. `Automation`

**C · AI-Powered Client Communication & Status Compilation**

An AI layer that auto-drafts responses to common client inquiries, auto-routes non-payroll questions to the correct department, and compiles weekly implementation status directly from live system data for PM/PA review and send. `AI`

**D · AI-Assisted CSA Extraction & Cross-Validation** &nbsp; `[PRD Priority]`

Document AI that extracts structured fields from CSA PDFs on upload — fee structure, services, SUTA coverage, billing exceptions — and auto-flags discrepancies against ClientSpace handoff data, replacing four independent manual reviews with a single validation step and triggering automated document requests immediately after deal close. `AI`

**E · ClientSpace-WorkSight Integration & GuideCX Migration**

A WorkSight-ClientSpace integrated data collection workflow with webhook-based document routing and automated escalating reminders on overdue tasks — eliminating the GuideCX manual cycle and enforcing the hard data deadlines that compress the primary onboarding bottleneck. `Integration`

**F · Mock Payroll Pre-Flight Validation** &nbsp; `[PRD Priority]`

A pre-flight validation engine that checks PrismHR configuration completeness before initialization — WC codes, SUTA rates, billing rules, pay group alignment — and outputs a pass/fail report with specific remediation steps, replacing the iterative calculate-fail-fix cycle before the first mock payroll run. `Automation`

---

## 03 · Process Map

**Eyebrow:** Process Map · Current State Swimlane

**Onboarding Customer Journey Map**

Two roles across six lifecycle phases. Column colors indicate the onboarding phase; row labels identify the role responsible. Estimated phase durations reflect CSA signing to first payroll processed.

### Swimlane — PM & PA Activities by Phase

| Role | Deal Initiation | Sales Handoff | Kickoff & Data Collection | System Configuration | Testing & Training | First Payroll |
|------|-----------------|---------------|----------------------------|----------------------|--------------------|---------------|
| **Project Manager (OBPM)** | CSA Review & Cross-Validation; PM Assignment (48-hr SLA) | Schedule & Conduct Sales Handoff; Update ClientSpace Handoff Page; ⚠ BA calendar availability stretches this to 4–7 days | Client Kickoff Meeting; Set Up GuideCX Project; Data Collection & Follow-ups; ⚠ No enforced SLA — primary bottleneck; 10–20 days of wait | Build PrismHR Shell; WorkSight Account & Locations Setup; Employee Import (WorkSight Bulk); ⚠ PA cannot start billing config until PM shell complete | WorkSight Client Training (45–60 min) | Ongoing Project Management; Dual PM/PA Readiness Gate; Transition Sheet & PS Assignment |
| **Payroll Analyst (OBPA)** | CSA Review (PA Manager); PA Assignment (48-hr SLA); CSA Discrepancy Review | Attend Sales Handoff (optional) | Payroll Breakout Meeting; Request Additional Payroll Data; ⚠ Payroll breakout scheduled 5 days after kickoff — pure scheduling gap | PrismHR Billing Rules & SUTA Config; Deduction Codes & Pay Groups; ⚠ SUTA executive review can add 3–5 days to critical path | Mock Payroll (iterative error fix); Benefits / 401k Review; Client Admin Payroll Training; ⚠ WC/SUTA setup errors are a "pretty consistent" recurring delay | First Payroll Processing; Client Approval Cycle; Knowledge Transfer & Handoff |

### Key Systems by Phase

| Phase | Systems |
|-------|---------|
| Deal Initiation | ClientSpace · Excel (Master List) |
| Sales Handoff | ClientSpace · Outlook · Teams |
| Kickoff & Data Collection | GuideCX · ClientSpace · Google Drive |
| System Configuration | PrismHR · WorkSight · Click Boarding · Informer |
| Testing & Training | PrismHR · HRWorkCycles · WorkSight |
| First Payroll | PrismHR · ClientSpace · Excel |

### System Legend

- **Core Systems** (ClientSpace, PrismHR)
- **Communication** (Outlook · Teams · Gmail)
- **Productivity** (Excel · Google Drive · SharePoint)
- **Client & HR Platforms** (WorkSight · HRWorkCycles · GuideCX)

---

## 04 · Initiative Deep Dive

**Eyebrow:** Initiative Deep Dive

**Initiative Deep Dive**

Initiatives across two strategic buckets: gross margin capture (onboarding cycle compression to accelerate revenue recognition) and cost efficiency (AI and automation initiatives targeting FTE capacity improvement for both Project Managers and Payroll Analysts). Each initiative maps to documented pain points and a clear target state.

### 1 · Gross Margin Capture — Onboarding Cycle Compression

**A · Onboarding Cycle Compression: Time-to-First-Payroll Acceleration**

#### Initiative 1 — Automated Data Collection Deadlines & Escalation

**Tags:** `Automation`

**Current State**

- The PM creates a GuideCX data collection project after kickoff, then waits for the client to upload required documents — employee census, company codes, payroll reports, reverse wire authorization, handbook, and WTPA forms
- No downstream work can begin until the employee census and company codes arrive — PM cannot create PrismHR locations and positions, PA cannot configure billing rules or run mock payroll
- The PM monitors overdue tasks and sends manual follow-up emails with no enforced deadline or escalation SLA beyond "timely manner" in the SOP

**Current Challenges**

- Client data collection is the primary bottleneck and the single most variable phase in the onboarding cycle — the absence of any automated enforcement means overdue items can sit unactioned for days
- The PM distributes overdue item follow-ups manually to internal teams, creating parallel chasing overhead across Benefits, HR, and Payroll departments
- BAs frequently enter placeholder data in required ClientSpace fields at deal close, creating discrepancies that surface during onboarding and require correction before configuration can begin

**Automation Target**

- Implement automated escalating follow-up sequences in GuideCX/WorkSight: alternate-day automated reminder, day-5 manager escalation, day-10 escalation to BA and department head, etc.

#### Initiative 2 — AI-Assisted CSA Extraction & Automated Document Triggers

**Tags:** `AI` `[PRD Priority]`

→ Full initiative breakdown provided in the Cost Efficiency section under Initiative D.

#### Initiative 3 — Mock Payroll Pre-Flight Validation

**Tags:** `Automation` `[PRD Priority]`

→ Full initiative breakdown provided in the Cost Efficiency section under Initiative F.

### 2 · Cost Efficiency — FTE Capacity & Operational Improvement

**Optimize Capacity for Project Managers and Payroll Analysts**

#### Initiative B — Automated Project Management Workflows

**Tags:** `PM + PA` `Automation`

**Current State**

- PMs manually update ClientSpace cases, PrismHR records, and the Master Client List as each onboarding phase progresses — triple-entering the same status information across three systems
- OB PM Tool task updates and progress notes are manually written by PMs after each phase milestone; Teams group chat membership is manually updated per client
- Multi-departmental follow-up tracking (Benefits, 401k, Tax, Risk) is done via email chains with no automated escalation or central visibility

**Current Challenges**

- Project management is the #1 time consumer for PMs (37%) and #2 for PAs (19%) — dominated by status tracking and record-keeping that does not require human judgment
- Context-switching overhead across ClientSpace, PrismHR, Excel, and Teams for ~16 concurrent clients compounds into significant daily waste
- Missed status updates create downstream confusion for Payroll Specialists during handoff, requiring rework

**AI / Automation Target**

- Auto-create and update ClientSpace cases from PrismHR and WorkSight system events; auto-sync status to the Master Client List without manual re-entry
- Auto-generate OB PM Tool task progress notes from system data; auto-update Teams group chat membership on phase transitions
- Automated departmental follow-up sequences with escalation triggers; PM/PA reviews exceptions rather than initiating every touchpoint

#### Initiative C — AI-Powered Client Communication & Status Compilation

**Tags:** `PM + PA` `AI`

**Current State**

- Both PM and PA serve as single points of contact for all client questions during onboarding — triaging payroll vs. non-payroll inquiries, researching answers across multiple systems, and composing responses individually
- Weekly status updates are manually compiled by gathering implementation progress from each internal department and formatting into a client-facing summary

**Current Challenges**

- Client Communication consumes 15% of PM time and 10% of PA time — a significant burden for what is largely routine inquiry handling and status reporting
- Non-payroll inquiries (benefits, HR advisory, risk) are routed manually, creating delays and PM/PA distraction on topics outside their expertise
- Status compilation requires PMs to contact 6–8 internal departments before every weekly update

**AI / Automation Target**

- AI assistant auto-compiles weekly client status from GuideCX task completion and ClientSpace cases — PM/PA reviews and sends rather than assembles from scratch
- AI-drafted response templates for common inquiries (document status, payroll training schedule, timeline questions) with PM/PA review-and-approve workflow
- Auto-routing of non-payroll questions to the correct department based on keyword classification, eliminating manual triage

#### Initiative D — AI-Assisted CSA Extraction & Cross-Validation

**Tags:** `PM + PA` `AI` `[PRD Priority]`

**Current State**

- The CSA PDF is independently reviewed four times: by the PM Manager (CSA Review), the PM (Sales Handoff), the PA Manager (CSA Review), and the PA — each manually sifting through the multi-page legal document for fee structure, term, included vs. optional services, billing exceptions, SUTA coverage, and tax classification
- Each reviewer also cross-validates the CSA against the ClientSpace handoff page fields, repeating the same comparison logic four times with no shared structured output

**Current Challenges**

- Four independent reviews of the same PDF is the clearest documented redundancy in the onboarding process — the PM Manager alone spends 30–40 minutes per deal on this task
- BAs enter placeholder data in required fields, creating discrepancies that surface during onboarding meetings rather than pre-empted at deal close
- No Salesforce-to-ClientSpace integration means BAs manually re-enter data from Salesforce, increasing error risk

**AI / Automation Target**

- Document AI model extracts structured fields from the CSA PDF on upload — fee structure, term, included/optional services, pricing, tax classification, ownership, cyber policy — and populates a structured ClientSpace summary record
- Auto-flags discrepancies between extracted CSA fields and handoff page data; all four reviewers validate pre-populated structured data rather than independently sifting the PDF

#### Initiative E — ClientSpace-WorkSight Integration & GuideCX Migration

**Tags:** `PM` `Integration`

**Current State**

- The PM manually creates a GuideCX project within 2 business days of kickoff — naming it, selecting the template, adding team members, attaching kickoff documents, configuring task applicability, and updating due dates
- Client-uploaded documents are manually downloaded from GuideCX by the PM, saved to G: Drive, and attached to ClientSpace with documentation notes — a download-upload-note cycle repeated for every document submission
- Overdue task follow-ups are sent manually by email; no automated escalation logic exists beyond "timely manner" language in the SOP

**Current Challenges**

- GuideCX exists as a separate system that PMs must manage in parallel with ClientSpace — creating redundant data entry and context-switching overhead throughout the engagement
- Client data collection is the primary bottleneck (10–20 days), and the absence of automated escalation means overdue items can sit unactioned for days
- Security access setup for client admins in WorkSight requires a manual case — 3-day turnaround — blocking training scheduling

**AI / Automation Target**

- Migrate GuideCX to WorkSight and integrate with ClientSpace — auto-create data collection projects from ClientSpace kickoff-completion triggers using client metadata (service type, state, tier)
- Webhook-based auto-distribution of client-uploaded documents from WorkSight to G: Drive and ClientSpace, eliminating the manual download-upload-note cycle
- Automated escalating follow-up sequences for overdue tasks: day-5 reminder → day-10 BA/executive sponsor escalation → day-15 client CEO/decision-maker escalation

#### Initiative F — Mock Payroll Pre-Flight Validation

**Tags:** `PA` `Automation` `[PRD Priority]`

**Current State**

- The PA runs mock payroll in PrismHR, encounters system calculation errors (WC codes, SUTA rates, setup mismatches, pay group/schedule misalignment), manually resolves each error, re-initializes payroll, and iterates until the run is clean
- The SOP explicitly calls out this step in uppercase as a recurring delay: "DELAYS OCCUR HERE DUE TO W/C, SUTA ERRORS & OTHER SYSTEM GENERATED ERRORS DUE TO SETUP"
- Similar errors resurface during the first live payroll if setup corrections in mock were incomplete, creating a second error-resolution cycle

**Current Challenges**

- Payroll Consultation & Planning (11%) and Payroll Processing (14%) together represent 25% of PA time — the largest combined block — and both are heavily impacted by this iterative error-resolution cycle
- SUTA Bill Rate Review requires specific executive approval, with policy requiring setup to be complete at least 1 week before first payroll. Any delay in the executive review queue cascades directly into payroll processing delays
- The calculate-fail-fix-recalculate loop is unpredictable in duration, making it impossible to commit to a first-payroll date early in the onboarding cycle

**AI / Automation Target**

- Pre-flight validation report that runs before payroll initialization: (a) all employees have valid WC codes matching CSA Schedule 2; (b) SUTA rates entered for every state with active employees; (c) all billing rules complete; (d) pay group-schedule alignment correct; (e) deduction codes reference valid accounts
- Output: pass/fail report with specific remediation steps, eliminating the blind trial-and-error cycle and surfacing errors before they surface as calculation failures
- Pre-approve standard SUTA rates during the sales process for known states — only escalate non-standard rates to executive review, removing the approval queue from the critical path for the majority of deals

---

## 05 · Business Impact

**Eyebrow:** Business Impact

**Operational Baseline & Automation Impact**

Activity baseline and automation opportunity mapping derived from process interviews and time allocation data.

### Onboarding Cycle Compression — Gross Margin Capture

| Phase | Current Duration | Initiative Driver |
|-------|------------------|-------------------|
| **A. Deal Initiation & Assignment** | 2–3 days | 24-hr SLA enforcement for PM/PA assignment and 48-hr SLA for other specialist assignments |
| **B. Sales Handoff** `[PRD Priority]` | 4–6 days | Initiative D — AI-Assisted CSA Extraction & Automated Document Triggers |
| **C. Client Kickoff** | 4–6 days | |
| **D. Data Collection** ⚠ Primary Bottleneck | 15–20 days | Initiative A · 1 — Automated Data Collection Deadlines & Escalation |
| **E. System Configuration** | 8–12 days | Parallelize PM/PA system configuration + pre-approve standard SUTA rates during sales |
| **F. Payroll Testing & Training** `[PRD Priority]` | 5–7 days | Initiative F — Mock Payroll Pre-Flight Validation |
| **G. First Payroll Processing** | 3–5 days | |
| **Total** | 41–59 days | |

### Onboarding Activity Baseline

Column FTE counts: PM Time Allocation (15 FTEs), PA Time Allocation (16 FTEs).

| Process Area | PM Time Allocation (15 FTEs) | PA Time Allocation (16 FTEs) | Total FTE Equivalent | Initiative |
|--------------|:----:|:----:|:----:|:----:|
| **CSA Review** | 2% · 0.3 FTEs | 1% · 0.2 FTEs | 0.5 FTEs | Initiative D |
| **Sales Handoff** | 5% · 0.8 FTEs | 2% · 0.3 FTEs | 1.1 FTEs | Initiative D |
| **Client Kickoff** | 15% · 2.3 FTEs | 13% · 2.1 FTEs | 4.3 FTEs | — |
| **Client Data Collection** | 5% · 0.8 FTEs | 1% · 0.2 FTEs | 0.9 FTEs | Initiative A · 1 |
| **Project Management** | 37% · 5.6 FTEs | 19% · 3.0 FTEs | 8.6 FTEs | Initiative B · Initiative E |
| **Client Communication & Customer Service** | 15% · 2.3 FTEs | 10% · 1.6 FTEs | 3.9 FTEs | Initiative C |
| **System Configuration** | 5% · 0.8 FTEs | 5% · 0.8 FTEs | 1.6 FTEs | — |
| **Payroll Consultation & Planning** | — | 11% · 1.8 FTEs | 1.8 FTEs | Initiative F |
| **Payroll Processing (Initial)** | — | 14% · 2.2 FTEs | 2.2 FTEs | Initiative F |
| **Client Training** | 7% · 1.1 FTEs | 9% · 1.4 FTEs | 2.5 FTEs | — |
| **Client Transition** | 9% · 1.4 FTEs | 15% · 2.4 FTEs | 3.8 FTEs | — |
| **Total** | **100%** · 15.0 FTEs | **100%** · 16.0 FTEs | **31.0 FTEs** | |

#### Automation Goals by Process Area

**CSA Review** &nbsp; `[PRD Priority]` — Eliminate multiple contract review cycles and ensure validated, accurate client data is available to the reviewers from the moment a deal closes, reducing the time PMs, PAs, and managers spend manually cross-referencing the document. Extract structured fields from CSA PDFs upon upload to create a checklist-style validation document and auto-create a case for Sales flagging discrepancies / missing information; trigger automated standard document collection sequences at deal close.

**Client Data Collection** — Compress the longest uncontrolled wait period in the onboarding cycle by reducing client document submission lag — directly accelerating time-to-first-payroll. Automated escalation system with internal and external SLAs for data collection, deadlines, reminders, and alerts.

**Project Management** — Reduce the administrative coordination overhead that consumes the single largest share of both PM and PA time — freeing capacity to carry a larger concurrent client book without proportional headcount growth. Auto-sync case status across ClientSpace, PrismHR, and Master Client List on phase events; auto-route documents from GuideCX / WorkSight to G: Drive and ClientSpace, eliminating the manual download-upload cycle; trigger departmental follow-up sequences without manual intervention.

**Client Communication & Customer Service** — Reduce the time PMs and PAs spend triaging, researching, and responding to routine client inquiries — allowing them to focus on high-value onboarding activities while improving client response times. AI-draft responses to common client inquiries and auto-route non-payroll questions to the correct department; auto-compile weekly implementation status from live system data for PM/PA review and send.

**Payroll Consultation & Planning** &nbsp; `[PRD Priority]` — Eliminate recurring payroll configuration errors that create rework cycles and delay first payroll processing — reducing variability in the time-to-first-payroll timeline and freeing PA capacity from iterative error resolution. Run automated pre-flight configuration checks against PrismHR before payroll initialization — validating WC codes, SUTA rates, billing rules, and pay group alignment — replacing the iterative calculate-fail-fix cycle with a single remediation pass.

---

## 06 · Systems & Technical

**Eyebrow:** Systems & Technical

**Onboarding Systems Landscape**

The Onboarding team currently operates across 10+ systems — the most fragmented stack in G&A's operations. The reliance on Excel for assignment tracking and transition management, alongside manual cross-referencing of CSA PDFs and document routing between GuideCX, G: Drive, and ClientSpace, represents the most significant opportunities for system consolidation. Partners must address the integration architecture for this specific stack.

### Core Systems Inventory

**ClientSpace** — *Core CRM & Case Management*
Primary CRM for client record management, handoff pages, case tracking, and the OB PM Tool. The system of record for all onboarding activities. Most automation workflows should trigger from and write back to ClientSpace. Houses the structured handoff page fields that CSA validation must cross-reference.
Tags: `Core` `Automation Hub`

**PrismHR** — *Payroll System of Record*
The HRIS for payroll processing. PM creates the client shell (locations, positions, departments, divisions); PA configures billing rules, SUTA rates, deduction codes, pay groups, and runs mock and initial payrolls. The serial PM→PA dependency originates here. Pre-flight validation must run against PrismHR configuration data.
Tags: `Core` `Serial Dependency`

**WorkSight / Click Boarding** — *Employee Onboarding & Client Admin Portal*
Employee electronic onboarding (I-9, paperwork) and the client admin portal. PM creates the WorkSight account from PrismHR IDs and trains the client admin on submission. Security access setup currently requires a manual case with a 3-day turnaround — a documented automation candidate. Target destination for GuideCX migration (Initiative E).
Tags: `Core` `Migration Target`

**GuideCX** — *Client Data Collection Portal (Current)*
Client-facing project portal used to request and collect onboarding documents (employee census, company codes, payroll reports, handbook, WTPA forms). PM manually creates the project, configures tasks, and manages the document collection cycle. The manual download-upload-note cycle between GuideCX and G: Drive is a primary target for elimination. Migration to WorkSight-ClientSpace is scoped in Initiative E.
Tags: `Migration Candidate`

**HRWorkCycles** — *I-9 Verification Workflow*
I-9 verification workflow tool. HRWorkCycles I-9 errors are described as "a pretty consistent error causing decent delay fairly regularly." One-at-a-time onboarding invite resends are required for employees who haven't started — cited as a significant time drain for large clients. Bulk invite resend functionality would directly address this pain point.
Tags: `Known Errors` `Bulk Invite Needed`

**Informer** — *SUTA Bill Rate Reporting*
Reporting tool used for SUTA bill rate review and state-level compliance reporting. The SUTA Bill Rate Review requires executive approval before first payroll — Informer surfaces the data for this review. Pre-approving standard SUTA rates for known states is a key cycle compression lever under Initiative A, removing the executive approval queue from the critical path for standard multi-state clients.
Tags: `Reporting`

**Excel (Master Client List)** — *Assignment Tracking & Workload Balancing*
Used for PM and PA assignment tracking, workload balancing, and the Payroll Transition Spreadsheet. Both PM and PA assignment processes rely on manual judgment using Excel pivot tables with no BI dashboard or automated workload balancing. The process data explicitly notes a ClientSpace-based BI report would be "ideal." A primary candidate for elimination via ClientSpace integration.
Tags: `Manual Dependency` `Eliminate via CS Integration`

**Google Drive / G: Drive** — *Client Folder Structure & Document Storage*
Client-specific folder structure for storing all onboarding documents received from GuideCX. Documents are manually downloaded from GuideCX and saved here before being attached to ClientSpace. The GuideCX-to-G: Drive-to-ClientSpace pipeline is the primary document routing bottleneck targeted by Initiative E.
Tags: `Manual Routing`

**Outlook / Gmail / Teams** — *Communication & Coordination*
Outlook and Gmail for client communication and assignment notifications. Teams for internal group chats (per-client channels), knowledge transfer, and multi-departmental coordination. Teams group chat membership is manually updated by PMs per client. Multi-department follow-ups are conducted via email with no automated escalation.
Tags: `Manual Follow-up` `Auto-routing Target`

### Key Integration Gaps & Technical Risks

| Gap | Impact | Initiative Dependency |
|-----|--------|------------------------|
| **No Salesforce → ClientSpace integration** | BAs manually re-enter data from Salesforce into ClientSpace handoff pages, introducing error risk and placeholder data that creates downstream onboarding rework | Initiative D (CSA Extraction) — pre-populating handoff fields from CSA data is a partial mitigation until a direct Salesforce-ClientSpace feed is built |
| **GuideCX to ClientSpace/G: Drive: manual routing** | Every client document upload requires PM manual download → G: Drive save → ClientSpace attachment. At 704 clients/year with 8–12 documents each, this is 5,600–8,400 manual routing actions per year | Initiative E (ClientSpace-WorkSight Integration) — webhook-based auto-distribution eliminates this cycle entirely |
| **PrismHR shell → PA config: hard serial dependency** | PA cannot begin billing rules and SUTA configuration until the PM completes the PrismHR shell, creating 3–5 days of idle PA time on the critical path | Initiative B (Automated PM Workflows) + Cycle Compression (Initiative A) — splitting shell creation into billing-independent and billing-dependent fields enables parallel PA start |
| **WorkSight security access: 3-day manual case** | Client admin security access requires a manual case → team member pickup → 3-day processing. Blocks training scheduling. Explicitly flagged as "be nice to have automated" by users | Initiative E — role-based auto-provisioning upon Client Security Form submission eliminates the manual case workflow |
| **PrismHR pre-flight: no validation before initialization** | WC codes, SUTA rates, and billing rule errors are only discovered when mock payroll fails, triggering an iterative error-resolution cycle documented in the SOP as a recurring delay | Initiative F (Pre-Flight Validation) — configuration checks before initialization surface errors before they surface as calculation failures |
| **Excel workload balancing: no BI integration** | PM and PA assignment decisions rely on Excel pivot tables — no real-time visibility into concurrent client load by team member. Uneven geographic distribution of clients across time zones makes this particularly acute | Initiative B (Automated PM Workflows) — a ClientSpace-based BI report replaces Excel as the assignment decision surface |

---

## 07 · Glossary

**Eyebrow:** Glossary

**Onboarding Terms & Acronyms**

Definitions of G&A-specific terminology, role titles, system names, and onboarding phase labels used throughout this document. Understand these before responding.

### Role Definitions

- **OBPM / Project Manager** — Onboarding Project Manager. Owns the client-facing onboarding relationship from sales handoff through transition to the Payroll Specialist. Coordinates all internal departments and manages the GuideCX data collection project. 15 PMs on the current team.
- **OBPA / Payroll Analyst** — Onboarding Payroll Analyst. Handles all payroll-specific configuration, testing, and initial processing. Configures PrismHR billing rules, SUTA, deductions, and pay groups; runs mock and first-live payrolls; trains the client admin on payroll submission. 16 PAs on the current team.
- **BA / Business Advisor** — Business Advisor (Sales). The G&A salesperson who closes the deal and conducts the sales handoff meeting with the PM. BA enters client data into ClientSpace and is the source of handoff page information. Frequently enters placeholder data in required fields.
- **PS / Payroll Specialist** — Payroll Specialist. The ongoing payroll operations role that receives the client after Onboarding completes the first two payrolls. The client exits the Onboarding process once the PS handoff and knowledge transfer is complete.
- **PM Manager / PA Manager** — Managers who supervise the PM and PA teams respectively. Both independently review the CSA at the Deal Initiation phase — contributing to the four-way redundant review that Initiative D targets.

### Process & Document Terms

- **CSA** — Client Service Agreement. The binding contract signed at deal close. Contains fee structure, term, included vs. optional services, billing exceptions, SUTA state coverage, IRS tax classification, and ownership information. Currently reviewed four times independently by PM Manager, PM, PA Manager, and PA.
- **OB PM Tool** — Onboarding Project Management Tool — the ClientSpace-based task tracking module used by PMs to manage onboarding milestones, phase progress, and internal departmental assignments. Currently requires manual task updates and progress notes.
- **Master Client List** — Excel-based spreadsheet used to track PM and PA assignment workload across the current concurrent client portfolio. Currently the primary workload balancing tool — no automated BI integration with ClientSpace.
- **SUTA** — State Unemployment Tax Act. State-specific unemployment tax rates that must be configured in PrismHR per state where the client has active employees. SUTA Bill Rate Review requires executive approval — a bottleneck on the critical path for multi-state clients.
- **WC Code** — Workers' Compensation code. State and job-specific classification codes required for payroll tax calculation. WC code configuration errors are the most commonly documented source of mock payroll failures.
- **WTPA** — Wage Theft Prevention Act. State-specific notice requirement. WTPA forms are among the kickoff documents clients must upload via GuideCX before system configuration can begin.
- **Mock Payroll** — A test payroll run in PrismHR conducted by the PA before the first live payroll. Identifies setup errors (WC codes, SUTA rates, billing rules, pay group alignment). Currently an iterative trial-and-error process; Initiative F targets this with pre-flight validation.
- **Payroll Breakout** — A payroll-specific client meeting conducted by the PA, typically scheduled within 5 business days of the general kickoff meeting. Currently a separate scheduling cycle — combining the kickoff and payroll breakout into a single meeting is one of the five cycle compression levers under Initiative A.
- **Handoff Page** — The ClientSpace record completed by the BA at deal close. Contains the structured data fields that PMs and PAs use to set up the client in PrismHR and WorkSight. Frequently has incomplete or placeholder data, requiring correction during onboarding meetings.

### System Acronyms

- **ClientSpace / CS** — The core CRM and case management system. Functions as the hub for all onboarding record-keeping, task tracking, and status documentation. Also referred to as ClientSpacePRO for the Pro version used by certain service teams.
- **PrismHR** — G&A's primary HRIS and payroll processing platform. The system in which clients are configured (shell, billing, SUTA, pay groups) and in which all payrolls are run. The PM builds the shell; the PA configures the payroll rules and runs payroll.
- **GuideCX** — Third-party client onboarding portal used to create data collection projects, request documents from clients, and track submission status. Currently the primary channel for receiving onboarding documents. Target of the WorkSight/ClientSpace migration initiative.
- **WorkSight / Click Boarding** — Employee electronic onboarding platform and client admin portal. Employees complete I-9 and paperwork here. Also the target destination for GuideCX migration — Initiative E proposes making WorkSight the integrated data collection and client portal layer.
- **HRWorkCycles** — I-9 verification workflow system. Known for recurring I-9 errors and one-at-a-time invite resend limitations — both flagged as automation candidates by end users.
- **Informer** — Reporting and analytics tool used for SUTA bill rate reporting and state compliance data. Primary data source for the SUTA Bill Rate Review executive approval process.

---

## 08 · Submission Guide

**Eyebrow:** Submission Guide

**What We Need From Partners**

This submission is scoped to the two PRD Priority initiatives: **Initiative D — AI-Assisted CSA Extraction & Cross-Validation** and **Initiative F — Mock Payroll Pre-Flight Validation**. Your response must address all six items below. Quality over length — a specific response beats a comprehensive generic one. A working demo or POC is strongly preferred over slide descriptions. Submit to the engagement lead listed in the Overview tab.

### Required Submission Components

**1. Proposed Approach & Workplan**
How do you sequence Initiative D and Initiative F? Can both be piloted independently of broader system integration work? What does the first 30–60–90 days look like for each? What are the key dependencies — for Initiative D, what does your approach require from ClientSpace and the CSA upload workflow? For Initiative F, what level of PrismHR API access or data export is required before build can begin? What G&A-side resources are needed and how much of their time?

**2. Architecture & Technical Design**

**(D) AI-Assisted CSA Extraction:** Which document intelligence platform do you propose for multi-page legal documents with variable structure? How do you extract and structure fields — fee structure, included/optional services, SUTA state coverage, billing exceptions, IRS classification — from a CSA PDF on upload? How do you auto-flag discrepancies between extracted fields and ClientSpace handoff page data? How do you auto-create a case for Sales with flagged discrepancies? What is the integration point with ClientSpace for populating the structured summary record?

**(F) Mock Payroll Pre-Flight Validation:** Is this a PrismHR API integration, a custom Informer report, or an RPA layer — and why? How do you validate WC codes against CSA Schedule 2, SUTA rate completeness across all active employee states, billing rule completeness, pay group-schedule alignment, and deduction code validity? What does the pass/fail output look like and how are remediation steps surfaced to the PA? How do you handle the SUTA executive pre-approval logic for standard vs. non-standard states?

Include a system architecture diagram for each initiative.

**3. Effort, Timeline & Cost**
Build cost for Initiative D and Initiative F separately, ongoing infrastructure cost, and proposed pricing model. Include G&A-side resource requirements by role (ClientSpace admins, PrismHR access, PA/PM involvement for testing). Separate build cost from run cost. Provide a realistic time-to-production estimate for each initiative independently — the goal is to understand whether both can be live within a single quarter or whether they require sequential delivery.

**4. Data & PII Handling**
Both priority initiatives handle highly sensitive data. For **Initiative D**: the CSA is a signed legal document containing ownership information, EIN, fee structure, and IRS tax classification — how do you handle PII and confidential commercial terms in LLM calls? What is your data residency approach? For **Initiative F**: the pre-flight validation reads full PrismHR payroll configuration data including billing rates, WC codes, SUTA rates, and employee-level tax data — how do you ensure this complies with G&A's data obligations? Expected token cost per client onboarded for Initiative D's AI-assisted extraction component.

**5. Working Demo / POC**

**(D) AI-Assisted CSA Extraction:** Upload a sample multi-page CSA PDF (we will provide a redacted example) and demonstrate structured field extraction — fee structure, included services, SUTA state coverage, billing exceptions, IRS classification — populating a ClientSpace summary record. Show the auto-flagging of at least one discrepancy between an extracted CSA field and a ClientSpace handoff page field. Show the auto-created Sales case with the flagged discrepancy.

**(F) Pre-Flight Validation:** Show a simulated pre-flight report against a PrismHR configuration with a seeded WC code error and a missing SUTA rate — demonstrating the pass/fail output with specific remediation steps before mock payroll initialization. Show how a PA would action the remediation steps from the report output.

*Video recording is accepted if a live session is not possible before the deadline.*

**6. Relevant Experience**
2–3 specific examples of document AI or payroll automation solutions built for PEO, HRIS, payroll operations, or analogous environments. For each: problem, solution, systems integrated, and measurable outcome (error rate reduction, cycle time reduction, or FTE savings preferred). Specifically call out any prior experience with: PrismHR API integration, ClientSpace workflow configuration, document intelligence applied to legal or contract documents, and payroll configuration validation automation. Include the team members who would work on this engagement and their direct experience with these systems.

### Evaluation Criteria

| Criterion | Weight | What We Are Looking For |
|-----------|:------:|-------------------------|
| **Working POC / Demo Quality** | 30% | Does the CSA extraction output look like something a PM or PA Manager would validate rather than re-enter from scratch? Does the discrepancy flagging and auto-created Sales case work end-to-end? Does the pre-flight validation report surface errors in a format that enables immediate PA remediation — not a generic error dump? |
| **Architecture Credibility** | 25% | Is the Initiative D design realistic given the ClientSpace integration requirement and the variable structure of CSA PDFs? Is the Initiative F approach technically credible for the PrismHR stack — API, Informer report, or RPA — with a clear rationale for the chosen approach? Are both initiatives scoped as standalone pilots without requiring broader system migrations? |
| **Relevant Experience** | 20% | Prior experience with PrismHR API or payroll configuration validation. Document intelligence solutions applied to legal or contract documents. ClientSpace or analogous CRM integration experience. PEO or HR outsourcing operational context is a strong differentiator. |
| **Cost Realism & PII Strategy** | 15% | Is build cost credible for the scope of each initiative independently? Is PII handling in LLM calls explicitly addressed for both CSA data (D) and PrismHR configuration data (F)? Is per-client token cost estimated for Initiative D? |
| **Speed to Value** | 10% | Can Initiative D and Initiative F each be live and in production within 60–90 days independently? What is the minimum viable version of each that could be piloted with a subset of new client onboardings before full rollout? |

> **Submit to:** tsagireddy@alixpartners.com &nbsp;|&nbsp; **Deadline:** June 25, 2026

---

*G&A Partners · AI Onboarding PRD · Confidential · Preliminary — Subject to Change*
