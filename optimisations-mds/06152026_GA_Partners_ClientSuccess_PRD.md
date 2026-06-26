# G&A Partners | AI Client Success PRD

> **Confidential · Partners Only**
> **Partner Evaluation Package · June 2026**
> *Preliminary — Subject to Change*

# AI-Enabled Client Success — Product Requirements Document

G&A Partners is evaluating strategic AI development and implementation partners to design and build an AI-enabled operations workflow for its Client Success division. This document provides everything a partner needs to understand the opportunity, current state, and what a winning response looks like.

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

**AI-Enabled Client Success — Product Requirements Document**

G&A Partners is evaluating strategic AI development and implementation partners to design and build an AI-enabled operations workflow for its Client Success division. This document provides everything a partner needs to understand the opportunity, current state, and what a winning response looks like. Navigate using the tabs above.

### What's Inside

| # | Section | Description |
|---|---------|-------------|
| 01 | **Overview** | Key contents, scope, timeline for the partner evaluation, and the point of contact for all questions and submissions. |
| 02 | **Business Context** | What the Client Success division does, its operational processes, team structure, P&L position, and the margin improvement mandate. Read this first. |
| 03 | **Process Map** | A swimlane diagram mapping all Client Success processes across various roles and lifecycle phases. |
| 04 | **Initiative Deep Dive** | Initiative-level breakdowns covering current state, pain points, and what an AI and automation solution must deliver. This is where partners should spend most of their time. |
| 05 | **Business Impact** | Client Success operational and activity baseline, annual attrition metrics, and automation / AI-enablement goals to improve current pain points across various processes. |
| 06 | **Systems & Technical** | Full inventory of systems in scope, integration gaps, broken integrations, and API considerations. For the partner's technical team. |
| 07 | **Glossary** | Definitions of Client Success terminology, G&A-specific acronyms, tier definitions, and system names used throughout this document. |
| 08 | **Submission Guide** | What we need from partners, how we will evaluate responses, and what a winning submission looks like. |

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

**G&A Partners Client Success — Business Overview**

A concise summary of the Client Success division's business, operating model, team structure, account tier framework, and performance context. Read this before reviewing the process and technical sections.

### What the Client Success Division Does

#### The Business

G&A Partners Client Success group manages the post-sale client relationship across G&A's PEO and ASO book of business. The division is responsible for client retention, satisfaction, upsell/cross-sell, escalation resolution, and broker relationship management. Revenue is indirectly driven by this team — every client that renews, expands, or refers another client does so because of the relationship quality delivered by Client Success. The team manages approximately 4,900 total parent accounts across two service tiers.

#### Operational Processes

- **Client Onboarding** — CSM assignment of new accounts from implementation handoff.
- **Client Relationship** — Proactive outreach (Silver/Bronze) and lifecycle management (Platinum/Gold).
- **Account Management** — Daily/weekly case oversight and aging case management across all clients.
- **Inbound Call Handling** — Live call triage, case creation, and routing for inbound client calls.
- **Escalation Management** — Investigation and resolution of escalated client issues.
- **Value-Add / Upsell** — Identifying and closing service expansion opportunities.
- **Broker Relationship Management** — Managing broker-referred client relationships and satisfaction.
- **Client Surveys & NPS** — NPS survey case management, root cause investigation, and reporting.

### Client Success Business at a Glance

| Metric | Value |
|--------|-------|
| Total Accounts Managed | **4,900** |
| Total Onshore FTEs | **65** |
| Total Onshore FLC | **$8.4M** |
| Offshore FTEs | **18** |

### Account Tier Framework

| Tier | Accounts | FTEs Serving | Coverage Ratio | Avg. Time / Account / Month | Service Model |
|------|----------|--------------|----------------|-----------------------------|---------------|
| **Platinum / Gold** | ~1,700 | 34 (CSMs + Mgrs) | 50 accts/FTE | 192 min | Dedicated CSM; monthly QBRs, full lifecycle mgmt. |
| **Silver / Bronze** | ~3,200 | 16 (Advocates + Mgrs) | 200 accts/FTE | 48 min | Pooled advocates; proactive outreach 5x/week per advocate |

### Current Team Structure

**CLIENT SUPPORT TEAM — 65 ONSHORE FTEs**

| Role | FTEs | Coverage |
|------|:----:|----------|
| CSMs + Managers | 34 | Platinum / Gold |
| Client Advocates + Managers | 16 | Silver / Bronze |
| Inbound CSM Team | 4 | Client inbound calls |
| HR Support Spec. | 6 | WSE inbound calls |
| Other | 5 | Mgmt. & specialist roles |

#### Client Success Managers (CSMs)

Own the full lifecycle for Platinum/Gold accounts: onboarding handoff, monthly touchpoints, case oversight, escalation management, renewal, and upsell conversations.

#### Client Advocates

Manage proactive outreach for Silver/Bronze accounts. Each outreach involves client scoring, CRM case creation, email drafting, Teams notification, and follow-up — all done manually across multiple disconnected systems.

#### Inbound CSM Team

