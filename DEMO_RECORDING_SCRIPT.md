# G&A Compass — CAP Platform Demo Recording Script

## Pre-Recording Setup
1. Open Chrome at `http://localhost:3000` (make sure dev server is running: `cd demo && npx next dev -p 3000`)
2. Open the HTML slides at `file:///Users/abhijeettiwari/Documents/ga-CAP-demo-dev/CAP_Demo_Slides.html` in another Chrome tab
3. Set browser to **full screen** (Cmd+Shift+F)
4. Clear localStorage to reset state: DevTools → Application → Storage → Clear site data
5. Start QuickTime screen recording: **Cmd+Shift+5** → Record Entire Screen

---

## PART 1: Current State Understanding (~2 min)

### Slide 1: CAP Excel Anatomy
- **Switch to the Demo Slides HTML tab**
- Show **Slide 1** (CAP Excel Workbook Anatomy)
- **Pause 5 seconds** on the sheet layer map (left side) — point out the 15+ sheets
- **Scroll down slowly** to show:
  - The 8 sections of Company Info
  - The Itafos Conda filled example (298 employees, 5 medical plans, 19.89% renewal increase)
  - The Rate Calculation Formula: `Base × Bucket × AF × (1+Comm) × RF = $931.52`
  - The Output Sheets (ER Confirmation, EE SRA, Mapping, Change Tracker)
- **Scroll to** the process flow at the bottom: 8 steps from "Documents In" to "Downstream"
- **Pause** on Step 7 "Configure Prism" — highlight "48% of role · CAP errors block go-live"

### Slide 2: Foundation Setup
- **Click right arrow** to go to Slide 2 (Prism-Synced Foundation)
- **Pause** on the three-column layout:
  - Left: From Excel CAP (Replace) + PrismHR (System of Record) with Stream 1 & Stream 2
  - Center: The Foundation Hub (Master Plan Library, Calculator Logic, Parameters, Vocab, Templates, Validation)
  - Right: ClientSpace + DocuSign connections
- **Point out** the Pricing Stack at the bottom: Bucket → Carrier Base → Admin Factor + Commission = Risk Factor → Billed

---

## PART 2: Integrations Hub (~2 min)

### Login to the App
- **Switch to the app tab** (`localhost:3000`)
- Click **admin@gapartners.com** in the persona selector
- Click **Sign in with SAML SSO →**
- Wait for dashboard to load

### Show Integrations Hub
- **Click "Integrations"** in the sidebar (under Administration)
- Wait for the page to load — show the **"All Systems Operational"** banner (5 connectors, 1,326 total syncs)
- **Click the chevron ▶ on PrismHR** to expand:
  - Show Sync Settings: Schedule (Nightly), Delta sync (On), Records (847)
  - Show Field Mapping table: prism.plan_name → plan.name, prism.rate_eo → tierRate.eo, etc.
  - Show Sync Log: last 3 runs with dates and record counts
- Click **"Test Connection"** on PrismHR — watch the spinner → "Connected ✓"
- Click **"Re-sync"** on PrismHR — watch the sync overlay animation (6 steps)
- **Collapse PrismHR**, expand **ClientSpace**:
  - Show field mapping: cs.caseId → workflow.caseId, cs.status → lifecycle.stage
  - Show Quick Info: 234 syncs, Active, 14 min ago
- **Briefly expand DocuSign and WorkSight** to show they're connected

### Show API/Data Object Details (Slide 5)
- **Switch to Demo Slides**, navigate to **Slide 5** (Ben Admin → Prism Write-Back)
- **Pause** on the right side showing the Prism Write-Back Orchestration:
  - Step 1 VALIDATE (read): getGroupBenefitTypes, getClientBenefitPlans, getGroupBenefitRates
  - Step 2 CONFIGURE (write): setClientBenefitPlanSetupDetails, setGroupBenefitBillingRates, setBenefitRule
  - Step 3 ENROLL (write per WSE): enrollBenefit, setDependent, setFlexPlan, setHSA
  - Step 4 VERIFY (read-back): getActiveBenefitPlans, getBenefitConfirmationList

---

## PART 3: Admin Console (~3 min)

