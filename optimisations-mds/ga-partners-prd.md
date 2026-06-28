# G&A Partners — AI-Enabled Sales Workflow PRD

> **Partner Evaluation Package · May 2026**
> Confidential · Partners Only — Preliminary, Subject to Change

G&A Partners is evaluating strategic AI development partners to design and build an AI-enabled sales workflow. This document provides everything a partner needs to understand the opportunity, the current state, and what a winning response looks like.

---

## 1. Overview

### What's Inside

| # | Section | Summary |
|---|---------|---------|
| 01 | **Overview** | Key contents of this document, scope and timeline for the partner evaluation, and the point of contact for all questions and submissions. |
| 02 | **Business Context** | What G&A Partners is, the three product lines, the sales organization, and key performance metrics. Read this first. |
| 03 | **Process Flow** | A visual swimlane of the full end-to-end sales process across functional roles — from lead sourcing through closed-won handoff to onboarding. Current state with systems labeled. |
| 04 | **Process Deep Dive** | Stage-by-stage breakdown: what happens today, where the pain is, and what needs to change. Partners should spend most of their time here. |
| 05 | **Business Impact** | What we expect partners to automate to reduce the time salespeople spend across each step of the process. |
| 06 | **Systems & Technical** | Full inventory of systems in scope, integration status, and API considerations. For the partner's technical team. |
| 07 | **Glossary** | Definitions of all PEO industry terms, G&A-specific acronyms, and sales process terminology used throughout. |
| 08 | **Submission Guide** | What we are looking for from partners, how we evaluate and qualify partners, and what a winning response looks like. |

### Scope & Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| **PRD Shared** | May 29, 2026 | This document distributed to select partners |
| **Partner Response Deadline** | June 10, 2026 | Approach, architecture, cost, demo/POC, relevant experience |
| **Partner Presentations** | TBD | Live Q&A and demo walk-through with G&A leadership |

### Point of Contact

**Engagement Lead** — All questions and submissions should be directed to:

**Tilak Sagireddy** · tsagireddy@alixpartners.com

---

## 2. Business Context — G&A Partners Business Overview

### What G&A Partners Does

**The Business** — G&A Partners is a leading Professional Employer Organization (PEO) serving worksite employees (WSEs) across the United States. We co-employ clients' employees — administering payroll, benefits, HR, workers' comp, and risk management on their behalf. Revenue is driven by **WSE count × per-employee-per-month (PEPM) fee**, plus arbitrage on benefits and workers' comp programs.

**Three Product Lines:**

- **PEO** — Full co-employment. Client uses G&A master health plan and/or WC program. Highest PEPM and margin. Majority of revenue.
- **ASO** — Administrative services only. Client retains own insurance. Lower PEPM, more admin overhead.
- **HCM (iSolved)** — Standalone payroll/HR software. Separate tech stack and team. Out of scope for Phase 1.

### 2025 Performance

| Metric | Value |
|--------|-------|
| Gross Margin Closed | **$26.6M** |
| Deals Closed | **932** |
| Average GM Per Deal | **$28K** |

### 2026 Goal

| Metric | Value |
|--------|-------|
| Gross Margin Target | **$32.5M** |

### 2026 Sales Team

**Coverage: 143 professionals · 20 sub-regions · 10 open positions**

| Group | Count | Notes |
|-------|-------|-------|
| Total Headcount | 143 | Field sales professionals |
| Business Advisors | 91 | + 6 Sr. BAs |
| HCM Consultants | 10 | Dedicated HCM team |
| RSDs / VPs / CRO | 26 | 17 RSD + 8 VP + 1 CRO |
| Open Positions | 10 | Not shown on coverage map |

**Roles:**

- **Business Advisors — High Volume** — Clients with 20–500+ WSEs. Own the full sales cycle. Receive significant volume of leads from brokers and referral partners (where they spend most of their time). Less time on outbound prospecting.
- **Business Advisors — Low Volume** — Clients with 20–500+ WSEs. Own the full sales cycle. Spend most of their time on prospecting and working the full sales process — from sourcing leads through close.
- **Inside Sales Reps (ISRs)** — Clients with 1–25 WSEs. Own the full sales cycle.
- **SDRs** — Lead prospecting — setting initial meetings for BAs through cold calling and email sequences.
- **Regional Sales Admins (RSAs)** — Help BAs with manual work — document routing, CRM data entry, and administrative support.