Handle inbound calls from clients, performing initial triage, case creation, and routing. Serve as the first point of contact for clients who call in rather than reaching out to their dedicated CSM.

#### HR Support Specialists

Handle inbound calls and chats from Worksite Employees (WSEs) on platform navigation, payroll, benefits, and HR questions. A significant portion of call types are routine and repeatable.

### What We Are Looking For

#### 1 · Cost Efficiency — Coverage Ratio & Operational Improvement

**A · Unified Client 360 Dashboard** &nbsp; `[PRD Priority]`

A single ClientSpace screen aggregating services, case history, NPS trends, open escalations, and AI-computed health score eliminates the need to navigate five systems before every touchpoint meeting and enables proactive client health monitoring at scale.

**B · Automated Escalation Routing with SLA Enforcement**

When a case is escalated, the system auto-notifies the case owner, starts a response timer, and escalates through the management chain if unacknowledged — eliminating the manual follow-up cycle identified as the single largest time waste across Client Success.

**C · AI Assisted Case Updates & Aged Case Alerts**

AI-generated case notes after every client interaction replace manual documentation — ensuring every case has a clear current status and explicit next action. Automated alerts proactively surface cases open beyond SLA thresholds before they stall, eliminating the manual daily scan.

**D · AI Customer Experience — Inbound & Silver/Bronze** &nbsp; `[Outside PRD Scope]`

Auto case creation on call pickup, AI-generated call summaries, and an AI search layer over WorkSight reduce handle time and documentation burden for the inbound and Silver/Bronze channels — where high account volume makes every minute of manual overhead disproportionately costly.

#### 2 · Customer Retention & Gross Margin Protection

**E · AI Churn Propensity Model** &nbsp; `[PRD Priority]`

A machine-learning model that aggregates client data (e.g. NPS scores, case volume and aging, escalation history, onboarding recency, and service utilization) signals to generate a continuous churn risk score for each account — proactively surfacing at-risk accounts to CSMs/Client Advocates before churn occurs and enabling earlier, targeted intervention to protect gross revenue retention.

---

## 03 · Process Map

**Eyebrow:** Process Map · Current State Swimlane

**Client Success — Customer Journey Map**

Four roles across four lifecycle phases. Column colors indicate the lifecycle phase; row labels identify the team responsible.

Lifecycle phases: **Client Onboarding → Relationship Management → Service & Support → Retention & Growth**

Initiative overlay: **E · AI Churn Model**

### Lane: CSM (Platinum / Gold)

| Client Onboarding | Relationship Management | Service & Support | Retention & Growth |
|-------------------|-------------------------|-------------------|---------------------|
| Sales Handoff & Kick-off | Recurring Touchpoints & QBRs *(Opp A)* | Daily Case Review & Oversight *(Opp C)* | Broker Relationship Mgmt. *(Opp A)* |
| CSM Assignment & Introduction | Client Action Plan Maintenance *(Opp A)* | Case Investigation & Resolution *(Opp C)* | Process NPS Survey Cases *(Opp A)* |
| Establish Meeting Cadence *(Opp A)* | | Weekly Delegated Case Audit *(Opp C)* | Value-Add / Upsell Conversations *(Opp A)* |
| | | Manage Escalations *(Opp B)* | Client Exit Coordination *(Opp A)* — **EXIT RISK** |
| | | Root Cause Classification *(Opp B)* | |
| | | Aging Case Follow-up *(Opp C)* | |

### Lane: Client Advocate (Silver / Bronze)

| Client Onboarding | Relationship Management | Service & Support | Retention & Growth |
|-------------------|-------------------------|-------------------|---------------------|
| Client Scoring & Prioritisation *(Opp A)* | Internal Team Notification | Account Case Oversight *(Opp C)* | NPS Case Handling *(Opp A)* |
| Outreach Email & Case Creation *(Opp A)* | Case Triage & Routing *(Opp B)* | Escalation Follow-up *(Opp B)* | |
| | | Outreach Follow-up & Closure *(Opp C)* | |

### Lane: Inbound CSM / Client Adv. (Client Contact Center)

| Service & Support |
|-------------------|
| Caller Authentication & Verification *(Opp D)* |
| Handle Inbound Client Call *(Opp D)* |
| Resolved on first call? |
| YES → Coordinate Follow-up Survey *(Opp D)* |
| NO → Triage to Specialist Dept. *(Opp D)* |

### Lane: HR Support Specialist (WSE Call Center)

| Service & Support |
|-------------------|
| Resolve Inbound WSE Calls *(Opp D)* |
| Resolve Inbound Chats *(Opp D)* |
| Manage Queue (email) *(Opp D)* |
| Resolve Queue *(Opp D)* |

### Key Systems by Phase

| Phase | Systems |
|-------|---------|
| Client Onboarding | ClientSpace · Outlook · Teams |
| Relationship Management | ClientSpacePro · Outlook · Teams · Excel · SharePoint · WorkSight · PRISM · TLM · Cornerstone |
| Service & Support | ClientSpacePro · TalkDesk · Teams · Qualtrics · WorkSight · Power BI |
| Retention & Growth | ClientSpacePro · WorkSight · PRISM · Excel |

