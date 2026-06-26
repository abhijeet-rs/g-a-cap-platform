# Mock Payroll Pre-Flight Validation — Demo Recording Script

**Initiative:** F — Pre-Flight Payroll Validation
**Duration:** ~4-5 minutes
**Flow:** Architecture Slides --> Select Client --> Data Fetching --> Validation Results --> Inline Fix --> Batch Push --> Remediation Checklist

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

> "Today, the Payroll Analyst runs mock payroll in PrismHR and immediately hits system calculation errors — workers' comp code mismatches, SUTA rate gaps, setup discrepancies, pay group and schedule misalignment. The SOP explicitly warns — and I'm quoting — 'DELAYS OCCUR HERE DUE TO W/C, SUTA ERRORS AND OTHER SYSTEM GENERATED ERRORS DUE TO SETUP.'"

**[Point to the 4-step calculate-fail-fix cycle diagram]**

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

> "We're replacing this with a pre-flight validation engine that checks everything before mock payroll is initialized."

**[Point to Source Connectors on the left]**

> "Four data sources feed the validator:"
>
> - "PrismHR — the employee roster, workers' comp code assignments, SUTA rate tables, and billing rules."
> - "CSA Extraction output — this is the cross-initiative synergy with Initiative D. The WC codes and SUTA coverage type extracted from Schedule 2 of the signed CSA become the expected values we validate against."
> - "ClientSpace — state registrations and employee location data."
> - "Informer — SUTA state rate tables and bill rate history as a fallback reference."

**[Point to the 5 Validation Checks in the center]**

> "Five deterministic checks run against the combined data:"
>
> 1. "WC Code Match — do PrismHR employee WC assignments match the CSA Schedule 2 codes?"
> 2. "SUTA Rate Coverage — is a SUTA rate entered for every state where employees are located?"
> 3. "Billing Rules vs CSA — do the billing rules configured in PrismHR match the fee structure in the signed agreement?"
> 4. "Pay Group Alignment — are pay groups and pay schedules correctly configured for the effective date?"
> 5. "Deduction Codes — are all deduction codes mapped to valid GL accounts?"

**[Point to the Pass/Fail Report on the right]**

> "Each check returns pass, warning, or critical — with severity levels, affected employee counts, source citations, and specific remediation steps."

**[Point to SUTA Pre-Approval callout]**

> "Key design decision — standard SUTA rates are pre-approved at the point of sale. Only non-standard rates escalate to the executive review queue. This removes the one-week SLA from the critical path for the majority of deals."

---

## SLIDE 3: Inline Fix & Batch Push (20 sec)

**[Click Tab 3: Inline Fix & Batch Push]**

> "When the validator finds issues, the PA fixes them inline — right inside the pre-flight screen."

**[Point to the Before vs After comparison]**

> "WC codes are corrected via dropdown selectors pre-populated with CSA Schedule 2 values. SUTA rates are entered with a rate type selector — standard versus client rate — with immediate routing logic. Deduction codes are mapped to GL accounts from a searchable list."

**[Point to the batch push section]**

> "Once all fixes are applied, one batch API call pushes every change to PrismHR. No manual data entry, no context-switching between screens."

**[Point to the remediation checklist]**

> "A live remediation checklist tracks every issue — items check off and strike through as the PA fixes them, with a running counter showing progress."

---

## STEP 1: Select Client (15 sec)

**[Switch to the app tab --> Navigate to Workspace --> Onboarding --> Pre-Flight Validator]**

> "We start in the Pre-Flight Validator. The client selector shows all clients in the onboarding pipeline."

**[Click the client selector dropdown --> Select "Acme Corp"]**

> "I'll select Acme Corp — 38 employees based in Connecticut, effective date July 1st, 2026, assigned to PA Sarah Mitchell."

**[Point to the 3 source connector indicators]**

> "All three source connectors show green — PrismHR connected, CSA Extraction connected with the latest extraction linked, and ClientSpace connected. The validator has everything it needs."

---

## STEP 2: Data Fetching Animation (15 sec)

**[Click "Run Pre-Flight Validation"]**

> "I click Run Pre-Flight Validation — watch the data fetching sequence."

**[Watch the 5-step fetching animation]**