### What We Are Looking For

We are looking for solutions across three areas:

1. **Better leads in** — Higher-quality prospecting powered by intent data so BAs focus on accounts most likely to convert.
2. **Cut admin from the sales process** — BAs spend a significant portion of their time on admin activities, document prep, and CRM entry. Automating these steps frees reps to focus on selling.
3. **Elevate the post-sale experience** — A structured onboarding handoff that accelerates onboarding for clients.

> **A note to partners:** Do not be constrained by the systems listed in this document. The current stack is documented as context, not as a constraint. If you believe a different architecture, platform, or toolset better meets the business requirements, that is a fair and encouraged response. We are evaluating the best solution to the problem — not the most compatible one with what we already have.

---

## 3. Process Flow — End-to-End Sales Process (Current State)

Three swimlanes by sales role across six phases.

**Legend:** Start/End nodes · Activity (role shown by swimlane) · Decision Gate

### Phases

1. Prospecting
2. Qualification
3. Pricing
4. Research & Proposal
5. Demo & Closing
6. Handoff

### Business Advisors (BA) Lane

| Phase | Steps (systems) |
|-------|-----------------|
| 1 · Prospecting | **Start** → Work 600 Assigned Accounts (Salesforce · ZoomInfo) → Contact Captured in Salesforce → Initiate Outreach Sequence (Outreach.io) |
| 2 · Qualification | Initial Meeting (Terret AI · Outlook) → Request Client Data (Email) → Create Opportunity in SF (Salesforce → ClientSpace) |
| 3 · Pricing | Upload to ClientSpace (WC + PEPM) → **[Decision: Medical Quote Needed?]** → Clean & Normalize Census (RSA/Offshore · Excel) → Upload to Milliman HERO (RSA · HERO · Gradient · State-Specific) → **[Decision: Master Plan Approved?]** → If Declined → BA Reaches Out to GAB (Email · Benefiter · Alliant) |
| 4 · Research & Proposal | Research Company (ZoomInfo · Web · AI) → Build Proposal + Cost & Benefits Comparison (PandaDoc · AI ad-hoc) |
| 5 · Demo & Closing | Product Demo + Q&A (Manual) → Negotiate + Sign CSA (PandaDoc · DocuSign) |
| 6 · Handoff | Handoff to Payroll & Benefits Ops (Email · ClientSpace) → **Closed Won** |

**RSA / Offshore sub-lane (Phase 3):** Build Rate Comparison Table (Excel · Offshore team)

### SDR Lane

| Phase | Steps (systems) |
|-------|-----------------|
| 1 · Prospecting | Work SDRQ + Pull from 5500 Report (Salesforce SDRQ · 5500) → Audit Account: ZoomInfo + LinkedIn → Add Contacts to Outreach Sequence (Outreach.io) → Parallel Dial via Orum (4 simultaneous) |
| 2 · Qualification | Meeting Set → Open Opportunity in SF (Salesforce) → Warm Handoff to BA (Email · Salesforce) |

### ISR Lane

| Phase | Steps (systems) |
|-------|-----------------|
| 1 · Prospecting | Work Assigned Accounts + Audit Contacts (Salesforce · ZoomInfo) → Sequence + Parallel Dial via Orum (Outreach.io · Orum) |
| 2 · Qualification | Initial Meeting (Terret AI · Outlook) → Create Opportunity in SF (Salesforce → ClientSpace) |
| 3 · Pricing | Upload Data + Get Pricing (ClientSpace) |
| 4 · Research & Proposal | Proposal + Comparison (PandaDoc · AI ad-hoc) |
| 5 · Demo & Closing | Demo + Sign CSA (PandaDoc · DocuSign) |
| 6 · Handoff | Handoff to Ops (Email · ClientSpace) |

### Key Systems by Phase