### System Legend

- **Core CRM** — ClientSpace
- **Communication & Telephony** — Outlook · Teams · TalkDesk · Power BI
- **Productivity** — Excel · SharePoint
- **Client Platforms** — WorkSight · Qualtrics
- **Service Data** — PRISM · TLM · Cornerstone

---

## 04 · Initiative Deep Dive

**Eyebrow:** Initiative Deep Dive

**How AI & Automation Can Transform Client Success**

Two initiatives across two strategic buckets: cost efficiency (four AI and automation sub-opportunities targeting coverage ratio improvement) and customer retention (an AI churn propensity model targeting $18.2M in controllable revenue at risk). Each initiative maps to documented pain points and a clear target state — this is where winning responses will demonstrate specificity.

### 1 · Cost Efficiency — Coverage Ratio & Operational Improvement

**Optimize Coverage Ratio for CSMs and Client Advocates**

**Tags:** `AI` `Automation`

Four AI/automation sub-initiatives targeting the largest time sinks across Client Relationship (19–20%), Escalation Management (25%), Account Management (31%), and Inbound Call Handling — together consuming the majority of all Client Support capacity. Sub-opp A targets cross-system consolidation; B targets escalation routing; C targets AI-assisted documentation; D addresses inbound call handling.

#### A — Unified Client 360 Dashboard (Cross-System Consolidation)

**Tags:** `All Tiers` `Automation` `PRD Priority`

**Current State**

- P/G CSMs navigate five systems (ClientSpace, WorkSight, PRISM, TLM, Cornerstone) before every touchpoint — 15–30 min of manual preparation per meeting
- S/B Advocates manually copy contact lists from ClientSpacePro into Outlook for every outreach email
- Client health is assessed manually by reviewing cases and reports — no proactive surfacing

**Current Challenges**

- *"Everything is pretty manual between the way that the data flows between them"* — Client Relationship (S/B)
- No single source of truth for services, pricing, and quotes — CSMs cross-reference three systems for every upsell conversation
- NPS data from Qualtrics dumps into a single text field in ClientSpace — each element extracted manually per case

**AI / Automation Target**

- Single ClientSpace screen aggregating: current services (WorkSight, PRISM, TLM, Cornerstone), case history, NPS trend, open escalations, action plan, service team, and AI health score
- Auto-generated S/B outreach emails drafted from SOP template with contact list pre-populated — advocate reviews and sends
- Fix Qualtrics→Salesforce→ClientSpace mapping so NPS score, comments, and category populate dedicated fields

#### B — Automated Escalation Routing with SLA Enforcement

**Tags:** `All Tiers` `Automation`

**Current State**

- Escalated cases require CSMs to manually notify case owners via Teams; non-responses trigger a multi-step manual chase through owner, manager, and department leadership
- No automated escalation directory exists outside of IT — CSMs manually identify the correct leader in the chain each time

**Current Challenges**

- *"One of the biggest forms of waste is waiting. We wait on other departments far more than we should"* — Account Mgmt.
- IT's dedicated Teams escalation chat works well; payroll, benefits, 401k, and tax lack equivalent channels
- Platinum priority flags in ClientSpace are routinely ignored by internal departments

**AI / Automation Target**

- When tagged as an escalation: system auto-notifies the case owner, starts a response timer, and escalates to manager (24h) then department leadership (48h) — CSM confirmed at each step
- Replicate IT's Teams escalation chat model for payroll, benefits, 401k, tax, and HR advisory
- Embed root cause definitions in ClientSpace dropdown, retiring the external Excel reference

#### C — AI Assisted Case Updates and Aged Case Alerts

**Tags:** `All Tiers` `AI`

**Current State**

- CSMs review full case note histories twice daily to identify current status and next steps — even when the last entry is stale
- Documentation after every client call is fully manual — 10–15 min per case from scratch; 15–20 min for escalation entries
- Aged cases are identified reactively during daily review; no system proactively flags cases sitting idle past acceptable thresholds

**Current Challenges**

- *"The last internal note never gives me clear instruction on what I need to do next"* — Account Management interviewee
- Inconsistent note quality across the team undermines scoring algorithms and outreach effectiveness
- No automated mechanism flags cases open beyond SLA thresholds — CSMs discover stale cases manually

**AI / Automation Target**

- After every client call or Teams meeting, AI generates a structured note: (1) summary, (2) case status, (3) next action and owner — CSM reviews and approves
- Daily review converts from reading full history to scanning an AI summary
- Automated alerts surface cases open beyond configurable thresholds (e.g., >2 days for Platinum) directly to the CSM and manager

#### D — AI Customer Experience — Inbound & Silver/Bronze

**Tags:** `All Tiers` `AI` `Outside PRD Scope`

**Current State**

- Inbound CSM Client Advocates handle high-volume calls with no AI support — caller authentication, case lookup, and case creation are all manual during each call
- WorkSight's KB search is poor, forcing agents to rely on memory or SharePoint during live calls instead of having answers surfaced in real time