### Navigate to Admin Console
- **Switch back to the app**
- Click **"Admin Console"** in the sidebar
- Show the **9 tab buttons** at the top (F2-F10)

### F3 · Master Plans
- Click **"F3 · Master Plans"** tab
- Show the 4 metrics tiles: 42 Master Plans, 168 Tier Rates, 8 Carriers, 2026 Plan Year
- **Expand** the BCBSTX card to show the sample plans/rates
- **Expand** the Guardian card

### F4 · Pricing Stack
- Click **"F4 · Pricing Stack"** tab
- Show the Rate Formula card
- **Use the Rate Calculator**: Enter Base Rate = 877.94, Bucket = 0.975, AF = 1.013, Comm = 0.03, RF = 1.043
- Click **"Calculate"** — show the result ($931.52)

### F5 · Parameters
- Click **"F5 · Parameters"** tab
- Show the ACA Affordability Threshold ($129.90/month, 2026)
- Show Deduction Options and Fee Schedule

### F6 · Vocabularies
- Click **"F6 · Vocabularies"** tab
- **Expand** "Manage Items" under Class Types
- Add a new item: type "Executives" → click "Add"
- Show it appears in the list

### F7 · Templates
- Click **"F7 · Templates"** tab
- Click **"Preview"** on the Benefits Booklet template
- Show the template content in the modal
- Close the modal

### F8 · Validation
- Click **"F8 · Validation"** tab
- Show the 4 rule categories
- Click **"+ Add Rule"** — type "Custom: Broker commission verified" → click "Save"

### F9 · Roles
- Click **"F9 · Roles"** tab
- Show the **User Personas table** with all 6 roles
- Click **"View"** on one persona to show the permission detail panel
- Click **"Switch to this persona"** to demonstrate live role switching

---

## PART 4: New Business CAP Build (~5 min)

### Show Slide 3 first
- **Switch to Demo Slides** → Slide 3 (New Business: AI Wizard)
- **Pause** on the Build Wizard pipeline: Upload → Extract → Assemble → Rates → Validate → Preview
- **Point out** the Copilot sidebar on the right
- **Point out** "or load an existing WIP CAP (.xlsx)" in Step 1

### Start New Business CAP
- **Switch to the app**
- Click **"+ New Business CAP"** button (top-right or sidebar)
- **Show the CAP Info Bar** at top: CAP-2026-0847, version badge, live editing indicator

### Step 1: Intake & Upload
- **Show the mode toggle**: "Start from scratch" vs "Upload existing WIP CAP"
- **Click "Upload existing WIP CAP"** briefly to show the .xlsx upload zone
- **Click back to "Start from scratch"**
- Show the **Seed Information** form (pre-filled: Itafos Conda, 2026, 298, July, BCBS Texas)
- Show the **Document Checklist** (3 done, 3 pending)
- **Click the upload drop zone** — select any file — show it appears in Uploaded Files with size
- Click **"Continue →"**

### Step 2: AI Extraction
- Show the **3 status cards**: 7 Extracted, 1 Low Confidence, 2 Missing
- **Scroll slowly** through the extraction table:
  - Point out confidence bars (green 95%+, amber 89-94%, red missing)
  - Point out source badges (Upload, Invoice, SBC, Census, Needs Input)
- Click **"Continue →"**

### Step 3: Assembly
- Show the **Provenance Legend** at top: From library (blue), From upload·confirm (amber), Underwriting (purple), Needs input (red)
- **Go through each section slowly**:
  - Company Info (F6 · Vocabularies): show editable fields with confirm buttons
  - Underwriting (F4 · Pricing Stack): show the Prism sync refresh ↻ icons
  - **Click a refresh icon** on Bucket — watch the spinner → auto-fills "0.975"
  - Fill in remaining UW fields: Admin Factor = 1.013, Risk Factor = 1.043
  - Products (F3 · Master Plans): show plan dropdowns
- Click **"Continue →"**