| Phase | Systems |
|-------|---------|
| 1 · Prospecting | Salesforce, ZoomInfo, 6sense, Outreach.io, Orum, 5500 Report |
| 2 · Qualification | Salesforce, ClientSpace, Terret AI |
| 3 · Pricing | ClientSpace, HERO/Gradient, State-Specific |
| 4 · Research & Proposal | ZoomInfo, PandaDoc, AI (ad-hoc) |
| 5 · Demo & Closing | PandaDoc, DocuSign |
| 6 · Handoff | ClientSpace, PrismHR |

---

## 4. Process Deep Dive — How AI Can Help Improve the Sales Process

Six phases from the Process Flow. Each step lists the problem today, current state, current challenges, and the AI/automation target.

### Step 1 — Prospecting

#### 1. Contact Cleaning & Validation
*60–70% of SDR time spent here. The biggest time drain across all three roles.*

- **Current State:** SDRs spend 24 hrs/week auditing accounts — cross-referencing ZoomInfo + LinkedIn. Mass-loading contacts without auditing means ~80% are invalid (wrong person, fax, left company). BAs have Outreach for cold calling but it is not as efficient as Orum — and they do not have access to Orum.
- **Current Challenges:** 2–3 min per account manually. 15,000 SDR accounts × 2 min = impossible. If done fast: terrible data; if done carefully: no time left to call. BAs have no Orum ($300/seat) — no incentive to do this manually.
- **AI / Automation Target:** AI agent scrubs every account (ZoomInfo + LinkedIn validation, finds 2–3 correct contacts, flags stale data). SDRs go from 24 hrs/week data prep → near zero, with 35+ hrs/week calling. All 600 BA accounts auto-cleaned and sequenced without BA effort.

#### 2. Rules-Based Outreach Sequencing
*Every email today is manual and generic. Bulk-send is killing deliverability.*

- **Current State:** No rules routing contacts to the right sequence — every rep decides manually. Outreach bulk-send (top of hour, tracking pixels, opt-out links) triggering spam filters. Email response rates have plummeted significantly in the last few months — suspected spam filter issue.
- **Current Challenges:** Templates locked — reps cannot personalize; generic emails go to all contacts the same way. Emails sent from Outreach domain, not gnapartners.com — further hurts deliverability. Renewal date, competitor, and intent signal all available but not used to auto-route.
- **AI / Automation Target:** Rules-based auto-sequencing — renewal date + competitor + intent score determines which sequence. AI writes a personalized first line per contact using intent topics and company context. Emails sent from gnapartners.com via Outlook — not Outreach bulk-send.

#### 3. Intent-Driven Call Prioritization
*Who to call today should come from data, not gut feel.*

- **Current State:** SDRs have some filtering on hot deals vs. rest — categorization exists, but the opportunity is to fully automate priority ranking. BAs make near-zero outbound calls (no incentive when referral pipeline is sufficient). High-intent ZoomInfo signals not auto-piped into Salesforce or assigned to a rep.
- **Current Challenges:** SDRs manually partition queue (hot number → PEO accounts → others) — 30+ min/day. BAs mostly rely entirely on referral channels; outbound is reactive at best. No alert when a company crosses an intent threshold — it just sits in the database.
- **AI / Automation Target:** Daily pre-built call queue per rep in Orum — sorted by intent score, renewal proximity, competitor flag. High-intent ZoomInfo signal → auto-assigned to rep by region and availability in Salesforce. BA top-10 prioritized list; remaining calls auto-routed to SDR on BA's behalf. Opportunity for an AI agent to make outbound calls directly on behalf of BAs — surfacing only qualified live conversations for rep follow-up.

### Step 2 — Qualification

#### 4. Data Request & Document Collection
*Every deal requires a manual email asking for census, WC dec pages, invoices. No tracking, no follow-up automation.*

- **Current State:** No standard data request template — written fresh each time by each rep. No tracking of what has been received vs. outstanding. Follow-up emails for missing docs also manual — deals stall waiting.
- **Current Challenges:** BA or RSA manually emails prospect after initial meeting requesting census, WC dec pages, current invoices, FEIN. 3–7 day average delay waiting for docs; no visibility to sales leadership on where each deal is. Data arrives in varying formats (PDF, Excel, CSV) requiring manual handling.
- **AI / Automation Target:** Auto-trigger standardized data request email on opportunity creation in Salesforce. Smart doc tracker flags received vs. outstanding; auto-sends follow-up at 48hr and 96hr if incomplete. BA only notified when full package received or manual escalation needed. Self-service portal where prospects upload required documents directly — AI scans for completeness and sends periodic reminders until complete.