**Current Challenges**

- TalkDesk-to-ClientSpace auto-population is broken — agents manually search for client identity on every inbound call
- *"The search feature on the knowledge base is not good"* — avoidable escalations and longer handle times result
- High call volume with fully manual case creation is disproportionately costly at 200 accounts per FTE

**AI / Automation Target**

- Ciklum rollout: auto case creation on call pickup with client identity and recent history pre-populated from ClientSpace
- AI-generated call summary posted to ClientSpace within 2 minutes of call end — agents review and approve
- AI-powered search layer over WorkSight surfaces resolution steps in real time, improving first-call resolution

> **Coverage ratio improvement:** Our goal from implementing all opportunities above (A + B + C + D) is to improve the coverage ratios for CSMs and Client Advocates. Today, a CSM supports ~50 Platinum/Gold accounts and ~200 Silver/Bronze accounts on average.

### 2 · Customer Retention & Gross Margin Protection

#### E — AI Churn Propensity Model

**Tags:** `AI` `PRD Priority`

A machine-learning model that aggregates client signals across disconnected systems to generate a continuous churn risk score per account — enabling CSMs and Client Advocates to intervene proactively before churn occurs. In 2025, G&A Partners lost 350 accounts to controllable reasons, representing **$18.2M in total revenue** that a predictive retention model could have targeted for intervention.

**Current State**

- 680 accounts churned in 2025, representing **$30.4M in total lost revenue**. Of these, **350 accounts (51.5%) were lost to controllable reasons**: Customer Service Issues (127 accounts, $6.9M), Price (135 accounts, $6.3M), and Medical Rates Too High (88 accounts, $4.9M) — totalling $18.2M in controllable revenue at risk
- CSMs have no systematic early warning for at-risk accounts — churn is identified reactively when clients serve notice, typically too late for effective intervention
- Account health is assessed manually through ad-hoc NPS review and case observation — no model aggregates signals across systems into a unified risk score

**Current Challenges**

- Churn prediction signals exist across disconnected systems — NPS in Qualtrics, cases and escalations in ClientSpace, service utilization in PRISM/WorkSight — but are never aggregated into a unified view
- With 50 P/G accounts per CSM, proactively monitoring all accounts for early warning signs is not feasible manually — at-risk accounts surface only after NPS drops or case volume spikes visibly
- No structured feedback loop exists between churn events and CSM outreach strategy — lost account data is not used to improve future retention actions

**AI / Automation Target**

- ML propensity model ingesting NPS trends, case volume and aging, escalation history, service utilization, and account tenure — generating a continuous churn risk score per account
- Monthly risk scores surfaced in ClientSpace — CSMs and Client Advocates see a ranked view of at-risk accounts for prioritised retention outreach
- Model trained on 2020–2025 attrition data with ongoing retraining as new churn events occur

---

## 05 · Business Impact

**Eyebrow:** Business Impact

**AI & Automation Business Impact — Cost Efficiency & Gross Margin Retention**

Section 1 presents the Client Success operational baseline and maps the AI / automation goals with each process. Section 2 presents G&A's 2025 attrition profile, segments controllable vs. non-controllable churn, and outlines our expectation from the AI Churn Propensity Model for customer retention.

### 1 · Cost Efficiency — Coverage Ratio & Operational Improvement

#### Current State Baseline

**Platinum / Gold**

| Metric | Current |
|--------|--------:|
| FTEs (CSMs + Mgrs) | 34 |
| Total Accounts | ~1,700 |
| Coverage Ratio | 50 accts / FTE |
| Time per Account per Month | 192 min |

**Silver / Bronze**

| Metric | Current |
|--------|--------:|
| FTEs (Advocates + Mgrs) | 16 |
| Total Accounts | ~3,200 |
| Coverage Ratio | 200 accts / FTE |
| Time per Account per Month | 48 min |

#### Time Allocation by Process (Current State)

**Platinum/Gold — 192 min/account/month**

| Process | % Allocation | Min/Acct/Mo |
|---------|:------------:|------------:|
| **Client Relationship** | 36% | ~70 min |
| **Escalation Management** | 25% | ~49 min |
| **Account Management** | 19% | ~37 min |
| Other (NPS, Value-Add, Onboarding) | 19% | ~36 min |

**Silver/Bronze — 48 min/account/month**

| Process | % Allocation | Min/Acct/Mo |
|---------|:------------:|------------:|
| **Escalation Management** | 25% | ~12 min |
| **Inbound Call Handling** | 20% | ~10 min |
| **Account Management** | 20% | ~10 min |
| **Client Relationship** | 21% | ~10 min |
| Other (NPS, Value-Add) | 14% | ~6 min |

#### Automation Opportunities — Cost Efficiency

