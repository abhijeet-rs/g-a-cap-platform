# Mock Payroll Pre-Flight Validation — Demo Recording Script

**Initiative:** F — Pre-Flight Payroll Validation
**Duration:** ~4-5 minutes
**Flow:** Architecture Slides --> Select Client --> Data Fetching --> Validation Results --> Inline Fix --> Batch Push --> Remediation Checklist

> **PACING NOTE:** Walk through every step very slowly. Voiceover will be added in post-production, so each step needs breathing room. Do not rush transitions. Hover over UI elements before clicking them. Let every animation play to completion before narrating the next beat.

---

## Pre-Recording Setup

1. Open Chrome at `http://localhost:3000` (make sure dev server is running: `cd demo && npx next dev -p 3000`)
2. Open the architecture slides at `file:///Users/abhijeettiwari/Documents/ga-CAP-demo-dev/PreFlight_Validation_Architecture_Slide.html` in another Chrome tab
3. Set browser to **full screen** (Cmd+Shift+F)
4. Clear localStorage to reset state: DevTools --> Application --> Storage --> Clear site data
5. Start QuickTime screen recording: **Cmd+Shift+5** --> Record Entire Screen

---

## SLIDE 1: Current State Problem (30 sec)

**[Open PreFlight_Validation_Architecture_Slide.html --> Tab 1: Current State]**

**[PAUSE 3 seconds]**

> "Let me set context. PrismHR is G&A's primary HRIS and payroll processing platform — it's where employee records, workers' comp assignments, SUTA rates, and billing rules all live. What we're building is a pre-flight validation layer that reads PrismHR configuration via REST API, validates it against CSA Schedule 2 — the signed Client Service Agreement that defines the contractual terms — and writes fixes back to PrismHR through the same API. The reason this matters: today, configuration errors are only discovered when mock payroll fails inside PrismHR. There is no way to catch them before that point."

**[Point to the 4-step calculate-fail-fix cycle diagram]**

> "The PA runs mock payroll in PrismHR and immediately hits system calculation errors — workers' comp code mismatches, SUTA rate gaps, setup discrepancies, pay group and schedule misalignment. The SOP explicitly warns — and I'm quoting — 'DELAYS OCCUR HERE DUE TO W/C, SUTA ERRORS AND OTHER SYSTEM GENERATED ERRORS DUE TO SETUP.'"

> "The PA manually resolves each error, re-initializes payroll, and runs mock again — repeating this cycle until the run comes back clean. There's no way to predict how many iterations it takes."

**[Point to the statistics]**

> "This is a 25% time block — Payroll Consultation at 11% plus Processing at 14% — the single largest combined allocation of PA time. The testing phase stretches 5 to 7 days per client."

**[Point to the 3 pain points]**

> "Three compounding problems:"
>
> 1. "SUTA Bill Rate Review requires executive approval with a one-week SLA — and that has to happen before the first payroll can run."
> 2. "Errors that surface during mock payroll frequently resurface in the first live payroll because fixes aren't systematically tracked."
> 3. "No pre-validation exists — the PA discovers every issue reactively, inside PrismHR, one error at a time."

---

## SLIDE 2: Solution Architecture (30 sec)

**[Click Tab 2: Solution Architecture]**

**[PAUSE 3 seconds]**

> "We're replacing this with a pre-flight validation engine that checks PrismHR configuration against CSA Schedule 2 before mock payroll is ever initialized."

**[Point to Source Connectors on the left]**

**[HOVER over each connector before describing it]**

> "Four data sources feed the validator:"
>
> - "PrismHR — the employee roster, workers' comp code assignments, SUTA rate tables, and billing rules. This is the system of record we're validating."
> - "CSA Schedule 2 — the source of truth. The WC codes, SUTA coverage type, and fee structure extracted from Schedule 2 of the signed Client Service Agreement become the expected values we validate PrismHR configuration against. This is the cross-initiative synergy with Initiative D."
> - "ClientSpace — state registrations and employee location data."
> - "Informer — SUTA state rate tables and bill rate history. This is the reference source for SUTA bill rate validation and provides the data needed for executive review when non-standard rates are involved."

**[Point to the 5 Validation Checks in the center]**