> 1. "Connecting to PrismHR API — pulling the employee roster, WC code assignments, and SUTA rate tables."
> 2. "Loading CSA extraction data — WC codes from Schedule 2 and the fee structure — this is Initiative D's output feeding directly into Initiative F."
> 3. "Querying ClientSpace — state registrations and employee location records."
> 4. "Pulling Informer SUTA data — state rate tables and bill rate history."
> 5. "Cross-referencing all sources."

**[Watch the 5 validation checks run sequentially with checkmarks appearing]**

> "Now the five checks run — WC Code Match, SUTA Rate Coverage, Billing Rules, Pay Group Alignment, Deduction Codes — each one completing with a result indicator."

---

## STEP 3: Validation Results (30 sec)

**[Results panel appears]**

> "Results are in — 3 out of 5 checks passed. One critical issue and two warnings."

### 3a. WC Code Validation (Critical)

**[Click to expand the WC Code Validation card — red/critical indicator]**

> "The critical finding — WC Code Validation. Three employees have workers' comp codes that don't match the CSA Schedule 2."

**[Point to the table rows]**

> "J. Martinez is assigned WC code 8810 in PrismHR, but the CSA specifies CT 5606 for this role. R. Chen has 8742 — should be CT 9012. And S. Patel has no WC code assigned at all — should be CT 9083."

**[Point to source citations below the table]**

> "Notice the source citations — 'PrismHR: Employee WC Assignments' and 'CSA: Schedule 2 WC Codes.' Every finding traces back to its data sources."

### 3b. SUTA Rate Coverage (Warning)

**[Collapse WC, click to expand SUTA Rate Coverage — amber/warning indicator]**

> "SUTA Rate Coverage — warning level. No SUTA rate has been entered for Connecticut, which affects all 38 employees."

**[Point to source citations]**

> "Sources: 'PrismHR: SUTA Rate Table' and 'CSA: SUTA Coverage Type = CR%.' The CSA specifies Client Rate percentage, so the validator knows what type of rate to expect."

### 3c. Deduction Code Validation (Warning)

**[Collapse SUTA, click to expand Deduction Code Validation — amber/warning indicator]**

> "Deduction Code Validation — the 401K-EE deduction code references an unconfigured GL account. This would cause a posting error during payroll processing."

---

## STEP 4: Inline Fix — WC Codes (30 sec)

**[Re-expand the WC Code Validation card]**

> "Now I fix these inline — no need to open PrismHR in another tab."

**[Click the WC code dropdown for J. Martinez --> select "CT 5606"]**

> "J. Martinez — I select CT 5606 from the dropdown. These options are pre-populated from the CSA Schedule 2 extraction."

**[Click the dropdown for R. Chen --> select "CT 9012"]**

> "R. Chen — CT 9012."

**[Click the dropdown for S. Patel --> select "CT 9083"]**

> "S. Patel — CT 9083."

**[Watch the card header transition from red to green]**

> "All three employees corrected — the check card turns green. The PA just fixed three WC code mismatches without leaving the pre-flight screen — no PrismHR navigation, no searching through employee records."

---

## STEP 5: Inline Fix — SUTA Rate (30 sec)

**[Click to expand the SUTA Rate Coverage card]**

> "SUTA rate for Connecticut. I enter the rate — 2.31%."

**[Type "2.31" into the SUTA rate input field]**

**[Point to the rate type radio buttons]**

> "Now the rate type — this is where the SUTA pre-approval logic kicks in."

**[Select "Client Rate (CR%)" --> observe the amber warning]**

> "If I select Client Rate — the system flags it amber: 'Executive SUTA Bill Rate Review Required.' It shows the deadline, the SLA window, and the Informer source reference. This would add one week to the critical path."

**[Switch to "Standard Rate" --> observe the green indicator]**

> "But if I select Standard Rate — green: 'Standard Rate — Pre-Approved at Sales.' The message reads 'Approval queue bypassed — ready for payroll initialization.'"

**[Leave Standard Rate selected]**

> "Standard rates were pre-approved during the sales process. The executive approval queue is removed from the critical path for the majority of deals — this is a significant cycle time reduction."

---

## STEP 6: Inline Fix — Deduction Code (15 sec)

**[Click to expand the Deduction Code Validation card]**

> "Last issue — the 401K-EE deduction code needs a GL account mapping."

**[Click the GL account dropdown --> select "401K-Employee-Main"]**