#### 5. Opportunity Creation & CRM Logging
*Meeting set → opportunity creation → CRM update is entirely manual. High-volume reps skip it.*

- **Current State:** BA manually creates opportunity in Salesforce after every meeting — fields typed from scratch. Salesforce → ClientSpace integration exists but requires multiple manual steps. Activities not logged in Salesforce don't count toward KPI points — high-volume reps stop logging.
- **Current Challenges:** Terret AI records some meetings but summaries not pushed to Salesforce — BA types notes manually. CRM logging estimated at <50% compliance for high-volume BAs. SDR → BA handoff via email — context quality varies by rep.
- **AI / Automation Target:** Terret AI summary auto-pushed to Salesforce opportunity + ClientSpace simultaneously. Auto-create pre-populated opportunity from call data — BA confirms rather than types. AI generates structured SDR→BA handoff brief with prospect context, intent data, and renewal date. AI sends a follow-up email with next best action based on the call transcript.

### Step 3 — Pricing

#### 6. Census Cleaning & Underwriting Submission
*1–2 hours of manual work per deal before a single rate is returned.*

- **Current State:** Census arrives in varying formats — RSA manually cleans, normalizes, fills gaps. HERO / Gradient / state-specific platforms require separate manual upload after census is clean. If prospect declined from master plan: separate manual email per carrier for open market rates.
- **Current Challenges:** RSA cleans census in Excel (normalize headers, fix date formats, remove duplicates) — 1–2 hrs/deal. BA or RSA manually enters data into underwriting platform (HERO, Gradient, or state-specific). HERO decline = BA manually emails GAB separately per carrier (not one consolidated request).
- **AI / Automation Target:** AI extracts and normalizes census from any format (PDF/Excel/CSV), flagging anomalies for review only. AI pre-fills underwriting platform from clean census — BA approves before submission. HERO decline auto-triggers consolidated open market request to GAB — all carriers in one action. AI scans BA inboxes automatically, detects incoming census/insurance documents, extracts and cleans the data, and pre-fills both the underwriting platform and ClientSpace — without the BA touching the files.

#### 7. Admin Pricing in ClientSpace
*25+ minutes of manual data entry per deal — biggest single CRM time sink in the sales process.*

- **Current State:** BA enters deal parameters into ClientSpace manually (PEPM, SUTA, WC) — every deal, every time. Triggers approval chain: credit check, risk review, VP approval.
- **Current Challenges:** 25+ minutes manual entry per proposal — high-volume BAs report this as their most avoided task. Approval chain status only visible to operations — BA must ask someone to find out. Pricing exceptions require separate escalation with no auto-routing.
- **AI / Automation Target:** Pre-populate ClientSpace from Salesforce opportunity data — BA confirms only deltas. Real-time approval status visible to BA (e.g., "Credit check: complete. Risk review: Day 2"). Auto-escalate pricing exceptions with deal context pre-filled — no BA action to initiate.

### Step 4 — Research & Proposal

#### 8. Company Research & Proposal Assembly
*Top BAs do this in 15 min with AI. Average BA takes 2.5 hours manually.*

- **Current State:** Average BA builds proposal manually — rates + cost comparison + benefits grid + narrative → Word/PandaDoc. No shared prompts, no standard output — proposal quality varies entirely by rep.
- **Current Challenges:** Top BAs use AI for four tasks: (1) G&A-branded call review, (2) competitor cost comparison, (3) benefits plan comparison, (4) RFP data scrub. Average BA does none of these — 2–2.5 hrs per proposal. RSA builds comparison table manually in Excel — wrong ~70% of the time per BA interviews.
- **AI / Automation Target:** AI assembles proposal from call summary + rates + competitor invoice → populated PandaDoc template. Target: proposal-ready draft in under 30 minutes for every rep.

### Step 5 — Demo & Closing

#### 9. Demo Scheduling & Live Q&A Support
*Manual scheduling adds 2–3 days. BAs answer questions from memory — hard questions lose deals.*