| Process | Initiative | Automation Goal |
|---------|:----------:|-----------------|
| **Client Relationship** *(PRD Priority)* | Opp A — Unified Client 360 Dashboard | Unified 360 dashboard aggregates services, case history, NPS trends, open escalations, and AI health score into a single ClientSpace screen — eliminating 5-system navigation before every touchpoint. Auto-drafted outreach emails for S/B advocates reduce manual preparation per interaction. |
| **Escalation Management** | Opp B — Automated Escalation Routing with SLA Enforcement | Auto-notify case owners on escalation, start response timers, and escalate automatically through the management chain on non-response — eliminating the manual Teams follow-up cycle identified as the single largest time waste across Client Success. |
| **Account Management** | Opp C — AI Assisted Case Updates & Aged Case Alerts | Replace manual case note authoring with AI-generated structured summaries (summary, status, next action) after every client interaction. Daily case review converts from reading full note history to scanning an AI summary. Automated alerts proactively surface cases aged beyond SLA thresholds. |
| **Inbound Call Handling** | Opp D — AI Customer Experience — Inbound & S/B | Auto case creation on call pickup with client identity pre-populated, AI-generated call summaries, and AI-powered search over WorkSight reduce average handle time and documentation burden for the high-volume inbound channel. *Outside PRD Scope* |

### 2 · Customer Retention & Revenue Protection

#### 2025 Attrition Baseline

| Metric | Value |
|--------|-------|
| Total Accounts Lost | **680** |
| Total Revenue Lost | **$30.4M** |
| Controllable Revenue at Risk | **$18.2M** |

#### Attrition Breakdown by Reason

| Primary Reason | Category | Accounts Lost | Revenue Lost | % of Total Revenue |
|----------------|----------|:-------------:|:------------:|:------------------:|
| **Customer Service Issues** | Controllable | 127 | $6.9M | 22.8% |
| **Price** | Controllable | 135 | $6.3M | 20.7% |
| **Medical Rates Too High** | Controllable | 88 | $4.9M | 16.2% |
| **Business Closed** | Non-Controllable | 172 | $4.7M | 15.6% |
| **Business Sold** | Non-Controllable | 106 | $6.2M | 20.3% |
| **Financial Issues** | Non-Controllable | 42 | $1.2M | 3.9% |
| Other / G&A Initiated | Non-Controllable | 10 | $0.1M | 0.5% |
| **Total** | | 680 | $30.4M | 100% |
| **Total Controllable** | Controllable | 350 (51.5%) | $18.2M | 59.7% |

#### Automation Opportunities — Gross Margin Retention

| Process | Initiative | Automation Goal |
|---------|:----------:|-----------------|
| **Retention & Churn Prevention** *(PRD Priority)* | Opp E — AI Churn Propensity Model | ML-based churn propensity model aggregates NPS trends, case volume, escalation history, and service utilization to generate a monthly risk score per account — surfaced in ClientSpace so CSMs and Client Advocates can prioritise retention outreach before churn occurs. |

---

## 06 · Systems & Technical

**Eyebrow:** Systems & Technical

**System Inventory, Integration Gaps & Technical Constraints**

A full inventory of every system that Client Success teams currently use, the gaps between them, and the broken integrations that a partner solution must address or route around. This is the technical foundation for any architecture proposal.

> **Critical constraint:** Client Success operates across 6+ systems with zero native integration. All data transfer between ClientSpacePro, Outlook, Teams, Excel, SharePoint, and TalkDesk is fully manual. Any solution architecture must directly address this fragmentation — either by building integration layers or replacing the manual data movement.

### Core Systems in Scope

**ClientSpacePro / ClientSpace** — *Primary CRM & Case Management*
The core case management and client record system for Client Success. All cases, escalations, account assignments, and NPS cases live here. Dashboards load slowly, adding cumulative delay to every daily review session. The system has a priority flag for Platinum accounts but internal departments do not consistently act on it.
Tags: `In Scope` `Slow Load Performance` `Fragmented from Other Systems`

**TalkDesk** — *Inbound Call Platform*
Phone platform for all inbound calls from clients and WSEs. A previously working integration automatically populated caller identity and case context from ClientSpacePro based on caller phone number — this integration is now broken. All case data entry is currently fully manual, adding time to every call.
Tags: `In Scope` `Broken Integration (Critical)` `Restore as Priority`

**Qualtrics** — *NPS Survey Platform*
NPS surveys are sent via Qualtrics during the first two weeks of each month. The Qualtrics→Salesforce→ClientSpace integration dumps all survey data (NPS score, client comments, response category) into a single issue text field rather than mapping to dedicated fields. CSMs must manually extract each data element — creating a bottleneck for every NPS case and blocking Power BI reporting accuracy.
Tags: `In Scope` `Broken Data Mapping (Critical)` `Fix Mapping as Priority`

**WorkSight** — *Client Portal & Knowledge Base*
Client-facing portal and knowledge base. WorkSight's search functionality is documented as "poor" — clients cannot efficiently find answers to common questions, driving avoidable inbound call volume. The knowledge base content exists but is not surfaced effectively to end users.
Tags: `In Scope` `Poor Search (High Impact)` `AI Search Layer Needed`