> "I select '401K-Employee-Main' from the GL account list."

**[Watch the card header turn green]**

> "Green. All three issues resolved."

---

## STEP 7: Remediation Action Plan Checklist (15 sec)

**[Scroll down to the Remediation Action Plan section]**

> "Scroll down to the Remediation Action Plan — this is the live checklist that tracks every issue."

**[Point to the 3 checked/struck-through items]**

> "All three items are checked and struck through in green:"
>
> 1. "WC Code mismatches — 3 employees corrected."
> 2. "SUTA rate for CT — entered with Standard Rate pre-approval."
> 3. "Deduction code GL mapping — 401K-EE linked to account."

**[Point to the counter]**

> "The counter reads '3 of 3 resolved.' The bottom bar confirms: 'All issues resolved inline — push fixes to PrismHR and initialize mock payroll.'"

> "This replaces the blind trial-and-error cycle. The PA sees the remediation checklist update in real-time as they fix each issue — nothing is lost between iterations."

---

## STEP 8: Batch Push to PrismHR (20 sec)

**[Click "Push All Fixes to PrismHR"]**

> "One button — Push All Fixes to PrismHR."

**[Point to the fix summary panel]**

> "The summary panel lists all five changes being pushed — three WC code updates, one SUTA rate entry, and one deduction code mapping."

**[Watch the push animation]**

> "Authenticating with PrismHR... writing WC codes... writing SUTA rates... writing deduction codes... verifying."

**[Green "Pushed" badge appears]**

> "Pushed. One batch API call wrote all five corrections to PrismHR — no manual data entry, no switching between employee records, no copy-paste errors."

**[Point to "Re-run Validation" button]**

> "Now I can re-run the validation to confirm everything is clean."

---

## STEP 9: Re-run & All Pass (15 sec)

**[Click "Re-run Validation"]**

> "Re-running the full validation suite."

**[Watch all 5 checks re-run and turn green]**

> "WC Code Match — pass. SUTA Rate Coverage — pass. Billing Rules — pass. Pay Group Alignment — pass. Deduction Codes — pass."

**[Point to the "5/5 checks passed" summary]**

> "5 out of 5 checks passed — all green. The 'Mark as Reviewed' button is now enabled."

> "Mock payroll should now run clean on the first attempt. No iterative calculate-fail-fix cycles."

---

## CLOSE (15 sec)

> "To summarize what we just saw:"
>
> "We replaced the iterative calculate-fail-fix cycle with a single pre-flight validation pass. Five automated checks run against PrismHR, CSA extraction output, and ClientSpace — catching WC code mismatches, SUTA rate gaps, billing rule discrepancies, pay group misalignment, and deduction code errors before mock payroll is ever initialized."
>
> "The PA fixed all issues inline — no PrismHR navigation, no context-switching — and pushed all changes in one batch API call."
>
> "Standard SUTA rates are pre-approved at sales, removing the executive approval queue from the critical path."
>
> "15 to 20 minutes versus 3 to 5 hours in the current cycle."

---

## Key Talking Points (if asked)

| Topic | Detail |
|-------|--------|
| **Validation engine** | Rule-based, deterministic — no AI/ML needed for the validation checks |
| **Checks** | 5: WC Code Match, SUTA Rate Coverage, Billing Rules vs CSA, Pay Group Alignment, Deduction Codes |
| **Data sources** | PrismHR API (primary), CSA Extraction output (Initiative D synergy), ClientSpace, Informer (SUTA fallback) |
| **Inline fix** | WC codes via dropdown (pre-populated from CSA Schedule 2), SUTA rate + type radio, deduction GL account selector |
| **Batch push** | Single API call writes all fixes to PrismHR — no manual data entry |
| **SUTA pre-approval** | Standard rates auto-approved at sales, only non-standard escalated to executive review (1-week SLA) |
| **Remediation checklist** | Live checkbox + strikethrough as fixes applied, "X/3 resolved" counter, real-time progress |
| **Cross-initiative synergy** | CSA extraction (Initiative D) feeds expected WC codes and SUTA coverage type to pre-flight validation (Initiative F) |
| **Time savings** | 25% PA time (4.0 FTEs) impacted, 15-20 min vs 3-5 hours per client |
| **Cycle compression** | Payroll Testing phase: 5-7 days --> predictable 1-2 day turnaround |