- **Current State:** Tech demo scheduled manually via email — adds 2–3 days to deal cycle. BAs answer prospect questions from memory during demo — no real-time knowledge base support. Post-demo follow-up email written manually — no standard format.
- **Current Challenges:** One BA built a Q&A doc in AI covering ~80% of common questions — not standardized. No auto-scheduling link — every demo requires back-and-forth email coordination. No AI assist during live calls to surface answers from G&A knowledge base.
- **AI / Automation Target:** Auto-scheduling link triggered on prospect demo request — no back-and-forth. AI Q&A assistant surfaces answers from SalesHood knowledge base during live demo. Post-demo recap + next steps auto-generated for BA one-click send.

#### 10. Contract Execution & Closed-Won Handoff
*Post-signature handoff is fully manual — the only step with zero automation today.*

- **Current State:** BA manually uploads documents to ClientSpace after CSA signed. BA manually emails onboarding director with deal context — no structured trigger. Deal stall: no alert when a deal goes cold in late stage.
- **Current Challenges:** DocuSign completion requires BA to package docs, upload to ClientSpace, email onboarding PM. No deal stall visibility — BA has no alert when deal is inactive for 5+ days.
- **AI / Automation Target:** DocuSign completion webhook: auto-package docs → ClientSpace upload → onboarding task → PM notification. BA receives confirmation — zero manual action required after signature. Deal stall alert: no activity in late-stage deal for 5+ days triggers BA notification.

### Step 6 — Handoff & Post-Sale

#### 11. Onboarding Handoff
*Manual email with varying context. Delay in handoff = delay in revenue recognition.*

- **Current State:** BA emails onboarding director manually after CSA signed — deal context often incomplete. No structured data package transfers from sales to operations. Delay in onboarding start costs revenue recognition time.
- **Current Challenges:** PM assigned manually from team of 4 implementation specialists. No auto-trigger — handoff only happens when BA remembers to send the email. Handoff delay estimated at 1–3 days post-signature.
- **AI / Automation Target:** DocuSign webhook auto-triggers structured onboarding brief to ClientSpace and PM. Client welcome email sent immediately after signing — zero BA action. Handoff delay: 1–3 days → <5 minutes.

#### 12. Loss Intelligence & Referral Loop
*Best lead channel (41% close rate) is the least automated. Loss reasons are unreliable.*

- **Current State:** BA self-reports loss reason in ClientSpace dropdown — subjective and often inaccurate. No transcript analysis, no pattern detection, no feedback into training content. Referral asks not triggered by client signals — entirely manual and ad-hoc.
- **Current Challenges:** Loss reason accuracy estimated at <50% — CSO confirmed top reps may not give genuine reasons. 147 referral leads in 2025 at 41% close rate — best channel but manually managed. No signal-triggered outreach to happy clients at key milestones.
- **AI / Automation Target:** Terret AI transcript analysis on Closed Lost → structured tags → pattern dashboard for leadership. Auto-trigger referral ask at 6-month client anniversary and NPS promoter response. Loss patterns fed back into SalesHood training content quarterly.

---

## 5. Business Impact — Where Time Is Spent Today

Estimated hours per week per role on each activity.

> **Demo focus request:** Partners should focus on two demos — **one on Prospecting** and **one on Research & Proposal Assembly**.