**Microsoft Teams** — *Internal Communication & Escalation*
Primary internal communication tool. IT has a dedicated Teams escalation chat that works well — giving CSMs a monitored channel with fast acknowledgment. Payroll, benefits, 401k, tax, and HR advisory departments lack equivalent channels, forcing CSMs to manually chase responses through case notes and individual Teams messages.
Tags: `In Scope` `Missing Dept. Escalation Channels` `Replicate IT Model`

**SharePoint** — *Document Storage & SOPs*
Shared Advocacy Library and SOP storage. The library is hard to navigate — finding the proactive outreach SOP requires extensive scrolling through a large document list. SOPs exist but are not embedded in workflow tools, requiring context-switching to reference them during active work.
Tags: `In Scope` `Poor Navigability`

**Microsoft Excel / Outlook** — *Scoring, Tracking & Outreach*
Excel hosts the Silver/Bronze outreach scoring tool (macro-based; macro security may block execution) and the outreach tracker. Outlook handles all client outreach email composition. Contact lists must be manually copied from ClientSpacePro and pasted into Outlook — no auto-population exists. KPIs including retention rates, upsell revenue, and adoption rates are tracked in Excel, not the CRM.
Tags: `In Scope` `Manual Data Transfer` `KPI Silo`

**PRISM / TLM / Cornerstone** — *Service Data Systems*
Three separate systems holding service utilization, pricing, and client learning data respectively. P/G CSMs must navigate all three alongside ClientSpace before every touchpoint meeting. No consolidated view exists. These are the primary data sources that the Unified Client 360 Dashboard (Opp A) must aggregate.
Tags: `In Scope` `No Consolidated View` `Source for 360 Dashboard`

**Ciklum** — *Target: AI Self-Service Platform*
The target vendor for AI Customer Experience automation (Opp D). Ciklum would provide auto case creation on call pickup, AI-generated call documentation, and an AI-powered search layer over WorkSight for inbound agents. This is a new integration — no existing Ciklum deployment exists at G&A Partners today.
Tags: `AI Self-Service · Opp D`

### Integration Gap Summary

| Gap | Systems Affected | Current Workaround | Initiative | Priority |
|-----|------------------|--------------------|:----------:|:--------:|
| **TalkDesk auto-population broken** | TalkDesk → ClientSpacePro | Manual client search on every inbound call | #2 | High |
| **Qualtrics data mapping failure** | Qualtrics → Salesforce → ClientSpace | CSM manually extracts NPS score, comments field-by-field per case | #1-A | High |
| **No ClientSpace→Outlook integration** | ClientSpacePro → Outlook | Manual copy-paste of contact lists per outreach | #1-A | High |
| **No ClientSpace→Teams integration** | ClientSpace → Teams | Manual team member lookup + individual Teams chat initiation | #1-B | Medium |
| **No multi-system aggregation layer** | WorkSight, PRISM, TLM, Cornerstone → ClientSpace | CSM navigates 5 systems manually before each meeting | #1-A | Medium |
| **KPI data in Excel, not CRM** | Excel → ClientSpace | Manual tracking; no real-time pipeline visibility | #1-A | Low |

> **Note to partners:** Partners are not constrained by the current system architecture. If you believe a different toolset, integration platform, or data layer better addresses the requirements, that is a valid and encouraged response. The systems above are documented as context, not as constraints.

---

## 07 · Glossary

**Eyebrow:** Glossary

**Terms, Definitions & Acronyms**

Definitions of all Client Success–specific terms, G&A operational acronyms, tier designations, and system names used throughout this document.

### Client Tier Definitions

- **Platinum / Gold (P/G)** — The top two client tiers in G&A's account segmentation framework. Platinum/Gold accounts receive dedicated CSM coverage, monthly touchpoints or QBRs, full lifecycle management, and white-glove escalation handling. Current coverage ratio: ~50 accounts per FTE. Time allocation: ~192 min/account/month.
- **Silver / Bronze (S/B)** — The bottom two client tiers. Silver/Bronze accounts are served by a pooled team of Client Advocates through proactive outreach on a weekly cadence (~5 outreaches per advocate per week) rather than dedicated coverage. Current coverage ratio: ~200 accounts per FTE. Time allocation: ~48 min/account/month.
- **Coverage Ratio** — The number of accounts served per FTE. The primary operational efficiency metric for Client Success — increasing the coverage ratio (while maintaining retention outcomes) is the core objective of the cost efficiency initiatives (Opps A–C).
- **Parent Company / Parent Account** — The top-level organizational unit in ClientSpace. Tier designation and CSM assignment are made at the parent company level, not at the individual worksite level. Coverage ratio modeling (1,700 P/G, 3,200 S/B) uses parent account counts.

### Roles