> "Five deterministic checks run against the combined data — in every case, PrismHR configuration is validated against CSA Schedule 2 as the source of truth:"
>
> 1. "WC Code Match — do PrismHR employee WC assignments match the WC codes specified in CSA Schedule 2?"
> 2. "SUTA Rate Coverage — is a SUTA rate entered for every state where employees are located, and does the rate type match what CSA Schedule 2 specifies?"
> 3. "Billing Rules vs CSA — do the billing rules configured in PrismHR match the fee structure defined in CSA Schedule 2?"
> 4. "Pay Group Alignment — are pay groups and pay schedules correctly configured for the effective date?"
> 5. "Deduction Codes — are all deduction codes mapped to valid GL accounts?"

**[Point to the Pass/Fail Report on the right]**

> "Each check returns pass, warning, or critical — with severity levels, affected employee counts, source citations, and specific remediation steps."

**[Point to SUTA Pre-Approval callout]**

> "Key design decision — standard SUTA rates are pre-approved at the point of sale. Only non-standard rates escalate to the executive review queue. This removes the one-week SLA from the critical path for the majority of deals."

---

## SLIDE 3: Inline Fix & Batch Push (20 sec)

**[Click Tab 3: Inline Fix & Batch Push]**

**[PAUSE 3 seconds]**

> "When the validator finds issues, the PA fixes them inline — right inside the pre-flight screen."

**[Point to the Before vs After comparison]**

> "WC codes are corrected via dropdown selectors pre-populated with values from CSA Schedule 2. SUTA rates are entered with a rate type selector — standard versus client rate — with immediate routing logic. Deduction codes are mapped to GL accounts from a searchable list."

**[Point to the batch push section]**

> "Once all fixes are applied, one batch API call pushes every change to PrismHR. No manual data entry, no context-switching between screens."

**[Point to the remediation checklist]**

> "A live remediation checklist tracks every issue — items check off and strike through as the PA fixes them, with a running counter showing progress."

---

## SLIDE 4: APIs & Integration Approach (20 sec)

**[Click Tab 4: APIs & Integration]**

**[PAUSE 3 seconds]**

> "This slide shows the complete API integration picture. On the left, PrismHR Read APIs — 8 GET endpoints that pull employee data, WC codes, SUTA rates, billing rules, and tax jurisdictions. On the right, the Write APIs — 5 PUT/POST endpoints that push fixes back to PrismHR."

**[Point to ClientSpace and Informer API panels]**

> "ClientSpace provides 6 endpoints including the handoff page and state registration data. Informer provides 4 endpoints for SUTA bill rate tables and the pre-approved state list."

**[Point to the integration strategy section]**

> "Integration strategy: primary approach is REST API — direct, real-time, bidirectional."

---

## SLIDE 5: End-to-End Flow (20 sec)

**[Click Tab 5: End-to-End Flow]**

**[PAUSE 3 seconds]**

> "This shows where pre-flight validation fits in the complete pipeline. CSA Extraction produces the Schedule 2 data — that feeds directly into pre-flight as the source of truth. CSA pushes to ClientSpace for onboarding. Pre-Flight pushes to PrismHR to fix configuration. The result: mock payroll runs clean on the first attempt."

**[Point to the two 'What Gets Pushed Where' columns]**

> "Two distinct downstream targets: PrismHR gets WC codes, SUTA rates, and deduction mappings via PUT endpoints. ClientSpace gets the onboarding case, tasks, and documents via POST endpoints. Different systems, different APIs, connected by the extracted CSA data."

---

## STEP 1: Select Client (20 sec)

**[Switch to the app tab --> Navigate to Workspace --> Onboarding --> Pre-Flight Validator]**

**[PAUSE 3 seconds]**

> "We start in the Pre-Flight Validator. The client selector shows all clients in the onboarding pipeline."

**[Click the client selector dropdown --> Select "Acme Corp"]**

> "I'll select Acme Corp — 38 employees based in Connecticut, effective date July 1st, 2026, assigned to PA Sarah Mitchell."

**[Point to the 4 source connector indicators]**

> "All four source connectors show green — PrismHR connected, CSA Schedule 2 extraction connected with the latest extraction linked, ClientSpace connected, and Informer connected. The validator has everything it needs."

### 1a. API Endpoint Visibility

**[Click the eye icon on the PrismHR connector]**

**[HOVER over each endpoint before moving to the next]**

> "Let me click the eye icon on the PrismHR connector — this reveals the API integration details. You can see the REST endpoints: GET /api/v1/employees for the roster pull, GET /api/v1/employees/wc-codes for workers' comp assignments, GET /api/v1/suta-rates for SUTA tables. And below those, the write-back endpoints: PUT /api/v1/employees/wc-codes, PUT /api/v1/suta-rates, PUT /api/v1/deduction-mappings."

> "The eye icon keeps the interface clean for PAs while giving technical reviewers full integration visibility."