| # | Task | BA High Vol (hrs/wk) | BA Low Vol (hrs/wk) | SDR (hrs/wk) | ISR (hrs/wk) | Priority | Automation Goal |
|---|------|:---:|:---:|:---:|:---:|:---:|-----------------|
| **Prospecting** | | | | | | | |
| 1 | Contact Scrubbing & Outreach Sequencing | 2 | 12 | 20 | 15 | High | **Fully automate** contact scrubbing and outreach sequencing — zero time spent by BAs, SDRs, or ISRs. AI agent scrubs accounts (ZoomInfo + LinkedIn), identifies right contacts, and auto-sequences personalized emails from the G&A domain — no rep action. |
| 2 | Cold Calling | 1 | 10 | 12 | 10 | High | Explore an **AI-ranked daily call queue** surfacing highest-priority accounts first. Interested in whether a **Voice AI agent can make live outbound calls** directly — routing only qualified, interested prospects to a human rep. |
| **Qualification** | | | | | | | |
| 3 | Data Requests & Follow-ups | 4 | 1 | — | 1 | Low | Today ≥30 min/opportunity chasing data. Want a **self-service portal** for clients to upload all documents; AI scans for completeness and sends automatic reminders until the full package is received. |
| 4 | CRM Activity Logging (Post-Call) | 4 | 1 | 2 | 1 | Medium | Today 15–20 min/call summarizing notes. Want AI to capture the transcript via Terret AI and auto-populate CRM notes, next steps, and next best actions — rep only reviews and confirms. |
| **Pricing** | | | | | | | |
| 5 | Census Cleaning & Data Entry to HERO | 4 | 1 | — | 1 | Medium | Today ≥30 min finding quote requests, cleaning census, uploading to HERO. Want AI to scan inboxes, detect documents, extract/clean census, and upload to HERO — BA time down to **5 min review**. |
| 6 | ClientSpace Data Entry for Pricing | 3 | 1 | — | 1 | Medium | Today ~25 min/deal. Want to pre-populate all pricing fields from Salesforce opportunity data — BA time down to **5 min for confirmation only**. |
| **Research & Proposal** | | | | | | | |
| 7 | Research & Proposal Assembly (Cost + Benefits Comparison) | 16 | 4 | — | 4 | High | Today ~120 min (2–2.5 hrs)/opportunity. Want AI to assemble the full proposal (company research, plan comparison, cost comparison from competitor invoice) — **proposal-ready draft in under 30 min** with a clear talk track. |
| **Handoff** | | | | | | | |
| 8 | Post-Signature Handoff to Onboarding | 6 | 2 | — | 2 | Medium | Today 30–45 min/deal. Want **under 5 min** — auto-send client a document upload link and a scheduling link for their first onboarding call, triggered on contract signature, no BA action. |
| **Other** | | | | | | | |
| 9 | Training; Meetings — Internal & External Networking | 10 | 9 | 6 | 6 | Low | Part of standard business operations. No automation target. |
| | **Total Hours / Week** | **50** | **40** | **40** | **40** | | 8 opportunities/week (High Vol) · 2 opportunities/week (Low Vol) |

### Demo Priorities

**🎯 Demo Priority #1 — Prospecting** — SDRs spend 21 hrs/week and low-volume BAs spend 12 hrs/week on contact scrubbing and outreach before a single call is made. We want to see AI-driven account scrubbing, contact validation, and auto-sequencing of personalized emails from the G&A domain. Voice AI for live outbound calls also welcome.

**🎯 Demo Priority #2 — Research & Proposal** — High-volume BAs spend 16 hrs/week (120 minutes per opportunity) on proposal assembly. A working demo of AI pulling a competitor invoice comparison and assembling a proposal with company research, delivered in under 30 minutes, would directly demonstrate the highest-impact automation in the selling process.

---

## 6. Systems & Technical Reference

Full inventory of systems currently in scope, their integration status, and API considerations.

> **Please do not feel constrained by the existing systems or architecture.** We are open to all ideas — feel free to propose the architecture that makes the most sense to meet the business requirements.

### Systems in Scope