### Step 4: Plan Design & Rates
- Show the **Rate Formula card**: Billed = Base × Bucket × AF × (1+Comm) × RF
- Show the **parameter cards**: Bucket 0.975, AF 1.013, Comm 0.03, RF 1.043, Multiplier 1.0610
- **Click through each Contribution Strategy**:
  - Variable (default) — show the ER% changes
  - Base Plan — show how ER% adjusts
  - Flat Dollar — show the fixed amount
  - Rolldown — explain the concept
  - **Switch back to Variable**
- **Scroll slowly** through each plan rate card:
  - BCBS Texas PPO $500 80%: show Base, Billed, Employer (green), Employee, PPD (blue)
  - BCBS Texas HDHP $3300 90%
  - Guardian Dental (Open Mkt)
  - Guardian Vision (Open Mkt)
- Show the **ACA Affordability Check** at the bottom: ✓ Affordable
- Click **"Continue →"**

### Step 5: Readiness
- Show the **Validation banner**: "2 error(s) block handoff" with 70% progress bar
- Click **"Re-run Validation"** — watch the spinner
- **Expand** a few check items by clicking the ▼ arrows
- Click **"Fix"** on "Dental EO matches carrier quote" → show the fix panel
- Click **"Accept $27.50"** — watch the error turn to ✓ pass
- Click **"Fix"** on "UW parameters complete" — click "Go to Step 3" (navigate to assembly, then come back)
- Show that error count decreases

### Open Copilot
- Click **"✦ Copilot"** button in the top bar
- Show the sidebar opens with welcome message
- **Click** "Explain rate formula" chip → watch the response with rate math breakdown
- **Type** "set strategy to flat dollar 500" → watch the proposed change card appear
- Click **"Apply Change"** → watch the AI-assisted badge
- **Close the Copilot** (click ✕)

### Step 6: Preview & Submit
- Click **"Continue →"** to get to Step 6
- Show the **Workflow Status Bar**: AM Submits → Coordinator QC → Client Sign-off → Prism Write-back → Configured
- Show the **Summary Card**: Itafos Conda, 4 plans, Est. Annual ER
- Show the **ClientSpace Case card**: CS-2026-1847, case timeline
- Show the **validation blocker banner** (if still blocking) or the enabled Submit button
- Click **"Generate Booklet"** — watch the sync overlay
- Show the **Audit Trail** — click to expand, show the 14+ events
- If submit is enabled: Click **"Submit for Review →"** — watch the sync overlay → redirects to dashboard

---

## PART 5: Documents & Audit Trail (~1 min)

- Click **"Documents"** in the sidebar
- Show the **6 document cards** with status badges
- Click **"Preview"** on "CAP Summary" → show the **slide-in drawer**:
  - Document Info (Client, Prism ID, Plan Year, Carrier, Template, Status)
  - Document Content Preview (actual plan rates, contributions)
  - Version History (v1-v4)
  - Audit Trail (7-8 events)
- Click **"Send to DocuSign"** button
- Close the drawer

---

## PART 6: Renewals (~3 min)

### Show Slide 4 first
- **Switch to Demo Slides** → Slide 4 (Renewals: Sync From Prism, Diff What Changed)
- **Pause** on the two change types: Client-driven vs Master-data drift
- Show the approval/sign/write-back lifecycle at the bottom

### Show Renewal Dashboard
- **Switch to the app**
- Click **"Renewals"** in the sidebar
- Show the **Renewal Queue** on the left: 8 clients sorted by urgency

### Go Through Renewal Tabs
- **Select "Itafos Conda"** in the queue
- Show the header: +5.3% medical increase, 28 days until renewal, ClientSpace case reference

#### R2 · Pre-fill
- Show Prior-Year CAP (plan lineup, contribution strategy, prior WSE)
- Show Prism Client Record (carrier, effective date, current WSE)
- Show **Plan-Code Crosswalk Migration** table (old → new codes)
- Click **"Start Renewal →"**

#### R4 · Data Currency
- Click the **"R4 · Data Currency"** tab
- Show the **version comparison table**: Carrier Rates (2025 v3 → 2026 v1), Pricing Stack (v3 → v4)
- Show the **"⚠ Outdated"** badges
- Click **"Bring Up to Date →"** — watch the sync overlay