**[Click the eye icon again to collapse]**

---

## STEP 2: Data Fetching Animation (20 sec)

**[Click "Run Pre-Flight Validation"]**

> "I click Run Pre-Flight Validation — watch the data fetching sequence."

**[SLOW — let the animation play fully]**

**[Watch the fetch animation — 4 data source steps plus cross-reference]**

> 1. "Connecting to PrismHR API — pulling the employee roster, WC code assignments, and SUTA rate tables. Notice the API endpoint displayed under this step — PrismHR REST API for employees and WC codes."
> 2. "Loading CSA Schedule 2 data — WC codes and fee structure from Schedule 2 of the signed Client Service Agreement. This is the source of truth that every validation check runs against. The API endpoint shown here is the CSA extraction pipeline for Schedule 2 data — this is Initiative D's output feeding directly into Initiative F."
> 3. "Querying ClientSpace — state registrations and employee location records. The endpoint displayed is the ClientSpace API for state registrations."
> 4. "Pulling Informer SUTA data — state rate tables, SUTA bill rate history for executive review. Informer is the data source for SUTA bill rate tables and provides the historical context needed when non-standard rates require escalation."
> 5. "Cross-referencing all four sources."

**[Watch the 5 validation checks run sequentially with checkmarks appearing]**

**[SLOW — let the animation play fully]**

> "Now the five checks run — WC Code Match, SUTA Rate Coverage, Billing Rules, Pay Group Alignment, Deduction Codes — each one completing with a result indicator. Every check validates PrismHR configuration against CSA Schedule 2 as the source of truth."

---

## STEP 3: Validation Results (30 sec)

**[Results panel appears]**

**[PAUSE 3 seconds]**

> "Results are in — 3 out of 5 checks passed. One critical issue and two warnings. Each finding tells you exactly where PrismHR configuration deviates from what CSA Schedule 2 specifies."

### 3a. WC Code Validation (Critical)

**[Click to expand the WC Code Validation card — red/critical indicator]**

**[WAIT for the transition to complete]**

> "The critical finding — WC Code Validation. Three employees have workers' comp codes in PrismHR that don't match what CSA Schedule 2 defines for their roles."

**[Point to the table rows]**

> "J. Martinez is assigned WC code 8810 in PrismHR, but CSA Schedule 2 specifies CT 5606 for this role. R. Chen has 8742 — CSA Schedule 2 says CT 9012. And S. Patel has no WC code assigned at all — CSA Schedule 2 specifies CT 9083."

**[Point to source citations below the table]**

> "Notice the source citations — 'PrismHR: Employee WC Assignments' and 'CSA Schedule 2: WC Codes.' Every finding traces back to its data sources, so the PA knows exactly what's expected and where that expectation comes from."

### 3b. SUTA Rate Coverage (Warning)

**[Collapse WC, click to expand SUTA Rate Coverage — amber/warning indicator]**

**[WAIT for the transition to complete]**

> "SUTA Rate Coverage — warning level. No SUTA rate has been entered in PrismHR for Connecticut, which affects all 38 employees."

**[Point to source citations]**

> "Sources: 'PrismHR: SUTA Rate Table' and 'CSA Schedule 2: SUTA Coverage Type = CR%.' CSA Schedule 2 specifies Client Rate percentage for this client, so the validator knows what type of rate to expect."

### 3c. Deduction Code Validation (Warning)

**[Collapse SUTA, click to expand Deduction Code Validation — amber/warning indicator]**

**[WAIT for the transition to complete]**

> "Deduction Code Validation — the 401K-EE deduction code references an unconfigured GL account. This would cause a posting error during payroll processing."

---

## STEP 4: Inline Fix — WC Codes (30 sec)

**[Re-expand the WC Code Validation card]**

> "Now I fix these inline — no need to open PrismHR in another tab."

**[Click the WC code dropdown for J. Martinez --> select "CT 5606"]**

**[WAIT for the transition to complete]**

> "J. Martinez — I select CT 5606 from the dropdown. These dropdown options are pre-populated directly from CSA Schedule 2 — the source of truth for all WC code assignments."

**[Click the dropdown for R. Chen --> select "CT 9012"]**

**[WAIT for the transition to complete]**

> "R. Chen — CT 9012."

**[Click the dropdown for S. Patel --> select "CT 9083"]**

**[WAIT for the transition to complete]**

> "S. Patel — CT 9083."

**[Watch the card header transition from red to green]**