| System | Purpose | Stage | Current Integration Status |
|--------|---------|-------|----------------------------|
| **— PROSPECTING —** | | | |
| **ZoomInfo** | Lead database, intent signals, contact data, company summaries | Prospecting | Connected to Salesforce. Intent topic data not flowing as a Salesforce filterable field. |
| **6sense** | ABM intent signals, buying stage, account prioritization | Prospecting | Connected to Salesforce. Daily email digest sent to BAs highlighting prioritized accounts with high intent scores. |
| **Outreach.io** | Email sequencing, cold calling, prospect engagement | Prospecting | Connected to Salesforce. Sequences pre-built — BAs cannot edit template content but can use Salesforce custom fields via liquid syntax merge tags. |
| **Orum** | Auto-dialer for SDR/ISR cold calling — parallel dial up to 4 contacts simultaneously | Prospecting | Connected to Salesforce. |
| **— CRM & OPPORTUNITY MANAGEMENT —** | | | |
| **Salesforce** | Primary CRM — opportunity tracking, account management, pipeline visibility | All stages | Central hub. Connected to Outreach.io and ClientSpace. |
| **ClientSpace** | PEO-specific CRM — pricing (PEPM, SUTA, WC), case management, onboarding trigger | Pricing through close | Connected to Salesforce. Manual steps still required despite the integration existing. |
| **— MEETING INTELLIGENCE —** | | | |
| **Terret AI** | Meeting recording, transcription, summaries, next steps | Qualification onwards | Used by some BAs. Not currently connected to Salesforce — summaries not auto-pushed to CRM. |
| **— UNDERWRITING & PRICING —** | | | |
| **Milliman HERO / Gradient / State-Specific Platforms** | Medical underwriting submission portal — varies by state | Pricing | Manual — no API connection. RSA or BA manually enters data after census is cleaned. |
| **— PROPOSAL & CONTRACT —** | | | |
| **PandaDoc** | Proposal creation and contract execution (CSA) | Proposal to close | Transitioning from Word templates. DocuSign used for e-signature. |
| **DocuSign** | E-signature for CSA execution | Closing | Standard integration. CSA signing currently does not auto-trigger onboarding. |
| **— AI LAYER (CURRENT) —** | | | |
| **Claude / AI (ad-hoc)** | Used by a small number of BAs for research, cost comparisons, proposal drafting, data scrubbing | Proposal | Individual accounts only. No shared prompts, no integrations, no standardization across the team. |

---

## 7. Glossary

### PEO Industry Terms

- **PEO** — Professional Employer Organization. Co-employs a client's workforce, taking on employer responsibilities for payroll, benefits, HR compliance, and workers' comp. The client retains day-to-day operational control of employees.
- **ASO** — Administrative Services Organization. Similar to PEO but without co-employment — the client remains employer of record and retains their own insurance policies. G&A provides admin services only.
- **HCM** — Human Capital Management. G&A's standalone payroll/HR software product built on iSolved. Separate tech stack and team from PEO/ASO. Out of scope for Phase 1.
- **WSE** — Worksite Employee. An employee at a client company co-employed by G&A under a PEO arrangement. WSE count × PEPM = the revenue driver for PEO contracts.
- **PEPM** — Per Employee Per Month. The administrative fee G&A charges per worksite employee per month. Higher when client uses G&A's master health and WC programs; lower when client retains own coverage.
- **Master Plan** — G&A's master health insurance plan. When clients join, G&A earns benefits arbitrage. Medical underwriting via Milliman HERO is required before a prospect can join.
- **WC** — Workers' Compensation insurance. G&A offers master WC programs through TMI and Zurich. Clients joining contribute to G&A's margin.
- **SUTA** — State Unemployment Tax Act. G&A manages SUTA filings and rates for PEO clients. SUTA margin is a revenue component factored into ClientSpace pricing.
- **GM / Gross Margin** — The primary revenue metric at G&A — net margin after paying client payroll, benefits, and direct service costs. Sales targets and comp plans are denominated in annualized GM.

### G&A Sales Process Terms

- **BA** — Business Advisor. G&A's primary sales role. Owns the full sales cycle for accounts with 20+ WSEs. Compensated on annualized GM closed.
- **ISR** — Inside Sales Representative. Handles smaller accounts (1–25 WSEs). Owns the full sales cycle for smaller deals through outbound calling and digital inbound leads.
- **SDR** — Sales Development Representative. Focuses exclusively on setting initial meetings for BAs through cold calling (Orum) and Outreach.io sequences. Does not carry a closing quota.
- **RSA** — Regional Sales Admin. Supports BAs with document routing, CRM data entry, and census cleaning. Role significantly impacted by the proposed automation.
- **IM** — Initial Meeting. The first formal call/meeting between a BA and a qualified prospect. Setting 4 IMs per week is the primary lag KPI for BAs (25 KPI points each).
- **CSA** — Client Service Agreement. The master contract between G&A and a new client. Signing is the final step to Closed Won, executed via PandaDoc and DocuSign.
- **KPI Points** — A weighted activity scoring system for BA productivity. Minimum 200 points per week. Proposals = 100 pts, IMs = 25 pts, cold calls = 1 pt, sequenced emails = 1 pt (capped at 100/week). All activity must be logged in Salesforce to count.
- **SDRQ** — SDR Queue. A centralized Salesforce account (~15,000 accounts) shared across all SDRs. Created to preserve account context when SDRs turn over. SDRs work accounts in round-robin, prioritizing by renewal date and intent signals.
- **5500 Report** — A database of public insurance filings G&A uses to identify companies renewing with a known competitor in the next 120 days — a primary source for the SDRQ.
- **Project 35** — G&A's internal initiative to reach 35% operating margin by 2027, backed by TPG (G&A's private equity owner). AI investment in sales is a direct lever toward this goal.