- **CSM (Client Success Manager)** — Dedicated relationship manager for Platinum/Gold accounts. Owns the full client lifecycle: onboarding handoff, monthly touchpoints, case oversight, escalation management, renewal, and upsell.
- **Client Advocate** — Pooled outreach specialist serving Silver/Bronze accounts. Executes proactive outreach using an Excel-based scoring tool to prioritize which clients to contact each week.
- **CSM – Broker** — A specialized CSM role managing the broker relationship channel rather than direct client accounts. Responsible for broker satisfaction, broker-escalated client issues, and premier broker program management.
- **HR Support Specialist** — Inbound support role handling WSE (Worksite Employee) calls and chats. Spends 70% of time on call intake and resolution for platform navigation, payroll, benefits, and HR questions.
- **Inbound CSM Client Advocate** — Specialized advocate role handling inbound calls from clients (not WSEs). Sits between the HR Support Specialist team and the full CSM team in terms of case complexity.

### Process & Operational Terms

- **AHT (Average Handle Time)** — Average time to handle an inbound support call from pickup to case closure. Referenced in Opp D (AI Customer Experience) as the metric that automation and AI knowledge base improvements will reduce.
- **Aging Case** — A case that has been open beyond a defined SLA threshold — typically 7 days for standard accounts, less for Platinum. Aging cases are reviewed weekly by CSMs and account managers. The lack of automated aging alerts forces manual case-by-case review, contributing to 20–25% of Account Management time.
- **Client Snapshot** — G&A's term for the client profile view in ClientSpacePro. The "Client Snapshot" panel contains service agreements, contact records, and basic account data. Currently does not aggregate data from PRISM, TLM, WorkSight, or Cornerstone — this is the gap that Opp A's Unified 360 Dashboard addresses.
- **CSA (Client Service Agreement)** — The formal service agreement defining what services a client receives from G&A. Long-tenured and acquired clients often have outdated CSAs that no longer reflect actual service usage, creating uncertainty during upsell conversations and making it impossible to rely on the CSA as a source of truth.
- **NPS (Net Promoter Score)** — Client satisfaction metric collected monthly via Qualtrics. Responses classify clients as Promoters (9–10), Passives (7–8), or Detractors (0–6). Detractor cases trigger investigation and CSM engagement. The broken Qualtrics→ClientSpace data mapping (all data dumped to a single field) prevents accurate Power BI reporting on NPS trends.
- **QBR (Quarterly Business Review)** — Formal quarterly meeting between a P/G CSM and the client's key contacts to review service performance, open issues, and strategic priorities. Meeting preparation currently requires manual navigation of 5+ systems, taking 15–30 minutes per meeting.
- **SLA (Service Level Agreement)** — Defined response time expectations for case handling or escalation acknowledgment. G&A currently lacks formal SLAs for escalation routing to internal departments. Opp B's automated escalation routing introduces SLA enforcement (24h/48h auto-escalation timers) to create accountability.
- **WSE (Worksite Employee)** — An employee of a G&A client company. WSEs interact with G&A directly for platform questions, paycheck issues, benefits inquiries, and HR matters. HR Support Specialists handle WSE inbound calls — the population targeted by Opp D (AI Customer Experience).

### Systems & Technology Terms

- **ClientSpacePro** — The PEO-specific case management CRM used by Client Success as the system of record for all cases, accounts, contacts, and escalations. Has slow dashboard load times that add cumulative delay to daily review sessions. No native integration with Outlook, Teams, PRISM, TLM, or Cornerstone.
- **Ciklum** — The target AI/automation platform vendor identified for Opp D (AI Customer Experience — Inbound & Silver/Bronze). Ciklum would provide the AI layer integrated with WorkSight's knowledge base to enable auto case creation, AI-generated documentation, and real-time KB search for inbound agents.
- **Power BI** — Microsoft's business intelligence platform used by Client Success leadership for NPS dashboards and reporting. Power BI's NPS reporting is currently broken because the Qualtrics→ClientSpace data mapping dumps all survey data into a single text field rather than mapping NPS scores, comments, and categories to dedicated fields.
- **TalkDesk** — The telephony platform handling all inbound client and WSE calls. A previously functional integration auto-populated caller identity and case context from ClientSpacePro based on caller phone number — this integration is no longer functional. All case data entry is now fully manual on every call.
- **WorkSight** — G&A's client-facing portal and knowledge base for clients and WSEs. The portal contains documentation for common platform and HR questions, but the search functionality is documented as poor — clients cannot effectively find relevant articles, driving avoidable inbound call volume to the HR Support Specialist team.

### Retention & Attrition Terms

- **Churn Propensity Model** — An ML-based scoring model (Initiative E) that assigns a continuous churn risk score to each account by aggregating NPS trends, case volume and aging, escalation history, service utilization, and account tenure. Scores are surfaced monthly in ClientSpace to enable proactive CSM and Client Advocate intervention before churn occurs.
- **Controllable Churn** — Client attrition attributable to reasons within G&A's ability to influence — primarily Customer Service Issues, Price, and Medical Rates Too High. In 2025, controllable churn accounted for 350 accounts and $18.2M in revenue (59.7% of total revenue lost). The churn propensity model specifically targets this segment.
- **Non-Controllable Churn** — Client attrition driven by client-side events outside G&A's ability to influence — Business Closed, Business Sold, Financial Issues, and G&A-initiated terminations. In 2025, non-controllable churn accounted for 330 accounts and $12.2M in revenue. These accounts are excluded from the churn propensity model's intervention targeting.