> "All three employees corrected — the check card turns green. The PA just fixed three WC code mismatches without leaving the pre-flight screen — no PrismHR navigation, no searching through employee records. Every correction maps PrismHR back to what CSA Schedule 2 specifies."

---

## STEP 5: Inline Fix — SUTA Rate (40 sec)

**[Click to expand the SUTA Rate Coverage card]**

**[WAIT for the transition to complete]**

> "SUTA rate for Connecticut. Let me explain how the pre-approval logic works before I make the fix."

**[Point to the state-specific pre-approval panel]**

> "Standard SUTA rates for common states — Texas, California, Florida, New York, Illinois, Pennsylvania, Ohio, Georgia — are pre-approved at deal close during the sales process. The PA doesn't need to trigger pre-approval for these states because it was already completed before the client reached onboarding."

**[HOVER over the pre-approved state badges]**

> "You can see the green badges for each pre-approved state in this panel. These rates are locked in and ready to use."

**[Point to the CT entry with amber clock icon]**

> "Connecticut shows an amber clock icon — it's not in the standard pre-approved list. For states like CT where CSA Schedule 2 specifies Client Rate — CR% — the PA enters the rate and selects the rate type."

**[Type "2.31" into the SUTA rate input field]**

> "I enter 2.31%."

**[Point to the rate type radio buttons]**

> "Now the rate type — this is where the routing logic matters."

**[Select "Standard Rate" --> observe the green indicator]**

> "If I select Standard Rate — green: 'Standard Rate — Pre-Approved at Sales.' The rate was already approved during the sales process, so the approval queue is bypassed. No executive review needed."

**[Switch to "Client Rate (CR%)" --> observe the amber warning]**

**[WAIT for the transition to complete]**

> "But if I select Client Rate — the system flags it amber: 'Executive SUTA Bill Rate Review Required.' It shows the deadline, the one-week SLA window, and the Informer source reference. Informer is the data source for SUTA bill rate tables — it provides the historical rate data and state rate tables that the executive reviewer needs to evaluate non-standard rates. Selecting Client Rate escalates to executive SUTA Bill Rate Review with a one-week SLA."

**[Switch back to "Standard Rate" --> observe the green indicator]**

**[WAIT for the transition to complete]**

> "For this demo, I'll select Standard Rate — already pre-approved, no executive review, no delay on the critical path. This is a significant cycle time reduction for the majority of deals."

---

## STEP 6: Inline Fix — Deduction Code (15 sec)

**[Click to expand the Deduction Code Validation card]**

**[WAIT for the transition to complete]**

> "Last issue — the 401K-EE deduction code needs a GL account mapping."

**[Click the GL account dropdown --> select "401K-Employee-Main"]**

**[WAIT for the transition to complete]**

> "I select '401K-Employee-Main' from the GL account list."

**[Watch the card header turn green]**

> "Green. All three issues resolved."

---

## STEP 7: Remediation Action Plan Checklist (15 sec)

**[Scroll down to the Remediation Action Plan section]**

**[PAUSE 3 seconds]**

> "Scroll down to the Remediation Action Plan — this is the live checklist that tracks every issue."

**[Point to the 3 checked/struck-through items]**

> "All three items are checked and struck through in green:"
>
> 1. "WC Code mismatches — 3 employees corrected to match CSA Schedule 2."
> 2. "SUTA rate for CT — entered with Standard Rate pre-approval."
> 3. "Deduction code GL mapping — 401K-EE linked to account."

**[Point to the counter]**

> "The counter reads '3 of 3 resolved.' The bottom bar confirms: 'All issues resolved inline — push fixes to PrismHR and initialize mock payroll.'"

> "This replaces the blind trial-and-error cycle. The PA sees the remediation checklist update in real-time as they fix each issue — nothing is lost between iterations."

---

## STEP 8: Batch Push to PrismHR (25 sec)

**[Click "Push All Fixes to PrismHR"]**

> "One button — Push All Fixes to PrismHR."

**[Point to the fix summary panel]**

> "The summary panel lists all five changes being pushed — three WC code updates, one SUTA rate entry, and one deduction code mapping."

### 8a. API Write-Back Visibility

**[Point to the push overlay showing PUT endpoints]**

**[HOVER over each endpoint before moving to the next]**

> "Notice the push overlay — it shows the specific PUT API endpoint for each fix. PUT /api/v1/employees/wc-codes for the three WC code corrections. PUT /api/v1/suta-rates for the Connecticut SUTA entry. PUT /api/v1/deduction-mappings for the GL account link."

> "PrismHR write-back is API-driven — PUT endpoints for WC codes, SUTA rates, and deduction mappings. One batch call, full audit trail."