#### R5 · Renewal Diff
- Click **"R5 · Renewal Diff"** tab
- Show the diff table: prior vs current values, +5.3% delta
- Click **"Accept"** on each changed row
- Show the **"Accept all carried-forward"** button

#### R6 · Readiness
- Click **"R6 · Readiness"** tab
- Show the **8 readiness gates** with progress bar
- Show the **"Fix →"** buttons on failing gates
- If all gates pass: Click **"Approve Renewal →"**

#### R7 · Booklet
- Click **"R7 · Booklet"** tab
- Show the booklet preview and annual contract management table (2024-2026)

#### R9 · Handoff
- Click **"R9 · Handoff"** tab
- Show the structured Prism update payload
- Show downstream systems checklist

---

## PART 7: Ben Admin Write-Back (~2 min)

### Show Slide 5 first
- **Switch to Demo Slides** → Slide 5 (Approved CAP → Automated Prism Setup)
- **Pause** on:
  - Ben Admin Handoff Console (3 awaiting setup)
  - The structured payload preview
  - The 4-step API orchestration sequence
  - Auth & Guardrails (scoped web-service user, session token, REST/JSON)

### Switch Role to Benefits Analyst
- **Switch to the app**
- In the top bar, click **"Viewing As"** dropdown → select **"Benefits Analyst"**
- Show that the sidebar now shows **"Ben Admin"** nav item

### Ben Admin Console
- Click **"Ben Admin"** in the sidebar
- Show the **Approved CAPs Queue**: 2-4 CAPs ready for write-back
- **Select "Itafos Conda"**
- **Scroll through slowly**:

#### Payload Preview
- Show all 8 structured fields: Client, Plans, Tier Rates, ER Contribution, Enrollments, Effective, FSA, HSA

#### Pre-Write Validation
- Show the 6 validation checks (5 ✓ pass, 1 ⚠ warning)
- Point out: "Plan codes valid", "Rate tiers match", "Contribution math verified", "Client exists in Prism"

#### API Call Sequence (THE KEY SECTION — go very slowly here)
- Show **Step 1 VALIDATE** (blue/read):
  - BenefitService.getGroupBenefitTypes
  - BenefitService.getClientBenefitPlans
  - BenefitService.getGroupBenefitRates
- Show **Step 2 CONFIGURE PLANS** (red/write):
  - BenefitService.setClientBenefitPlanSetupDetails
  - BenefitService.setGroupBenefitBillingRates
  - BenefitService.setGroupBenefitPremiumRates
  - BenefitService.setBenefitRule
- Show **Step 3 ENROLL WSEs** (red/write per employee):
  - BenefitService.getEnrollInputList
  - BenefitService.setDependent
  - BenefitService.enrollBenefit
  - EmployeeService.benefitPlanSetWaive
  - BenefitService.setFlexPlan
  - EmployeeService.setHSA
  - BenefitService.setEnrollmentPlanDocuments
- Show **Step 4 VERIFY** (blue/read-back):
  - BenefitService.getActiveBenefitPlans
  - BenefitService.getBenefitConfirmationList
  - BenefitService.getBenefitConfirmationData
  - BenefitService.getBenefitsEnrollmentTrace
- Show the **cross-cutting notes**: Optimistic concurrency, Error routing, Re-runnable, Audit

#### Comments & Actions
- Show existing comments from AM and system
- Type a comment: "Confirmed open-market dental with Guardian. Proceeding with write-back."
- Click **"Push to Prism →"** — watch the 4-step sync overlay animation
- Show the success toast

---

## PART 8: Closing (~30 sec)

- Navigate back to **Dashboard**
- Show the updated metric tiles (Published count should increase if you completed the flow)
- Show the **Activity Log** at the bottom with the latest events
- **End recording**

---

## Recording Tips
- **Browser**: Use Chrome at 1440×900 or higher resolution
- **Speed**: Go SLOWLY through rate tables, API sequences, and validation — these are the demo differentiators
- **Copilot**: Make sure to demo at least 2 interactions (one read, one write)
- **Roles**: Switch between AM and Analyst to show role-based UI differences
- **Total time target**: 15-20 minutes
- **Music**: None — record with narration or add voiceover later