---

## 08 · Submission Guide

**Eyebrow:** Submission Guide

**What We Need From You**

Your response must address all six items below. Responses should focus on the two PRD priority initiatives: Opp A (Unified Client 360 Dashboard) and Opp E (AI Churn Propensity Model). Quality over length — a specific response beats a comprehensive generic one.

### Required Submission Components

**1. Proposed Approach & Workplan**
What is your phasing? Which initiative do you tackle first and why? What does the first 30–60–90 days look like? Be specific about sequencing — how do you phase the Unified 360 Dashboard (Opp A) alongside the AI Churn Propensity Model (Opp E)? Are these parallel build tracks or sequential? What are the critical path dependencies in your plan?

**2. Architecture & Technical Design**
How do you architect the Unified 360 Dashboard against the ClientSpace-centric stack — specifically the five-system aggregation requirement (ClientSpace, WorkSight, PRISM, TLM, Cornerstone) and the Qualtrics data mapping fix needed to correctly surface NPS scores? What AI models, frameworks, and integration patterns?

For the AI Churn Propensity Model: how do you design the ML pipeline — feature engineering from ClientSpace/Qualtrics, model training on 2020–2025 attrition data, and monthly score delivery back into ClientSpace? Include a system architecture diagram. Address which components require external build vs. native ClientSpace configuration.

**3. Effort, Timeline & Cost**
Build cost by initiative, ongoing infrastructure cost, proposed pricing model. Include G&A-side resource requirements (who needs to be involved, how much of their time). Separate build cost from run cost — a low build / high run structure is not acceptable without justification.

**4. Data Cost Management & PII Handling**
How do you handle PII in LLM and ML processing — client contact records, NPS survey comments, and case content used in the 360 Dashboard? For the Churn Propensity Model: how is client behavioral data stored, processed, and protected? What is your data residency approach? Expected token and compute cost for the 360 Dashboard at steady state.

**5. Working Demo / POC**
**(A) Unified Client 360 Dashboard:** Show a mock ClientSpace screen aggregating data from at least three source systems (e.g. case history, NPS score, open escalations, service utilization) into a single client snapshot view — demonstrating how a CSM would prepare for a touchpoint meeting without navigating multiple systems. Include how the AI health score would be surfaced and how the Qualtrics NPS data fix enables the dashboard.

**(E) AI Churn Propensity Model:** Present a sample model output showing 5–10 accounts with their churn risk scores, the top contributing signals (e.g. NPS trend, escalation frequency, case volume), and the recommended intervention action for each. Show how scores would surface in ClientSpace so CSMs and Client Advocates can prioritise retention outreach. Include a brief description of the training data approach using the 2020–2025 attrition dataset.

*Video recording of a live demo is accepted if a live session is not possible before the deadline.*

**6. Relevant Experience**
2–3 specific examples of AI or automation solutions built for client success, CRM, or B2B service environments — ideally including at least one unified dashboard or cross-system aggregation build and one churn or propensity scoring model. For each: problem, solution, systems integrated, and measurable outcome (churn reduction, revenue retained, NPS improvement, or client preparation time saved preferred). Include the team that would work on this engagement and their relevant experience with ClientSpace and Qualtrics specifically.

### Evaluation Criteria

| Criterion | Weight | What We Are Looking For |
|-----------|:------:|-------------------------|
| **Working POC / Demo Quality** | 30% | Does the Unified 360 Dashboard demo show realistic ClientSpace aggregation across the five source systems with a credible AI health score? Does the churn propensity demo surface risk scores in a way that is actionable for a non-technical CSM or Client Advocate? |
| **Architecture Credibility** | 25% | Is the 360 Dashboard design realistic given the five-system aggregation requirement? Is the Qualtrics data mapping fix credibly addressed as a prerequisite? Is the ML pipeline for the churn model well-designed — feature engineering from ClientSpace/Qualtrics, training on 2020–2025 attrition data, and retraining cadence? |
| **Relevant Experience** | 20% | Have you built unified dashboard or cross-system aggregation solutions for CRM or service environments? Have you built churn or propensity scoring models for B2B service businesses? ClientSpace and Qualtrics experience specifically valued. |
| **Cost Realism & PII Strategy** | 15% | Is build cost credible for the 360 Dashboard (five-system integration) and the churn model (ML build + monthly inference)? Is PII handling for client behavioral data and NPS survey content explicitly addressed? Are Qualtrics integration costs scoped credibly as a prerequisite for Opp A? |
| **Speed to Value** | 10% | What is the fastest path to a working prototype of either Opp A or Opp E? What can be demonstrated or piloted within 60–90 days? How do the two PRD priority initiatives sequence relative to each other? |

> **Submit to:** tsagireddy@alixpartners.com &nbsp;|&nbsp; **Deadline:** TBD

---

*G&A Partners · AI Client Success Operations PRD · Confidential · Preliminary — Subject to Change*