**[SLOW — let the animation play fully]**

**[Watch the push animation]**

> "Authenticating with PrismHR... writing WC codes... writing SUTA rates... writing deduction codes... verifying."

**[Green "Pushed" badge appears]**

> "Pushed. One batch API call wrote all five corrections to PrismHR — no manual data entry, no switching between employee records, no copy-paste errors."

**[Point to "Re-run Validation" button]**

> "Now I can re-run the validation to confirm everything is clean."

---

## STEP 9: Re-run & All Pass (15 sec)

**[Click "Re-run Validation"]**

**[SLOW — let the animation play fully]**

> "Re-running the full validation suite."

**[Watch all 5 checks re-run and turn green]**

> "WC Code Match — pass. SUTA Rate Coverage — pass. Billing Rules — pass. Pay Group Alignment — pass. Deduction Codes — pass."

**[Point to the "5/5 checks passed" summary]**

**[PAUSE 3 seconds]**

> "5 out of 5 checks passed — all green. The 'Mark as Reviewed' button is now enabled."

> "Mock payroll should now run clean on the first attempt. No iterative calculate-fail-fix cycles."

---

## CLOSE (15 sec)

> "To summarize what we just saw:"
>
> "We replaced the iterative calculate-fail-fix cycle with a single pre-flight validation pass. Five automated checks validate PrismHR configuration against CSA Schedule 2 as the source of truth — with additional data from ClientSpace for state registrations and Informer for SUTA bill rate tables — catching WC code mismatches, SUTA rate gaps, billing rule discrepancies, pay group misalignment, and deduction code errors before mock payroll is ever initialized."
>
> "The PA fixed all issues inline — no PrismHR navigation, no context-switching — with every correction mapped back to what CSA Schedule 2 specifies. All changes were pushed in one batch API call via PrismHR REST endpoints."
>
> "Standard SUTA rates are pre-approved at sales, removing the executive approval queue from the critical path. Non-standard rates escalate to executive review with Informer providing the bill rate history for evaluation."
>
> "15 to 20 minutes versus 3 to 5 hours in the current cycle."

---

## Key Talking Points (if asked)

| Topic | Detail |
|-------|--------|
| **Source of truth** | CSA Schedule 2 — the signed Client Service Agreement defines the expected WC codes, SUTA coverage type, and fee structure that PrismHR configuration is validated against |
| **Validation engine** | Rule-based, deterministic — no AI/ML needed for the validation checks |
| **Checks** | 5: WC Code Match, SUTA Rate Coverage, Billing Rules vs CSA Schedule 2, Pay Group Alignment, Deduction Codes |
| **Data sources** | 4 sources: PrismHR API (system being validated), CSA Schedule 2 (source of truth, Initiative D synergy), ClientSpace (state registrations), Informer (SUTA bill rate tables and history) |
| **API coverage** | Eye icon reveals REST endpoints per connector — separated into READ and WRITE sections. Keeps UI clean for PAs, provides full integration visibility for technical reviewers |
| **PrismHR integration** | REST API (v1) — 8 GET endpoints for reads, 5 PUT/POST endpoints for write-backs |
| **ClientSpace integration** | REST API — 6 endpoints for client records, handoff page, state registrations, case creation, and task management |
| **Data provenance** | Enhanced "Data Provenance" section in validation report shows exactly which system provides which data: CSA = source of truth, PrismHR = system being validated, ClientSpace = supplementary, Informer = reference data |
| **Inline fix** | WC codes via dropdown (pre-populated from CSA Schedule 2), SUTA rate + type radio, deduction GL account selector |
| **Batch push** | Single API call writes all fixes to PrismHR via PUT endpoints — full audit trail, no manual data entry |
| **SUTA pre-approval** | Standard rates for common states (TX, CA, FL, NY, IL, PA, OH, GA) pre-approved at deal close. Client Rate selection escalates to executive SUTA Bill Rate Review with 1-week SLA. Informer provides bill rate tables for review |
| **Remediation checklist** | Live checkbox + strikethrough as fixes applied, "X/3 resolved" counter, real-time progress |
| **Cross-initiative synergy** | CSA Schedule 2 extraction (Initiative D) feeds expected WC codes and SUTA coverage type to pre-flight validation (Initiative F) |
| **Time savings** | 25% PA time (4.0 FTEs) impacted, 15-20 min vs 3-5 hours per client |
| **Cycle compression** | Payroll Testing phase: 5-7 days --> predictable 1-2 day turnaround |