### Systems & Technology Terms

- **ClientSpace** — G&A's PEO-specific CRM platform. Used for opportunity management, deal pricing (PEPM, SUTA, WC), case management, and onboarding triggers. Connected to Salesforce.
- **Milliman HERO** — The underwriting submission portal used to request medical rates from Milliman. Census data is submitted through HERO to obtain master health plan quotes. Varies by state — some states use Gradient or other platforms.
- **Terret AI** — AI meeting intelligence tool. Records and transcribes sales calls, generates meeting summaries and recommended next steps. Currently used by some BAs but not integrated with Salesforce.
- **6sense** — ABM platform that tracks intent signals and assigns buying stage scores to accounts. Connected to Salesforce — sends a daily email digest to BAs with prioritized high-intent accounts.
- **Outreach.io** — Sales engagement platform for email sequencing and cold calling. Sequences are pre-built — BAs cannot edit template content but AI-generated personalization can be inserted via Salesforce custom fields using liquid syntax merge tags.
- **Orum** — Auto-dialer used by SDRs and ISRs for high-volume cold calling. Can dial up to 4 contacts simultaneously, auto-leave voicemails, and navigate phone trees. Connected to Salesforce. $300/seat/month — BAs do not have access.
- **Liquid Syntax** — Outreach.io's templating language for dynamic field insertion into locked email templates (e.g. `{{account.custom_field}}`). Enables AI-generated personalized content to be inserted into Outreach sequences without template editing access.

---

## 8. Submission Guide — What We Need From You

Your response must address all six items below. Quality over length — a specific response beats a comprehensive generic one. Any format plus a working demo.

1. **Proposed Approach & Workplan** — What is your phasing? Which capabilities do you tackle first and why? What does the first 30–60–90 days look like? Be specific about sequencing decisions — we want to understand your judgment, not just your capability list.

2. **Architecture & Technical Design** — How do you architect this solution? What AI models and frameworks? How do you handle the integrations between systems to enable automation? Include a system diagram.

3. **Effort, Timeline & Cost** — Build cost by phase, ongoing infrastructure and token cost, proposed pricing model. Include G&A-side resource requirements. Be specific about assumptions.

4. **Token & Data Cost Management** — Expected LLM token cost per deal and per month at scale (100+ BAs). How do you minimize cost without degrading quality? How do you handle PII in LLM calls — census data, competitor invoices, employee records?

5. **Working Demo / POC**
   - **(A)** AI agent scrubs accounts in Salesforce using ZoomInfo + LinkedIn validation, then auto-sequences tailored emails specific to each prospect sent from the G&A Partners domain.
   - **(B)** Comparison of quotes with the prospect's current plans and putting together a proposal document with company research.
   - Video recording of a live demo is accepted if a live session is not possible before the deadline.

6. **Relevant Experience** — 2–3 specific examples of AI-enabled workflow solutions built for B2B services companies — ideally HR, benefits, insurance, or financial services. For each: problem, solution, systems integrated, measurable outcome. Include the team that would work on this engagement.

### Evaluation Criteria

| Criterion | Weight | What We Are Looking For |
|-----------|:---:|-------------------------|
| **Working POC / Demo Quality** | 30% | Does it work? Does it show real orchestration across the identified systems? |
| **Architecture Credibility** | 25% | Is the design realistic given our context? Are integrations specifically addressed? |
| **Relevant Experience** | 20% | Have you built this for a comparable company? With similar fragmented system constraints? |
| **Cost Realism & Token Strategy** | 15% | Is the build cost credible? Is run-rate manageable? Is PII handling addressed explicitly? |
| **Speed to Value** | 10% | What can be delivered and working for the team in 30–60 days? |

> **Submit to:** tsagireddy@alixpartners.com · **Deadline:** June 10, 2026
